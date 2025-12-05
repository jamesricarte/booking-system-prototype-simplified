"use client";

import { useEffect, useRef, useState } from "react";
import { API_URL } from "../../../config/apiConfig";
import { useAuth } from "../../../context/AuthContext";
import { convertTimeTo12HourFormat } from "../../../utils/timeUtils";
import AddScheduleModal from "./components/modals/AddScheduleModal";
import DeleteScheduleConfirmModal from "./components/modals/DeleteScheduleConfirmModal";

import useRoomFetches from "../RoomDetails/hooks/useRoomFetches";

const MyClassSchedule = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteScheduleModalOpen, setIsDeleteScheduleModalOpen] =
    useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({
    isMessageAvailable: false,
    message: "",
    type: "",
  });
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const [isScrollable, setIsScrollable] = useState(false);
  const scrollRefs = useRef({});

  // Hook for fetching
  const { subjects, classes, timeslots, bookingsPurposes, bookings } =
    useRoomFetches();

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    fetchSchedules();
    fetchRooms();
  }, []);

  useEffect(() => {
    daysOfWeek.forEach((day) => checkIfScrollable(day));
  }, [schedules]);

  const fetchSchedules = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/myClassSchedules?professorId=${user?.school_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      setSchedules(result.schedules || []);
    } catch (error) {
      console.error("Error fetching schedules:", error);
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

  const handleDeleteScheduleConfirm = (scheduleId) => {
    setIsDeleteScheduleModalOpen(true);
    setSelectedScheduleId(scheduleId);
  };

  const handleScheduleCardClick = (schedule) => {
    setSelectedDay(schedule.day_of_week);
    setSelectedRoom(schedule.room_id);
    setIsAddModalOpen(true);
    // We'll use a ref to communicate this to the modal
    window.selectedScheduleToEdit = schedule;
  };

  const handleDeleteScheduleCancel = () => {
    setIsDeleteScheduleModalOpen(false);
    setSelectedScheduleId(null);
  };

  const handleDeleteSchedule = async () => {
    if (!selectedScheduleId) return;

    setIsDeleteScheduleModalOpen(false);
    setLoading(true);
    const startTime = Date.now();
    let message = { isMessageAvailable: false, message: "", type: "" };

    try {
      const response = await fetch(
        `${API_URL}/api/deleteClassSchedule/${selectedScheduleId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete schedule");
      }

      const result = await response.json();

      message = {
        isMessageAvailable: true,
        message: result.message,
        type: "success",
      };
    } catch (error) {
      const errorMessage =
        error.message === "Failed to fetch"
          ? "Unable to connect to the server. Check your internet connection"
          : error.message;

      console.error(
        "Error updating schedule:",
        errorMessage || "Failed to update schedule. Please try again."
      );

      message = {
        isMessageAvailable: true,
        message: errorMessage,
        type: "error",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        setLoading(false);
        if (message.type === "success") {
          // Close all modals and refresh
          setIsDeleteScheduleModalOpen(false);
          setSelectedScheduleId(null);
          fetchSchedules();
        }
        setMessage({
          isMessageAvailable: message.isMessageAvailable,
          message: message.message,
          type: message.type,
        });
        setTimeout(() => {
          setMessage((prev) => ({
            ...prev,
            isMessageAvailable: false,
          }));
        }, 2000);
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  const getRoomName = (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.room_number : null;
  };

  const getTimeslotTime = (timeslotId) => {
    const timeslot = timeslots.find((t) => t.id === timeslotId);
    return timeslot ? convertTimeTo12HourFormat(timeslot.time) : null;
  };

  const getClassName = (classId) => {
    const classItem = classes.find((c) => c.id === classId);
    return classItem ? classItem.class_name : null;
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.course_name : null;
  };

  const getSubjectCode = (subjectId) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? subject.course_code : null;
  };

  const schedulesByDay = daysOfWeek.reduce((acc, day) => {
    acc[day] = schedules.filter((s) => s.day_of_week === day) || [];
    return acc;
  }, {});

  const checkIfScrollable = (day) => {
    const el = scrollRefs.current[day];
    if (!el) return;

    setIsScrollable((prev) => ({
      ...prev,
      [day]: el.scrollHeight > el.clientHeight,
    }));
  };

  return (
    <main className="container h-full mx-auto bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-gray-400 border-b-1">
        <h1 className="text-xl">My Class Schedule</h1>
      </div>

      {/* Content */}
      <div className="p-4 pr-8">
        <h1 className="mb-4 text-xl font-semibold text-center">Weekly View</h1>

        {/* Weekly Calendar Grid */}
        <div className="grid grid-cols-7 gap-3 mb-6">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="border border-gray-300 rounded-xs bg-gray-50 min-h-[300px] max-h-[68vh] flex flex-col"
            >
              {/* Day Header */}
              <div className="flex items-center justify-center my-3">
                <h3 className="text-lg font-bold text-gray-800">{day}</h3>
              </div>

              <hr className="border-gray-300" />

              <div
                ref={(el) => (scrollRefs.current[day] = el)}
                onScroll={() => checkIfScrollable(day)}
                className="flex-1 p-4 overflow-y-auto"
              >
                {/* Schedules for this day */}
                {schedulesByDay[day] && schedulesByDay[day].length > 0 ? (
                  <div className="space-y-2">
                    {schedulesByDay[day].map((schedule) => {
                      const subjectCode = getSubjectCode(schedule.subject_id);
                      const subjectName = getSubjectName(schedule.subject_id);

                      return (
                        <div
                          key={schedule.id}
                          onClick={() => handleScheduleCardClick(schedule)}
                          className="p-3 transition-shadow bg-white border border-gray-100 rounded shadow-sm cursor-pointer hover:shadow-lg hover:border-gray-200"
                        >
                          {subjectCode && (
                            <p className="text-sm font-semibold text-gray-900">
                              {subjectCode}
                            </p>
                          )}

                          {subjectName && (
                            <p className="mt-1 text-xs text-gray-700">
                              {subjectName}
                            </p>
                          )}

                          <p className="mt-1 text-xs text-gray-600">
                            {getTimeslotTime(schedule.start_time_id)} -{" "}
                            {getTimeslotTime(schedule.end_time_id)}
                          </p>

                          <p className="text-xs text-gray-600">
                            Room {getRoomName(schedule.room_id)}
                          </p>

                          <p className="text-xs text-gray-600">
                            {getClassName(schedule.class_id)}
                          </p>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // prevent parent onClick
                                handleDeleteScheduleConfirm(schedule.id);
                              }}
                              className="flex-1 px-2 py-1 text-white text-xs rounded cursor-pointer
                            bg-[#EF5350] hover:bg-[#E53935]"
                              title="Delete this schedule"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="py-4 text-xs text-center text-gray-400">
                    No classes scheduled
                  </p>
                )}
                {!isScrollable?.[day] && (
                  // Normal placement
                  <button
                    onClick={() => {
                      setSelectedDay(day);
                      setIsAddModalOpen(true);
                    }}
                    className="text-lg bg-[#A2DEF9] hover:bg-[#b4e8ff] text-white rounded w-full mt-3 flex justify-center items-center font-bold gap-1 cursor-pointer"
                    title={`Add schedule for ${day}`}
                  >
                    <p>+</p>
                  </button>
                )}
              </div>

              {isScrollable?.[day] && (
                // Sticky version
                <div className="sticky bottom-0 p-4 bg-gray-50">
                  <button
                    onClick={() => {
                      setSelectedDay(day);
                      setIsAddModalOpen(true);
                    }}
                    className="text-lg bg-[#A2DEF9] hover:bg-[#b4e8ff] text-white rounded w-full flex justify-center items-center font-bold gap-1 cursor-pointer"
                    title={`Add schedule for ${day}`}
                  >
                    <p>+</p>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add Schedule Modal */}
      <AddScheduleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onScheduleAdded={() => {
          fetchSchedules();
        }}
        rooms={rooms}
        classes={classes}
        timeslots={timeslots}
        subjects={subjects}
        user={user}
        selectedDay={selectedDay}
        selectedRoom={selectedRoom}
        setSelectedDay={setSelectedDay}
        bookingsPurposes={bookingsPurposes}
        setLoading={setLoading}
        loading={loading}
        setMessage={setMessage}
      />

      {/* Delete Schedule Confirm Modal */}
      <DeleteScheduleConfirmModal
        isOpen={isDeleteScheduleModalOpen}
        onConfirm={handleDeleteSchedule}
        onCancel={handleDeleteScheduleCancel}
        loading={loading}
      />

      {/* Background Overlay */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black z-10 ${
          (message.isMessageAvailable || loading) && !isAddModalOpen
            ? "opacity-30 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Booking Response Message */}
      <div
        className={`fixed z-50 p-4 m-0 transform -translate-x-1/2 bg-white left-1/2 shadow-xl transition-all duration-500 ease font-semibold text-sm rounded ${
          message.isMessageAvailable
            ? "top-12 opacity-100"
            : "-top-10 opacity-0"
        } ${message.type === "success" ? "text-cyan-500" : "text-red-500"}`}
      >
        <p>{message.message}</p>
      </div>

      {/* Loading spinner */}
      <div
        className={`fixed z-50 w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-6 rounded-1/2 border-t-transparent border-cyan-500 left-1/2 top-1/2 ${
          loading ? "block animate-spin" : "hidden"
        }`}
      />
    </main>
  );
};

export default MyClassSchedule;
