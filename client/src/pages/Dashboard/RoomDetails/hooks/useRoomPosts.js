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

  const [loading, setLoading] = useState(false);

  //POST Requests
  const bookNow = async (e) => {
    e.preventDefault();

    setLoading(true);
    const startTime = Date.now();
    let message = { isBookingMessageAvaialable: false, message: "", type: "" };

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
      message = {
        isBookingMessageAvaialable: true,
        message: result.message,
        type: "success",
      };
    } catch (error) {
      message = {
        isBookingMessageAvaialable: true,
        message: error.message,
        type: "error",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        setLoading(false);
        setBookingMessage({
          isBookingMessageAvaialable: message.isBookingMessageAvaialable,
          message: message.message,
          type: message.type,
        });
        setTimeout(() => {
          setBookingMessage((prev) => ({
            ...prev,
            isBookingMessageAvaialable: false,
          }));
        }, 2000);
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  const reserveBooking = async (e) => {
    e.preventDefault();

    setLoading(true);
    const startTime = Date.now();
    let message = { isBookingMessageAvaialable: false, message: "", type: "" };

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
      message = {
        isBookingMessageAvaialable: true,
        message: result.message,
        type: "success",
      };
    } catch (error) {
      message = {
        isBookingMessageAvaialable: true,
        message: error.message,
        type: "error",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        setLoading(false);
        setBookingMessage({
          isBookingMessageAvaialable: message.isBookingMessageAvaialable,
          message: message.message,
          type: message.type,
        });
        setTimeout(() => {
          setBookingMessage((prev) => ({
            ...prev,
            isBookingMessageAvaialable: false,
          }));
        }, 2000);
      }, Math.max(0, minimumTime - elapsedTime));
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
    loading,
  };
};

export default useRoomPosts;
