"use client";

import { useState, useEffect, useRef } from "react";
import { RiCloseCircleFill } from "react-icons/ri";
import { API_URL } from "../../../../../config/apiConfig";
import { convertTimeTo12HourFormat } from "../../../../../utils/timeUtils";
import { bookingTimeToMinutes } from "../../../../../utils/timeUtils";

import ScheduleDetailPopup from "../ScheduleDetailPopup";
import EditScheduleModal from "./EditScheduleModal";

const AddScheduleModal = ({
  isOpen,
  onClose,
  onScheduleAdded,
  rooms,
  classes,
  timeslots,
  subjects,
  user,
  selectedDay,
  selectedRoom,
  setSelectedDay,
  bookingsPurposes,
  setLoading,
  loading,
  setMessage,
}) => {
  const [filteredEndTimeslots, setFilteredEndTimeslots] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [userSchedules, setUserSchedules] = useState([]);
  const [error, setError] = useState("");
  const [hasConflict, setHasConflict] = useState(false);
  const [hasUserConflict, setHasUserConflict] = useState(false);

  //For schedule detail popup
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedSchedulePosition, setSelectedSchedulePosition] =
    useState(null);

  const [editScheduleModal, setEditScheduleModal] = useState(false);

  const [formData, setFormData] = useState({
    dayOfWeek: selectedDay || "Monday",
    roomId: "",
    startTimeId: 1,
    endTimeId: 2,
    classId: "",
    subjectId: "",
    purpose: "Lecture",
  });

  const scrollableDivRef = useRef(null);
  const selectedScheduleToEditRef = useRef(null);
  const initialTimePosition = 43;
  const timeslotDistance = 56;

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Initialized field values
  useEffect(() => {
    if (
      selectedDay &&
      rooms.length > 0 &&
      timeslots.length > 0 &&
      classes.length > 0 &&
      subjects.length > 0
    ) {
      setFormData((prev) => ({
        ...prev,
        dayOfWeek: selectedDay || "Monday",
        roomId: selectedRoom || rooms[0]?.id,
        classId: classes[0]?.id,
        subjectId: subjects[0]?.id,
        purpose: "Lecture",
      }));
    }
  }, [selectedDay, selectedRoom, rooms, classes, subjects, timeslots]);

  // Initially, filtering end timeslots
  useEffect(() => {
    setFilteredEndTimeslots(timeslots.slice(1));
  }, [timeslots]);

  // ---------- FIND FIRST AVAILABLE TIMESLOT SECTION -----------

  // Helper function to find first available timeslot without conflicts
  const findFirstAvailableTimeslot = () => {
    if (!timeslots || timeslots.length === 0) return null;

    for (let i = 0; i < timeslots.length - 1; i++) {
      const currentTimeslot = timeslots[i];
      const hasConflict = schedules.some((schedule) => {
        return !(
          currentTimeslot.id < schedule.start_time_id ||
          currentTimeslot.id >= schedule.end_time_id
        );
      });

      if (!hasConflict) {
        return currentTimeslot.id;
      }
    }

    return timeslots[0]?.id || 1;
  };

  // Helper function to find available end timeslot (2 positions after start, with fallback)
  const findAvailableEndTimeslot = (startTimeId) => {
    if (!timeslots || timeslots.length === 0) return null;

    const startIndex = timeslots.findIndex((t) => t.id === startTimeId);
    if (startIndex === -1) return null;

    // Try to get timeslot 2 positions after start (3rd timeslot)
    const preferredEndIndex = startIndex + 2;

    if (preferredEndIndex < timeslots.length) {
      const preferredEndTimeId = timeslots[preferredEndIndex].id;

      // Check if preferred end time has conflict
      const hasConflict = schedules.some((schedule) => {
        return !(
          preferredEndTimeId <= schedule.start_time_id ||
          startTimeId >= schedule.end_time_id
        );
      });

      if (!hasConflict) {
        return preferredEndTimeId;
      }
    }

    // Fallback: Find next available timeslot after start time
    for (let i = startIndex + 1; i < timeslots.length; i++) {
      const candidateEndTimeId = timeslots[i].id;

      const hasConflict = schedules.some((schedule) => {
        return !(
          candidateEndTimeId <= schedule.start_time_id ||
          startTimeId >= schedule.end_time_id
        );
      });

      if (!hasConflict) {
        return candidateEndTimeId;
      }
    }

    // Final fallback: use timeslot right after start
    if (startIndex + 1 < timeslots.length) {
      return timeslots[startIndex + 1].id;
    }

    return null;
  };

  // Auto-select first available start time and calculate end time
  useEffect(() => {
    const availableStartTime = findFirstAvailableTimeslot();
    const availableEndTime = availableStartTime
      ? findAvailableEndTimeslot(availableStartTime)
      : timeslots[1]?.id || 2;

    setFormData((prev) => ({
      ...prev,

      startTimeId: availableStartTime || 1,
      endTimeId: availableEndTime || 2,
    }));
  }, [schedules]);

  // -----------------------------------------------------------------

  // Fetch schedules for designated room and day of week
  useEffect(() => {
    if (formData.dayOfWeek && formData.roomId && isOpen) {
      fetchSchedule();
      setSelectedSchedule(null);
      selectedScheduleToEditRef.current = window.selectedScheduleToEdit || null;
      window.selectedScheduleToEdit = null;
    }
  }, [formData.dayOfWeek, formData.roomId, isOpen]);

  // Detecting if there is changes in form data start time then filter again the end timeslots
  useEffect(() => {
    if (formData.startTimeId) {
      const nextAvailableEndTime = timeslots.find(
        (timeslot) => timeslot.id > Number.parseInt(formData.startTimeId)
      );

      if (nextAvailableEndTime) {
        setFilteredEndTimeslots(
          timeslots.filter((timeslot) => timeslot.id >= nextAvailableEndTime.id)
        );

        // When start time changes, recalculate available end time
        const newEndTimeId = findAvailableEndTimeslot(
          Number.parseInt(formData.startTimeId)
        );

        if (newEndTimeId) {
          setFormData((prevData) => ({
            ...prevData,
            endTimeId: newEndTimeId,
          }));
        }
      }
    }
  }, [formData.startTimeId, schedules]);

  // ----- SCROLL TO CENTER OF SELECTED SCHEDULE SECTION -----
  useEffect(() => {
    if (
      isOpen &&
      selectedScheduleToEditRef.current &&
      scrollableDivRef.current
    ) {
      const schedule = selectedScheduleToEditRef.current;
      const scrollableDiv = scrollableDivRef.current;
      const scheduleElement = document.getElementById(
        `schedule-${schedule.id}`
      );
      let scheduleElementRect = null;

      if (scheduleElement) {
        scheduleElementRect = scheduleElement.getBoundingClientRect();
      }

      // Calculate the scroll position to center the selected schedule
      const start = bookingTimeToMinutes(schedule.start_time);
      const top = (start / 30) * timeslotDistance + initialTimePosition;

      // Get the visible height of the scrollable div
      const scrollableDivHeight = scrollableDiv.clientHeight;

      // Calculate the scroll position to center the schedule
      // Subtract half the visible height so the schedule appears in the center
      const scrollPosition = top - scrollableDivHeight / 2;

      if (scrollPosition < 0) {
        // Set initial position of Schedule Detail Popup
        if (scheduleElementRect) {
          setSelectedSchedulePosition({
            top: scheduleElementRect.top + window.scrollY,
            left: scheduleElementRect.left + scheduleElementRect.width * 1.7,
          });
          setSelectedSchedule(schedule);
        }
      }

      // Function to check when scroll reached target
      const handleScroll = () => {
        const current = scrollableDiv.scrollTop;

        // Allow small +/- 2px tolerance because smooth scroll never lands exactly
        if (Math.abs(current - scrollPosition) < 2) {
          // Remove listener
          scrollableDiv.removeEventListener("scroll", handleScroll);

          // Set initial position of Schedule Detail Popup
          if (scheduleElementRect) {
            setSelectedSchedulePosition({
              top: scheduleElementRect.top + window.scrollY,
              left: scheduleElementRect.left + scheduleElementRect.width * 1.7,
            });
            setSelectedSchedule(schedule);
          }
        }
      };

      // Add listener BEFORE starting scroll
      scrollableDiv.addEventListener("scroll", handleScroll);

      // Scroll to the calculated position with smooth behavior
      scrollableDiv.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: "smooth",
      });

      // Clear the ref after scrolling
      selectedScheduleToEditRef.current = null;
    }
  }, [schedules, isOpen]);
  // --------------------------------------------------

  // ----------- CONFLICT DETECTION SECTION -----------

  useEffect(() => {
    // Delaying to remove flicker
    const timer = setTimeout(() => {
      checkScheduleConflict();
      checkUserScheduleConflict();
    }, 50);

    return () => clearTimeout(timer);
  }, [
    formData.startTimeId,
    formData.endTimeId,
    formData.roomId,
    formData.dayOfWeek,
    schedules,
    userSchedules,
    hasConflict,
    hasUserConflict,
  ]);

  const checkScheduleConflict = () => {
    const selectedStart = Number.parseInt(formData.startTimeId);
    const selectedEnd = Number.parseInt(formData.endTimeId);

    const isOverlapping = schedules.some((schedule) => {
      const scheduleStart = schedule.start_time_id;
      const scheduleEnd = schedule.end_time_id;

      return !(selectedEnd <= scheduleStart || selectedStart >= scheduleEnd);
    });

    setHasConflict(isOverlapping);

    if (isOverlapping)
      setError("This time slot conflicts with an existing schedule.");
  };

  const checkUserScheduleConflict = () => {
    // Check for conflicts with user's schedule in OTHER rooms at current selected day
    const selectedStart = Number.parseInt(formData.startTimeId);
    const selectedEnd = Number.parseInt(formData.endTimeId);
    const currentRoomId = Number.parseInt(formData.roomId);
    const currentDayOfWeek = formData.dayOfWeek;

    // Filter schedules from OTHER rooms on the same day of week
    const otherRoomConflicts = userSchedules.filter((schedule) => {
      const isSameDayOfWeek = schedule.day_of_week === currentDayOfWeek;
      const isDifferentRoom = schedule.room_id !== currentRoomId;
      const scheduleStart = schedule.start_time_id;
      const scheduleEnd = schedule.end_time_id;

      // Check if times overlap
      const isOverlapping = !(
        selectedEnd <= scheduleStart || selectedStart >= scheduleEnd
      );

      return isSameDayOfWeek && isDifferentRoom && isOverlapping;
    });

    setHasUserConflict(otherRoomConflicts.length > 0);

    // Only show error if there's NO conflict in current room (priority rule)
    // If there's already a conflict in the current room+day, don't overwrite that error
    if (!hasConflict && otherRoomConflicts.length > 0) {
      setError(
        `You have another class in room ${
          otherRoomConflicts[0].room_number
        } at ${convertTimeTo12HourFormat(
          otherRoomConflicts[0].start_time
        )} - ${convertTimeTo12HourFormat(
          otherRoomConflicts[0].end_time
        )} on ${currentDayOfWeek}. You cannot teach two classes simultaneously.`
      );
    }
  };

  useEffect(() => {
    // Delaying to remove flicker
    const timer = setTimeout(() => {
      if (!hasConflict && !hasUserConflict) setError("");
    }, 50);

    return () => clearTimeout(timer);
  }, [hasConflict, hasUserConflict]);

  // ----------------------------------------------------------

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ----------- SCHEDULE DETAIL POP UP SECTION --------------

  //Linking the position of schedule details popup to schedules
  useEffect(() => {
    const scrollableDiv = scrollableDivRef.current;
    if (scrollableDiv) {
      scrollableDiv.addEventListener("scroll", updatePosition);
    }

    return () => {
      if (scrollableDiv) {
        scrollableDiv.removeEventListener("scroll", updatePosition);
      }
    };
  });

  //Select the clicked schedule
  const handleSelectedScheduleClick = (schedule, event) => {
    const scheduleRect = event.target.getBoundingClientRect();

    setSelectedSchedulePosition({
      top: scheduleRect.top + window.scrollY,
      left: scheduleRect.left + scheduleRect.width * 1.7,
    });
    setSelectedSchedule(schedule);
  };

  //Function for linking the position of schedule details popup to selected schedule
  const updatePosition = () => {
    if (selectedSchedule) {
      const scheduleElement = document.getElementById(
        `schedule-${selectedSchedule.id}`
      );
      const scheduleElementRect = scheduleElement.getBoundingClientRect();

      setSelectedSchedulePosition({
        top: scheduleElementRect.top + window.scrollY,
        left: scheduleElementRect.left + scheduleElementRect.width * 1.7,
      });

      const scrollableDivRect =
        scrollableDivRef.current.getBoundingClientRect();

      const isOutOfView =
        scheduleElementRect.bottom < scrollableDivRect.top ||
        scheduleElementRect.top > scrollableDivRect.bottom;

      if (isOutOfView) {
        setSelectedSchedule(null);
        setSelectedSchedulePosition(null);
      }
    }
  };
  // ----------------------------------------------------------------

  // ----------- FORM REQUESTS SECTION --------------
  // Form validation
  const validateForm = () => {
    if (
      Number.parseInt(formData.endTimeId) <
      Number.parseInt(formData.startTimeId)
    ) {
      setError("End time cannot be earlier than the start time.");
      return false;
    }
    if (hasConflict) {
      setError("This time slot conflicts with an existing schedule.");
      return false;
    }
    return true;
  };

  const fetchSchedule = () => {
    fetchSchedulesByRoomAndDay();
    fetchUserSchedules();
  };

  // Fetch schedule by room and day
  const fetchSchedulesByRoomAndDay = async () => {
    if (!formData.dayOfWeek && !formData.roomId) return;

    const startTime = Date.now();
    let result;

    try {
      const response = await fetch(
        `${API_URL}/api/schedulesByRoomAndDay?roomId=${Number.parseInt(
          formData.roomId
        )}&dayOfWeek=${formData.dayOfWeek}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch schedules");
      }

      result = await response.json();
      setSchedules(result.schedules);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      setError(error.message || "Failed to fetch schedules. Please try again.");
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        if (loading) setLoading(false);
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  // Fetch user schedules
  const fetchUserSchedules = async () => {
    if (!user?.school_id) return;

    const startTime = Date.now();

    try {
      const response = await fetch(
        `${API_URL}/api/userSchedules?professorId=${user?.school_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch user schedules");
      }

      const result = await response.json();
      setUserSchedules(result.schedules || []);
    } catch (error) {
      console.error("Error fetching user schedules:", error);
      // Don't show error for this fetch - only show room+day conflicts as priority
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 2000; // Minimum 2 seconds loading time

      setTimeout(() => {
        if (loading) setLoading(false);
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  // Add schedule
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const startTime = Date.now();
    let message = { isMessageAvailable: false, message: "", type: "" };

    try {
      const response = await fetch(`${API_URL}/api/addClassSchedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          professorId: user?.school_id,
          roomId: Number.parseInt(formData.roomId),
          classId: Number.parseInt(formData.classId),
          subjectId: Number.parseInt(formData.subjectId),
          dayOfWeek: formData.dayOfWeek,
          startTimeId: Number.parseInt(formData.startTimeId),
          endTimeId: Number.parseInt(formData.endTimeId),
          purpose: formData.purpose,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add schedule");
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
          onScheduleAdded();
          fetchSchedule();
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
  // ----------------------------------------------------------------

  const getRoomName = (roomId) => {
    const room = rooms.find((r) => r.id === roomId);
    return room ? room.room_number : null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/30">
      <div className="fixed transform -translate-x-1/2 -translate-y-1/2 bg-[#FAFAFA] border border-gray-300 shadow-lg top-1/2 left-1/2 z-10 rounded-xs w-[62vw]">
        <div className="flex items-center justify-between p-3">
          <h3 className="text-lg">Add Class Schedule Template</h3>
          <RiCloseCircleFill
            className="cursor-pointer"
            onClick={() => {
              onClose();
              setError("");
              setSelectedSchedule(null);
              setSelectedDay("");
              setFormData((prev) => ({
                ...prev,
                dayOfWeek: "",
                startTimeId: 1 || "",
                endTimeId: 2 || "",
              }));
              setSchedules([]);
            }}
            color="red"
          />
        </div>

        <hr />

        <div className="grid grid-cols-2">
          {/* 1. Form */}
          <div className="flex flex-col gap-4 px-12 py-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && <p className="text-red-500">{error}</p>}

              {/* Day of Week */}
              <div className="flex flex-col">
                <p>Day of Week:</p>
                <select
                  name="dayOfWeek"
                  value={formData.dayOfWeek}
                  onChange={handleInputChange}
                  className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Selection */}
              <div className="flex flex-col">
                <p>Room:</p>
                <select
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleInputChange}
                  className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md"
                >
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      Room {room.room_number}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Selection */}
              <div className="flex flex-col">
                <p>Subject / Course:</p>
                <select
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md"
                >
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.id
                        ? `${subject.course_code} - ${subject.course_name}`
                        : subject.course_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class Selection */}
              <div className="flex flex-col">
                <p>Year &amp; Block:</p>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md"
                >
                  {classes.map((classItem) => (
                    <option key={classItem.id} value={classItem.id}>
                      {classItem.class_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Time and End Time */}
              <div className="flex items-center gap-5">
                <div className="w-full">
                  <p>Start Time:</p>
                  <select
                    name="startTimeId"
                    value={formData.startTimeId}
                    onChange={handleInputChange}
                    className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md w-full"
                  >
                    {timeslots.slice(0, -1).map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {convertTimeTo12HourFormat(slot.time)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-full">
                  <p>End Time:</p>
                  <select
                    name="endTimeId"
                    value={formData.endTimeId}
                    onChange={handleInputChange}
                    className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md w-full"
                  >
                    {filteredEndTimeslots.map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {convertTimeTo12HourFormat(slot.time)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col">
                <p>Purpose:&nbsp;</p>
                <select
                  className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                >
                  {bookingsPurposes.map((bookingPurpose, index) => (
                    <option key={index} value={bookingPurpose}>
                      {bookingPurpose}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex flex-col text-[#F56C18]">
                  <p className="font-bold">Faculty in Charge:&nbsp;</p>
                  <p>{user.name}</p>
                </div>
                <button
                  type="submit"
                  className="px-8 py-2 rounded-sm cursor-pointer bg-[#A2DEF9] hover:bg-[#b4e8ff] text-black disabled:bg-gray-300 disabled:opacity-60"
                  disabled={loading || hasConflict || hasUserConflict}
                >
                  Add Schedule
                </button>
              </div>
            </form>

            {/* White background when loading */}
            <div
              className={`fixed top-0 left-0 w-full h-full bg-white opacity-50 pointer-events-auto z-10 ${
                loading ? "block" : "hidden"
              }`}
            />
          </div>

          {/* 2. Scrollable timeslots */}
          <div className="flex flex-col items-center justify-center my-8 mr-8">
            <div className="mb-2">
              <h1 className="text-lg font-semibold text-center">
                {formData.dayOfWeek}
              </h1>
              <h5>Room {getRoomName(Number.parseInt(formData.roomId))}</h5>
            </div>

            {/* Overflow */}
            <div
              className="relative px-6 overflow-y-scroll border border-gray-200 h-[71vh] w-full"
              ref={scrollableDivRef}
            >
              {timeslots.map((timeslot, index) => (
                <div key={index} className="flex items-center my-8">
                  <p className="min-w-20">
                    {convertTimeTo12HourFormat(timeslot.time)}
                  </p>
                  <div className="w-full h-[1px] bg-gray-300"></div>
                </div>
              ))}

              {schedules.map((schedule, index) => {
                const start = bookingTimeToMinutes(schedule.start_time);
                const end = bookingTimeToMinutes(schedule.end_time);
                const top =
                  (start / 30) * timeslotDistance + initialTimePosition + 1;
                const height = ((end - start) / 30) * timeslotDistance;

                return (
                  // Schedules
                  <div
                    key={index}
                    id={`schedule-${schedule.id}`}
                    className="absolute w-[60%] p-2 text-sm text-white rounded-md cursor-pointer left-32 overflow-hidden"
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      backgroundColor: schedule.booking_color
                        ? schedule.booking_color
                        : "#3B82F6",
                    }}
                    onClick={(e) => handleSelectedScheduleClick(schedule, e)}
                  >
                    <div className="relative">
                      <p>{schedule.professor_name}</p>
                      {schedule.subject_id && <p>{schedule.course_code}</p>}
                      <p>{schedule.class_name}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <ScheduleDetailPopup
        selectedSchedule={selectedSchedule}
        selectedSchedulePosition={selectedSchedulePosition}
        setSelectedSchedule={setSelectedSchedule}
        setEditScheduleModal={setEditScheduleModal}
        onScheduleDeleted={() => {
          fetchSchedule();
          onScheduleAdded();
        }}
        setLoading={setLoading}
        loading={loading}
        setMessage={setMessage}
        user={user}
      />

      <EditScheduleModal
        editScheduleModal={editScheduleModal}
        setEditScheduleModal={setEditScheduleModal}
        selectedSchedule={selectedSchedule}
        setSelectedSchedule={setSelectedSchedule}
        timeslots={timeslots}
        rooms={rooms}
        subjects={subjects}
        classes={classes}
        schedulesPurposes={bookingsPurposes}
        onScheduleUpdated={() => {
          fetchSchedule();
          onScheduleAdded();
        }}
        setMessage={setMessage}
        setLoading={setLoading}
        loading={loading}
        schedules={schedules}
        userSchedules={userSchedules}
      />
    </div>
  );
};

export default AddScheduleModal;
