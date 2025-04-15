const express = require("express");
const db = require("../config/db");

const router = express.Router();

//Fetch server date
router.get("/serverDate", (req, res) => {
  try {
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
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
});

//Fetch Classes
router.get("/classes", (req, res) => {
  try {
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
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
});

//Fetch timeslots
router.get("/timeslots", (req, res) => {
  try {
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
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
});

//Fetch enum booking purposes
router.get("/bookingPurposes", (req, res) => {
  try {
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
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
});

//Fetch professor
router.get("/professor/:schoolId", (req, res) => {
  try {
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
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
});

//Fetch User
router.get("/user/:schoolId", (req, res) => {
  const schoolId = req.params.schoolId;

  db.query(
    "SELECT * FROM users WHERE school_id = ?",
    [schoolId],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error fetching user", error: err.message });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userData } = result[0]; // exclude password
      return res.status(200).json({ user: userData });
    }
  );
});

// Fetch Admin
router.get("/admin", (req, res) => {
  db.query(
    "SELECT id, username, email, school_id FROM users WHERE user_type = 0 LIMIT 1",
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "Error fetching admin",
          error: err.message,
        });
      }

      if (result.length === 0) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const { password, ...admin } = result[0];
      return res.status(200).json({ admin });
    }
  );
});

//Fetch occupancy history
router.get("/occupancyHistory", (req, res) => {
  try {
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
      ORDER BY b.date DESC;`,
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
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
});

module.exports = router;
