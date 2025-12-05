import { useState } from "react";
import { IoIosClose } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import { TbClockCancel } from "react-icons/tb";
import { convertTimeTo12HourFormat } from "../../../../utils/timeUtils";
import { useAuth } from "../../../../context/AuthContext";
import CancelReservatonConfirmModal from "./modals/CancelReservationConfirmModal";

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

  if (!selectedBooking) return null;

  return (
    <>
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

        <h3 className="mb-2 text-lg font-semibold">Booking Details:</h3>
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
          <p>Subject:</p>
          <p>
            {selectedBooking.subject_id
              ? `${selectedBooking.course_code} - ${selectedBooking.course_name}`
              : "None"}
          </p>
        </div>
        <div className="flex gap-1">
          <p>Faculty In Charge:</p>
          <p>{selectedBooking.professor_name}</p>
        </div>
        <div className="flex gap-1">
          <p>Year & Block:</p>
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

      {/* CANCEL RESERVATION MODAL */}
      <CancelReservatonConfirmModal
        isOpen={showCancelModal}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </>
  );
};

export default BookingDetailPopup;
