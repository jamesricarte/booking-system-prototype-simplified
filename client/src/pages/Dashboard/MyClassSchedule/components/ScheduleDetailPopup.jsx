"use client";

import { useEffect, useState } from "react";
import { IoIosClose } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";
import { convertTimeTo12HourFormat } from "../../../../utils/timeUtils";
import { API_URL } from "../../../../config/apiConfig";
import DeleteScheduleConfirmModal from "./modals/DeleteScheduleConfirmModal";

const ScheduleDetailPopup = ({
  selectedSchedule,
  selectedSchedulePosition,
  setSelectedSchedule,
  setEditScheduleModal,
  onScheduleDeleted,
  setLoading,
  loading,
  setMessage,
  user,
}) => {
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  const handleEditClick = () => {
    setEditScheduleModal(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirmModal(true);
  };

  // Delete schedule
  const handleConfirmDelete = async () => {
    if (!selectedSchedule?.id) return;

    setShowDeleteConfirmModal(false);
    setLoading(true);
    const startTime = Date.now();
    let message = { isMessageAvailable: false, message: "", type: "" };

    try {
      const response = await fetch(
        `${API_URL}/api/deleteClassSchedule/${selectedSchedule.id}`,
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
          setShowDeleteConfirmModal(false);
          setSelectedSchedule(null);
          onScheduleDeleted();
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

  const handleCancelDelete = () => {
    setShowDeleteConfirmModal(false);
  };

  const isOwnSchedule = (schedule) => {
    return schedule?.professor_id === user?.school_id;
  };

  if (!selectedSchedule) return null;

  return (
    <>
      <div
        className="absolute z-20 p-3 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-md shadow-lg min-w-80 left-1/2 top-1/2"
        style={{
          top: `${selectedSchedulePosition?.top}px`,
          left: `${selectedSchedulePosition?.left}px`,
        }}
      >
        <div className="flex items-center justify-end gap-0.5">
          {isOwnSchedule(selectedSchedule) && (
            <>
              <MdDeleteOutline
                size={26}
                className="p-1 cursor-pointer hover:bg-gray-200"
                title="Delete Schedule"
                onClick={handleDeleteClick}
              />
              <MdEdit
                size={25}
                className="p-1 cursor-pointer hover:bg-gray-200"
                title="Edit Schedule"
                onClick={handleEditClick}
              />
            </>
          )}

          <IoIosClose
            size={30}
            className="cursor-pointer hover:bg-gray-200"
            title="Close"
            onClick={() => setSelectedSchedule(null)}
          />
        </div>

        <h3 className="mb-2 text-lg font-semibold">Schedule Details:</h3>
        <div className="flex gap-1">
          <p>Day of Week:</p>
          <p>{selectedSchedule.day_of_week}</p>
        </div>
        <div className="flex gap-1">
          <p>Room Number:</p>
          <p>{selectedSchedule.room_number}</p>
        </div>
        <div className="flex gap-1">
          <p>Start Time:</p>
          <p>{convertTimeTo12HourFormat(selectedSchedule.start_time)}</p>
        </div>
        <div className="flex gap-1">
          <p>End Time:</p>
          <p>{convertTimeTo12HourFormat(selectedSchedule.end_time)}</p>
        </div>
        <div className="flex gap-1">
          <p>Subject:</p>
          <p>
            {selectedSchedule.subject_id
              ? `${selectedSchedule.course_code} - ${selectedSchedule.course_name}`
              : "None"}
          </p>
        </div>
        <div className="flex gap-1">
          <p className="min-w-36">Faculty In Charge:</p>
          <p>{selectedSchedule.professor_name}</p>
        </div>
        <div className="flex gap-1">
          <p>Year & Block:</p>
          <p>{selectedSchedule.class_name}</p>
        </div>
        <div className="flex gap-1">
          <p>Purpose:</p>
          <p>{selectedSchedule.purpose}</p>
        </div>
      </div>

      {/* DELETE SCHEDULE CONFIRMATION MODAL */}
      <DeleteScheduleConfirmModal
        isOpen={showDeleteConfirmModal}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        loading={loading}
      />
    </>
  );
};

export default ScheduleDetailPopup;
