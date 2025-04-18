import { useEffect, useState } from "react";
import {
  convertUTCDateToSameTimezone,
  convertTimeTo12HourFormat,
} from "../../../utils/timeUtils";

const API_URL = import.meta.env.VITE_API_URL;

const HistoryOfOccupancy = () => {
  const [historyData, setHistoryData] = useState([]);

  const fetchHistoryOccupancy = async () => {
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
      setHistoryData(result.occupancyHistory);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchHistoryOccupancy();
  }, []);

  return (
    <>
      <main className="container h-full bg-white">
        <div className="p-4">
          <h1 className="text-xl">History of Occupancy</h1>
        </div>
        <hr />
        <div className="px-10 py-7 overflow-auto h-[78vh]">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <td className="p-2 border">Room Number</td>
                <td className="p-2 border">Class</td>
                <td className="p-2 border">Faculty</td>
                <td className="p-2 border">Time</td>
                <td className="p-2 border">Date</td>
                <td className="p-2 border">User Account</td>
              </tr>
            </thead>
            <tbody>
              {historyData.map((data, index) => (
                <tr key={index}>
                  <td className="p-2 border">{data.room_number}</td>
                  <td className="p-2 border">{data.class_name}</td>
                  <td className="p-2 border">{data.professor_name}</td>
                  <td className="p-2 border">
                    {convertTimeTo12HourFormat(data.start_time)} -{" "}
                    {convertTimeTo12HourFormat(data.end_time)}
                  </td>
                  <td className="p-2 border">
                    {convertUTCDateToSameTimezone(data.date)}
                  </td>
                  <td className="p-2 border">{data.professor_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
};

export default HistoryOfOccupancy;
