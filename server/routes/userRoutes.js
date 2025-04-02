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
      //⬆️ return the response if the if statement is true, meaning it will stop executing the code below
    }

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [user.email],
      async (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Something went wrong.", error: err.message });
        }

        if (result.length === 0) {
          return res.status(400).json({ message: "Invalid email or password" });
        }

        fetchedUser = result[0];

        const passwordMatch =
          user.email !== "admin"
            ? await bcrypt.compare(user.password, fetchedUser.password)
            : user.password === fetchedUser.password;

        if (passwordMatch) {
          res.status(200).json({
            message: "Login successfull.",
            fetchedUser: {
              id: fetchedUser.id,
              school_id: fetchedUser.school_id,
              user_type: fetchedUser.user_type,
            },
          });
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
    //Use this error handling in catch block ⬆️
  }
});

//register
router.post("/register", async (req, res) => {
  const user = req.body;
  try {
    if (
      Object.values(user).includes("") ||
      Object.values(user).includes(null) ||
      Object.values(user).includes(undefined)
    ) {
      return res.status(400).json({ message: "All fields are required!" });
      //⬆️ return the response if the if statement is true, meaning it will stop executing the code below
    }

    if (user.password !== user.confirmPassword) {
      return res
        .status(400)
        .json({ message: "Your confirmation password does not match" });
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        user.password
      )
    ) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
      });
    }

    db.query(
      "SELECT * FROM users WHERE email = ?",
      [user.email],
      async (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Something went wrong.", error: err.message });
        }
        if (result.length > 0) {
          return res.status(400).json({
            exists: true,
            message: "Email is already registered",
          });
        }

        db.query(
          "SELECT * FROM professors WHERE school_id = ?",
          [user.schoolId],
          async (err, result) => {
            if (err) {
              return res.status(500).json({
                message: "Something went wrong.",
                error: err.message,
              });
            }

            if (result.length === 0) {
              return res.status(400).json({
                message:
                  "Sorry, this school ID is not allowed for registration in our system",
              });
            }

            const school_id = result[0].id;
            db.query(
              "SELECT * FROM users WHERE school_id = ?",
              [school_id],
              async (err, result) => {
                if (err) {
                  return res.status(500).json({
                    message: "Something went wrong.",
                    error: err.message,
                  });
                }

                if (result.length > 0) {
                  return res.status(400).json({
                    message: "This school Id was already registered.",
                  });
                }

                const hashedPassword = await bcrypt.hash(user.password, 10);

                db.query(
                  "INSERT INTO users (email, school_id, password, user_type) VALUES(?,?,?,?)",
                  [user.email, school_id, hashedPassword, 1],
                  (err, result) => {
                    if (err) {
                      return res.status(500).json({
                        message: "Something went wrong.",
                        error: err.message,
                      });
                    }

                    res.status(201).json({
                      message: "Account was registered successfully.",
                      id: result.insertId,
                    });
                    console.log(
                      `${user.schoolId} account was registered successfully.`
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
    //Use this error handling in catch block ⬆️
  }
});

router.put("/", (req, res) => {});
router.delete("/", (req, res) => {});

module.exports = router;
