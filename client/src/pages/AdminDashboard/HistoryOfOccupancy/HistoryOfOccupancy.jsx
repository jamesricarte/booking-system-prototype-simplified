import { useEffect, useState } from 'react';
import axios from 'axios';

const HistoryOfOccupancy = () => {
  const [historyData, setHistoryData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        console.log('Fetching history of occupancy...');
        const response = await axios.get('/api/history-of-occupancy');
        console.log('Response data:', response.data);

        if (Array.isArray(response.data.data)) {
          setHistoryData(response.data.data);
        } else {
          console.error('Unexpected response format:', response.data);
          setError('Unexpected response format. Please contact support.');
        }
      } catch (error) {
        console.error('Error fetching history of occupancy:', error);
        setError(
          'Failed to fetch history of occupancy. Please try again later.'
        );
      }
    };

    fetchHistory();
  }, []);

  if (error) {
    return (
      <div className="container w-full h-full bg-white flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      <main className="container w-full h-full bg-white">
        <div className="p-4">
          <h1 className="text-xl">History of Occupancy</h1>
        </div>
        <hr />
        <div className="px-10 pt-7 overflow-auto max-h-[500px]">
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
