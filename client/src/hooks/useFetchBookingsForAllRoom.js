import React, { useEffect, useState } from "react";

import { API_URL } from "../config/apiConfig";

const useFetchBookingsForAllRoom = () => {
  const [bookingsForAllRoom, setBookingsForAllRoom] = useState([]);

  useEffect(() => {
    fetchBookingsForAllRoom();
  }, []);

  const fetchBookingsForAllRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/api/roomBookingAvailability`);

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      setBookingsForAllRoom(result.roomBookings);
    } catch (error) {
      console.error(error);
    }
  };
  return {
    bookingsForAllRoom,
    fetchBookingsForAllRoom,
  };
};

export default useFetchBookingsForAllRoom;
