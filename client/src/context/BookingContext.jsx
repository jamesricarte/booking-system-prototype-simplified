import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { convertTimeToMinutes } from "../utils/timeUtils";
import useFetchBookingsForAllRoom from "../hooks/useFetchBookingsForAllRoom"; // adjust path
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

  const lastMinuteRef = useRef(null);
  const isBookingsFetchedRef = useRef(false);

  const updateBookingsTypeOfUser = async (updateToCurrentBook, type) => {
    try {
      const response = await fetch(`${API_URL}/api/updateBookingTypeOfUser`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toBeUpdated: updateToCurrentBook,
          professorId: user?.school_id,
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
  }, [currentTime]);

  const checkUserOccupancyBookingType = () => {
    const isBookingTypeCorrect = bookingsForAllRoom.some(
      (booking) =>
        currentTime >= convertTimeToMinutes(booking.start_time) &&
        currentTime < convertTimeToMinutes(booking.end_time) &&
        booking.booking_type === "current_book" &&
        booking.professor_id === user?.school_id
    );

    const checkPreviousCurrentBook = bookingsForAllRoom.find(
      (booking) =>
        currentTime >= convertTimeToMinutes(booking.end_time) &&
        booking.booking_type === "current_book" &&
        booking.professor_id === user?.school_id
    );

    if (checkPreviousCurrentBook) {
      updateBookingsTypeOfUser(
        checkPreviousCurrentBook.booking_id,
        "updateCurrent"
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
          "updatePrevious"
        );
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
  }, [bookingsForAllRoom]);

  const findUserOccupancyData = () => {
    fetchBookingsForAllRoom();
    const foundUserOccupancyData = bookingsForAllRoom.find(
      (booking) =>
        booking.booking_type === "current_book" &&
        booking.professor_id === user?.school_id
    );

    setUserOccupancyData(foundUserOccupancyData || null);
  };

  useEffect(() => {
    if (userOccupancyData) {
      checkOccupantRemainingTime();
    } else {
      setUserOccupancyRemainingTime({
        hours: 0,
        minutes: 0,
      });
    }
  }, [userOccupancyData, currentTime]);

  const checkOccupantRemainingTime = () => {
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

  return (
    <BookingContext.Provider
      value={{
        userOccupancyData,
        userOccupancyRemainingTime,
        findUserOccupancyData,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};
