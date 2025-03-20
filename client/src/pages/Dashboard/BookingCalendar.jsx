import { useState, useEffect } from "react";

export default function BookingCalendar() {
  const [bookings, setBookings] = useState([
    { startTime: "9:30 AM", endTime: "10:30 AM", title: "Meeting with Client" },
    { startTime: "2:00 PM", endTime: "3:00 PM", title: "Design Review" },
  ]);

  const generateTimeSlots = () => {
    const slots = [];
    let hour = 7;
    let minutes = 0;
    let period = "AM";

    for (let i = 0; i < 25; i++) {
      const time = `${hour}:${minutes === 0 ? "00" : "30"} ${period}`;
      slots.push(time);

      if (minutes === 0) {
        minutes = 30;
      } else {
        minutes = 0;
        hour++;
        if (hour === 12) period = "PM";
        if (hour === 13) hour = 1; // Convert to 12-hour format
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Function to convert time (e.g., "9:30 AM") to minutes since 7:00 AM
  const timeToMinutes = (time) => {
    const [hourMinute, period] = time.split(" ");
    let [hour, minute] = hourMinute.split(":").map(Number);
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return (hour - 7) * 60 + minute; // Minutes from 7:00 AM
  };

  // Get current time position for real-time indicator
  const [currentTimePosition, setCurrentTimePosition] = useState(0);

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const totalMinutes = (hours - 7) * 60 + minutes;
      setCurrentTimePosition((totalMinutes / 30) * 40); // Each 30-min slot is 40px
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h3 className="mb-2 text-lg font-semibold">Bookings</h3>
      <div className="relative px-6 overflow-y-scroll border border-gray-200 h-96 w-96">
        {/* Current Time Indicator */}
        <div
          className="absolute left-6 right-6 h-[2px] bg-red-500"
          style={{ top: `${currentTimePosition}px` }}
        ></div>

        {/* Time Slots */}
        {timeSlots.map((time, index) => (
          <div key={index} className="relative flex items-center h-10">
            <p className="text-sm min-w-20">{time}</p>
            <div className="w-full h-[1px] bg-gray-300"></div>
          </div>
        ))}

        {/* Bookings */}
        {bookings.map((booking, index) => {
          const start = timeToMinutes(booking.startTime);
          const end = timeToMinutes(booking.endTime);
          const top = (start / 30) * 40; // Each 30-min slot is 40px
          const height = ((end - start) / 30) * 40; // Height proportional to duration

          return (
            <div
              key={index}
              className="absolute w-48 p-1 text-sm text-white bg-blue-500 rounded left-28"
              style={{ top: `${top}px`, height: `${height}px` }}
            >
              {booking.title}
            </div>
          );
        })}
      </div>
    </div>
  );
}
