const express = require("express");
const db = require("../config/db");

const router = express.Router();

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

module.exports = router;
