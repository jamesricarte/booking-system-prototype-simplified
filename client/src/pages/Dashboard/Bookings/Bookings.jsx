import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/Button";
import {
  convertTimeToMinutes,
  convertTimeTo12HourFormat,
} from "../../../utils/timeUtils";
import useFetchBookingsForAllRoom from "../../../hooks/useFetchBookingsForAllRoom";

const API_URL = import.meta.env.VITE_API_URL;

const Bookings = () => {
  const { bookingsForAllRoom } = useFetchBookingsForAllRoom();

  const [rooms, setRooms] = useState([]);
  const [currentTime, setCurrentTime] = useState(null);
  const [lastMinutes, setLastMinutes] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 1000);

    return () => clearInterval(interval);
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

  return (
    <>
      <main className="container h-full mx-auto bg-white">
        <div className="px-4 py-3 border-gray-400 border-b-1">
          <h1 className="text-xl">Booking Section</h1>
        </div>

        <div className="p-4 pr-8">
          <div className="h-[76vh] overflow-y-auto bg-white border-b border-b-gray-500">
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
                  <td className="p-2 text-center border border-black">
                    Action
                  </td>
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
                      <td className="p-6 text-center border border-gray-500 ">
                        <div
                          className={`p-1.5 text-white rounded-sm ${
                            !isWithinBookingHours
                              ? "bg-gray-200"
                              : isOccupied
                              ? "bg-[#EF5350]"
                              : "bg-[#66BB6A]"
                          }`}
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
                      <td>
                        <div className="flex items-center justify-center">
                          {/* {!isOccupied && (
                          <Button className="px-4 py-2 mr-2 text-black bg-[#A2DEF9] rounded hover:bg-[#82d1f5]">
                            Book Now
                          </Button>
                        )} */}
                          <Link to={`/room/${room.id}`}>
                            <Button className="px-4 py-2 text-black bg-[#A2DEF9] rounded hover:bg-[#82d1f5] cursor-pointer">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </td>
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

export default Bookings;
