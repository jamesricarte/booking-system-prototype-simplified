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
  const [bookings, setBookings] = useState([
    {
      id: 1,
      start_time: "09:30:00",
      end_time: "10:30:00",
      purpose: "Meeting with Client",
      professor_name: "Rogie Mar A. Bolon",
      class: "1A",
    },
    {
      id: 2,
      start_time: "14:00:00",
      end_time: "16:00:00",
      purpose: "Lecture with Students",
      professor_name: "Marites O. Olesco",
      class: "1B",
    },
  ]);

  //React router dom states
  const { id } = useParams();

  // Modal States
  const [bookNowModal, setBookNowModal] = useState(false);
  const [reserveModal, setReserveModal] = useState(false);

  //Other States
  const [currentTimePosition, setCurrentTimePosition] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedBookingPosition, setSelectedBookingPosition] = useState(null);

  //Other Declarations
  const scrollableDivRef = useRef(null);

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
      convertTimeSlotsTo12HourFormat(result.timeslots);
    } catch (error) {
      console.error(error.message);
    }
  };

  //Functions
  const convertTimeSlotsTo12HourFormat = (originalTimeslots) => {
    const convertedTimeslots = originalTimeslots.map((time, index) => {
      let [hour, minutes, seconds] = time.time.split(":").map(Number);
      let period;
      if (hour < 12) {
        period = "AM";
      } else {
        period = "PM";
      }

      hour = hour % 12 || 12;

      return {
        ...time,
        time: `${
          hour.toString().padStart(2, "0") +
          ":" +
          minutes.toString().padStart(2, "0") +
          " " +
          period
        }`,
      };
    });

    setTimeslots(convertedTimeslots);
  };

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

  const timeToMinutes = (time) => {
    let [hour, minutes, seconds] = time.split(":").map(Number);

    return (hour - 7) * 60 + minutes;
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
        `booking-${selectedBooking.id}`
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
  }, []);

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
                <p className="min-w-20">{timeslot.time}</p>
                <div className="w-full h-[1px] bg-gray-300"></div>
              </div>
            ))}

            {/* Bookings */}
            {bookings.map((booking, index) => {
              const start = timeToMinutes(booking.start_time);
              const end = timeToMinutes(booking.end_time);
              const top = (start / 30) * 50.4 + 25;
              const height = ((end - start) / 30) * 50.4;

              return (
                <div
                  key={index}
                  id={`booking-${booking.id}`}
                  className="absolute w-48 px-1 text-sm text-white bg-blue-500 rounded cursor-pointer left-28"
                  style={{ top: `${top}px`, height: `${height}px` }}
                  onClick={(e) => handleSelectedBookingClick(booking, e)}
                >
                  <div className="relative">
                    <p>{booking.professor_name}</p>
                    <p>{booking.class}</p>
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
            <h3>Booking Detail:</h3>
            <div className="flex gap-1">
              <p>Date: </p>
              <p>March 20, 2025</p>
            </div>
            <div className="flex gap-1">
              <p>Start Time:</p>
              <p>13:00:00</p>
            </div>
            <div className="flex gap-1">
              <p>End Time:</p>
              <p>14:30:00</p>
            </div>
            <div className="flex gap-1">
              <p>Faculty In Charge:</p>
              <p>Rogie Mar A. Bolon</p>
            </div>
            <div className="flex gap-1">
              <p>Class:</p>
              <p>1 B</p>
            </div>
            <div className="flex gap-1">
              <p>Purpose:</p>
              <p>Meeting with Client</p>
            </div>
          </div>
        )}

        {/* Book Now Modal */}
        <div
          className={`fixed px-6 py-2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-lg top-1/2 left-1/2 z-10 ${
            bookNowModal ? "block" : "hidden"
          }`}
        >
          <h3>Book this room</h3>
          <div className="flex">
            <p>Date:</p>
            <p>March 15, 2025</p>
          </div>
          <div className="flex">
            <p>Time:</p>
            <div>
              <p>Start Time:</p>
              <input type="time" />
            </div>

            <div>
              <p>End Time:</p>
              <input type="time" />
            </div>
          </div>

          <div className="flex">
            <p>professor_name in Charge:</p>
            <p>Rogie Mar A. Bolon</p>
          </div>

          <div className="flex">
            <p>Class Year & Block:</p>
            <select name="" id="">
              {classes.map((ClassItem, index) => (
                <option key={index} value={ClassItem.id}>
                  {ClassItem.class_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex">
            <p>Purpose:</p>
            <select name="" id="">
              <option value="">Lecture</option>
              <option value="">Workshop</option>
              <option value="">Meeting</option>
              <option value="">Seminar</option>
              <option value="">Group Study</option>
              <option value="">Exam</option>
              <option value="">Training Session</option>
              <option value="">Special Event</option>
              <option value="">Tutoring</option>
              <option value="">Club Activity</option>
            </select>
          </div>
          <Button>Book Now</Button>
          <Button onClick={() => setBookNowModal(!bookNowModal)}>Cancel</Button>
        </div>
        {/* Reserve Modal */}
        <div
          className={`fixed px-6 py-2 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-lg top-1/2 left-1/2 z-10 ${
            reserveModal ? "block" : "hidden"
          }`}
        >
          <h3>Reserve Booking</h3>
          <div className="flex">
            <p>Date:</p>
            <p>March 15, 2025</p>
          </div>
          <div className="flex">
            <p>Time:</p>
            <div>
              <p>Start Time:</p>
              <input type="time" />
            </div>

            <div>
              <p>End Time:</p>
              <input type="time" />
            </div>
          </div>

          <div className="flex">
            <p>professor_name in Charge:</p>
            <p>Rogie Mar A. Bolon</p>
          </div>

          <div className="flex">
            <p>Class Year & Block:</p>
            <select name="" id="">
              {classes.map((ClassItem, index) => (
                <option key={index} value={ClassItem.id}>
                  {ClassItem.class_name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex">
            <p>Purpose:</p>
            <select name="" id="">
              <option value="">Lecture</option>
              <option value="">Workshop</option>
              <option value="">Meeting</option>
              <option value="">Seminar</option>
              <option value="">Group Study</option>
              <option value="">Exam</option>
              <option value="">Training Session</option>
              <option value="">Special Event</option>
              <option value="">Tutoring</option>
              <option value="">Club Activity</option>
            </select>
          </div>
          <Button>Reserve Now</Button>
          <Button onClick={() => setReserveModal(!reserveModal)}>Cancel</Button>
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
