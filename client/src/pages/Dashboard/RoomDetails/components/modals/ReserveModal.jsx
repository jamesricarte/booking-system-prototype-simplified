import React from "react";
import { RiCloseCircleFill } from "react-icons/ri";
import { convertTimeTo12HourFormat } from "../../../../../utils/timeUtils";
import { handleFormChange } from "../../../../../utils/formHandlers";
import Button from "../../../../../components/Button";
import { useAuth } from "../../../../../context/AuthContext";

const ReserveModal = ({
  reserveModal,
  setReserveModal,
  serverDate,
  isTimeSlotAvailableForReserveBooking,
  reserveBooking,
  filteredStartTimeSlots,
  filteredEndTimeSlotsForReservation,
  reserveBookingFormData,
  setReserveBookingFromData,
  subjects,
  classes,
  bookingsPurposes,
  loading,
  bookingMessage,
  conflictWithUserOccupancy,
}) => {
  const { user } = useAuth();
  const handleReserveBookingFormData = handleFormChange(
    reserveBookingFormData,
    setReserveBookingFromData
  );
  return (
    <>
      {/* Reserve Modal */}
      <div
        className={`fixed transform -translate-x-1/2 -translate-y-1/2 bg-white border border-gray-300 shadow-lg top-1/2 left-1/2 rounded-xs z-20 w-[35vw] ${
          reserveModal && !bookingMessage.isBookingMessageAvaialable
            ? "block"
            : "hidden"
        }`}
      >
        <div className="flex items-center justify-between p-3">
          <h3 className="text-lg">Reserve a room</h3>
          <RiCloseCircleFill
            className="cursor-pointer"
            onClick={() => setReserveModal(!reserveModal)}
            color="red"
          />
        </div>

        <hr />

        <div className="flex flex-col gap-4 px-12 py-8">
          <div className="flex">
            <p>Date:&nbsp;</p>
            <p>{serverDate?.split("T")[0]}</p>
          </div>

          {!isTimeSlotAvailableForReserveBooking ? (
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

          <form className="flex flex-col gap-4" onSubmit={reserveBooking}>
            <div className="flex items-center justify-between gap-5">
              <div className="w-full">
                <p>Start Time:</p>
                <select
                  className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md w-full"
                  name="startTime"
                  value={reserveBookingFormData.startTime}
                  onChange={handleReserveBookingFormData}
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
                  value={reserveBookingFormData.endTime}
                  onChange={handleReserveBookingFormData}
                >
                  {filteredEndTimeSlotsForReservation
                    .filter(
                      (timeslot) =>
                        timeslot.id > parseInt(reserveBookingFormData.startTime)
                    )
                    .map((timeslot, index) => (
                      <option key={index} value={timeslot.id}>
                        {convertTimeTo12HourFormat(timeslot.time)}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col">
              <p>Subject:&nbsp;</p>
              <select
                className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md"
                name="subjectId"
                value={reserveBookingFormData.subjectId}
                onChange={handleReserveBookingFormData}
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
                value={reserveBookingFormData.classId}
                onChange={handleReserveBookingFormData}
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
                value={reserveBookingFormData.purpose}
                onChange={handleReserveBookingFormData}
              >
                {bookingsPurposes.map((bookingPurpose, index) => (
                  <option key={index} value={bookingPurpose}>
                    {bookingPurpose}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col text-[#F56C18]">
                <p className="font-bold">Faculty in Charge:&nbsp;</p>
                <p>{user.name}</p>
              </div>
              <Button
                className={`px-8 py-2 rounded-sm cursor-pointer ${
                  !isTimeSlotAvailableForReserveBooking ||
                  conflictWithUserOccupancy
                    ? "bg-gray-300 opacity-60"
                    : "bg-[#A2DEF9] hover:bg-[#b4e8ff]"
                }`}
                type="submit"
                disabled={
                  !isTimeSlotAvailableForReserveBooking ||
                  conflictWithUserOccupancy
                }
              >
                Reserve Booking
              </Button>
            </div>
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

export default ReserveModal;
