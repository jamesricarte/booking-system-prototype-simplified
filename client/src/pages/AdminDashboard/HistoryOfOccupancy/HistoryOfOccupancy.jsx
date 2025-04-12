import { useEffect, useState } from 'react';
import axios from 'axios';

const HistoryOfOccupancy = () => {
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get('/api/history-of-occupancy');
        setHistoryData(response.data);
      } catch (error) {
        console.error('Error fetching history of occupancy:', error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <>
      <main className="container w-full h-full bg-white">
        <div className="p-4">
          <h1 className="text-xl">History of Occupancy</h1>
        </div>
        <hr />
        <div className="px-10 pt-7">
          <table className="border-collapse w-full">
            <thead>
              <tr>
                <td className="border p-2">Room Number</td>
                <td className="border p-2">Class</td>
                <td className="border p-2">Faculty</td>
                <td className="border p-2">Time</td>
                <td className="border p-2">Date</td>
                <td className="border p-2">User Account</td>
              </tr>
            </thead>
            <tbody>
              {historyData.map((entry, index) => (
                <tr key={index}>
                  <td className="border p-2">{entry.roomNumber}</td>
                  <td className="border p-2">{entry.className}</td>
                  <td className="border p-2">{entry.faculty}</td>
                  <td className="border p-2">{entry.time}</td>
                  <td className="border p-2">{entry.date}</td>
                  <td className="border p-2">{entry.userAccount}</td>
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
