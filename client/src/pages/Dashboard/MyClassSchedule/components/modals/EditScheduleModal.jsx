"use client";

import { RiCloseCircleFill } from "react-icons/ri";
import { convertTimeTo12HourFormat } from "../../../../../utils/timeUtils";
import { handleFormChange } from "../../../../../utils/formHandlers";
import Button from "../../../../../components/Button";
import { useEffect, useState } from "react";
import { API_URL } from "../../../../../config/apiConfig";

const EditScheduleModal = ({
  editScheduleModal,
  setEditScheduleModal,
  selectedSchedule,
  setSelectedSchedule,
  timeslots,
  rooms,
  subjects,
  classes,
  schedulesPurposes,
  onScheduleUpdated,
  setMessage,
  setLoading,
  loading,
  schedules,
  userSchedules,
}) => {
  const [editScheduleFormData, setEditScheduleFormData] = useState({
    scheduleId: "",
    startTimeId: "",
    endTimeId: "",
    subjectId: "",
    classId: "",
    purpose: "Lecture",
    dayOfWeek: "",
    roomId: "",
  });

  const [filteredEndTimeslots, setFilteredEndTimeslots] = useState([]);
  const [error, setError] = useState("");
  const [hasConflict, setHasConflict] = useState(false);
  const [hasUserConflict, setHasUserConflict] = useState(false);

  const handleEditScheduleFormData = handleFormChange(
    editScheduleFormData,
    setEditScheduleFormData
  );

  // Initially, filtering end timeslots
  useEffect(() => {
    setFilteredEndTimeslots(timeslots.slice(1));
  }, [timeslots]);

  // Update filtered end timeslots when start time changes
  useEffect(() => {
    if (editScheduleFormData.startTimeId) {
      const nextAvailableEndTime = timeslots.find(
        (timeslot) =>
          timeslot.id > Number.parseInt(editScheduleFormData.startTimeId)
      );

      if (nextAvailableEndTime) {
        setFilteredEndTimeslots(
          timeslots.filter((timeslot) => timeslot.id >= nextAvailableEndTime.id)
        );

        if (
          Number.parseInt(editScheduleFormData.endTimeId) -
            Number.parseInt(editScheduleFormData.startTimeId) <=
          1
        ) {
          setEditScheduleFormData((prevData) => ({
            ...prevData,
            endTimeId: nextAvailableEndTime.id,
          }));
        }
      }
    }
  }, [editScheduleFormData.startTimeId]);

  // Initialize form data from selected schedule
  useEffect(() => {
    if (selectedSchedule) {
      setEditScheduleFormData((prevData) => ({
        ...prevData,
        scheduleId: selectedSchedule.id,
        startTimeId: selectedSchedule.start_time_id,
        endTimeId: selectedSchedule.end_time_id,
        subjectId:
          subjects.find(
            (subjectItem) =>
              subjectItem.course_name === selectedSchedule.course_name
          )?.id || 0,
        classId:
          classes.find(
            (classItem) => classItem.class_name === selectedSchedule.class_name
          )?.id || "",
        purpose: selectedSchedule.purpose,
        dayOfWeek: selectedSchedule.day_of_week,
        roomId: selectedSchedule.room_id,
      }));
    }
  }, [selectedSchedule]);

  // ----------- CONFLICT DETECTION SECTION -----------

  useEffect(() => {
    checkScheduleConflict();
    checkUserScheduleConflict();
  }, [
    editScheduleFormData.startTimeId,
    editScheduleFormData.endTimeId,
    editScheduleFormData.scheduleId,
    editScheduleFormData.roomId,
    editScheduleFormData.dayOfWeek,
    schedules,
    userSchedules,
    hasConflict,
    hasUserConflict,
  ]);

  const checkScheduleConflict = () => {
    const selectedStart = Number.parseInt(editScheduleFormData.startTimeId);
    const selectedEnd = Number.parseInt(editScheduleFormData.endTimeId);

    const isOverlapping = schedules.some((schedule) => {
      if (schedule.id === editScheduleFormData.scheduleId) {
        return false;
      }

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
    const selectedStart = Number.parseInt(editScheduleFormData.startTimeId);
    const selectedEnd = Number.parseInt(editScheduleFormData.endTimeId);
    const currentRoomId = Number.parseInt(editScheduleFormData.roomId);
    const currentDayOfWeek = editScheduleFormData.dayOfWeek;

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

  // Form validation
  const validateForm = () => {
    if (
      Number.parseInt(editScheduleFormData.endTimeId) <
      Number.parseInt(editScheduleFormData.startTimeId)
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

  // Update schedule
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    const startTime = Date.now();
    let message = { isMessageAvailable: false, message: "", type: "" };

    try {
      const response = await fetch(`${API_URL}/api/updateClassSchedule`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scheduleId: editScheduleFormData.scheduleId,
          startTimeId: Number.parseInt(editScheduleFormData.startTimeId),
          endTimeId: Number.parseInt(editScheduleFormData.endTimeId),
          classId: Number.parseInt(editScheduleFormData.classId),
          subjectId: Number.parseInt(editScheduleFormData.subjectId),
          purpose: editScheduleFormData.purpose,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update schedule");
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
          // Close modals and refresh
          setEditScheduleModal(false);
          setSelectedSchedule(null);
          onScheduleUpdated();
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

  if (!editScheduleModal) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30">
      {/* Edit Schedule Modal */}
      <div className="fixed transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-lg top-1/2 left-1/2 rounded-xs z-30 w-[35vw]">
        <div className="flex items-center justify-between p-3">
          <h3 className="text-lg">Edit Schedule</h3>
          <RiCloseCircleFill
            className="cursor-pointer"
            onClick={() => {
              setEditScheduleModal(false);
              setSelectedSchedule(null);
              setEditScheduleFormData((prev) => ({
                ...prev,
                startTimeId: selectedSchedule.start_time_id,
                endTimeId: selectedSchedule.end_time_id,
              }));
            }}
            color="red"
          />
        </div>

        <hr />

        <div className="flex flex-col gap-4 px-12 py-8">
          {error && <p className="text-red-500">{error}</p>}

          {/* Display day of week and room (read-only) */}
          <div className="flex gap-8">
            <div className="flex">
              <p className="font-semibold">Day of Week:&nbsp;</p>
              <p>{editScheduleFormData.dayOfWeek}</p>
            </div>
            <div className="flex">
              <p className="font-semibold">Room:&nbsp;</p>
              <p>{getRoomName(editScheduleFormData.roomId)}</p>
            </div>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between gap-5">
              <div className="w-full">
                <p>Start Time:</p>
                <select
                  className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md w-full"
                  name="startTimeId"
                  value={editScheduleFormData.startTimeId}
                  onChange={handleEditScheduleFormData}
                >
                  {timeslots.slice(0, -1).map((timeslot, index) => (
                    <option key={index} value={timeslot.id}>
                      {convertTimeTo12HourFormat(timeslot.time)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full">
                <p>End Time:</p>
                <select
                  className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md w-full"
                  name="endTimeId"
                  value={editScheduleFormData.endTimeId}
                  onChange={handleEditScheduleFormData}
                >
                  {filteredEndTimeslots.map((timeslot, index) => (
                    <option key={index} value={timeslot.id}>
                      {convertTimeTo12HourFormat(timeslot.time)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <p>Subject</p>
              <select
                className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md w-full"
                name="subjectId"
                value={editScheduleFormData.subjectId}
                onChange={handleEditScheduleFormData}
              >
                {subjects.map((subjectItem, index) => (
                  <option key={index} value={subjectItem.id}>
                    {subjectItem.id
                      ? `${subjectItem.course_code} - ${subjectItem.course_name}`
                      : subjectItem.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <p>Year &amp; Block:&nbsp;</p>
              <select
                className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md w-full"
                name="classId"
                value={editScheduleFormData.classId}
                onChange={handleEditScheduleFormData}
              >
                {classes.map((classItem, index) => (
                  <option key={index} value={classItem.id}>
                    {classItem.class_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <p>Purpose:&nbsp;</p>
              <select
                className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md w-full"
                name="purpose"
                value={editScheduleFormData.purpose}
                onChange={handleEditScheduleFormData}
              >
                {schedulesPurposes.map((purpose, index) => (
                  <option key={index} value={purpose}>
                    {purpose}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end">
              <Button
                className="px-8 py-2 rounded-sm cursor-pointer bg-[#A2DEF9] hover:bg-[#b4e8ff] disabled:bg-gray-300 disabled:opacity-60"
                type="submit"
                disabled={loading || hasConflict}
              >
                Edit Schedule
              </Button>
            </div>
          </form>

          {/* White background when loading */}
          <div
            className={`fixed top-0 left-0 w-full h-full bg-white opacity-50 pointer-events-auto z-30 ${
              loading ? "block" : "hidden"
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default EditScheduleModal;
