import { useEffect, useState } from 'react';
import { FaRegCalendarAlt } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  convertUTCDateToSameTimezone,
  convertTimeTo12HourFormat,
} from '../../../utils/timeUtils';

const API_URL = import.meta.env.VITE_API_URL;

const HistoryOfOccupancy = () => {
  const [historyData, setHistoryData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const entriesPerPage = 10;
  const totalEntries = historyData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

  const fetchHistoryOccupancy = async () => {
    try {
      const response = await fetch(`${API_URL}/api/occupancyHistory`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      const filteredData = historyData.filter((entry) => {
        const entryDate = new Date(entry.date).toDateString();
        return entryDate === date.toDateString();
      });
      setHistoryData(filteredData);
    } else {
      fetchHistoryOccupancy();
    }
  };

  const handleSearchChange = (event) => {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm) {
      const filteredData = historyData.filter((entry) => {
        return (
          String(entry.room_number).toLowerCase().includes(searchTerm) ||
          entry.class_name.toLowerCase().includes(searchTerm) ||
          entry.professor_name.toLowerCase().includes(searchTerm) ||
          convertTimeTo12HourFormat(entry.start_time)
            .toLowerCase()
            .includes(searchTerm) ||
          convertTimeTo12HourFormat(entry.end_time)
            .toLowerCase()
            .includes(searchTerm) ||
          convertUTCDateToSameTimezone(entry.date)
            .toLowerCase()
            .includes(searchTerm)
        );
      });
      setHistoryData(filteredData);
    } else {
      fetchHistoryOccupancy();
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
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <span className="text-black mr-2">Search:</span>
              <input
                type="text"
                className="border-b border-black focus:outline-none w-full"
                placeholder="Type to search..."
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center">
              <FaRegCalendarAlt className="w-5 h-5 text-orange-500 mr-2" />
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                placeholderText="Select a date"
                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
              />
            </div>
          </div>
          <table className="w-full border-collapse rounded-md overflow-hidden text-center">
            <thead className="bg-orange-500 text-white">
              <tr>
                <td className="p-2 border border-black">Room No.</td>
                <td className="p-2 border border-black">Class</td>
                <td className="p-2 border border-black">Faculty</td>
                <td className="p-2 border border-black">Time</td>
                <td className="p-2 border border-black">Date</td>
                <td className="p-2 border border-black">User Account</td>
              </tr>
            </thead>
            <tbody className="bg-gray-100">
              {historyData
                .slice(
                  (currentPage - 1) * entriesPerPage,
                  currentPage * entriesPerPage
                )
                .map((data, index) => (
                  <tr key={index}>
                    <td className="px-2 py-4 border border-black">
                      {data.room_number}
                    </td>
                    <td className="px-2 py-4 border border-black">
                      {data.class_name}
                    </td>
                    <td className="px-2 py-4 border border-black">
                      {data.professor_name}
                    </td>
                    <td className="px-2 py-4 border border-black">
                      {convertTimeTo12HourFormat(data.start_time)} -{' '}
                      {convertTimeTo12HourFormat(data.end_time)}
                    </td>
                    <td className="px-2 py-4 border border-black">
                      {convertUTCDateToSameTimezone(data.date)}
                    </td>
                    <td className="px-2 py-4 border border-black">
                      {data.professor_name}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="flex justify-between items-center mt-4">
            <div className="text-gray-600">
              Showing{' '}
              {Math.min((currentPage - 1) * entriesPerPage + 1, totalEntries)}{' '}
              to {Math.min(currentPage * entriesPerPage, totalEntries)} of{' '}
              {totalEntries} entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="text-gray-700 hover:underline"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
                const page = Math.max(1, currentPage - 2) + index;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-md transition-colors duration-200 hover:bg-gray-300 ${
                      page === currentPage
                        ? 'bg-sky-300 text-orange-500'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                className="text-gray-700 hover:underline"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default HistoryOfOccupancy;
