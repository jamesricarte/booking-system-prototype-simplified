const express = require("express");
const db = require("../config/db");
const router = express.Router();

//Fetch Bookings for specific room and date
router.get("/bookings/:id", (req, res) => {
  const roomId = req.params.id;
  db.query(
    `SELECT b.id AS booking_id,
      r.room_number,
      p.professor_name,
      p.id AS professor_id,
      c.class_name,
      b.start_time AS start_time_id,
      t1.time AS start_time,
      b.end_time AS end_time_id,
      t2.time AS end_time,
      b.purpose,
      booking_type,
      b.date,
      b.created_at 
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN professors p ON b.professor_id = p.id
      JOIN classes c ON b.class_id = c.id
      JOIN timeslots t1 ON b.start_time = t1.id
      JOIN timeslots t2 ON b.end_time = t2.id
      WHERE b.date = CURRENT_DATE() AND b.room_id = ?;`,
    [roomId],
    async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (!result) {
        return res
          .status(400)
          .json({ message: "Some problem occured", result });
      }

      if (result.length === 0) {
        return res
          .status(200)
          .json({ message: "No bookings were found", bookings: result });
      }

      res.status(200).json({
        message: "Bookings were succesfully fetched!",
        bookings: result,
      });
    }
  );
});

//Check availability for all rooms
//Fetch bookings for all room at current date
router.get("/roomBookingAvailability", (req, res) => {
  db.query(
    `SELECT b.id AS booking_id,
    b.room_id,
    t1.time AS start_time,
    t2.time AS end_time,
    p.professor_name,
    p.id AS professor_id,
    b.booking_type,
    r.room_number,
    b.start_time AS start_time_id,
    b.end_time AS end_time_id
    FROM bookings b 
    JOIN timeslots t1 ON b.start_time = t1.id
    JOIN timeslots t2 ON b.end_time = t2.id
    JOIN professors p ON b.professor_id = p.id
    jOIN rooms r ON b.room_id = r.id
    WHERE b.date = CURRENT_DATE()`,
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      const fetchedBookings = result;

      if (!result) {
        return res
          .status(400)
          .json({ message: "Some problem occured", result });
      }

      if (result.length === 0) {
        return res.status(200).json({
          message: "No bookings found.",
          roomBookings: fetchedBookings,
        });
      }

      return res.status(200).json({
        message: "Successfully fetched bookings for all rooms",
        roomBookings: fetchedBookings,
      });
    }
  );
});

//bookNow
router.post("/newBooking", (req, res) => {
  const booking = req.body;

  if (
    Object.values(booking).includes("") ||
    Object.values(booking).includes(null) ||
    Object.values(booking).includes(undefined)
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  if (parseInt(booking.endTime) <= parseInt(booking.startTime)) {
    return res
      .status(400)
      .json({ message: "Start time must be before end time!" });
  }

  db.query(
    "SELECT * FROM bookings WHERE date = CURRENT_DATE() AND room_id = ? AND NOT ( ? <= start_time OR ? >= end_time)",
    [booking.roomId, booking.endTime, booking.startTime],
    async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (result.length > 0) {
        return res
          .status(400)
          .json({ message: "The selected time period was already booked." });
      } else {
        db.query(
          "INSERT INTO bookings (room_id, professor_id, class_id, start_time, end_time, purpose, booking_type, date) VALUES (?, ?, ? ,?, ?, ?, ?, NOW())",
          [
            booking.roomId,
            booking.professorId,
            booking.classId,
            booking.startTime,
            booking.endTime,
            booking.purpose,
            booking.booking_type,
          ],
          async (err, result) => {
            if (err) {
              return res.status(500).json({
                message: "Something went wrong",
                error: err.message,
              });
            }

            if (!result) {
              return res
                .status(500)
                .json({ message: "Error adding booking", error: result });
            }

            res.status(201).json({
              message: "Your booking has been successfully added!",
              result,
            });
          }
        );
      }
    }
  );
});

//Reserve Booking
router.post("/reserveBooking", (req, res) => {
  const booking = req.body;

  if (
    Object.values(booking).includes("") ||
    Object.values(booking).includes(null) ||
    Object.values(booking).includes(undefined)
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  if (parseInt(booking.endTime) <= parseInt(booking.startTime)) {
    return res
      .status(400)
      .json({ message: "Start time must be before end time!" });
  }

  db.query(
    "SELECT * FROM bookings WHERE date = CURRENT_DATE() AND room_id = ? AND NOT ( ? <= start_time OR ? >= end_time)",
    [booking.roomId, booking.endTime, booking.startTime],
    async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (result.length > 0) {
        return res
          .status(400)
          .json({ message: "The selected time period was already booked." });
      } else {
        db.query(
          "INSERT INTO bookings (room_id, professor_id, class_id, start_time, end_time, purpose, booking_type, date) VALUES (?, ?, ? ,?, ?, ?, ?, NOW())",
          [
            booking.roomId,
            booking.professorId,
            booking.classId,
            booking.startTime,
            booking.endTime,
            booking.purpose,
            booking.booking_type,
          ],
          async (err, result) => {
            if (err) {
              return res.status(500).json({
                message: "Something went wrong",
                error: err.message,
              });
            }

            if (!result) {
              return res
                .status(500)
                .json({ message: "Error adding booking", error: result });
            }

            res.status(201).json({
              message: "Your reservation has been successfully confirmed!",
              result,
            });
          }
        );
      }
    }
  );
});

//Update booking type
router.put("/updateBookingType", (req, res) => {
  const { toBeUpdated, startTime, endTime, roomId, type } = req.body;
  db.query(
    "UPDATE bookings SET booking_type = 'current_book' WHERE id = ?",
    [toBeUpdated],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (!result) {
        return res
          .status(400)
          .json({ message: "Some problem occured", result });
      }

      const idToFindPrevious =
        type === "updateReservationToCurrent" ? startTime : endTime;

      db.query(
        "UPDATE bookings SET booking_type = 'past' WHERE (end_time <= ?  AND booking_type = 'current_book' AND room_id = ?) OR (date < CURRENT_DATE() AND booking_type = 'current_book' AND room_id = ?)",
        [idToFindPrevious, roomId, roomId],
        (err, result) => {
          if (err) {
            res
              .status(500)
              .json({ message: "Something went wrong", error: err.message });
          }

          if (!result) {
            return res
              .status(400)
              .json({ message: "Some problem occured", result });
          }

          return res
            .status(200)
            .json({ message: "Successfully updated booking type", result });
        }
      );
    }
  );
});

//Update booking type of user occupancy
router.put("/updateBookingTypeOfUser", (req, res) => {
  const { toBeUpdated, startTime, endTime, professorId, type } = req.body;
  db.query(
    "UPDATE bookings SET booking_type = 'current_book' WHERE id = ?",
    [toBeUpdated],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (!result) {
        return res
          .status(400)
          .json({ message: "Some problem occured", result });
      }

      const idToFindPrevious =
        type === "updateReservationToCurrent" ? startTime : endTime;

      db.query(
        "UPDATE bookings SET booking_type = 'past' WHERE (end_time <= ?  AND booking_type = 'current_book' AND professor_id = ?) OR (date < CURRENT_DATE() AND booking_type = 'current_book' AND professor_id = ?)",
        [idToFindPrevious, professorId, professorId],
        (err, result) => {
          if (err) {
            res
              .status(500)
              .json({ message: "Something went wrong", error: err.message });
          }

          if (!result) {
            return res
              .status(400)
              .json({ message: "Some problem occured", result });
          }

          return res
            .status(200)
            .json({ message: "Successfully updated booking type", result });
        }
      );
    }
  );
});

//Check User Occupancy (NOT USED)
router.get("/checkUserOccupancy/:professorId", (req, res) => {
  const professorId = req.params.professorId;

  db.query(
    `SELECT b.id AS booking_id,
    p.professor_name,
    c.class_name,
    t1.time AS start_time,
    t2.time AS end_time,
    b.purpose,
    r.room_number,
    r.id AS room_id
    FROM bookings b
    JOIN professors p ON b.professor_id = p.id
    JOIN classes c ON b.class_id = c.id
    JOIN timeslots t1 ON b.start_time = t1.id
    JOIN timeslots t2 ON b.end_time = t2.id
    JOIN rooms r ON b.room_id = r.id
    WHERE b.professor_id = ? 
    AND b.booking_type = 'current_book'
    AND b.date = CURRENT_DATE()`,
    [professorId],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (result.length === 0) {
        return res
          .status(200)
          .json({ message: "No occupancy yet", occupancyData: [] });
      }

      if (result.length > 1) {
        return res.status(200).json({
          multipleOccupancy: true,
          message: "Multiple Occupancy detected!",
          occupancyData: result,
        });
      }

      return res.status(200).json({
        message: "User have occupancy already",
        occupancyData: result,
      });
    }
  );
});

//Delete userOccupancy booking
router.delete("/deleteUserOccupancyBooking", (req, res) => {
  const { booking_id } = req.body;

  db.query("DELETE FROM bookings WHERE id = ?", [booking_id], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Something went wrong", error: err.message });
    }

    if (Object.values(result).every((val) => val === 0)) {
      return res.status(400).json({
        message: "The booking you were trying to delete was not found",
        result: result,
      });
    }

    return res.status(200).json({
      message: "Booking was canceled.",
      result: result,
    });
  });
});

const convertTimeToMinutes = (hours, minutes) => {
  return hours * 60 + minutes;
};

//End current booking
router.put("/endUserOccupancyBooking", (req, res) => {
  const userOccupancyData = req.body;

  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();

  const userOccupancyStartTimeHours = userOccupancyData.start_time
    .split(":")
    .map(Number)[0];
  const userOccupancyStartTimeMinutes = userOccupancyData.start_time
    .split(":")
    .map(Number)[1];
  const userOccupancyEndTimeHours = userOccupancyData.end_time
    .split(":")
    .map(Number)[0];
  const userOccupancyEndTimeMinutes = userOccupancyData.end_time
    .split(":")
    .map(Number)[1];

  const totalCurrentTimeMinutes = convertTimeToMinutes(hours, minutes);
  const totalUserOccupancyStartTimeMinutes = convertTimeToMinutes(
    userOccupancyStartTimeHours,
    userOccupancyStartTimeMinutes
  );
  const totalUserOccupancyEndTimeMinutes = convertTimeToMinutes(
    userOccupancyEndTimeHours,
    userOccupancyEndTimeMinutes
  );

  function endBooking(selectedEndTimeId) {
    db.query(
      "UPDATE bookings SET end_time = ?, booking_type = ? WHERE id = ?",
      [selectedEndTimeId, "past", userOccupancyData.booking_id],
      (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Something went wrong", error: err.message });
        }

        if (Object.values(result).every((val) => val === 0)) {
          return res.status(400).json({
            message:
              "Error ending! The booking you were trying to cancel was not found.",
            result: result,
          });
        }

        return res.status(200).json({ message: "Ended your booking" });
      }
    );
  }

  let selectedEndTimeId;
  let nearestTimeSlotForCancel;
  if (totalCurrentTimeMinutes - totalUserOccupancyStartTimeMinutes < 30) {
    selectedEndTimeId = parseInt(++userOccupancyData.start_time_id);

    endBooking(selectedEndTimeId);
  } else {
    if (minutes > 15 && minutes < 45) {
      minutes = 30;
    } else if (minutes >= 45) {
      hours++;
      minutes = 0;
    } else {
      minutes = 0;
    }
    nearestTimeSlotForCancel = `${hours.toString().padStart(2, "0")}:${minutes
      .toString(nearestTimeSlotForCancel)
      .padStart(2, "0")}:00`;
    db.query(
      "SELECT * FROM timeslots WHERE time = ?",
      [nearestTimeSlotForCancel],
      (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Something went wrong", error: err.message });
        }

        if (result.length === 0) {
          return res
            .status(400)
            .json("Error finding right timeslot for cancelation.");
        }

        selectedEndTimeId = result[0].id;

        endBooking(selectedEndTimeId);
      }
    );
  }
});

//Update booking
router.put("/updateBooking", (req, res) => {
  const editBooking = req.body;

  db.query(
    "UPDATE bookings SET start_time = ?, end_time = ?, class_id = ?, purpose = ? WHERE id = ?",
    [
      editBooking.startTime,
      editBooking.endTime,
      editBooking.classId,
      editBooking.purpose,
      editBooking.bookingId,
    ],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (!result) {
        return res
          .status(400)
          .json({ message: "Some problem occured", result });
      }

      if (Object.values(result).every((val) => val === 0)) {
        return res.status(400).json({
          message:
            "Error updating! The booking you were trying to update was unfortunately not found.",
          result: result,
        });
      }

      return res
        .status(200)
        .json({ message: "Updated your booking successfully!" });
    }
  );
});

//Cancel Reservation
router.delete("/cancelReservation/:bookingId", (req, res) => {
  const bookingId = req.params.bookingId;

  db.query("DELETE FROM bookings WHERE id = ?", [bookingId], (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Something went wrong", error: err.message });
    }

    if (!result) {
      return res.status(400).json({ message: "Some problem occured", result });
    }

    if (Object.values(result).every((val) => val === 0)) {
      return res.status(400).json({
        message:
          "Cancel error! The booking you were trying to cancel was unfortunately not found.",
        result: result,
      });
    }

    return res
      .status(200)
      .json({ message: "Your reservation has been cancelled." });
  });
});

module.exports = router;
