import React from "react";

const DeleteScheduleConfirmModal = ({
  isOpen,
  onConfirm,
  onCancel,
  loading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
      <div className="w-full max-w-sm bg-white rounded-md shadow-xl">
        <div className="flex p-4">
          <h1 className="text-lg">Delete Schedule</h1>
        </div>
        <hr className="w-full" />
        <div className="flex flex-col gap-5 p-5">
          <h2 className="font-normal">
            Are you sure you want to delete this schedule?
          </h2>
          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 bg-[#B3E5FC] rounded cursor-pointer hover:bg-[#99d3ee]"
              onClick={onCancel}
              disabled={loading}
            >
              No
            </button>
            <button
              className="px-4 py-2 text-white bg-[#EF5350] hover:bg-[#E53935] rounded cursor-pointer disabled:opacity-60"
              onClick={onConfirm}
              disabled={loading}
            >
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteScheduleConfirmModal;
