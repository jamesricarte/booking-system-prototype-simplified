import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BookingDetailPopup from "./components/BookingDetailPopup";
import useRoomFetches from "./hooks/useRoomFetches";
import {
  convertTimeTo12HourFormat,
  bookingTimeToMinutes,
  convertTimeToMinutes,
} from "../../../utils/timeUtils";
import { IoIosArrowRoundBack } from "react-icons/io";

const API_URL = import.meta.env.VITE_API_URL;

const AdminRoomDetails = () => {
  //React router dom states
  const { id } = useParams();
  const roomId = parseInt(id);

  const { roomDetails, timeslots, bookings, fetchBookings } =
    useRoomFetches(roomId);

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

  //For calculating the position of time indicator in scrollable div
  const [currentTimePosition, setCurrentTimePosition] = useState(0);

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

  //For getting the detail of occupant of this room
  const [occupantBookingDetail, setOccupantBookingDetail] = useState(null);

  //Remaining time data of occupant before checkout
  const [occupantRemainingTime, setOccupantRemainingTime] = useState({
    hours: 0,
    minutes: 0,
  });

  //Other Declarations
  const isBookingsFetchedRef = useRef(false);
  const lastMinuteRef = useRef(null);
  const scrollableDivRef = useRef(null);
  const hasScrolledInitially = useRef(false);
  const initialTimePosition = 43;
  const timeslotDistance = 56;

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

      const totalMinutes = (hours - 7) * 60 + minutes;

      if (hours - 7 < 0) {
        setCurrentTimePosition(initialTimePosition);
      } else if (hours - 7 >= 12) {
        setCurrentTimePosition(timeslotDistance * 24 + initialTimePosition);
      } else {
        setCurrentTimePosition(
          (totalMinutes / 30) * timeslotDistance + initialTimePosition
        );
        setCurrentTime(hours * 60 + minutes);
      }
    }
  };

  //Checking every minute if the type of current booking is correct, then change it in database if not correct
  useEffect(() => {
    checkBookingTypeChanges();
  }, [roomAvailability, currentTime]);

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

  //Getting the remaining time of user's occupancy before checkout
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

  return (
    <main className="container h-full bg-[#FAFAFA]">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-xl">
          {" "}
          <Link to="/adminBookings" className="hover:underline">
            Booking Section
          </Link>{" "}
          <span className="text-base">&gt;</span>{" "}
          <Link to={`/admin/room/${roomId}`} className="hover:underline">
            Room Details
          </Link>
        </h1>
        <Link to="/adminBookings">
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

            <div
              className="relative px-6 overflow-y-scroll border border-gray-200 h-[66vh]"
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
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold">Room Details</h3>

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
                    Occupant already ended his booking.
                  </p>
                ) : (
                  <p className="text-sm font-semibold text-green-500">
                    Room is not occupied at the moment.
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
    </main>
  );
};

export default AdminRoomDetails;
