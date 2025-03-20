const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/rooms", async (req, res) => {
  try {
    db.query("SELECT * FROM rooms", async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: "No rooms were found" });
      }

      res
        .status(200)
        .json({ message: "Successfully fetched rooms", rooms: result });
    });
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
});

router.get("/room/:id", (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "Id is invalid" });
    db.query("SELECT * FROM rooms WHERE id = ?", [id], async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: "No room was found." });
      }

      res
        .status(200)
        .json({ message: "Room was successfully fetched", room: result[0] });
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
