const express = require("express");
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config();

const router = express.Router();

const generateCode = () => Math.floor(100000 + Math.random() * 900000);

//nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASS,
  },
});

// multer
const storage = multer.diskStorage({
  destination: (req, file, cb) =>
    cb(null, path.join(__dirname, "../../uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png"];
  allowedTypes.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Invalid file type"), false);
};

const upload = multer({ storage, fileFilter });

//login
router.post("/login", async (req, res) => {
  const user = req.body;

  if (
    Object.values(user).includes("") ||
    Object.values(user).includes(null) ||
    Object.values(user).includes(undefined)
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  let query;

  if (user.email === "admin") {
    query = "SELECT * FROM users WHERE email = ?";
  } else {
    query = `SELECT u.id,
      u.school_id,
      p.school_id AS professor_school_id,
      u.email, p.professor_name AS name,
      u.password,
      u.profile_image,
      u.booking_color,
      u.user_type
      FROM users u
      JOIN professors p ON u.school_id = p.id
      WHERE u.email = ?`;
  }

  db.query(query, [user.email], async (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Something went wrong.", error: err.message });
    }

    if (result.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const fetchedUser = result[0];

    const passwordMatch =
      user.email !== "admin"
        ? await bcrypt.compare(user.password, fetchedUser.password)
        : user.password === fetchedUser.password;

    if (passwordMatch) {
      const { password, ...userWithoutPass } = fetchedUser;
      res.status(200).json({
        message: "Login successfull.",
        fetchedUser: userWithoutPass,
      });
    } else {
      res.status(400).json({ message: "Incorrect password." });
    }
  });
});

//register
router.post("/register", async (req, res) => {
  const user = req.body;
  if (
    Object.values(user).includes("") ||
    Object.values(user).includes(null) ||
    Object.values(user).includes(undefined)
  ) {
    return res.status(400).json({ message: "All fields are required!" });
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
                "INSERT INTO users (email, school_id, password, user_type, booking_color) VALUES(?,?,?,?,?)",
                [user.email, school_id, hashedPassword, 1, "#1e90ff"],
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
});

//Change password
router.post("/changePassword", (req, res) => {
  const changePasswordData = req.body;

  if (
    Object.values(changePasswordData).includes("") ||
    Object.values(changePasswordData).includes(null) ||
    Object.values(changePasswordData).includes(undefined)
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  db.query(
    "SELECT password FROM users WHERE id = ?",
    [changePasswordData.id],
    async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: "Can't access user password?" });
      }

      const fetchedPassword = result[0].password;

      const passwordMatch = await bcrypt.compare(
        changePasswordData.currentPassword,
        fetchedPassword
      );

      if (!passwordMatch) {
        return res
          .status(400)
          .json({ message: "The current password does not match" });
      } else {
        if (
          changePasswordData.newPassword !== changePasswordData.confirmPassword
        ) {
          return res
            .status(400)
            .json({ message: "Your confirmation password does not match" });
        }

        const isPasswordTheSame = await bcrypt.compare(
          changePasswordData.newPassword,
          fetchedPassword
        );

        if (isPasswordTheSame) {
          return res.status(400).json({
            message:
              "The new password is same as the current password, please change for a new one",
          });
        }

        if (
          !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            changePasswordData.newPassword
          )
        ) {
          return res.status(400).json({
            message:
              "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
          });
        }

        const hashedPassword = await bcrypt.hash(
          changePasswordData.newPassword,
          10
        );

        db.query(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashedPassword, changePasswordData.id],
          (err, result) => {
            if (err) {
              return res
                .status(500)
                .json({ message: "Something went wrong", error: err.message });
            }

            return res
              .status(200)
              .json({ message: "Password was updated successfully." });
          }
        );
      }
    }
  );
});

//Update profile information
router.put("/updateProfileInformation", (req, res) => {
  profileUpdateData = req.body;

  if (
    Object.values(profileUpdateData).includes("") ||
    Object.values(profileUpdateData).includes(null) ||
    Object.values(profileUpdateData).includes(undefined)
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  db.query(
    "SELECT email FROM users WHERE id = ?",
    [profileUpdateData.id],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: "User not found." });
      }

      const fetchedEmail = result[0].email;

      if (profileUpdateData.email === fetchedEmail) {
        return res.status(400).json({
          message: "The email is just the same as the existing",
        });
      }

      db.query(
        "UPDATE users SET email = ? WHERE id = ?",
        [profileUpdateData.email, profileUpdateData.id],
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Something went wrong", error: err.message });
          }

          return res
            .status(200)
            .json({ message: "Successfully updated profile information!" });
        }
      );
    }
  );
});

// Upload Profile
router.post("/uploadProfile", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const filePath = `/uploads/${req.file.filename}`;

  const userId = req.body.id;

  if (!userId) {
    return res.status(400).json({ message: "Missing User Id" });
  }

  const updateQuery = "UPDATE users SET profile_image = ? WHERE id = ?";

  db.query(updateQuery, [filePath, userId], (err, result) => {
    if (err) {
      console.error("Failed to update profile image:", err);
      return res
        .status(500)
        .json({ message: "Failed to update profile image" });
    }
    return res.status(200).json({
      message: "Upload successful and profile image updated",
      filePath,
    });
  });
});

//Check Email
router.post("/checkUser", (req, res) => {
  const email = req.body;
  const code = generateCode();

  if (
    Object.values(email).includes("") ||
    Object.values(email).includes(null) ||
    Object.values(email).includes(undefined)
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.email)) {
    return res.status(400).json({
      message: `The email address you entered is not in a valid format.`,
    });
  }

  if (email.email === "admin") {
    return res.status(400).json({ message: "Account is not yet registered" });
  }

  db.query(
    `SELECT * FROM users WHERE email = ?`,
    [email.email],
    (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (results.length === 0) {
        return res
          .status(400)
          .json({ message: "Account is not yet registered" });
      }

      const fetchedUser = results[0];

      db.query(
        `UPDATE users SET reset_code = ? WHERE email = ?`,
        [code, fetchedUser.email],
        (err, results) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Something went wrong", error: err.message });
          }

          const emailName = process.env.ADMIN_EMAIL.split("@")[0];

          const mailOptions = {
            from: `${emailName} <${process.env.ADMIN_EMAIL}>`,
            to: fetchedUser.email,
            subject: "Password Reset Code",
            text: `Your password reset code is: ${code}`,
            html: `
              <div style="font-family: Arial, sans-serif; font-size: 16px;">
                <p>Hello,</p>
                <p>Your password reset code is: <b>${code}</b></p>
                <p>If you did not request this, you can safely ignore this email.</p>
                <p>Thank you!</p>
              </div>
            `,
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.log(error);
              return res.status(500).json({
                message:
                  "Failed to send the email. Please contact the server administrator for assistance.",
                error: error,
              });
            }

            return res.json({
              message:
                "A verification code was sent to your email. Please check your inbox to verify.",
              info,
              fetchedUser,
            });
          });
        }
      );
    }
  );
});

//Verify if the user have code in db
router.get("/codeCheck/:email", (req, res) => {
  const email = req.params.email;

  if (
    Object.values({ email }).includes("") ||
    Object.values({ email }).includes(null) ||
    Object.values({ email }).includes(undefined)
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  db.query(
    "SELECT reset_code FROM users WHERE email = ?",
    [email],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: "Account was not found." });
      }

      const resetCode = result[0];

      if (resetCode.reset_code) {
        res.status(200).json({ message: "Code is present" });
      } else {
        res.status(400).json({ message: "Code is not present" });
      }
    }
  );
});

//Code Verification
router.post("/verifyCode", (req, res) => {
  const verificationCode = req.body;

  console.log(verificationCode);

  if (
    Object.values(verificationCode).includes("") ||
    Object.values(verificationCode).includes(null) ||
    Object.values(verificationCode).includes(undefined)
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  db.query(
    `SELECT * FROM users WHERE email = ?`,
    [verificationCode.email],
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: "Account was not found." });
      }

      const fetchedUser = result[0];
      console.log(fetchedUser);

      if (
        fetchedUser.reset_code === parseInt(verificationCode.verificationCode)
      ) {
        db.query(
          "UPDATE users SET reset_code = null WHERE email = ?",
          [verificationCode.email],
          (err, result) => {
            if (err) {
              return res.status(500).json({
                message: "Something went wrong",
                error: err.message,
              });
            }

            return res.status(200).json({
              message: "Code verified, you can now reset your password!",
              fetchedUser,
            });
          }
        );
      } else {
        res.status(400).json({
          message: "The code you entered is invalid. Please try again.",
        });
      }
    }
  );
});

//Reset password
router.put("/resetPassword", async (req, res) => {
  const newPasswordData = req.body;

  if (
    Object.values(newPasswordData).includes("") ||
    Object.values(newPasswordData).includes(null) ||
    Object.values(newPasswordData).includes(undefined)
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  if (newPasswordData.newPassword !== newPasswordData.confirmPassword) {
    return res
      .status(400)
      .json({ message: "Your confirmation password does not match" });
  }

  if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
      newPasswordData.newPassword
    )
  ) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.",
    });
  }

  const hashedPassword = await bcrypt.hash(newPasswordData.newPassword, 10);

  db.query(
    "SELECT password FROM users WHERE email = ?",
    [newPasswordData.email],
    async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Something went wrong", error: err.message });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: "Account was not found" });
      }

      const fetchedPassword = result[0].password;

      const isPasswordTheSame = await bcrypt.compare(
        newPasswordData.newPassword,
        fetchedPassword
      );

      if (isPasswordTheSame) {
        return res.status(400).json({
          message: "The new password must be different from the old password.",
        });
      }

      db.query(
        "UPDATE users SET password = ? WHERE email = ?",
        [hashedPassword, newPasswordData.email],
        (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Something went wrong", error: err.message });
          }

          return res.status(200).json({
            message:
              "Your password has been changed successfully. You can now log in.",
          });
        }
      );
    }
  );
});

//Delete image in profile
router.put("/deleteImageProfile", (req, res) => {
  const { userId, userProfileImage } = req.body;

  if (!userId) {
    return res
      .status(400)
      .json({ message: "No user ID was received. Something went wrong." });
  }

  if (!userProfileImage) {
    return res.status(400).json({
      message:
        "There is no image available to delete. Please upload a profile picture first.",
    });
  }

  db.query(
    "UPDATE users SET profile_image = null WHERE id = ?",
    [userId],
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
            "Error deleting image! The image you were trying to delete was unfortunately not found.",
          result: result,
        });
      }

      return res
        .status(200)
        .json({ message: "Deleted image successfully.", success: true });
    }
  );
});

//Update booking color
router.put("/updateBookingColor", (req, res) => {
  const { userId, selectedColor } = req.body;

  db.query(
    "UPDATE users SET booking_color = ? WHERE id = ?",
    [selectedColor, userId],
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
            "Error changing booking color! The user you were trying to update was unfortunately not found.",
          result: result,
        });
      }

      return res
        .status(200)
        .json({ message: "Booking color updated successfully." });
    }
  );
});

module.exports = router;
