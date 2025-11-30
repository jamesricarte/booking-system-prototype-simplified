const express = require("express");
const db = require("../config/db");

const router = express.Router();

//Fetch server date
router.get("/serverDate", (req, res) => {
  db.query("SELECT CURRENT_DATE() AS server_date", (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Something went wrong", error: err.message });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "No current date has found" });
    }

    res.status(200).json({
      message: "Successfully fetched server date!",
      serverDate: result[0].server_date,
    });
  });
});

//Fetch subjects
router.get("/subjects", (req, res) => {
  db.query("SELECT * FROM subjects", async (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Something went wrong", error: err.message });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "No classes were found" });
    }

    res
      .status(200)
      .json({ message: "Successfully fetched subjects", subjects: result });
  });
});

//Fetch Classes
router.get("/classes", (req, res) => {
  db.query("SELECT * FROM classes", async (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Something went wrong", error: err.message });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "No classes were found" });
    }

    res
      .status(200)
      .json({ message: "Successfully fetched classes", classes: result });
  });
});

//Fetch timeslots
router.get("/timeslots", (req, res) => {
  db.query("SELECT * FROM timeslots", async (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Something went wrong", error: err.message });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "No timeslots were found" });
    }

    res
      .status(200)
      .json({ message: "Successfully fetched timeslots", timeslots: result });
  });
});

//Fetch enum booking purposes
router.get("/bookingPurposes", (req, res) => {
  db.query(
    "SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?",
    ["bookings", "purpose"],
    async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (!result) {
        return res.status(500).json({
          message: "Error fetching booking purposes",
          error: result,
        });
      }

      if (result.length === 0) {
        return res
          .status(400)
          .json({ message: "No booking purposes were found" });
      }

      const enumStr = result[0].COLUMN_TYPE;
      const purposes = enumStr
        .match(/'([^']+)'/g)
        .map((val) => val.replace(/'/g, ""));

      res.status(200).json({
        message: "Successfully fetched booking purposes",
        bookingPurposes: purposes,
      });
    }
  );
});

//Fetch professor
router.get("/professor/:schoolId", (req, res) => {
  const schoolId = req.params.schoolId;

  db.query(
    "SELECT * FROM professors WHERE id = ?",
    [schoolId],
    async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (result.length === 0) {
        return res.status(400).json({
          message:
            "The provided school ID is not valid for booking. Booking is not allowed.",
        });
      }

      return res.status(200).json({
        message: "Successfully fetched professor details",
        professor: { id: result[0].id },
      });
    }
  );
});

//Fetch occupancy history
router.get("/occupancyHistory", (req, res) => {
  db.query(
    `SELECT b.id AS booking_id,
      r.room_number,
      p.professor_name,
      c.class_name,
      b.start_time AS start_time_id,
      t1.time AS start_time,
      b.end_time AS end_time_id,
      t2.time AS end_time,
      b.purpose,
      b.date,
      b.created_at 
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN professors p ON b.professor_id = p.id
      JOIN classes c ON b.class_id = c.id
      JOIN timeslots t1 ON b.start_time = t1.id
      JOIN timeslots t2 ON b.end_time = t2.id
      WHERE b.booking_type = 'past'
      ORDER BY b.date DESC, b.end_time DESC;`,
    async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err });
      }

      if (result.length === 0) {
        return res
          .status(400)
          .json({ message: "The occupancy history is empty" });
      }

      res.status(200).json({
        message: "Successfully fetched occupancy history data!",
        occupancyHistory: result,
      });
    }
  );
});

module.exports = router;
