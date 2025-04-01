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
  const [reserveBookingFormData, setReserveBookingFromData] = useState({
    startTime: "",
    endTime: "",
    classId: "",
    purpose: "",
    roomId: "",
    professorId: "",
  });

  //Response message states
  const [bookingMessage, setBookingMessage] = useState({
    isBookingMessageAvaialable: false,
    message: "",
    type: "",
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
      setBookingMessage({
        isBookingMessageAvaialable: true,
        message: result.message,
        type: "success",
      });
    } catch (error) {
      setBookingMessage({
        isBookingMessageAvaialable: true,
        message: error.message,
        type: "error",
      });
    } finally {
      setTimeout(() => {
        setBookingMessage((prev) => ({
          ...prev,
          isBookingMessageAvaialable: false,
        }));
      }, 3000);
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
      setBookingMessage({
        isBookingMessageAvaialable: true,
        message: result.message,
        type: "success",
      });
    } catch (error) {
      setBookingMessage({
        isBookingMessageAvaialable: true,
        message: error.message,
        type: "error",
      });
    } finally {
      setTimeout(() => {
        setBookingMessage((prev) => ({
          ...prev,
          isBookingMessageAvaialable: false,
        }));
      }, 3500);
    }
  };

  return {
    reserveBookingFormData,
    bookNowFormData,
    bookNow,
    reserveBooking,
    setBookNowFormData,
    setReserveBookingFromData,
    bookingMessage,
  };
};

export default useRoomPosts;
