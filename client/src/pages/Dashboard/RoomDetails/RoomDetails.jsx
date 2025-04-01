import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Nav from "../../../components/Nav";
import Button from "../../../components/Button";
import { IoIosClose } from "react-icons/io";
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
import useRoomPosts from "./hooks/useRoomPosts";
import { handleFormChange } from "../../../utils/formHandlers";

const RoomDetails = () => {
  //React router dom states
  const { id } = useParams();

  const {
    roomDetails,
    classes,
    timeslots,
    bookings,
    bookingsPurposes,
    serverDate,
    professor,
    fetchBookings,
  } = useRoomFetches(id);

  const {
    reserveBookingFormData,
    bookNowFormData,
    bookNow,
    reserveBooking,
    setBookNowFormData,
    setReserveBookingFromData,
    bookingMessage,
  } = useRoomPosts();

  //Form Spread Operators
  const handleBookNowFormData = handleFormChange(
    bookNowFormData,
    setBookNowFormData
  );
  const handleReserveBookingFormData = handleFormChange(
    reserveBookingFormData,
    setReserveBookingFromData
  );

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
  const [lastMinute, setLastMinute] = useState(null);
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

  //Other Declarations
  const scrollableDivRef = useRef(null);
  const hasScrolledInitially = useRef(false);

  //Functions
  const updateCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    if (minutes !== lastMinute) {
      setLastMinute(minutes);
      setNearestTimeInTimeSlot(nearestTimeInTimeSlotFunction(hours, minutes));

      const totalMinutes = (hours - 7) * 60 + minutes;

      if (hours - 7 <= 0) {
        setCurrentTimePosition(25);
        setIsRoomAvailableForBooking(false);
      } else if (hours - 7 >= 12) {
        setCurrentTimePosition(50.4 * 24 + 25);
        setIsRoomAvailableForBooking(false);
      } else {
        setCurrentTimePosition((totalMinutes / 30) * 50.4 + 25);
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
        left: bookingElementRect.left + bookingElementRect.width * 1.77,
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
      left: bookingRect.left + bookingRect.width * 1.77,
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
    const currentMinutes = ((currentTimePosition - 25) / 50.4) * 30;

    return bookings.some((booking) => {
      const startMinutes = convertTimeToMinutes(booking.start_time) - 420;
      const endMinutes = convertTimeToMinutes(booking.end_time) - 420;

      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    });
  };

  //useEffect section
  useEffect(() => {
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(interval);
  }, []);

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
      reserveModal
    ) {
      setBookNowModal(false);
      setReserveModal(false);
      fetchBookings();
    }
  }, [bookingMessage]);

  return (
    <>
      <Nav />
      <main className="flex flex-col items-center">
        <div>
          <Link to="/dashboard">
            <p>Back to Dashboard</p>
          </Link>

          <div>
            <h3>Room Details:</h3>
            <div className="flex items-center">
              <h4>Room Number:</h4>
              <p>{roomDetails?.room_number}</p>
            </div>
            <div className="flex items-center">
              <h4>Capacity:</h4>
              <p>{roomDetails?.capacity}</p>
            </div>
            <div>
              <h4>Resources:</h4>
              <p>Whiteboard: {roomDetails?.whiteboard ? "✅" : "❌"}</p>
              <p>TV: {roomDetails?.tv ? "✅" : "❌"}</p>
            </div>

            {isRoomAvailableForBooking && (
              <div>
                <h4>Status:</h4>

                <p
                  className={`${
                    roomAvailability.type === "available"
                      ? "text-green-500"
                      : "text-red-500"
                  } font-bold`}
                >
                  {roomAvailability.message}
                </p>
              </div>
            )}
          </div>

          <h3>Bookings</h3>
          {isRoomAvailableForBooking ? (
            <>
              <div
                className="relative px-6 overflow-y-scroll border border-gray-200 h-80 w-96"
                ref={scrollableDivRef}
              >
                {/* Current Time Indicator */}
                <div
                  className="absolute h-[3px] left-24 right-0 bg-red-500 z-10"
                  style={{ top: `${currentTimePosition}px` }}
                ></div>

                {/* Timeslots */}
                {timeslots.map((timeslot, index) => (
                  <div key={index} className="flex items-center">
                    <p className="min-w-20">
                      {convertTimeTo12HourFormat(timeslot.time)}
                    </p>
                    <div className="w-full h-[1px] bg-gray-300"></div>
                  </div>
                ))}

                {/* Bookings */}
                {bookings.map((booking, index) => {
                  const start = bookingTimeToMinutes(booking.start_time);
                  const end = bookingTimeToMinutes(booking.end_time);
                  const top = (start / 30) * 50.4 + 25;
                  const height = ((end - start) / 30) * 50.4;

                  return (
                    <div
                      key={index}
                      id={`booking-${booking.booking_id}`}
                      className="absolute w-48 px-1 text-sm text-white bg-blue-500 rounded cursor-pointer left-28"
                      style={{ top: `${top}px`, height: `${height}px` }}
                      onClick={(e) => handleSelectedBookingClick(booking, e)}
                    >
                      <div className="relative">
                        <p>{booking.professor_name}</p>
                        <p>{booking.class_name}</p>
                        <p>{booking.purpose}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={() => setBookNowModal(!bookNowModal)}>
                  Book Now
                </Button>
                <Button onClick={() => setReserveModal(!reserveModal)}>
                  Reserve
                </Button>
              </div>
            </>
          ) : (
            <p className="text-red-500">
              Booking is not available at this time period.
            </p>
          )}
        </div>

        {/* Modals Below: */}
        {/* Booking Detail Modal */}
        {selectedBooking && (
          <div
            className="absolute z-10 p-3 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-lg left-1/2 top-1/2"
            style={{
              top: `${selectedBookingPosition?.top}px`,
              left: `${selectedBookingPosition?.left}px`,
            }}
          >
            <div className="text-right">
              <IoIosClose
                size={30}
                className="hover:bg-gray-200"
                onClick={() => {
                  setSelectedBooking(null);
                }}
              />
            </div>
            <h3>Booking Details:</h3>
            <div className="flex gap-1">
              <p>Date: </p>
              <p>{selectedBooking.date.split("T")[0]}</p>
            </div>
            <div className="flex gap-1">
              <p>Room Number: </p>
              <p>{selectedBooking.room_number}</p>
            </div>
            <div className="flex gap-1">
              <p>Start Time:</p>
              <p>{convertTimeTo12HourFormat(selectedBooking.start_time)}</p>
            </div>
            <div className="flex gap-1">
              <p>End Time:</p>
              <p>{convertTimeTo12HourFormat(selectedBooking.end_time)}</p>
            </div>
            <div className="flex gap-1">
              <p>Faculty In Charge:</p>
              <p>{selectedBooking.professor_name}</p>
            </div>
            <div className="flex gap-1">
              <p>Class:</p>
              <p>{selectedBooking.class_name}</p>
            </div>
            <div className="flex gap-1">
              <p>Purpose:</p>
              <p>{selectedBooking.purpose}</p>
            </div>
          </div>
        )}

        {/* Book Now Modal */}
        <div
          className={`fixed px-6 py-2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-lg top-1/2 left-1/2 z-10 ${
            bookNowModal && !bookingMessage.isBookingMessageAvaialable
              ? "block"
              : "hidden"
          }`}
        >
          <form onSubmit={bookNow}>
            <h3>Book now</h3>
            {!isTimeSlotAvailableForBookNow ? (
              <p className="text-red-500">
                Sorry this room is occupied at this time period. You can reserve
                for another time.
              </p>
            ) : (
              <div className="flex">
                <p>Status: </p>
                <p
                  className={`${
                    roomAvailability.type === "available"
                      ? "text-green-500"
                      : "text-red-500"
                  } font-bold`}
                >
                  {roomAvailability.message}
                </p>
              </div>
            )}

            <div className="flex">
              <p>Date:</p>
              <p>{serverDate?.split("T")[0]}</p>
            </div>
            <div className="flex">
              <p>Time:</p>
              <div>
                <p>Start Time:</p>
                <p>
                  {convertTimeTo12HourFormat(filteredStartTimeSlots[0]?.time)}
                </p>
              </div>

              <div>
                <p>End Time:</p>
                <select
                  name="endTime"
                  value={bookNowFormData.endTime}
                  onChange={handleBookNowFormData}
                >
                  {filteredEndTimeSlots.map((timeslot, index) => (
                    <option key={index} value={timeslot.id}>
                      {convertTimeTo12HourFormat(timeslot.time)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex">
              <p>Faculty in Charge:</p>
              <p>Rogie Mar A. Bolon</p>
            </div>

            <div className="flex">
              <p>Class Year & Block:</p>
              <select
                name="classId"
                value={bookNowFormData.classId}
                onChange={handleBookNowFormData}
              >
                {classes.map((classItem, index) => (
                  <option key={index} value={classItem.id}>
                    {classItem.class_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex">
              <p>Purpose:</p>
              <select
                name="purpose"
                value={bookNowFormData.purpose}
                onChange={handleBookNowFormData}
              >
                {bookingsPurposes.map((bookingPurpose, index) => (
                  <option key={index} value={bookingPurpose}>
                    {bookingPurpose}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={!isTimeSlotAvailableForBookNow}>
              Book Now
            </Button>
            <Button
              type="button"
              onClick={() => setBookNowModal(!bookNowModal)}
            >
              Cancel
            </Button>
          </form>
        </div>

        {/* Reserve Modal */}
        <div
          className={`fixed px-6 py-2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-lg top-1/2 left-1/2 z-10 ${
            reserveModal && !bookingMessage.isBookingMessageAvaialable
              ? "block"
              : "hidden"
          }`}
        >
          <form onSubmit={reserveBooking}>
            <h3>Reserve Booking</h3>
            {!isTimeSlotAvailableForReserveBooking && (
              <p className="text-red-500">
                This time period is already booked. Please select a different
                time.
              </p>
            )}

            <div className="flex">
              <p>Date:</p>
              <p>{serverDate?.split("T")[0]}</p>
            </div>
            <div className="flex">
              <p>Time:</p>
              <div>
                <p>Start Time:</p>
                <select
                  name="startTime"
                  value={reserveBookingFormData.startTime}
                  onChange={handleReserveBookingFormData}
                >
                  {filteredStartTimeSlots
                    .slice(0, -1)
                    .map((timeslot, index) => (
                      <option key={index} value={timeslot.id}>
                        {convertTimeTo12HourFormat(timeslot.time)}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <p>End Time:</p>
                <select
                  name="endTime"
                  id="endTime"
                  value={reserveBookingFormData.endTime}
                  onChange={handleReserveBookingFormData}
                >
                  {filteredEndTimeSlotsForReservation
                    .filter(
                      (timeslot) =>
                        timeslot.id > parseInt(reserveBookingFormData.startTime)
                    )
                    .map((timeslot, index) => (
                      <option key={index} value={timeslot.id}>
                        {convertTimeTo12HourFormat(timeslot.time)}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex">
              <p>Faculty in Charge:</p>
              <p>Rogie Mar A. Bolon</p>
            </div>

            <div className="flex">
              <p>Class Year & Block:</p>
              <select
                name="classId"
                value={reserveBookingFormData.classId}
                onChange={handleReserveBookingFormData}
              >
                {classes.map((classItem, index) => (
                  <option key={index} value={classItem.id}>
                    {classItem.class_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex">
              <p>Purpose:</p>
              <select
                name="purpose"
                value={reserveBookingFormData.purpose}
                onChange={handleReserveBookingFormData}
              >
                {bookingsPurposes.map((bookingPurpose, index) => (
                  <option key={index} value={bookingPurpose}>
                    {bookingPurpose}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              disabled={!isTimeSlotAvailableForReserveBooking}
            >
              Reserve Booking
            </Button>
            <Button
              type="button"
              onClick={() => setReserveModal(!reserveModal)}
            >
              Cancel
            </Button>
          </form>
        </div>

        {/* Background */}
        <div
          className={`fixed top-0 left-0 w-full h-full bg-black  ${
            bookNowModal ||
            reserveModal ||
            bookingMessage.isBookingMessageAvaialable
              ? "opacity-30 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        ></div>

        {/* Booking response message */}
        <div
          className={`fixed z-10 p-3 m-0 transform -translate-x-1/2 bg-white left-1/2 shadow-xl transition-all duration-500 ease ${
            bookingMessage.isBookingMessageAvaialable
              ? "top-12 opacity-100"
              : "-top-10 opacity-0"
          } ${
            bookingMessage.type === "success"
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          <p>{bookingMessage.message}</p>
        </div>
      </main>
    </>
  );
};

export default RoomDetails;
