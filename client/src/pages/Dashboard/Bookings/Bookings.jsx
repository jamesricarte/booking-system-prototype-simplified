import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../../../components/Nav";
import Button from "../../../components/Button";

const API_URL = import.meta.env.VITE_API_URL;

const Bookings = () => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    fetchRooms();
  }, []);

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
      <main className="container w-full h-full mx-auto overflow-y-auto bg-white">
            <div className="p-4">
                <h1 className="text-xl">Booking Section</h1>
              </div>
        <div>
          <table className="w-full h-screen border-collapse">
            <thead className="bg-[#B3E5FC]">
              <tr>
                <td className="p-2 text-center">Room no.</td>
                <td className="p-2 text-center">Status</td>
                <td className="p-2 text-center">Checkout Time</td>
                <td className="p-2 text-center">Action</td>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, index) => (
                <tr key={index}>
                  <td className="text-center">
                    <p>{room.room_number}</p>
                  </td>
                  <td className="text-center">
                    <div className="p-2 bg-green-500 rounded-md">Vacant</div>
                  </td>
                  <td className="text-center">--:--:--</td>
                  <td>
                    <div className="flex items-center justify-center">
                      <Button className="px-4 py-2 mr-2 text-black bg-[#B3E5FC] rounded hover:bg-[#a1e1ff]">
                          Book Now
                      </Button>
                      <Link to={`/room/${room.id}`}>
                        <Button className="px-4 py-2 text-black bg-[#FFCC80] rounded hover:bg-[#ffc480]">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default Bookings;
