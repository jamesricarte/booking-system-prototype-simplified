import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookNowModal from "./components/modals/BookNowModal";
import ReserveModal from "./components/modals/ReserveModal";
import BookingDetailPopup from "./components/BookingDetailPopup";
import EditBookingModal from "./components/modals/EditBookingModal";
import useRoomFetches from "./hooks/useRoomFetches";
import {
  convertTimeTo12HourFormat,
  bookingTimeToMinutes,
  convertTimeToMinutes,
} from "../../../utils/timeUtils";
import {
  getNearestTimeSlot,
  nearestTimeInTimeSlotFunction,
} from "./utils/roomFunctions";
import useRoomRequests from "./hooks/useRoomRequests";
import { IoIosArrowRoundBack } from "react-icons/io";
import { IoMdTime } from "react-icons/io";
import { useAuth } from "../../../context/AuthContext";
import { useBooking } from "../../../context/BookingContext";
import CancelModal from "./components/modals/CancelModal";
import EndNowModal from "./components/modals/EndModal";

const API_URL = import.meta.env.VITE_API_URL;

const RoomDetails = () => {
  //React router dom states
  const { id } = useParams();
  const roomId = parseInt(id);
  const { user } = useAuth();
  const {
    userOccupancyData,
    userOccupancyRemainingTime,
    userReservationData,
    refreshUserOccupancyAndReservationData,
    setTimeWhenBooked,
    timePassedAfterBooking,
  } = useBooking();

  useEffect(() => {
    console.log(user.booking_color);
  }, [user]);

  const {
    roomDetails,
    classes,
    timeslots,
    bookings,
    bookingsPurposes,
    serverDate,
    professor,
    fetchBookings,
  } = useRoomFetches(roomId);

  const {
    reserveBookingFormData,
    bookNowFormData,
    bookNow,
    reserveBooking,
    setBookNowFormData,
    setReserveBookingFromData,
    bookingMessage,
    loading,
    cancelBooking,
    endBooking,
    editBookingFormData,
    setEditBookingFormData,
    editBooking,
    cancelReservation,
  } = useRoomRequests();

  //Post Request for updating booking type
  const updateBookingsType = async (
    updateToCurrentBook,
    startTime,
    endTime,
    type
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/updateBookingType`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toBeUpdated: updateToCurrentBook,
          roomId: roomId,
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
      fetchBookings();
    } catch (error) {
      console.error(error);
    }
  };

  // Modal States
  const [bookNowModal, setBookNowModal] = useState(false);
  const [reserveModal, setReserveModal] = useState(false);
  const [editBookingModal, setEditBookingModal] = useState(false);

  //Tooltip Hover
  const [showBookingButtonToolTip, setShowBookingButtonToolTip] =
    useState(false);
  const [
    showBookingReservationButtonToolTip,
    setShowBookingReservationButtonToolTip,
  ] = useState(false);

  //States
  //Data of nearest timeslot in current time
  const [nearestTimeInTimeslot, setNearestTimeInTimeSlot] = useState(null);

  //For calculating the position of time indicator in scrollable div
  const [currentTimePosition, setCurrentTimePosition] = useState(0);

  //If booking for all rooms is elligible
  const [isRoomAvailableForBooking, setIsRoomAvailableForBooking] =
    useState(true);

  //Current time in total minutes
  const [currentTime, setCurrentTime] = useState(0);

  //For booking detail popup
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedBookingPosition, setSelectedBookingPosition] = useState(null);

  //If specific room is occupied or not
  const [roomAvailability, setRoomAvailability] = useState({
    status: true,
    message: "",
    type: "",
  });

  //For filtering the timeslots based from the current time
  const [filteredStartTimeSlots, setFilteredStartTimeslots] = useState([]);
  const [filteredEndTimeSlots, setFilteredEndTimeslots] = useState([]);
  const [
    filteredEndTimeSlotsForReservation,
    setFilteredEndTimeSlotsForReservation,
  ] = useState([]);

  //If booking now is possible
  const [isTimeSlotAvailableForBookNow, setIsTimeSlotAvailableForBookNow] =
    useState(true);
  //If selected start_time and end_time in book now is conflicting with user's reservation
  const [conflictWithUserReservation, setConflictWithUserReservation] =
    useState(false);

  //if the selected start time and end time is not conflicting with any bookings or reservations
  const [
    isTimeSlotAvailableForReserveBooking,
    setIsTimeSlotAvailableForReserveBooking,
  ] = useState(true);
  //If selected start_time and end_time in reservation conflic with user's occupancy
  const [conflictWithUserOccupancy, setConflictWithUserOccupancy] =
    useState(false);

  //For getting the detail of occupant of this room
  const [occupantBookingDetail, setOccupantBookingDetail] = useState(null);

  //Remaining time data of occupant before checkout
  const [occupantRemainingTime, setOccupantRemainingTime] = useState({
    hours: 0,
    minutes: 0,
  });

  // MODAL
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEndNowModal, setShowEndNowModal] = useState(false);

  // Modify these functions to show the modals instead of executing directly
  const handleCancelBooking = () => {
    setShowCancelModal(true);
  };

  const handleEndBookingNow = () => {
    setShowEndNowModal(true);
  };

  //Checking if cancelButton had timeout
  const [isCancelButtonTimeout, setIsCancelButtonTimeout] = useState(false);

  //Checking if end now button is allowed to show
  const [isEndNowButtonAllowedToShow, setIsEndNowButtonAllowedToShow] =
    useState(false);

  //Other Declarations
  const isBookingsFetchedRef = useRef(false);
  const lastMinuteRef = useRef(null);
  const scrollableDivRef = useRef(null);
  const hasScrolledInitially = useRef(false);
  const initialTimePosition = 43;
  const timeslotDistance = 56;

  // ---------------- useEffect and Functions Section ----------------

  //Running updateCurrentTime function every second to keep the system realtime
  useEffect(() => {
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const updateCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    if (bookings.length > 0 && !isBookingsFetchedRef.current) {
      checkBookingTypeChanges();
      isBookingsFetchedRef.current = true;
    }

    if (minutes !== lastMinuteRef.current) {
      lastMinuteRef.current = minutes;
      setNearestTimeInTimeSlot(nearestTimeInTimeSlotFunction(hours, minutes));

      const totalMinutes = (hours - 7) * 60 + minutes;

      if (hours - 7 < 0) {
        setCurrentTimePosition(initialTimePosition);
        setIsRoomAvailableForBooking(false);
      } else if (hours - 7 >= 12) {
        setCurrentTimePosition(timeslotDistance * 24 + initialTimePosition);
        setIsRoomAvailableForBooking(false);
      } else {
        setCurrentTimePosition(
          (totalMinutes / 30) * timeslotDistance + initialTimePosition
        );
        setCurrentTime(hours * 60 + minutes);
        setIsRoomAvailableForBooking(true);
      }
    }
  };

  //Checking every minute if the type of current booking is correct, then change it in database if not correct
  useEffect(() => {
    checkBookingTypeChanges();
  }, [bookingMessage, roomAvailability, currentTime]);

  const checkBookingTypeChanges = () => {
    const isBookingTypeCorrect = bookings.some((booking) => {
      return (
        currentTime >= convertTimeToMinutes(booking.start_time) &&
        currentTime < convertTimeToMinutes(booking.end_time) &&
        booking.booking_type === "current_book"
      );
    });

    const checkPreviousUncorrectedBookingType = bookings.find((booking) => {
      return (
        currentTime >= convertTimeToMinutes(booking.end_time) &&
        booking.booking_type !== "past"
      );
    });

    if (checkPreviousUncorrectedBookingType) {
      updateBookingsType(
        checkPreviousUncorrectedBookingType.booking_id,
        checkPreviousUncorrectedBookingType.start_time_id,
        checkPreviousUncorrectedBookingType.end_time_id,
        "updatePreviousUncorrected"
      );
    }

    if (!isBookingTypeCorrect) {
      const updateToCurrentBook = bookings.find((booking) => {
        return (
          currentTime >= convertTimeToMinutes(booking.start_time) &&
          currentTime < convertTimeToMinutes(booking.end_time) &&
          booking.booking_type === "reservation"
        );
      });

      if (updateToCurrentBook) {
        updateBookingsType(
          updateToCurrentBook.booking_id,
          updateToCurrentBook.start_time_id,
          updateToCurrentBook.end_time_id,
          "updateReservationToCurrent"
        );
        setTimeWhenBooked(currentTime);
      }
    }
  };

  //Centering the scrollableDiv scroll's position to current time
  useEffect(() => {
    if (
      scrollableDivRef.current &&
      currentTimePosition > 0 &&
      !hasScrolledInitially.current
    ) {
      const container = scrollableDivRef.current;
      const containerHeight = container.clientHeight;

      setTimeout(() => {
        container.scrollTop = Math.max(
          currentTimePosition - containerHeight / 2,
          0
        );
        hasScrolledInitially.current = true;
      }, 100);
    }
  }, [currentTimePosition]);

  //Linking the position of booking details popup to bookings
  useEffect(() => {
    const scrollableDiv = scrollableDivRef.current;
    if (scrollableDiv) {
      scrollableDiv.addEventListener("scroll", updatePosition);
    }

    return () => {
      if (scrollableDiv) {
        scrollableDiv.removeEventListener("scroll", updatePosition);
      }
    };
  });

  //Select the clicked booking
  const handleSelectedBookingClick = (booking, event) => {
    const bookingRect = event.target.getBoundingClientRect();

    setSelectedBooking(booking);
    setSelectedBookingPosition({
      top: bookingRect.top + window.scrollY,
      left: bookingRect.left + bookingRect.width * 1.8,
    });
  };

  //Function for linking the position of booking details popup to selected bookings
  const updatePosition = () => {
    if (selectedBooking) {
      const bookingElement = document.getElementById(
        `booking-${selectedBooking.booking_id}`
      );
      const bookingElementRect = bookingElement.getBoundingClientRect();

      setSelectedBookingPosition({
        top: bookingElementRect.top + window.scrollY,
        left: bookingElementRect.left + bookingElementRect.width * 1.8,
      });

      const scrollableDivRect =
        scrollableDivRef.current.getBoundingClientRect();

      const isOutOfView =
        bookingElementRect.bottom < scrollableDivRect.top ||
        bookingElementRect.top > scrollableDivRect.bottom;

      if (isOutOfView) {
        setSelectedBooking(null);
        setSelectedBookingPosition(null);
      }
    }
  };

  //Checking if room is occupied or not
  useEffect(() => {
    setRoomAvailability(
      checkRoomAvailability()
        ? {
            status: false,
            message: "Occupied",
            type: "occupied",
          }
        : { status: true, message: "Vacant", type: "available" }
    );
  }, [currentTimePosition, bookings]);

  const checkRoomAvailability = () => {
    const currentMinutes =
      ((currentTimePosition - initialTimePosition) / timeslotDistance) * 30;

    return bookings.some((booking) => {
      const startMinutes = convertTimeToMinutes(booking.start_time) - 420;
      const endMinutes = convertTimeToMinutes(booking.end_time) - 420;

      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    });
  };

  // Checking if booking start time and end time is interferring with other bookings
  useEffect(() => {
    checkAvailability("bookNow");
  }, [bookNowFormData.startTime, bookNowFormData.endTime, bookings]);

  //Checking if the selected start time and end time are not conflicting with previous bookings/reservations
  useEffect(() => {
    checkAvailability("reserveBooking");
  }, [
    reserveBookingFormData.startTime,
    reserveBookingFormData.endTime,
    bookings,
  ]);

  const checkAvailability = (bookingType) => {
    let selectedStart;
    let selectedEnd;
    if (bookingType === "bookNow") {
      selectedStart = parseInt(bookNowFormData.startTime);
      selectedEnd = parseInt(bookNowFormData.endTime);
    } else {
      selectedStart = parseInt(reserveBookingFormData.startTime);
      selectedEnd = parseInt(reserveBookingFormData.endTime);
    }

    const isOverlapping = bookings.some((booking) => {
      const bookingStart = booking.start_time_id;
      const bookingEnd = booking.end_time_id;

      return !(selectedEnd <= bookingStart || selectedStart >= bookingEnd);
    });

    if (!isOverlapping) {
      if (userReservationData) {
        if (
          selectedEnd <= parseInt(userReservationData?.start_time_id) ||
          selectedStart >= parseInt(userReservationData?.end_time_id)
        ) {
          setConflictWithUserReservation(false);
        } else {
          setConflictWithUserReservation(true);
        }
      }

      if (userOccupancyData) {
        if (
          selectedEnd <= parseInt(userOccupancyData?.start_time_id) ||
          selectedStart >= parseInt(userOccupancyData?.end_time_id)
        ) {
          setConflictWithUserOccupancy(false);
        } else {
          setConflictWithUserOccupancy(true);
        }
      }
    }

    bookingType === "bookNow"
      ? setIsTimeSlotAvailableForBookNow(!isOverlapping)
      : setIsTimeSlotAvailableForReserveBooking(!isOverlapping);
  };

  //Getting the data of occupant booking this room
  useEffect(() => {
    if (roomAvailability.type === "occupied") {
      getOccupantBookingDetails();
    } else {
      setOccupantBookingDetail(null);
    }
  }, [roomAvailability, currentTime]);

  const getOccupantBookingDetails = () => {
    const occupantBookingDetail = bookings.find((booking) => {
      return booking.booking_type === "current_book";
    });
    setOccupantBookingDetail(occupantBookingDetail);
  };

  //Getting the remaining time of user's occupancy before checkout and refreshUserOccupancyAndReservationData also when occupantBookingDetail changed
  useEffect(() => {
    if (occupantBookingDetail) {
      checkOccupantRemainingTime();
    }
  }, [occupantBookingDetail, currentTime]);

  const checkOccupantRemainingTime = () => {
    const remainingTime =
      convertTimeToMinutes(occupantBookingDetail.end_time) - currentTime;

    const hours = remainingTime < 60 ? 0 : Math.floor(remainingTime / 60);
    const minutes = remainingTime % 60;
  };

  //Changing Cancel button timeout depending on when it was booked
  //Checking if end now button is allowed to show
  useEffect(() => {
    if (timePassedAfterBooking && userOccupancyRemainingTime) {
      const totalMinutes =
        userOccupancyRemainingTime.hours * 60 +
        userOccupancyRemainingTime.minutes;

      if (totalMinutes <= 15) {
        if (timePassedAfterBooking >= 5) setIsCancelButtonTimeout(true);
      }

      if (totalMinutes <= 5) {
        if (timePassedAfterBooking > 2) setIsCancelButtonTimeout(true);
      }

      if (totalMinutes < 3) {
        setIsCancelButtonTimeout(true);
      }

      if (totalMinutes >= 15) {
        if (timePassedAfterBooking >= 15) setIsCancelButtonTimeout(true);
      }

      if (timePassedAfterBooking >= 15 && totalMinutes > 5) {
        setIsEndNowButtonAllowedToShow(true);
      } else if (totalMinutes <= 5) {
        setIsEndNowButtonAllowedToShow(true);
      }
    }

    if (
      userOccupancyRemainingTime.hours === 0 &&
      userOccupancyRemainingTime.minutes === 0
    ) {
      setIsCancelButtonTimeout(false);
      setIsEndNowButtonAllowedToShow(false);
    }
  }, [timePassedAfterBooking, userOccupancyRemainingTime, userOccupancyData]);

  //Checking if the booking message is available then close all modals, refetchBookings, refreshUserOccupancyAndReservationData
  useEffect(() => {
    if (
      (bookingMessage.isBookingMessageAvailable && bookNowModal) ||
      (bookingMessage.isBookingMessageAvailable && reserveModal) ||
      (bookingMessage.isBookingMessageAvailable && editBookingModal) ||
      (bookingMessage.isBookingMessageAvailable && selectedBooking)
    ) {
      setBookNowModal(false);
      setReserveModal(false);
      setEditBookingModal(false);
      setSelectedBooking(null);
    }

    if (bookingMessage.isBookingMessageAvailable) {
      fetchBookings();
    }
  }, [bookingMessage]);

  //Refresh user occupancy and reservation data everytime there is changes in bookings
  useEffect(() => {
    refreshUserOccupancyAndReservationData();
  }, [bookings]);

  //-----------------------------------------------------------
  //JUST FILTERING TIMESLOT DROPDOWNS--------------------------

  //Filtering the timeslots from current time
  useEffect(() => {
    const filteredTimeSlots = timeslots.filter(
      (timeslot) => convertTimeToMinutes(timeslot.time) >= getNearestTimeSlot()
    );

    setFilteredStartTimeslots(
      filteredTimeSlots.length > 1 ? filteredTimeSlots : timeslots.slice(-2)
    );
    setFilteredEndTimeslots(
      filteredTimeSlots.length > 1
        ? filteredTimeSlots.slice(1)
        : timeslots.slice(-1)
    );
    setFilteredEndTimeSlotsForReservation(
      filteredTimeSlots.length > 1
        ? filteredTimeSlots.slice(1)
        : timeslots.slice(-1)
    );
  }, [timeslots, roomAvailability, nearestTimeInTimeslot]);

  //Initially, setting the values of bookNow and reserveBooking form data from filtered timeslots
  useEffect(() => {
    setBookNowFormData((prevData) => ({
      ...prevData,
      startTime: filteredStartTimeSlots[0]?.id,
      endTime: filteredEndTimeSlots[0]?.id,
      classId: classes[0]?.id,
      purpose: "Lecture",
      roomId: roomDetails?.id,
      professorId: professor?.id,
    }));
    setReserveBookingFromData((prevData) => ({
      ...prevData,
      startTime: filteredStartTimeSlots[0]?.id,
      endTime: filteredEndTimeSlotsForReservation[0]?.id,
      classId: classes[0]?.id,
      purpose: "Lecture",
      roomId: roomDetails?.id,
      professorId: professor?.id,
    }));
  }, [
    filteredStartTimeSlots,
    filteredEndTimeSlots,
    filteredEndTimeSlotsForReservation,
    classes,
    roomDetails,
  ]);

  //Detecting if there is changes in reserve Booking start time then filter again the end time for reservation
  //The filter in the map below doesnt automatically updates when start time was changed
  useEffect(() => {
    if (reserveBookingFormData.startTime) {
      if (
        parseInt(reserveBookingFormData.endTime) -
          parseInt(reserveBookingFormData.startTime) <=
        1
      ) {
        const nextAvailableEndTime = filteredEndTimeSlotsForReservation.find(
          (timeslot) => timeslot.id > parseInt(reserveBookingFormData.startTime)
        );
        if (nextAvailableEndTime) {
          setReserveBookingFromData((prevData) => ({
            ...prevData,
            endTime: nextAvailableEndTime.id,
          }));
        }
      }
    }
  }, [reserveBookingFormData.startTime]);

  return (
    <main className="container h-full bg-[#FAFAFA]">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl">
          {" "}
          <Link to="/bookings" className="hover:underline">
            Booking Section
          </Link>{" "}
          <span className="text-base">&gt;</span>{" "}
          <Link to={`/room/${roomId}`} className="hover:underline">
            Room Details
          </Link>
        </h1>
        <Link to="/bookings">
          <div className="flex items-center text-[#F56C18] hover:underline">
            <IoIosArrowRoundBack size={26} />
            <p>Go Back</p>
          </div>
        </Link>
      </div>
      <hr />

      <div className="py-7 px-14 overflow-y-auto h-[80vh] bg-[#FAFAFA]">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="mb-2 text-lg font-semibold">Bookings</h3>
            {isRoomAvailableForBooking ? (
              <>
                <div
                  className="relative px-6 overflow-y-scroll border border-gray-200 h-[55vh]"
                  ref={scrollableDivRef}
                >
                  <div
                    className="absolute h-[3px] left-26 right-0 bg-red-500 z-10"
                    style={{ top: `${currentTimePosition}px` }}
                  />
                  {timeslots.map((timeslot, index) => (
                    <div key={index} className="flex items-center my-8">
                      <p className="min-w-20">
                        {convertTimeTo12HourFormat(timeslot.time)}
                      </p>
                      <div className="w-full h-[1px] bg-gray-300"></div>
                    </div>
                  ))}
                  {bookings.map((booking, index) => {
                    const start = bookingTimeToMinutes(booking.start_time);
                    const end = bookingTimeToMinutes(booking.end_time);
                    const top =
                      (start / 30) * timeslotDistance + initialTimePosition + 1;
                    const height = ((end - start) / 30) * timeslotDistance;

                    return (
                      <div
                        key={index}
                        id={`booking-${booking.booking_id}`}
                        className={`absolute w-[50%] p-2 text-sm text-white rounded-md cursor-pointer left-28 overflow-hidden ${
                          booking.booking_type === "current_book"
                            ? ""
                            : "opacity-60"
                        }`}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          backgroundColor: booking.booking_color
                            ? booking.booking_color
                            : "#3B82F6",
                        }}
                        onClick={(e) => handleSelectedBookingClick(booking, e)}
                      >
                        <div className="relative">
                          <p>{booking.professor_name}</p>
                          <p>{booking.class_name}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <div
                    onMouseEnter={() => setShowBookingButtonToolTip(true)}
                    onMouseLeave={() => setShowBookingButtonToolTip(false)}
                    className="relative"
                  >
                    <button
                      className={`px-4 py-2 text-black rounded cursor-pointer ${
                        userOccupancyData ||
                        roomAvailability?.type === "occupied"
                          ? "bg-gray-300 opacity-60"
                          : "bg-[#A2DEF9] hover:bg-[#b4e8ff]"
                      }`}
                      onClick={() => setBookNowModal(!bookNowModal)}
                      disabled={
                        userOccupancyData ||
                        roomAvailability?.type === "occupied"
                      }
                    >
                      Book Now
                    </button>
                    {userOccupancyData && (
                      <div
                        className={`absolute w-full p-3 text-xs bg-gray-100 shadow-md rounded-xs -top-18 transition-all duration-500 ${
                          showBookingButtonToolTip
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                        }`}
                      >
                        <p>You are still occupied.</p>
                      </div>
                    )}
                    {roomAvailability?.type === "occupied" &&
                      userOccupancyData?.room_id !== roomId && (
                        <div
                          className={`absolute w-full p-3 text-xs bg-gray-100 shadow-md rounded-xs -top-20 transition-all duration-500 ${
                            showBookingButtonToolTip
                              ? "opacity-100"
                              : "opacity-0 pointer-events-none"
                          }`}
                        >
                          <p>This room is already occupied.</p>
                        </div>
                      )}
                  </div>

                  <div
                    onMouseEnter={() =>
                      setShowBookingReservationButtonToolTip(true)
                    }
                    onMouseLeave={() =>
                      setShowBookingReservationButtonToolTip(false)
                    }
                    className="relative"
                  >
                    <button
                      className={`px-4 py-2 text-gray-800 rounded cursor-pointer ${
                        userReservationData
                          ? "bg-gray-300 opacity-60"
                          : "bg-[#A2DEF9] hover:bg-[#b4e8ff]"
                      }`}
                      onClick={() => setReserveModal(!reserveModal)}
                      disabled={userReservationData}
                    >
                      Reserve
                    </button>

                    {userReservationData && (
                      <div
                        className={`absolute p-3 text-xs bg-gray-100 shadow-md rounded-xs -top-26 transition-all duration-500 ${
                          showBookingReservationButtonToolTip
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                        }`}
                      >
                        <p>
                          You still have reservation at{" "}
                          <Link
                            to={`/room/${userReservationData.room_id}`}
                            className="hover:underline"
                          >
                            room {userReservationData.room_number}
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-red-500">
                Booking is not available at this time period.
              </p>
            )}
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold">Room Details</h3>

            {userOccupancyData?.room_id === roomId &&
              userOccupancyData?.professor_id === user.school_id && (
                <div className="text-sm text-[#F56C18] mb-4">
                  <p className="font-bold">Notice</p>
                  <div className="flex items-start gap-2">
                    <IoMdTime size={20} />
                    <p>
                      {userOccupancyRemainingTime.hours > 0 && (
                        <>
                          {userOccupancyRemainingTime.hours === 1
                            ? userOccupancyRemainingTime.hours + " hour"
                            : userOccupancyRemainingTime.hours + " hours"}
                        </>
                      )}
                      {userOccupancyRemainingTime.hours > 0 &&
                        userOccupancyRemainingTime.minutes > 0 &&
                        " and "}
                      {userOccupancyRemainingTime.minutes > 0 && (
                        <>
                          {userOccupancyRemainingTime.minutes === 1
                            ? userOccupancyRemainingTime.minutes + " minute"
                            : userOccupancyRemainingTime.minutes + " minutes"}
                        </>
                      )}{" "}
                      remaining before checkout
                    </p>
                  </div>
                </div>
              )}

            <table className="min-w-full bg-white border-collapse">
              <tbody>
                <tr>
                  <td className="p-2 font-medium border">Room Number:</td>
                  <td className="p-2 border">{roomDetails?.room_number}</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium border">Room Capacity:</td>
                  <td className="p-2 border">{roomDetails?.capacity}</td>
                </tr>
                {isRoomAvailableForBooking && (
                  <tr>
                    <td className="p-2 font-medium border">Room Status:</td>
                    <td className="p-2 border">
                      <span
                        className={`${
                          roomAvailability.type === "available"
                            ? "text-green-500"
                            : "text-red-500"
                        } font-bold`}
                      >
                        {roomAvailability.message}
                      </span>
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="p-2 font-medium border">Resources:</td>
                  <td className="p-2 border">
                    Whiteboard: {roomDetails?.whiteboard ? "✅" : "❌"} <br />
                    TV: {roomDetails?.tv ? "✅" : "❌"}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="mt-4">
              {roomAvailability.type === "occupied" &&
                occupantBookingDetail && (
                  <div className="mb-4">
                    <h3
                      className={`text-lg font-semibold ${
                        roomAvailability.type === "available"
                          ? "text-black"
                          : "text-red-500"
                      }`}
                    >
                      Faculty in charge:
                    </h3>

                    <p>{occupantBookingDetail?.professor_name}</p>
                  </div>
                )}

              {userReservationData &&
                roomAvailability.type === "available" &&
                userReservationData?.room_id !== roomId &&
                !userOccupancyData && (
                  <div className="mb-3">
                    <p className="font-semibold text-green-600">
                      You have a reservation at{" "}
                      <Link
                        to={`/room/${userReservationData.room_id}`}
                        className="text-black hover:underline"
                      >
                        {convertTimeTo12HourFormat(
                          userReservationData?.start_time
                        )}
                      </Link>
                      {" in "}
                      <Link
                        to={`/room/${userReservationData.room_id}`}
                        className="text-black hover:underline"
                      >
                        room {userReservationData.room_number}
                      </Link>
                      .
                    </p>
                  </div>
                )}

              <div className="border border-[#BDBDBD] p-4 flex flex-col gap-1 rounded-md">
                <h4 className="font-semibold">Current Booking Information</h4>
                {roomAvailability.type === "occupied" &&
                occupantBookingDetail ? (
                  <>
                    <div className="flex gap-2">
                      <p className="text-red-500">Class & Block:</p>
                      <p>{occupantBookingDetail?.class_name}</p>
                    </div>

                    <div className="flex gap-2">
                      <p className="text-red-500">Start time:</p>
                      <p>
                        {convertTimeTo12HourFormat(
                          occupantBookingDetail?.start_time
                        )}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <p className="text-red-500">Checkout Time:</p>
                      <p>
                        {convertTimeTo12HourFormat(
                          occupantBookingDetail?.end_time
                        )}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <p className="text-red-500">Purpose:</p>
                      <p>{occupantBookingDetail?.purpose}</p>
                    </div>
                  </>
                ) : !occupantBookingDetail &&
                  roomAvailability.type === "occupied" ? (
                  <p className="text-sm font-semibold text-green-500">
                    Booking will be available once the current occupancy ends.
                  </p>
                ) : userOccupancyData &&
                  roomAvailability.type === "available" ? (
                  <>
                    <p className="font-bold text-red-500">
                      You are still occupying{" "}
                      <Link
                        to={`/room/${userOccupancyData.room_id}`}
                        className="hover:underline"
                      >
                        room {userOccupancyData.room_number}
                      </Link>
                      .
                    </p>

                    <div className="flex gap-2">
                      <p className="text-red-500">Checkout Time:</p>
                      <p>
                        {convertTimeTo12HourFormat(userOccupancyData?.end_time)}
                      </p>
                    </div>
                  </>
                ) : isRoomAvailableForBooking ? (
                  <p className="text-sm font-semibold text-green-500">
                    Room is available for booking, you can book now.
                  </p>
                ) : (
                  <p className="text-sm text-red-500">
                    Booking is not available at this time period.
                  </p>
                )}
              </div>

              {userOccupancyData?.room_id === roomId &&
                userOccupancyData?.professor_id === user.school_id && (
                  <>
                    <div className="flex gap-3 mt-4">
                      {!isCancelButtonTimeout && (
                        <button
                          className="px-4 py-2 text-white text-sm rounded cursor-pointer
                            bg-[#EF5350] hover:bg-[#ff9292]"
                          title="Cancel this booking"
                          onClick={handleCancelBooking}
                        >
                          Cancel booking
                        </button>
                      )}

                      {isEndNowButtonAllowedToShow && (
                        <button
                          className="px-4 py-2 text-white text-sm rounded cursor-pointer
                            bg-[#ffac28] hover:bg-[#c7a877]"
                          title="End this booking now"
                          onClick={handleEndBookingNow}
                        >
                          End now
                        </button>
                      )}
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      </div>

      <BookingDetailPopup
        selectedBooking={selectedBooking}
        selectedBookingPosition={selectedBookingPosition}
        setSelectedBooking={setSelectedBooking}
        setEditBookingModal={setEditBookingModal}
        editBookingModal={editBookingModal}
        cancelReservation={cancelReservation}
      />

      <BookNowModal
        bookNowModal={bookNowModal}
        serverDate={serverDate}
        isTimeSlotAvailableForBookNow={isTimeSlotAvailableForBookNow}
        conflictWithUserReservation={conflictWithUserReservation}
        roomAvailability={roomAvailability}
        bookNow={bookNow}
        filteredStartTimeSlots={filteredStartTimeSlots}
        bookNowFormData={bookNowFormData}
        setBookNowFormData={setBookNowFormData}
        filteredEndTimeSlots={filteredEndTimeSlots}
        classes={classes}
        bookingsPurposes={bookingsPurposes}
        loading={loading}
        bookingMessage={bookingMessage}
        setBookNowModal={setBookNowModal}
      />

      <ReserveModal
        reserveModal={reserveModal}
        setReserveModal={setReserveModal}
        serverDate={serverDate}
        isTimeSlotAvailableForReserveBooking={
          isTimeSlotAvailableForReserveBooking
        }
        conflictWithUserOccupancy={conflictWithUserOccupancy}
        reserveBooking={reserveBooking}
        filteredStartTimeSlots={filteredStartTimeSlots}
        reserveBookingFormData={reserveBookingFormData}
        setReserveBookingFromData={setReserveBookingFromData}
        filteredEndTimeSlotsForReservation={filteredEndTimeSlotsForReservation}
        classes={classes}
        bookingsPurposes={bookingsPurposes}
        loading={loading}
        bookingMessage={bookingMessage}
      />

      <EditBookingModal
        editBookingModal={editBookingModal}
        setEditBookingModal={setEditBookingModal}
        setSelectedBooking={setSelectedBooking}
        selectedBooking={selectedBooking}
        serverDate={serverDate}
        filteredStartTimeSlots={filteredStartTimeSlots}
        filteredEndTimeSlotsForReservation={filteredEndTimeSlotsForReservation}
        classes={classes}
        bookingsPurposes={bookingsPurposes}
        editBookingFormData={editBookingFormData}
        setEditBookingFormData={setEditBookingFormData}
        editBooking={editBooking}
        loading={loading}
        bookingMessage={bookingMessage}
        bookings={bookings}
      />

      {/* MODAL */}
      <CancelModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => {
          cancelBooking();
          setShowCancelModal(false);
        }}
        loading={loading}
      />

      <EndNowModal
        isOpen={showEndNowModal}
        onClose={() => setShowEndNowModal(false)}
        onConfirm={() => {
          endBooking();
          setShowEndNowModal(false);
        }}
        loading={loading}
      />

      {/* Background Overlay */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black z-10 ${
          bookNowModal ||
          reserveModal ||
          editBookingModal ||
          bookingMessage.isBookingMessageAvailable ||
          loading
            ? "opacity-30 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Booking Response Message */}
      <div
        className={`fixed z-10 p-4 m-0 transform -translate-x-1/2 bg-white left-1/2 shadow-xl transition-all duration-500 ease font-semibold text-sm rounded ${
          bookingMessage.isBookingMessageAvailable
            ? "top-12 opacity-100"
            : "-top-10 opacity-0"
        } ${
          bookingMessage.type === "success" ? "text-cyan-500" : "text-red-500"
        }`}
      >
        <p>{bookingMessage.message}</p>
      </div>

      {/* Loading spinner */}
      <div
        className={`fixed z-20 w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-6 rounded-1/2 border-t-transparent border-cyan-500 left-1/2 top-1/2 ${
          loading ? "block animate-spin" : "hidden"
        }`}
      ></div>
    </main>
  );
};

export default RoomDetails;
