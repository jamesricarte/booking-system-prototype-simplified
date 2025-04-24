import React from "react";
import { IoIosClose } from "react-icons/io";
import { MdEdit } from "react-icons/md";
import { TbClockCancel } from "react-icons/tb";
import { convertTimeTo12HourFormat } from "../../../../utils/timeUtils";

const BookingDetailPopup = ({
  selectedBooking,
  selectedBookingPosition,
  setSelectedBooking,
}) => {
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
            <TbClockCancel
              size={25}
              className="p-1 cursor-pointer hover:bg-gray-200"
              title="cancel"
            />
            <MdEdit
              size={25}
              className="p-1 cursor-pointer hover:bg-gray-200"
              title="edit"
            />
            <IoIosClose
              size={30}
              className="cursor-pointer hover:bg-gray-200"
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
        </div>
      )}
    </>
  );
};

export default BookingDetailPopup;
