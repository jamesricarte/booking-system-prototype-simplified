import { useEffect, useState } from "react";
import { useBooking } from "../../../../context/BookingContext";

const API_URL = import.meta.env.VITE_API_URL;

const useRoomRequests = () => {
  const { setTimeWhenBooked, currentTime, userOccupancyData } = useBooking();

  //Form States
  const [bookNowFormData, setBookNowFormData] = useState({
    startTime: "",
    endTime: "",
    classId: "",
    purpose: "",
    roomId: "",
    professorId: "",
    booking_type: "current_book",
  });
  const [reserveBookingFormData, setReserveBookingFromData] = useState({
    startTime: "",
    endTime: "",
    classId: "",
    purpose: "",
    roomId: "",
    professorId: "",
    booking_type: "reservation",
  });

  const [editBookingFormData, setEditBookingFormData] = useState({
    bookingId: 0,
    startTime: "",
    endTime: "",
    classId: "",
    purpose: "",
  });

  //Response message states
  const [bookingMessage, setBookingMessage] = useState({
    isBookingMessageAvailable: false,
    message: "",
    type: "",
  });

  const [loading, setLoading] = useState(false);

  //POST Requests
  const bookNow = async (e) => {
    e.preventDefault();

    setLoading(true);
    const startTime = Date.now();
    let message = { isBookingMessageAvailable: false, message: "", type: "" };

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
      setTimeWhenBooked(currentTime);
      message = {
        isBookingMessageAvailable: true,
        message: result.message,
        type: "success",
      };
    } catch (error) {
      const errorMessage =
        error.message === "Failed to fetch"
          ? "Unable to connect to the server. Check your internet connection"
          : error.message;

      message = {
        isBookingMessageAvailable: true,
        message: errorMessage,
        type: "error",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        setLoading(false);
        setBookingMessage({
          isBookingMessageAvailable: message.isBookingMessageAvailable,
          message: message.message,
          type: message.type,
        });
        setTimeout(() => {
          setBookingMessage((prev) => ({
            ...prev,
            isBookingMessageAvailable: false,
          }));
        }, 2000);
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  const reserveBooking = async (e) => {
    e.preventDefault();

    setLoading(true);
    const startTime = Date.now();
    let message = { isBookingMessageAvailable: false, message: "", type: "" };

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
        isBookingMessageAvailable: true,
        message: result.message,
        type: "success",
      };
    } catch (error) {
      const errorMessage =
        error.message === "Failed to fetch"
          ? "Unable to connect to the server. Check your internet connection"
          : error.message;

      message = {
        isBookingMessageAvailable: true,
        message: errorMessage,
        type: "error",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        setLoading(false);
        setBookingMessage({
          isBookingMessageAvailable: message.isBookingMessageAvailable,
          message: message.message,
          type: message.type,
        });
        setTimeout(() => {
          setBookingMessage((prev) => ({
            ...prev,
            isBookingMessageAvailable: false,
          }));
        }, 2000);
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  const cancelBooking = async () => {
    setLoading(true);
    const startTime = Date.now();
    let message = { isBookingMessageAvailable: false, message: "", type: "" };

    try {
      const response = await fetch(
        `${API_URL}/api/deleteUserOccupancyBooking`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userOccupancyData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      message = {
        isBookingMessageAvailable: true,
        message: result.message,
        type: "error",
      };
    } catch (error) {
      const errorMessage =
        error.message === "Failed to fetch"
          ? "Unable to connect to the server. Check your internet connection"
          : error.message;

      message = {
        isBookingMessageAvailable: true,
        message: errorMessage,
        type: "error",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        setLoading(false);
        setBookingMessage({
          isBookingMessageAvailable: message.isBookingMessageAvailable,
          message: message.message,
          type: message.type,
        });
        setTimeout(() => {
          setBookingMessage((prev) => ({
            ...prev,
            isBookingMessageAvailable: false,
          }));
        }, 2000);
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  const endBooking = async () => {
    setLoading(true);
    const startTime = Date.now();
    let message = { isBookingMessageAvailable: false, message: "", type: "" };

    try {
      const response = await fetch(`${API_URL}/api/endUserOccupancyBooking`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userOccupancyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      message = {
        isBookingMessageAvailable: true,
        message: result.message,
        type: "success",
      };
    } catch (error) {
      const errorMessage =
        error.message === "Failed to fetch"
          ? "Unable to connect to the server. Check your internet connection"
          : error.message;

      message = {
        isBookingMessageAvailable: true,
        message: errorMessage,
        type: "error",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        setLoading(false);
        setBookingMessage({
          isBookingMessageAvailable: message.isBookingMessageAvailable,
          message: message.message,
          type: message.type,
        });
        setTimeout(() => {
          setBookingMessage((prev) => ({
            ...prev,
            isBookingMessageAvailable: false,
          }));
        }, 2000);
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  const editBooking = async (e) => {
    e.preventDefault();

    setLoading(true);
    const startTime = Date.now();
    let message = { isBookingMessageAvailable: false, message: "", type: "" };

    try {
      const response = await fetch(`${API_URL}/api/updateBooking`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editBookingFormData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      message = {
        isBookingMessageAvailable: true,
        message: result.message,
        type: "success",
      };
    } catch (error) {
      const errorMessage =
        error.message === "Failed to fetch"
          ? "Unable to connect to the server. Check your internet connection"
          : error.message;

      message = {
        isBookingMessageAvailable: true,
        message: errorMessage,
        type: "error",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        setLoading(false);
        setBookingMessage({
          isBookingMessageAvailable: message.isBookingMessageAvailable,
          message: message.message,
          type: message.type,
        });
        setTimeout(() => {
          setBookingMessage((prev) => ({
            ...prev,
            isBookingMessageAvailable: false,
          }));
        }, 2000);
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  const cancelReservation = async (bookingId) => {
    setLoading(true);
    const startTime = Date.now();
    let message = { isBookingMessageAvailable: false, message: "", type: "" };

    try {
      const response = await fetch(
        `${API_URL}/api/cancelReservation/${bookingId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      message = {
        isBookingMessageAvailable: true,
        message: result.message,
        type: "error",
      };
    } catch (error) {
      const errorMessage =
        error.message === "Failed to fetch"
          ? "Unable to connect to the server. Check your internet connection"
          : error.message;

      message = {
        isBookingMessageAvailable: true,
        message: errorMessage,
        type: "error",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        setLoading(false);
        setBookingMessage({
          isBookingMessageAvailable: message.isBookingMessageAvailable,
          message: message.message,
          type: message.type,
        });
        setTimeout(() => {
          setBookingMessage((prev) => ({
            ...prev,
            isBookingMessageAvailable: false,
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
    cancelBooking,
    endBooking,
    editBookingFormData,
    setEditBookingFormData,
    editBooking,
    cancelReservation,
  };
};

export default useRoomRequests;
