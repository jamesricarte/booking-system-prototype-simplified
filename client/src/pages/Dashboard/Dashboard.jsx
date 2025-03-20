import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Nav from "../../components/Nav";

const API_URL = import.meta.env.VITE_API_URL;

const Dashboard = () => {
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
      <Nav />
      <main className="flex flex-col items-center">
        <table className="border-collapse">
          <thead>
            <tr>
              <td>Room no.</td>
              <td>Details</td>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room, index) => (
              <tr key={index}>
                <td>
                  <Link to={`/room/${room.id}`}>{room.room_number}</Link>
                </td>
                <td>info</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
};

export default Dashboard;
