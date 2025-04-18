import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookNowModal from "./components/modals/BookNowModal";
import ReserveModal from "./components/modals/ReserveModal";
import BookingDetailPopup from "./components/BookingDetailPopup";
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

const API_URL = import.meta.env.VITE_API_URL;

const RoomDetails = () => {
  //React router dom states
  const { id } = useParams();
  const roomId = id;

  const { user } = useAuth();

  const {
    roomDetails,
    classes,
    timeslots,
    bookings,
    bookingsPurposes,
    serverDate,
    professor,
    fetchBookings,
    userOccupancyData,
    checkUserOccupancy,
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
  } = useRoomRequests();

  //Form Spread Operators

  // Modal States
  const [bookNowModal, setBookNowModal] = useState(false);
  const [reserveModal, setReserveModal] = useState(false);

  //Response message states
  const [roomAvailability, setRoomAvailability] = useState({
    status: true,
    message: "",
    type: "",
  });

  //Other States
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [nearestTimeInTimeslot, setNearestTimeInTimeSlot] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedBookingPosition, setSelectedBookingPosition] = useState(null);
  const [filteredStartTimeSlots, setFilteredStartTimeslots] = useState([]);
  const [filteredEndTimeSlots, setFilteredEndTimeslots] = useState([]);
  const [
    filteredEndTimeSlotsForReservation,
    setFilteredEndTimeSlotsForReservation,
  ] = useState([]);
  const [isTimeSlotAvailableForBookNow, setIsTimeSlotAvailableForBookNow] =
    useState(true);
  const [
    isTimeSlotAvailableForReserveBooking,
    setIsTimeSlotAvailableForReserveBooking,
  ] = useState(true);
  const [isRoomAvailableForBooking, setIsRoomAvailableForBooking] =
    useState(true);
  const [occupantBookingDetail, setOccupantBookingDetail] = useState({});
  const [isOccupantTheUser, setIsOccupantTheUser] = useState(false);
  const [occupantRemainingTime, setOccupantRemainingTime] = useState({
    hours: 0,
    minutes: 0,
  });

  //Other Declarations
  const isBookingsFetchedRef = useRef(false);
  const lastMinuteRef = useRef(null);
  const scrollableDivRef = useRef(null);
  const hasScrolledInitially = useRef(false);
  const initialTimePosition = 22.5;
  const timeslotDistance = 48;

  //useEffect section
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

  useEffect(() => {
    if (reserveBookingFormData.startTime) {
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
  }, [reserveBookingFormData.startTime]);

  useEffect(() => {
    checkAvailability("bookNow");
  }, [bookNowFormData.startTime, bookNowFormData.endTime, bookings]);

  useEffect(() => {
    checkAvailability("reserveBooking");
  }, [
    reserveBookingFormData.startTime,
    reserveBookingFormData.endTime,
    bookings,
  ]);

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

  useEffect(() => {
    if (
      (bookingMessage.isBookingMessageAvaialable && bookNowModal) ||
      (bookingMessage.isBookingMessageAvaialable && reserveModal)
    ) {
      setBookNowModal(false);
      setReserveModal(false);
      fetchBookings();
    }
  }, [bookingMessage, loading]);

  useEffect(() => {
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(interval);
  }, [isRoomAvailableForBooking, bookings]);

  useEffect(() => {
    if (bookings.length > 0) {
      checkBookingTypeChanges();
    }
  }, [currentTime]);

  //Post Request for updating booking type
  const updateBookingsType = async (updateToCurrentBook, type) => {
    try {
      const response = await fetch(`${API_URL}/api/updateBookingType`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toBeUpdated: updateToCurrentBook,
          roomId: roomId,
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

  //Functions
  const checkBookingTypeChanges = () => {
    const isBookingTypeCorrect = bookings.some((booking) => {
      return (
        currentTime >= convertTimeToMinutes(booking.start_time) &&
        currentTime < convertTimeToMinutes(booking.end_time) &&
        booking.booking_type === "current_book"
      );
    });
    const checkPreviousCurrentBook = bookings.find((booking) => {
      return (
        currentTime >= convertTimeToMinutes(booking.end_time) &&
        booking.booking_type === "current_book"
      );
    });
    if (checkPreviousCurrentBook) {
      updateBookingsType(checkPreviousCurrentBook.booking_id, "updateCurrent");
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
        updateBookingsType(updateToCurrentBook.booking_id, "updatePrevious");
      }
    }
  };

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

  const updatePosition = () => {
    if (selectedBooking) {
      const bookingElement = document.getElementById(
        `booking-${selectedBooking.booking_id}`
      );
      const bookingElementRect = bookingElement.getBoundingClientRect();

      setSelectedBookingPosition({
        top: bookingElementRect.top + window.scrollY,
        left: bookingElementRect.left + bookingElementRect.width * 1.9,
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

  const handleSelectedBookingClick = (booking, event) => {
    const bookingRect = event.target.getBoundingClientRect();

    setSelectedBooking(booking);
    setSelectedBookingPosition({
      top: bookingRect.top + window.scrollY,
      left: bookingRect.left + bookingRect.width * 1.9,
    });
  };

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

    bookingType === "bookNow"
      ? setIsTimeSlotAvailableForBookNow(!isOverlapping)
      : setIsTimeSlotAvailableForReserveBooking(!isOverlapping);
  };

  const checkRoomAvailability = () => {
    const currentMinutes =
      ((currentTimePosition - initialTimePosition) / timeslotDistance) * 30;

    return bookings.some((booking) => {
      const startMinutes = convertTimeToMinutes(booking.start_time) - 420;
      const endMinutes = convertTimeToMinutes(booking.end_time) - 420;

      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    });
  };

  useEffect(() => {
    if (roomAvailability.type === "occupied") {
      getOccupantBookingDetails();
    } else {
      setOccupantBookingDetail({});
    }

    checkUserOccupancy();
  }, [roomAvailability]);

  const getOccupantBookingDetails = () => {
    const occupantBookingDetail = bookings.find((booking) => {
      return booking.booking_type === "current_book";
    });
    setOccupantBookingDetail(occupantBookingDetail);
  };

  useEffect(() => {
    if (occupantBookingDetail?.professor_id === user.school_id) {
      setIsOccupantTheUser(true);
      checkOccupantRemainingTime();
    } else {
      setIsOccupantTheUser(false);
    }
  }, [occupantBookingDetail, currentTime]);

  const checkOccupantRemainingTime = () => {
    const remainingTime =
      convertTimeToMinutes(occupantBookingDetail.end_time) - currentTime;

    const hours = remainingTime < 60 ? 0 : Math.floor(remainingTime / 60);
    const minutes = remainingTime % 60;

    setOccupantRemainingTime({
      hours: hours,
      minutes: minutes,
    });
  };

  return (
    <main className="container h-full bg-[#FAFAFA]">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl">
          {" "}
          <Link to="/bookings" className="hover:underline">
            Booking Section
          </Link>{" "}
          &gt;{" "}
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
                  className="relative px-6 overflow-y-scroll border border-gray-200 h-105"
                  ref={scrollableDivRef}
                >
                  <div
                    className="absolute h-[3px] left-24 right-0 bg-red-500 z-10"
                    style={{ top: `${currentTimePosition}px` }}
                  />
                  {timeslots.map((timeslot, index) => (
                    <div key={index} className="flex items-center">
                      <p className="min-w-[4rem]">
                        {convertTimeTo12HourFormat(timeslot.time)}
                      </p>
                      <div className="w-full h-[1px] bg-gray-300"></div>
                    </div>
                  ))}
                  {bookings.map((booking, index) => {
                    const start = bookingTimeToMinutes(booking.start_time);
                    const end = bookingTimeToMinutes(booking.end_time);
                    const top =
                      (start / 30) * timeslotDistance +
                      initialTimePosition +
                      1.5;
                    const height = ((end - start) / 30) * timeslotDistance;

                    return (
                      <div
                        key={index}
                        id={`booking-${booking.booking_id}`}
                        className={`absolute w-48 p-2 text-sm text-white bg-blue-500 rounded cursor-pointer left-28 ${
                          booking.booking_type === "current_book"
                            ? ""
                            : "opacity-60"
                        }`}
                        style={{ top: `${top}px`, height: `${height}px` }}
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

                <div className="flex gap-2 mt-6">
                  <button
                    className={`px-4 py-2 text-black rounded cursor-pointer ${
                      userOccupancyData.length === 0
                        ? "bg-[#A2DEF9] hover:bg-[#b4e8ff]"
                        : "bg-gray-300 opacity-60"
                    }`}
                    onClick={() => setBookNowModal(!bookNowModal)}
                    disabled={userOccupancyData.length > 0}
                  >
                    Book Now
                  </button>
                  <button
                    className="px-4 py-2 text-gray-800 bg-[#FFCC80] rounded hover:bg-[#ffc080] cursor-pointer"
                    onClick={() => setReserveModal(!reserveModal)}
                  >
                    Reserve
                  </button>
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

            {isOccupantTheUser && (
              <div className="text-sm text-[#F56C18] mb-4">
                <p className="font-bold">Notice</p>
                <div className="flex items-start gap-2">
                  <IoMdTime size={20} />
                  <p>
                    {occupantRemainingTime.hours > 0 && (
                      <>
                        {occupantRemainingTime.hours === 1
                          ? occupantRemainingTime.hours + " hour"
                          : occupantRemainingTime.hours + " hours"}
                      </>
                    )}
                    {occupantRemainingTime.hours > 0 &&
                      occupantRemainingTime.minutes > 0 &&
                      " and "}
                    {occupantRemainingTime.minutes > 0 && (
                      <>
                        {occupantRemainingTime.minutes === 1
                          ? occupantRemainingTime.minutes + " minute"
                          : occupantRemainingTime.minutes + " minutes"}
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
              {roomAvailability.type === "occupied" ? (
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
              ) : (
                <h3
                  className={`mb-2 text-lg font-semibold ${
                    roomAvailability.type === "available"
                      ? "text-black"
                      : "text-red-500"
                  }`}
                >
                  Room Occupant details
                </h3>
              )}

              <div className="border border-[#BDBDBD] p-4 flex flex-col gap-1">
                {roomAvailability.type === "occupied" ? (
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
                ) : (
                  <p className="text-green-500">
                    Room is available for booking, you can book now.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BookingDetailPopup
        selectedBooking={selectedBooking}
        selectedBookingPosition={selectedBookingPosition}
        setSelectedBooking={setSelectedBooking}
      />

      <BookNowModal
        bookNowModal={bookNowModal}
        serverDate={serverDate}
        isTimeSlotAvailableForBookNow={isTimeSlotAvailableForBookNow}
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

      {/* Background Overlay */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black ${
          bookNowModal ||
          reserveModal ||
          bookingMessage.isBookingMessageAvaialable
            ? "opacity-30 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Booking Response Message */}
      <div
        className={`fixed z-10 p-3 m-0 transform -translate-x-1/2 bg-white left-1/2 shadow-xl transition-all duration-500 ease ${
          bookingMessage.isBookingMessageAvaialable
            ? "top-12 opacity-100"
            : "-top-10 opacity-0"
        } ${
          bookingMessage.type === "success" ? "text-green-500" : "text-red-500"
        }`}
      >
        <p>{bookingMessage.message}</p>
      </div>

      {/* Loading spinner */}
      <div
        className={`fixed z-10 w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-6 rounded-1/2 border-t-transparent border-cyan-500 left-1/2 top-1/2 ${
          loading ? "block animate-spin" : "hidden"
        }`}
      ></div>
    </main>
  );
};

export default RoomDetails;
