import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/Button";
import {
  convertTimeToMinutes,
  convertTimeTo12HourFormat,
} from "../../../utils/timeUtils";
import useFetchBookingsForAllRoom from "../../../hooks/useFetchBookingsForAllRoom";
import { IoIosInformationCircle } from "react-icons/io";
import { RxEnterFullScreen } from "react-icons/rx";
import useWebSocket from "../../../hooks/useWebSocket";

import { API_URL, WS_URL as WEBSOCKET_URL } from "../../../config/apiConfig";

const AdminBookings = () => {
  const { bookingsForAllRoom, fetchBookingsForAllRoom } =
    useFetchBookingsForAllRoom();

  const { socket, isConnected } = useWebSocket(WEBSOCKET_URL);

  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      console.log("Message from server:", event.data);
      fetchBookingsForAllRoom();
    };
  }, [socket]);

  const [rooms, setRooms] = useState([]);
  const [currentTime, setCurrentTime] = useState(null);
  const [lastMinutes, setLastMinutes] = useState(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const divRef = useRef(null);

  const [showDisplayFullscreenInfo, setShowDisplayFullscreenInfo] =
    useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = document.fullscreenElement === divRef.current;
      setIsFullscreen(isFull);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const updateCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    if (minutes !== lastMinutes) {
      setLastMinutes(minutes);
      const totalMinutes = hours * 60 + minutes;
      setCurrentTime(totalMinutes);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${API_URL}/api/rooms`, {
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
      setRooms(result.rooms);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleFullscreen = () => {
    if (divRef.current) {
      if (divRef.current.requestFullscreen) {
        divRef.current.requestFullscreen();
      } else if (divRef.current.webkitRequestFullscreen) {
        divRef.current.webkitRequestFullscreen();
      } else if (divRef.current.msRequestFullscreen) {
        divRef.current.msRequestFullscreen();
      }
    }
  };

  return (
    <>
      <main className="container h-full mx-auto bg-white">
        <div className="flex items-center justify-between px-4 py-3 border-gray-400 border-b-1">
          <h1 className="text-xl">Booking Section</h1>
          <div className="flex items-center gap-4">
            <RxEnterFullScreen
              size={26}
              className="text-black cursor-pointer hover:text-gray-600"
              onClick={handleFullscreen}
              title="Enter fullscreen"
            />
            <div
              onMouseEnter={() => setShowDisplayFullscreenInfo(true)}
              onMouseLeave={() => setShowDisplayFullscreenInfo(false)}
              className="relative"
            >
              <IoIosInformationCircle
                className="text-black cursor-pointer hover:text-gray-600"
                size={28}
              />

              <div
                className={`absolute w-48 p-2 text-xs bg-gray-200 shadow-md rounded-xs -left-32 -bottom-22 transition-all duration-300 ${
                  showDisplayFullscreenInfo
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <p className="text-xs text-gray-900">
                  Turns the booking display into fullscreen mode. Ideal for
                  projecting or showing on a monitor.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 pr-8">
          <div
            ref={divRef}
            className={`bg-white border-b border-b-gray-500 ${
              !isFullscreen ? "h-[76vh] overflow-y-auto" : ""
            }`}
          >
            <table className="w-full h-screen border-collapse">
              <thead className="text-white bg-[#F56C18]">
                <tr className="border border-black">
                  <td className="p-2 text-center border border-black">
                    Room no.
                  </td>
                  <td className="p-2 text-center border border-black">
                    Status
                  </td>
                  <td className="p-2 text-center border border-black">
                    Faculty in Charge
                  </td>
                  <td className="p-2 text-center border border-black">
                    Checkout Time
                  </td>
                  {!isFullscreen && (
                    <td className="p-2 text-center border border-black">
                      Action
                    </td>
                  )}
                </tr>
              </thead>
              <tbody className="bg-[#EFEFEF]">
                {rooms.map((room, index) => {
                  const activeBooking = bookingsForAllRoom.find((booking) => {
                    return (
                      booking.room_id === room.id &&
                      currentTime >= convertTimeToMinutes(booking.start_time) &&
                      currentTime < convertTimeToMinutes(booking.end_time) &&
                      booking.booking_type !== "past"
                    );
                  });

                  const isOccupied = !!activeBooking;
                  const isWithinBookingHours =
                    currentTime >= 420 && currentTime < 1140;

                  return (
                    <tr key={index} className="border border-gray-500">
                      <td className="text-center border border-gray-500">
                        <p>{room.room_number}</p>
                      </td>
                      <td className="p-6 text-center border border-gray-500">
                        <div
                          className={`text-white rounded-sm ${
                            !isWithinBookingHours
                              ? "bg-gray-200"
                              : isOccupied
                              ? "bg-[#EF5350]"
                              : "bg-[#66BB6A]"
                          } ${!isFullscreen ? "p-1.5" : "py-2"}`}
                        >
                          <p
                            className={`${
                              !isWithinBookingHours && "text-red-500"
                            }`}
                          >
                            {!isWithinBookingHours
                              ? "Booking Not Available"
                              : isOccupied
                              ? "Occupied"
                              : "Vacant"}
                          </p>
                        </div>
                      </td>
                      <td className="text-center border border-gray-500">
                        <p className="font-semibold">
                          {isOccupied
                            ? `${activeBooking.professor_name}`
                            : "N/A"}
                        </p>
                      </td>
                      <td className="text-center border border-gray-500">
                        <p className="font-semibold">
                          {isOccupied
                            ? `${convertTimeTo12HourFormat(
                                activeBooking.end_time
                              )}`
                            : "--:--:--"}
                        </p>
                      </td>
                      {!isFullscreen && (
                        <td>
                          <div className="flex items-center justify-center">
                            <Link to={`/admin/room/${room.id}`}>
                              <Button className="px-4 py-2 text-black bg-[#A2DEF9] rounded hover:bg-[#82d1f5] cursor-pointer">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminBookings;
