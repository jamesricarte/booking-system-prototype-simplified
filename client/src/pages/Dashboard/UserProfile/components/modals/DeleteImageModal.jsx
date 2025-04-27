import React from "react";

const DeleteImageModal = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-60">
      <div className="w-full max-w-sm bg-white rounded-md shadow-xl">
        <div className="flex p-4">
          <h1 className="text-lg ">Delete Image</h1>
        </div>

        <hr />
        <div className="flex flex-col gap-5 p-5">
          <h2 className="font-normal">
            Are you sure you want to delete this image?
          </h2>

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 bg-[#B3E5FC] rounded cursor-pointer hover:bg-[#99d3ee]"
              onClick={onClose}
              disabled={loading}
            >
              No
            </button>
            <button
              className="px-4 py-2 text-white bg-red-500 rounded cursor-pointer hover:bg-red-600"
              onClick={onConfirm}
              disabled={loading}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteImageModal;
