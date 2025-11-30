import React from "react";
import { RiCloseCircleFill } from "react-icons/ri";
import { convertTimeTo12HourFormat } from "../../../../../utils/timeUtils";
import { handleFormChange } from "../../../../../utils/formHandlers";
import Button from "../../../../../components/Button";
import { useAuth } from "../../../../../context/AuthContext";
import { useBooking } from "../../../../../context/BookingContext";
import { Link } from "react-router-dom";

const BookNowModal = ({
  bookNowModal,
  serverDate,
  isTimeSlotAvailableForBookNow,
  roomAvailability,
  bookNow,
  filteredStartTimeSlots,
  bookNowFormData,
  setBookNowFormData,
  filteredEndTimeSlots,
  subjects,
  classes,
  bookingsPurposes,
  loading,
  bookingMessage,
  setBookNowModal,
  conflictWithUserReservation,
}) => {
  const { user } = useAuth();
  const { userReservationData } = useBooking();
  const handleBookNowFormData = handleFormChange(
    bookNowFormData,
    setBookNowFormData
  );

  return (
    <>
      {/* Book Now Modal */}
      <div
        className={`fixed transform -translate-x-1/2 -translate-y-1/2 bg-[#FAFAFA] border border-gray-300 shadow-lg top-1/2 left-1/2 z-20 rounded-xs w-[35vw] ${
          bookNowModal && !bookingMessage.isBookingMessageAvaialable
            ? "block"
            : "hidden"
        }`}
      >
        <div className="flex items-center justify-between p-3">
          <h3 className="text-lg">Book this room</h3>
          <RiCloseCircleFill
            className="cursor-pointer"
            onClick={() => setBookNowModal(!bookNowModal)}
            color="red"
          />
        </div>

        <hr />

        <div className="flex flex-col gap-4 px-12 py-8">
          <div className="flex">
            <p>Date:&nbsp;</p>
            <p>{serverDate?.split("T")[0]}</p>
          </div>

          {!isTimeSlotAvailableForBookNow ? (
            <p className="text-red-500">
              Sorry, this room is occupied at this current time. You can reserve
              for another time.
            </p>
          ) : conflictWithUserReservation ? (
            <p className="text-red-500">
              You already have a reservation at{" "}
              {convertTimeTo12HourFormat(userReservationData?.start_time)} in{" "}
              <Link
                className="hover:underline"
                to={`/room/${userReservationData?.room_id}`}
              >
                room {userReservationData?.room_number}
              </Link>
              . Please choose a different time.
            </p>
          ) : (
            <div className="flex">
              <p>Room Status:&nbsp;</p>
              <p
                className={`${
                  roomAvailability.type === "available"
                    ? "text-green-500"
                    : "text-red-500"
                } font-bold`}
              >
                {roomAvailability.message}
              </p>
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={bookNow}>
            <div className="flex items-center gap-5">
              <div className="w-full">
                <p>Start Time:</p>
                <p className="bg-[#f9f9f9] p-3 text-[#343434] rounded-md">
                  {convertTimeTo12HourFormat(filteredStartTimeSlots[0]?.time)}
                </p>
              </div>
              <div className="w-full">
                <p>End Time:</p>
                <select
                  className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md w-full"
                  name="endTime"
                  value={bookNowFormData.endTime}
                  onChange={handleBookNowFormData}
                >
                  {filteredEndTimeSlots.map((timeslot, index) => (
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
                value={bookNowFormData.subjectId}
                onChange={handleBookNowFormData}
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
                className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md"
                name="classId"
                value={bookNowFormData.classId}
                onChange={handleBookNowFormData}
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
                className="bg-[#EFEFEF] p-3 text-[#343434] rounded-md"
                name="purpose"
                value={bookNowFormData.purpose}
                onChange={handleBookNowFormData}
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
                className={` px-8 py-2 rounded-sm cursor-pointer ${
                  !isTimeSlotAvailableForBookNow || conflictWithUserReservation
                    ? "bg-gray-300 opacity-60"
                    : "bg-[#A2DEF9] hover:bg-[#b4e8ff]"
                }`}
                type="submit"
                disabled={
                  !isTimeSlotAvailableForBookNow || conflictWithUserReservation
                }
              >
                Book Now
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

export default BookNowModal;
