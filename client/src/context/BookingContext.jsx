import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { convertTimeToMinutes } from "../utils/timeUtils";
import useFetchBookingsForAllRoom from "../hooks/useFetchBookingsForAllRoom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const BookingContext = createContext();

export const useBooking = () => useContext(BookingContext);

export const BookingProvider = ({ children }) => {
  const { user } = useAuth();
  const { bookingsForAllRoom, fetchBookingsForAllRoom } =
    useFetchBookingsForAllRoom();

  const [currentTime, setCurrentTime] = useState(null);
  const [userOccupancyData, setUserOccupancyData] = useState(null);
  const [userOccupancyRemainingTime, setUserOccupancyRemainingTime] = useState({
    hours: 0,
    minutes: 0,
  });
  const [timePassedAfterBooking, setTimePassedAfterBooking] = useState(0);

  const [userReservationData, setUserReservationData] = useState(null);

  const lastMinuteRef = useRef(null);
  const isBookingsFetchedRef = useRef(false);

  const updateBookingsTypeOfUser = async (
    updateToCurrentBook,
    startTime,
    endTime,
    type
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/updateBookingTypeOfUser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toBeUpdated: updateToCurrentBook,
          professorId: user?.school_id,
          startTime: startTime,
          endTime: endTime,
          type: type,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      fetchBookingsForAllRoom();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(interval);
  }, [bookingsForAllRoom]);

  const updateCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (bookingsForAllRoom.length > 0 && !isBookingsFetchedRef.current) {
      checkUserOccupancyBookingType();
      isBookingsFetchedRef.current = true;
    }

    if (minutes !== lastMinuteRef.current) {
      lastMinuteRef.current = minutes;
      setCurrentTime(hours * 60 + minutes);
    }
  };

  useEffect(() => {
    checkUserOccupancyBookingType();
  }, [bookingsForAllRoom, currentTime]);

  const checkUserOccupancyBookingType = () => {
    const isBookingTypeCorrect = bookingsForAllRoom.some(
      (booking) =>
        currentTime >= convertTimeToMinutes(booking.start_time) &&
        currentTime < convertTimeToMinutes(booking.end_time) &&
        booking.booking_type === "current_book" &&
        booking.professor_id === user?.school_id
    );

    const checkPreviousUncorrectedBookingType = bookingsForAllRoom.find(
      (booking) =>
        currentTime >= convertTimeToMinutes(booking.end_time) &&
        booking.booking_type === "current_book" &&
        booking.professor_id === user?.school_id
    );

    if (checkPreviousUncorrectedBookingType) {
      updateBookingsTypeOfUser(
        checkPreviousUncorrectedBookingType.booking_id,
        checkPreviousUncorrectedBookingType.start_time_id,
        checkPreviousUncorrectedBookingType.end_time_id,
        "updatePreviousUncorrected"
      );
    }

    if (!isBookingTypeCorrect) {
      const updateToCurrentBook = bookingsForAllRoom.find(
        (booking) =>
          currentTime >= convertTimeToMinutes(booking.start_time) &&
          currentTime < convertTimeToMinutes(booking.end_time) &&
          booking.booking_type === "reservation" &&
          booking.professor_id === user?.school_id
      );

      if (updateToCurrentBook) {
        updateBookingsTypeOfUser(
          updateToCurrentBook.booking_id,
          updateToCurrentBook.start_time_id,
          updateToCurrentBook.end_time_id,
          "updateReservationToCurrent"
        );
        setTimeWhenBooked(currentTime);
      }
    }
  };

  useEffect(() => {
    const foundUserOccupancyData = bookingsForAllRoom.find(
      (booking) =>
        booking.booking_type === "current_book" &&
        booking.professor_id === user?.school_id
    );

    setUserOccupancyData(foundUserOccupancyData || null);

    const foundUserReservationData = bookingsForAllRoom.find(
      (booking) =>
        booking.booking_type === "reservation" &&
        booking.professor_id === user?.school_id
    );

    setUserReservationData(foundUserReservationData || null);
  }, [bookingsForAllRoom]);

  const refreshUserOccupancyAndReservationData = () => {
    fetchBookingsForAllRoom();
  };

  useEffect(() => {
    if (userOccupancyData) {
      checkUserOccupancyRemainingTime();
      checkCancelButtonRemainingTime();
    } else {
      setUserOccupancyRemainingTime({
        hours: 0,
        minutes: 0,
      });
    }
  }, [userOccupancyData, currentTime]);

  const checkUserOccupancyRemainingTime = () => {
    if (userOccupancyData) {
      const remainingTime =
        convertTimeToMinutes(userOccupancyData.end_time) - currentTime;

      const hours = remainingTime < 60 ? 0 : Math.floor(remainingTime / 60);
      const minutes = remainingTime % 60;

      setUserOccupancyRemainingTime({
        hours: hours,
        minutes: minutes,
      });
    }
  };

  const checkCancelButtonRemainingTime = () => {
    if (userOccupancyData) {
      const timeWhenBooked = JSON.parse(localStorage.getItem("timeWhenBooked"));
      const timePassed = currentTime - timeWhenBooked.time;

      setTimePassedAfterBooking(timePassed);
    }
  };

  const setTimeWhenBooked = (time) => {
    localStorage.setItem("timeWhenBooked", JSON.stringify({ time: time }));
  };

  return (
    <BookingContext.Provider
      value={{
        userOccupancyData,
        userOccupancyRemainingTime,
        userReservationData,
        refreshUserOccupancyAndReservationData,
        setTimeWhenBooked,
        currentTime,
        timePassedAfterBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
