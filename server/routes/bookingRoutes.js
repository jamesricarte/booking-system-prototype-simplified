const express = require("express");
const db = require("../config/db");
const router = express.Router();

//Fetch Bookings
router.get("/bookings/:id", (req, res) => {
  try {
    const roomId = req.params.id;
    db.query(
      "SELECT b.id AS booking_id, r.room_number, p.professor_name, c.class_name, t1.time AS start_time, t2.time AS end_time, b.purpose, b.date, b.created_at FROM bookings b JOIN rooms r ON b.room_id = r.id JOIN professors p ON b.professor_id = p.id JOIN classes c ON b.class_id = c.id JOIN timeslots t1 ON b.start_time = t1.id JOIN timeslots t2 ON b.end_time = t2.id WHERE b.date = CURRENT_DATE() AND b.room_id = ?;",
      [roomId],
      async (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Something went wrong", error: err.message });
        }

        if (result.length === 0) {
          return res
            .status(200)
            .json({ message: "No bookings were found", bookings: result });
        }

        db.query("SELECT CURRENT_DATE() AS server_date", (err, dateResult) => {
          if (err) {
            return res.status(500).json({
              message: "Something went wrong",
              error: err.message,
            });
          }

          if (dateResult.length === 0) {
            return res
              .status(400)
              .json({ message: "The retrieval of current date has failed" });
          }

          res.status(200).json({
            message: "Bookings were succesfully fetched!",
            server_date: dateResult[0].server_date,
            bookings: result,
          });
        });
      }
    );
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
});

//bookNow
router.post("/newBooking", (req, res) => {
  try {
    const booking = req.body;

    if (
      Object.values(booking).includes("") ||
      Object.values(booking).includes(null) ||
      Object.values(booking).includes(undefined)
    ) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    db.query(
      "INSERT INTO bookings (room_id, professor_id, class_id, start_time, end_time, purpose, date) VALUES (?, ?, ? ,?, ?, ?, NOW())",
      [
        booking.roomId,
        booking.professorId,
        booking.classId,
        booking.startTime,
        booking.endTime,
        booking.purpose,
      ],
      async (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Something went wrong", error: err.message });
        }

        if (!result) {
          return res
            .status(500)
            .json({ message: "Error adding booking", error: result });
        }

        res.status(201).json({ message: "Booking has been added!", result });
      }
    );
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
});

module.exports = router;
