import React, { useState, useEffect } from "react";
import { convertUTCDateToSameTimezone } from "../../../../utils/timeUtils";
import { useAuth } from "../../../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const useRoomFetches = (roomId) => {
  // Database States
  const [roomDetails, setRoomDetails] = useState(null);
  const [classes, setClasses] = useState([]);
  const [timeslots, setTimeslots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingsPurposes, setBookingsPurposes] = useState([]);
  const [serverDate, setServerDate] = useState(null);
  const [professor, setProfessor] = useState(null);

  const { user } = useAuth();
  const schoolId = user.school_id;

  //Fetches from database
  const fetchRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/api/room/${roomId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      setRoomDetails(result.room);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_URL}/api/classes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      setClasses(result.classes);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchTimeslots = async () => {
    try {
      const response = await fetch(`${API_URL}/api/timeslots`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      setTimeslots(result.timeslots);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bookings/${roomId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      const updatedDateResult = {
        ...result,
        bookings: result.bookings.map((booking) => ({
          ...booking,
          date: convertUTCDateToSameTimezone(booking.date),
        })),
      };
      setBookings(updatedDateResult.bookings);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchBookingPurposes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/bookingPurposes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      setBookingsPurposes(result.bookingPurposes);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchServerDate = async () => {
    try {
      const response = await fetch(`${API_URL}/api/serverDate`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      setServerDate(convertUTCDateToSameTimezone(result.serverDate));
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchProfessor = async () => {
    try {
      const response = await fetch(`${API_URL}/api/professor/${schoolId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      setProfessor(result.professor);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        fetchRoom(),
        fetchClasses(),
        fetchTimeslots(),
        fetchBookings(),
        fetchBookingPurposes(),
        fetchServerDate(),
        fetchProfessor(),
      ]);
    };
    fetchData();
  }, []);

  return {
    roomDetails,
    classes,
    timeslots,
    bookings,
    bookingsPurposes,
    serverDate,
    professor,
    fetchBookings,
  };
};

export default useRoomFetches;
