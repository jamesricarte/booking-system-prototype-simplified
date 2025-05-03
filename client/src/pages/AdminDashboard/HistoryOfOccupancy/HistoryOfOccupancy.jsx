import { useEffect, useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  convertUTCDateToSameTimezone,
  convertTimeTo12HourFormat,
} from "../../../utils/timeUtils";

const API_URL = import.meta.env.VITE_API_URL;

const HistoryOfOccupancy = () => {
  const [historyData, setHistoryData] = useState([]);
  const [filteredHistoryData, setFilteredHistoryData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [entriesPerPage, setEntriesPerPage] = useState(6);
  const totalEntries = historyData.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage);

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

  useEffect(() => {
    filterData();
  }, [searchTerm, selectedDate, historyData]);

  const filterData = () => {
    let filtered = [...historyData];

    if (selectedDate) {
      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date).toDateString();
        return entryDate === selectedDate.toDateString();
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((entry) => {
        return (
          String(entry.room_number).toLowerCase().includes(term) ||
          entry.class_name.toLowerCase().includes(term) ||
          entry.professor_name.toLowerCase().includes(term) ||
          convertTimeTo12HourFormat(entry.start_time)
            .toLowerCase()
            .includes(term) ||
          convertTimeTo12HourFormat(entry.end_time).toLowerCase().includes(term)
        );
      });
    }

    setFilteredHistoryData(filtered);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <>
      <main className="container h-full bg-white">
        <div className="p-4">
          <h1 className="text-xl">History of Occupancy</h1>
        </div>
        <hr />
        <div className="px-6 py-4 overflow-auto h-[78vh]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <span className="mr-2 text-lg text-black">Search:</span>
              <input
                type="text"
                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none"
                placeholder="Type to search..."
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center">
              <label htmlFor="datePicker" className="cursor-pointer">
                <FaRegCalendarAlt className="w-5 h-5 mr-2 text-orange-500 hover:text-orange-600" />
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                placeholderText="Select a date"
                className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none"
                id="datePicker"
              />
            </div>
          </div>

          <table className="w-full overflow-hidden text-center border-collapse">
            <thead className="text-white bg-[#F56C18]">
              <tr className="rounded-md">
                <td className="p-2 border border-black">Room No.</td>
                <td className="p-2 border border-black">Class</td>
                <td className="p-2 border border-black">Faculty</td>
                <td className="p-2 border border-black">Time</td>
                <td className="p-2 border border-black">Date</td>
                <td className="p-2 border border-black">User Account</td>
              </tr>
            </thead>
            <tbody className="bg-[#EFEFEF]">
              {filteredHistoryData
                .slice(
                  (currentPage - 1) * entriesPerPage,
                  currentPage * entriesPerPage
                )
                .map((data, index) => (
                  <tr key={index}>
                    <td className="py-5 border border-black">
                      {data.room_number}
                    </td>
                    <td className="py-5 border border-black">
                      {data.class_name}
                    </td>
                    <td className="py-5 border border-black">
                      {data.professor_name}
                    </td>
                    <td className="py-5 border border-black">
                      {convertTimeTo12HourFormat(data.start_time)} -{" "}
                      {convertTimeTo12HourFormat(data.end_time)}
                    </td>
                    <td className="py-5 border border-black">
                      {convertUTCDateToSameTimezone(data.date)}
                    </td>
                    <td className="py-5 border border-black">
                      {data.professor_name}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-black">
              Showing{" "}
              {Math.min((currentPage - 1) * entriesPerPage + 1, totalEntries)}{" "}
              to {Math.min(currentPage * entriesPerPage, totalEntries)} of{" "}
              {totalEntries} entries
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="text-sm text-gray-700 cursor-pointer hover:underline"
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
                    className={`px-3 py-1 rounded-md transition-colors duration-200 hover:bg-sky-300 cursor-pointer ${
                      page === currentPage
                        ? "bg-sky-300 text-orange-500"
                        : "bg-gray-200 text-gray-700"
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
                className="text-sm text-gray-700 cursor-pointer hover:underline"
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
