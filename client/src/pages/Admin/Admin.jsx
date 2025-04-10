import React, { useEffect, useState } from "react";
import Nav from "../../components/Nav";

const API_URL = import.meta.env.VITE_API_URL;

const Admin = () => {
  const [occupancyHistoryData, setOccupancyHistoryData] = useState([]);

  const fetchOccupancyHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/api/occupancyHistory`, {
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
      setOccupancyHistoryData(result.occupancyHistory);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOccupancyHistory();
  }, []);

  return (
    <>
      <Nav />
      <main className="flex flex-col items-center">
        <h3>History of Occupancy</h3>
        <table className="border-collapse">
          <thead>
            <tr>
              <td>Room Number</td>
              <td>Class</td>
              <td>Faculty</td>
              <td>Time</td>
              <td>Date</td>
              <td>User Account</td>
            </tr>
          </thead>
          <tbody>
            {occupancyHistoryData.map((occupancyHistory, index) => (
              <tr key={index}>
                <td>{occupancyHistory.room_id}</td>
                <td>{occupancyHistory.class_id}</td>
                <td>{occupancyHistory.professor_id}</td>
                <td>
                  {occupancyHistory.start_time} - {occupancyHistory.end_time}
                </td>
                <td>{occupancyHistory.date}</td>
                <td>{occupancyHistory.professor_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </>
  );
};

export default Admin;
