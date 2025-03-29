import React, { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

const useRoomPosts = () => {
  //Form States
  const [bookNowFormData, setBookNowFormData] = useState({
    startTime: "",
    endTime: "",
    classId: "",
    purpose: "",
    roomId: "",
    professorId: "",
  });
  const [reserveBookingFormData, setReserveFromData] = useState({
    startTime: "",
    endTime: "",
    classId: "",
    purpose: "",
    roomId: "",
    professorId: "",
  });

  //POST Requests
  const bookNow = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/newBooking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookNowFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  const reserveBooking = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/api/reserveBooking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reserveBookingFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    reserveBookingFormData,
    bookNowFormData,
    bookNow,
    reserveBooking,
    setBookNowFormData,
    setReserveFromData,
  };
};

export default useRoomPosts;
