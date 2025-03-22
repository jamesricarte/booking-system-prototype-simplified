import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Nav from "../../../components/Nav";
import Button from "../../../components/Button";
import { IoIosClose } from "react-icons/io";

const API_URL = import.meta.env.VITE_API_URL;

const RoomDetails = () => {
  // Database States
  const [roomDetails, setRoomDetails] = useState(null);
  const [classes, setClasses] = useState([]);
  const [timeslots, setTimeslots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingsPurposes, setBookingsPurposes] = useState([]);
  const [serverDate, setServerDate] = useState(null);

  //Form States
  const [bookNowFormData, setBookNowFormData] = useState({
    startTime: "",
    endTime: "",
    classId: "",
    purpose: "",
    roomId: "",
    professorId: "",
  });

  //React router dom states
  const { id } = useParams();

  // Modal States
  const [bookNowModal, setBookNowModal] = useState(false);
  const [reserveModal, setReserveModal] = useState(false);

  //Other States
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedBookingPosition, setSelectedBookingPosition] = useState(null);
  const [filteredStartTimeSlots, setFilteredStartTimeslots] = useState([]);
  const [filteredEndTimeSlots, setFilteredEndTimeslots] = useState([]);

  //Other Declarations
  const scrollableDivRef = useRef(null);

  //Form Spread Operators
  const handleBookNowFormData = (e) => {
    const { name, value } = e.target;
    setBookNowFormData({ ...bookNowFormData, [name]: value });
  };

  //POST Requests
  const bookNow = async (e) => {
    e.preventDefault();

    console.log(bookNowFormData);
    console.log(timeslots.slice(0, -1));

    // try {
    //   const response = await fetch(`${API_URL}/api/newBooking`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(bookNowFormData),
    //   });

    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw errorData;
    //   }

    //   const result = await response.json();
    //   console.log(result);
    // } catch (error) {
    //   console.error(error);
    // }
  };

  //Fetches from database
  const fetchRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/api/room/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      setRoomDetails(result.room);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/classes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      setClasses(result.classes);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchTimeslots = async () => {
    try {
      const response = await fetch(`${API_URL}/api/timeslots`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      setTimeslots(result.timeslots);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bookings/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      const updatedDateResult = {
        ...result,
        server_date: convertUTCDateToSameTimezone(result.server_date),
        bookings: result.bookings.map((booking) => ({
          ...booking,
          date: convertUTCDateToSameTimezone(booking.date),
        })),
      };
      setBookings(updatedDateResult.bookings);
      setServerDate(updatedDateResult.server_date);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchBookingPurposes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bookingPurposes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      setBookingsPurposes(result.bookingPurposes);
    } catch (error) {
      console.error(error);
    }
  };

  //Functions
  const convertTimeTo12HourFormat = (time) => {
    if (time) {
      let [hours, minutes, seconds] = time.split(":").map(Number);
      let period;

      if (hours < 12) {
        period = "AM";
      } else {
        period = "PM";
      }

      hours = hours % 12 || 12;

      return (
        hours.toString().padStart(2, "0") +
        ":" +
        minutes.toString().padStart(2, "0") +
        " " +
        period
      );
    }
  };

  const convertUTCDateToSameTimezone = (dateTime) => {
    const localDate = new Date(dateTime);
    const formattedLocalDate = localDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return formattedLocalDate;
  };

  const convertTimeToMinutes = (time) => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const bookingTimeToMinutes = (time) => {
    let [hour, minutes, seconds] = time.split(":").map(Number);
    return (hour - 7) * 60 + minutes;
  };

  const getNearestTimeSlot = () => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    minutes = minutes < 30 ? 0 : 30;

    return hours * 60 + minutes;
  };

  const updateCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = (hours - 7) * 60 + minutes;

    if (hours - 7 <= 0) {
      setCurrentTimePosition(25);
    } else if (hours - 7 >= 12) {
      setCurrentTimePosition(50.4 * 24 + 25);
    } else {
      setCurrentTimePosition((totalMinutes / 30) * 50.4 + 25);
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

  //useEffect section
  useEffect(() => {
    fetchRoom();
    fetchClasses();
    fetchTimeslots();
    fetchBookings();
    fetchBookingPurposes();
  }, []);

  useEffect(() => {
    const filteredTimeSlots = timeslots.filter(
      (timeslot) => convertTimeToMinutes(timeslot.time) >= getNearestTimeSlot()
    );
    setFilteredStartTimeslots(
      filteredTimeSlots.length > 0
        ? filteredTimeSlots
        : [timeslots[timeslots.length - 1]]
    );
  }, [timeslots]);

  useEffect(() => {
    setBookNowFormData((prevData) => ({
      ...prevData,
      startTime: filteredStartTimeSlots[0]?.id,
      endTime: filteredStartTimeSlots[0]?.id,
      classId: classes[0]?.id,
      purpose: "Lecture",
      roomId: roomDetails?.id,
      professorId: 1,
    }));
  }, [filteredStartTimeSlots, classes, roomDetails]);

  useEffect(() => {
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);

    return () => clearInterval(interval);
  });

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

            <div>
              <h4>Status:</h4>
              <p className="text-red-500">Occupied at the moment.</p>
            </div>
          </div>

          <h3>Bookings</h3>
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
            bookNowModal ? "block" : "hidden"
          }`}
        >
          <form onSubmit={bookNow}>
            <h3>Book now</h3>
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
                  value={bookNowFormData.startTime}
                  onChange={handleBookNowFormData}
                >
                  {timeslots
                    .slice(0, -1)
                    .filter((timeslot, index, arr) => {
                      const nearestTime = getNearestTimeSlot();
                      const slotTime = convertTimeToMinutes(timeslot.time);
                      const hasValidSlots = arr.some(
                        (timeslot) =>
                          convertTimeToMinutes(timeslot.time) >= nearestTime
                      );

                      return (
                        slotTime >= nearestTime ||
                        (!hasValidSlots && index === arr.length - 1)
                      );
                    })
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
                  value={bookNowFormData.endTime}
                  onChange={handleBookNowFormData}
                >
                  {timeslots
                    .filter(
                      (timeslot) =>
                        timeslot.id > parseInt(bookNowFormData.startTime)
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
            <Button type="submit">Book Now</Button>
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
            reserveModal ? "block" : "hidden"
          }`}
        >
          <form>
            <h3>Reserve Booking</h3>
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
                  value={bookNowFormData.startTime}
                  onChange={handleBookNowFormData}
                >
                  {timeslots
                    .slice(0, -1)
                    .filter((timeslot, index, arr) => {
                      const nearestTime = getNearestTimeSlot();
                      const slotTime = convertTimeToMinutes(timeslot.time);
                      const hasValidSlots = arr.some(
                        (timeslot) =>
                          convertTimeToMinutes(timeslot.time) >= nearestTime
                      );

                      return (
                        slotTime >= nearestTime ||
                        (!hasValidSlots && index === arr.length - 1)
                      );
                    })
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
                  value={bookNowFormData.endTime}
                  onChange={handleBookNowFormData}
                >
                  {timeslots
                    .filter(
                      (timeslot) =>
                        timeslot.id > parseInt(bookNowFormData.startTime)
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
            <Button type="submit">Reserve Booking</Button>
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
            bookNowModal || reserveModal
              ? "opacity-30 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        ></div>
      </main>
    </>
  );
};

export default RoomDetails;
