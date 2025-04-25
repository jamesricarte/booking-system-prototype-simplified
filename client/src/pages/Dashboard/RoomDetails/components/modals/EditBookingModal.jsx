import { RiCloseCircleFill } from "react-icons/ri";
import { convertTimeTo12HourFormat } from "../../../../../utils/timeUtils";
import { handleFormChange } from "../../../../../utils/formHandlers";
import Button from "../../../../../components/Button";
import { useEffect, useState } from "react";
import { useBooking } from "../../../../../context/BookingContext";

const EditBookingModal = ({
  editBookingModal,
  setEditBookingModal,
  setSelectedBooking,
  selectedBooking,
  serverDate,
  filteredStartTimeSlots,
  filteredEndTimeSlotsForReservation,
  classes,
  bookingsPurposes,
  editBookingFormData,
  setEditBookingFormData,
  editBooking,
  loading,
  bookingMessage,
  bookings,
}) => {
  const { userOccupancyData } = useBooking();

  const [filteredBookings, setFilteredBookings] = useState([]);
  const [
    isTimeSlotAvailableForEditingBooking,
    setIsTimeSlotAvailableForEditingBooking,
  ] = useState(true);
  const [conflictWithUserOccupancy, setConflictWithUserOccupancy] =
    useState(false);

  const handleEditReserveFormData = handleFormChange(
    editBookingFormData,
    setEditBookingFormData
  );

  useEffect(() => {
    if (bookings.length > 0 && selectedBooking) {
      const filtered = bookings.filter(
        (booking) => booking.booking_id !== selectedBooking.booking_id
      );
      setFilteredBookings(filtered);
    }
  }, [bookings, selectedBooking]);

  const checkAvailability = () => {
    const selectedStart = parseInt(editBookingFormData.startTime);
    const selectedEnd = parseInt(editBookingFormData.endTime);

    const isOverlapping = filteredBookings.some((booking) => {
      const bookingStart = booking.start_time_id;
      const bookingEnd = booking.end_time_id;

      return !(selectedEnd <= bookingStart || selectedStart >= bookingEnd);
    });
    setIsTimeSlotAvailableForEditingBooking(!isOverlapping);

    if (!isOverlapping) {
      if (userOccupancyData) {
        if (
          selectedEnd <= parseInt(userOccupancyData?.start_time_id) ||
          selectedStart >= parseInt(userOccupancyData?.end_time_id)
        ) {
          setConflictWithUserOccupancy(false);
        } else {
          setConflictWithUserOccupancy(true);
        }
      }
    }
  };

  useEffect(() => {
    checkAvailability();
  }, [
    editBookingFormData.startTime,
    editBookingFormData.endTime,
    filteredBookings,
  ]);

  //Updating the value editBookingFormData.endTime to next to start_time
  useEffect(() => {
    if (editBookingFormData.startTime) {
      if (
        parseInt(editBookingFormData.endTime) -
          parseInt(editBookingFormData.startTime) <=
        1
      ) {
        const nextAvailableEndTime = filteredEndTimeSlotsForReservation.find(
          (timeslot) => timeslot.id > parseInt(editBookingFormData.startTime)
        );
        if (nextAvailableEndTime) {
          setEditBookingFormData((prevData) => ({
            ...prevData,
            endTime: nextAvailableEndTime.id,
          }));
        }
      }
    }
  }, [editBookingFormData.startTime, selectedBooking]);

  //Initially setting the values of EditBookingFormData from selected booking
  useEffect(() => {
    if (selectedBooking) {
      setEditBookingFormData((prevData) => ({
        ...prevData,
        bookingId: selectedBooking.booking_id,
        startTime: selectedBooking.start_time_id,
        endTime: selectedBooking.end_time_id,
        classId:
          classes.find((c) => c.class_name === selectedBooking.class_name)
            ?.id || "",
        purpose: selectedBooking.purpose,
      }));
    }
  }, [selectedBooking]);

  return (
    <>
      {/* Edit Reservation Modal */}
      <div
        className={`fixed transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-lg top-1/2 left-1/2 rounded-xs z-20 w-[35vw] ${
          editBookingModal && !bookingMessage.isBookingMessageAvaialable
            ? "block"
            : "hidden"
        }`}
      >
        <div className="flex items-center justify-between p-3">
          <h3 className="text-lg">Edit Booking</h3>
          <RiCloseCircleFill
            className="cursor-pointer"
            onClick={() => {
              setEditBookingModal(!editBookingModal);
              setSelectedBooking(null);
            }}
            color="red"
          />
        </div>

        <hr />

        <div className="flex flex-col gap-4 px-12 py-8">
          <div className="flex">
            <p>Date:&nbsp;</p>
            <p>{serverDate?.split("T")[0]}</p>
          </div>
          {selectedBooking?.booking_type === "reservation" && (
            <>
              {!isTimeSlotAvailableForEditingBooking ? (
                <p className="text-red-500">
                  This time period is already booked. Please select a different
                  time.
                </p>
              ) : (
                conflictWithUserOccupancy && (
                  <p className="text-red-500">
                    You already have a booking during this time in another room.
                    Please select a different time slot.
                  </p>
                )
              )}
            </>
          )}

          {selectedBooking?.booking_type === "current_book" && (
            <p className="text-sm text-red-500">
              Start time and end time cannot be modified for an occupied
              booking.
            </p>
          )}

          <form className="flex flex-col gap-4" onSubmit={editBooking}>
            <div className="flex items-center justify-between gap-5">
              {selectedBooking?.booking_type === "reservation" && (
                <>
                  <div className="w-full">
                    <p>Start Time:</p>
                    <select
                      className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md w-full"
                      name="startTime"
                      value={editBookingFormData.startTime}
                      onChange={handleEditReserveFormData}
                    >
                      {filteredStartTimeSlots
                        .slice(0, -1)
                        .map((timeslot, index) => (
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
                      name="endTime"
                      id="endTime"
                      value={editBookingFormData.endTime}
                      onChange={handleEditReserveFormData}
                    >
                      {filteredEndTimeSlotsForReservation
                        .filter(
                          (timeslot) =>
                            timeslot.id >
                            parseInt(editBookingFormData.startTime)
                        )
                        .map((timeslot, index) => (
                          <option key={index} value={timeslot.id}>
                            {convertTimeTo12HourFormat(timeslot.time)}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col">
              <p>Class Year &amp; Block:&nbsp;</p>
              <select
                className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md w-full"
                name="classId"
                value={editBookingFormData.classId}
                onChange={handleEditReserveFormData}
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
                value={editBookingFormData.purpose}
                onChange={handleEditReserveFormData}
              >
                {bookingsPurposes.map((bookingPurpose, index) => (
                  <option key={index} value={bookingPurpose}>
                    {bookingPurpose}
                  </option>
                ))}
              </select>
            </div>

            {selectedBooking?.booking_type === "reservation" ? (
              <div className="flex items-center justify-end">
                <Button
                  className={`px-8 py-2 rounded-sm cursor-pointer ${
                    !isTimeSlotAvailableForEditingBooking ||
                    conflictWithUserOccupancy
                      ? "bg-gray-300 opacity-60"
                      : "bg-[#A2DEF9] hover:bg-[#b4e8ff]"
                  }`}
                  type="submit"
                  disabled={
                    !isTimeSlotAvailableForEditingBooking ||
                    conflictWithUserOccupancy
                  }
                >
                  Edit Booking
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-end">
                <Button
                  className="px-8 py-2 rounded-sm cursor-pointer 
                    bg-[#A2DEF9] hover:bg-[#b4e8ff]"
                  type="submit"
                >
                  Save Changes
                </Button>
              </div>
            )}
          </form>
          {/* White background */}
          <div
            className={`fixed top-0 left-0 w-full h-full bg-white opacity-50 pointer-events-auto z-10 ${
              loading ? "block" : "hidden"
            }`}
          ></div>
        </div>
      </div>
    </>
  );
};

export default EditBookingModal;
