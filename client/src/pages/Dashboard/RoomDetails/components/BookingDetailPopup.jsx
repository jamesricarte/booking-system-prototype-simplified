import React, { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import { TbClockCancel } from "react-icons/tb";
import { convertTimeTo12HourFormat } from "../../../../utils/timeUtils";
import { useAuth } from "../../../../context/AuthContext";

const BookingDetailPopup = ({
  selectedBooking,
  selectedBookingPosition,
  setSelectedBooking,
  setEditBookingModal,
  editBookingModal,
  cancelReservation,
}) => {
  const { user } = useAuth();
  const [showCancelModal, setShowCancelModal] = useState(false); // <-- added

  const handleConfirmCancel = () => {
    cancelReservation(selectedBooking.booking_id);
    setShowCancelModal(false);
    setSelectedBooking(null);
  };

  return (
    <>
      {/* Booking Detail Popup */}
      {selectedBooking && (
        <div
          className="absolute z-10 p-3 transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 rounded-md shadow-lg left-1/2 top-1/2"
          style={{
            top: `${selectedBookingPosition?.top}px`,
            left: `${selectedBookingPosition?.left}px`,
          }}
        >
          <div className="flex items-center justify-end">
            {selectedBooking.booking_type === "reservation" &&
              selectedBooking.professor_id === user.school_id && (
                <TbClockCancel
                  size={25}
                  className="p-1 cursor-pointer hover:bg-gray-200"
                  title="Cancel Reservation"
                  onClick={() => setShowCancelModal(true)} // <-- open confirmation modal
                />
              )}
            {selectedBooking.booking_type !== "past" &&
              selectedBooking.professor_id === user.school_id && (
                <MdEdit
                  size={25}
                  className="p-1 cursor-pointer hover:bg-gray-200"
                  title={`${
                    selectedBooking.booking_type === "reservation"
                      ? "Edit Reservation"
                      : "Edit Booking"
                  }`}
                  onClick={() => setEditBookingModal(!editBookingModal)}
                />
              )}
            <IoIosClose
              size={30}
              className="cursor-pointer hover:bg-gray-200"
              title="Close"
              onClick={() => setSelectedBooking(null)}
            />
          </div>

          <h3>Booking Details:</h3>
          <div className="flex gap-1">
            <p>Date:</p>
            <p>{selectedBooking.date.split("T")[0]}</p>
          </div>
          <div className="flex gap-1">
            <p>Room Number:</p>
            <p>{selectedBooking.room_number}</p>
          </div>
          <div className="flex gap-1">
            <p>Start Time:</p>
            <p>{convertTimeTo12HourFormat(selectedBooking.start_time)}</p>
          </div>
          <div className="flex gap-1">
            <p>End Time:</p>
            <p>{convertTimeTo12HourFormat(selectedBooking.end_time)}</p>
          </div>
          <div className="flex gap-1">
            <p>Faculty In Charge:</p>
            <p>{selectedBooking.professor_name}</p>
          </div>
          <div className="flex gap-1">
            <p>Class:</p>
            <p>{selectedBooking.class_name}</p>
          </div>
          <div className="flex gap-1">
            <p>Purpose:</p>
            <p>{selectedBooking.purpose}</p>
          </div>
          {selectedBooking.booking_type === "reservation" && (
            <div className="flex gap-1">
              <p>Booking Type:</p>
              <p>
                {selectedBooking.booking_type.charAt(0).toUpperCase() +
                  selectedBooking.booking_type.slice(1)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* CANCEL RESERVATION MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-sm bg-white rounded-md shadow-xl">
            <div className="flex p-4">
            <h1 className="text-lg">Cancel Reservation</h1>
            </div>
            <hr className="w-full"/>
            <div className="flex flex-col gap-5 p-5">
              <h2 className="font-normal">Are you sure you want to cancel this reservation?</h2>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 bg-[#B3E5FC] rounded cursor-pointer hover:bg-[#99d3ee]"
                    onClick={() => setShowCancelModal(false)}
                  >
                    No
                  </button>
                  <button
                    className="px-4 py-2 text-white bg-red-500 rounded cursor-pointer hover:bg-red-600"
                    onClick={handleConfirmCancel}
                  >
                    Yes, Cancel
                  </button>
                </div>
            </div>
            
            
          </div>
        </div>
      )}
    </>
  );
};

export default BookingDetailPopup;
