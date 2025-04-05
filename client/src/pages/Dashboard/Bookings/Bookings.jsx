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
      <main className="container w-full h-full px-4 mx-auto bg-white">
        <div className="flex flex-col items-center justify-center">
          <h3>Bookings</h3>
          <table className="border-collapse">
            <thead>
              <tr>
                <td>Room no.</td>
                <td>Status</td>
                <td>Checkout Time</td>
                <td>Action</td>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room, index) => (
                <tr key={index}>
                  <td>
                    <p>{room.room_number}</p>
                  </td>
                  <td>Vacant</td>
                  <td>10:30pm</td>
                  <td>
                    <Button>Book Now</Button>
                    <Link to={`/room/${room.id}`}>
                      <Button>Details</Button>
                    </Link>
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
