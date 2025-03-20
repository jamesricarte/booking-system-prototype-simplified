const express = require("express");
const db = require("../config/db");
const bcrypt = require("bcrypt");
const router = express.Router();

router.get("/", (req, res) => {});

//login
router.post("/login", async (req, res) => {
  const user = req.body;

  try {
    if (
      Object.values(user).includes("") ||
      Object.values(user).includes(null) ||
      Object.values(user).includes(undefined)
    ) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    db.query(
      "SELECT * FROM users WHERE schoolId = ? OR email = ?",
      [user.schoolId, user.email],
      async (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Something went wrong.", error: err.message });
        }

        if (result.length === 0) {
          return res
            .status(400)
            .json({ message: "Invalid school ID or password" });
        }

        const fetchedUser = result[0];

        if (user.password === fetchedUser.password) {
          res.status(200).json({ message: "Login successfull.", fetchedUser });
        } else {
          res.status(400).json({ message: "Incorrect password." });
        }
      }
    );
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
});

router.put("/", (req, res) => {});
router.delete("/", (req, res) => {});

module.exports = router;
