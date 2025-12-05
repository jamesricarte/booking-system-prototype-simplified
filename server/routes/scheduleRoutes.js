const express = require("express");
const db = require("../config/db");
const router = express.Router();

// Add class schedule
router.post("/addClassSchedule", (req, res) => {
  let {
    professorId,
    roomId,
    classId,
    subjectId,
    dayOfWeek,
    startTimeId,
    endTimeId,
    purpose,
  } = req.body;

  if (!subjectId) subjectId = null;

  if (
    !professorId ||
    !roomId ||
    !classId ||
    !dayOfWeek ||
    !startTimeId ||
    !endTimeId
  ) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  // Validate that end time is after start time
  if (parseInt(endTimeId) <= parseInt(startTimeId)) {
    return res
      .status(400)
      .json({ message: "End time must be after start time!" });
  }

  // Check for professor schedule conflicts
  const professorConflictQuery = `
    SELECT id FROM class_schedules 
    WHERE professor_id = ? 
    AND day_of_week = ? 
    AND (
      (start_time_id < ? AND end_time_id > ?) OR
      (start_time_id < ? AND end_time_id > ?) OR
      (start_time_id >= ? AND end_time_id <= ?)
    )
  `;

  db.query(
    professorConflictQuery,
    [
      professorId,
      dayOfWeek,
      endTimeId,
      startTimeId,
      endTimeId,
      startTimeId,
      startTimeId,
      endTimeId,
    ],
    (err, professorConflicts) => {
      if (err) {
        return res.status(500).json({
          message: "Database error checking professor schedule",
          error: err.message,
        });
      }

      if (professorConflicts.length > 0) {
        return res.status(409).json({
          message:
            "Professor has a conflict: already teaching another class at this time on this day",
        });
      }

      // Check for room availability conflicts
      const roomConflictQuery = `
        SELECT id FROM class_schedules 
        WHERE room_id = ? 
        AND day_of_week = ? 
        AND (
          (start_time_id < ? AND end_time_id > ?) OR
          (start_time_id < ? AND end_time_id > ?) OR
          (start_time_id >= ? AND end_time_id <= ?)
        )
      `;

      db.query(
        roomConflictQuery,
        [
          roomId,
          dayOfWeek,
          endTimeId,
          startTimeId,
          endTimeId,
          startTimeId,
          startTimeId,
          endTimeId,
        ],
        (err, roomConflicts) => {
          if (err) {
            return res.status(500).json({
              message: "Database error checking room availability",
              error: err.message,
            });
          }

          if (roomConflicts.length > 0) {
            return res.status(409).json({
              message:
                "Room is not available: already booked for this time on this day",
            });
          }

          // Insert the new schedule if no conflicts found
          const insertQuery = `
            INSERT INTO class_schedules (professor_id, room_id, class_id, subject_id, day_of_week, start_time_id, end_time_id, purpose)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.query(
            insertQuery,
            [
              professorId,
              roomId,
              classId,
              subjectId,
              dayOfWeek,
              startTimeId,
              endTimeId,
              purpose,
            ],
            (err, result) => {
              if (err) {
                console.error("Failed to add schedule:", err);
                return res.status(500).json({
                  message: "Failed to add schedule",
                  error: err.message,
                });
              }

              return res.status(201).json({
                message: "Class schedule added successfully",
                scheduleId: result.insertId,
              });
            }
          );
        }
      );
    }
  );
});

// Update a class schedule
router.put("/updateClassSchedule", (req, res) => {
  const { scheduleId, startTimeId, endTimeId, classId, subjectId, purpose } =
    req.body;

  if (!scheduleId || !startTimeId || !endTimeId || !classId) {
    return res.status(400).json({
      message: "Schedule ID, Start Time, End Time, and Class ID are required!",
    });
  }

  if (parseInt(endTimeId) <= parseInt(startTimeId)) {
    return res.status(400).json({
      message: "End time must be after start time!",
    });
  }

  // First, get the current schedule to retrieve professor_id, room_id, and day_of_week
  const getScheduleQuery = `SELECT professor_id, room_id, day_of_week FROM class_schedules WHERE id = ?`;

  db.query(getScheduleQuery, [scheduleId], (err, scheduleResult) => {
    if (err) {
      return res.status(500).json({
        message: "Database error retrieving schedule",
        error: err.message,
      });
    }

    if (scheduleResult.length === 0) {
      return res.status(404).json({
        message: "Schedule not found!",
      });
    }

    const { professor_id, room_id, day_of_week } = scheduleResult[0];

    // Check for professor schedule conflicts (excluding current schedule)
    const professorConflictQuery = `
      SELECT id FROM class_schedules 
      WHERE professor_id = ? 
      AND day_of_week = ? 
      AND id != ?
      AND (
        (start_time_id < ? AND end_time_id > ?) OR
        (start_time_id < ? AND end_time_id > ?) OR
        (start_time_id >= ? AND end_time_id <= ?)
      )
    `;

    db.query(
      professorConflictQuery,
      [
        professor_id,
        day_of_week,
        scheduleId,
        endTimeId,
        startTimeId,
        endTimeId,
        startTimeId,
        startTimeId,
        endTimeId,
      ],
      (err, professorConflicts) => {
        if (err) {
          return res.status(500).json({
            message: "Database error checking professor schedule",
            error: err.message,
          });
        }

        if (professorConflicts.length > 0) {
          return res.status(409).json({
            message:
              "Professor has a conflict: already teaching another class at this time on this day",
          });
        }

        // Check for room availability conflicts (excluding current schedule)
        const roomConflictQuery = `
          SELECT id FROM class_schedules 
          WHERE room_id = ? 
          AND day_of_week = ? 
          AND id != ?
          AND (
            (start_time_id < ? AND end_time_id > ?) OR
            (start_time_id < ? AND end_time_id > ?) OR
            (start_time_id >= ? AND end_time_id <= ?)
          )
        `;

        db.query(
          roomConflictQuery,
          [
            room_id,
            day_of_week,
            scheduleId,
            endTimeId,
            startTimeId,
            endTimeId,
            startTimeId,
            startTimeId,
            endTimeId,
          ],
          (err, roomConflicts) => {
            if (err) {
              return res.status(500).json({
                message: "Database error checking room availability",
                error: err.message,
              });
            }

            if (roomConflicts.length > 0) {
              return res.status(409).json({
                message:
                  "Room is not available: already booked for this time on this day",
              });
            }

            // Update the schedule if no conflicts found
            const updateQuery = `
              UPDATE class_schedules 
              SET start_time_id = ?, end_time_id = ?, class_id = ?, subject_id = ?, purpose = ?, updated_at = CURRENT_TIMESTAMP
              WHERE id = ?
            `;

            db.query(
              updateQuery,
              [
                startTimeId,
                endTimeId,
                classId,
                subjectId || null,
                purpose,
                scheduleId,
              ],
              (err, result) => {
                if (err) {
                  console.error("Failed to update schedule:", err);
                  return res.status(500).json({
                    message: "Failed to update schedule",
                    error: err.message,
                  });
                }

                return res.status(200).json({
                  message: "Class schedule updated successfully",
                  scheduleId: scheduleId,
                });
              }
            );
          }
        );
      }
    );
  });
});

// Delete a class schedule
router.delete("/deleteClassSchedule/:scheduleId", (req, res) => {
  const { scheduleId } = req.params;

  // Validate that scheduleId is provided and is a valid number
  if (!scheduleId || isNaN(parseInt(scheduleId))) {
    return res.status(400).json({
      message: "Valid Schedule ID is required!",
    });
  }

  // Check if schedule exists before deleting
  const checkScheduleQuery = `SELECT id FROM class_schedules WHERE id = ?`;

  db.query(checkScheduleQuery, [scheduleId], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Database error checking schedule",
        error: err.message,
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        message: "Schedule not found!",
      });
    }

    // Delete the schedule
    const deleteQuery = `DELETE FROM class_schedules WHERE id = ?`;

    db.query(deleteQuery, [scheduleId], (err, result) => {
      if (err) {
        console.error("Failed to delete schedule:", err);
        return res.status(500).json({
          message: "Failed to delete schedule",
          error: err.message,
        });
      }

      return res.status(200).json({
        message: "Class schedule deleted successfully",
        scheduleId: scheduleId,
      });
    });
  });
});

router.get("/myClassSchedules", (req, res) => {
  const { professorId } = req.query;

  // Validate that professorId is provided
  if (!professorId) {
    return res.status(400).json({ message: "Professor ID is required!" });
  }

  // Query to fetch all class schedules for a specific professor
  // Joins with related tables to get complete schedule information
  const query = `
    SELECT 
      cs.id,
      cs.professor_id,
      cs.room_id,
      cs.class_id,
      cs.subject_id,
      cs.day_of_week,
      cs.start_time_id,
      cs.end_time_id,
      cs.purpose,
      cs.created_at,
      cs.updated_at,
      r.room_number,
      r.capacity,
      c.class_name,
      s.course_code,
      s.course_name,
      ts_start.time as start_time,
      ts_end.time as end_time,
      p.professor_name
    FROM class_schedules cs
    LEFT JOIN rooms r ON cs.room_id = r.id
    LEFT JOIN classes c ON cs.class_id = c.id
    LEFT JOIN subjects s ON cs.subject_id = s.id
    LEFT JOIN timeslots ts_start ON cs.start_time_id = ts_start.id
    LEFT JOIN timeslots ts_end ON cs.end_time_id = ts_end.id
    LEFT JOIN professors p ON cs.professor_id = p.id
    WHERE cs.professor_id = ?
    ORDER BY 
      FIELD(cs.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
      cs.start_time_id ASC
  `;

  db.query(query, [professorId], (err, schedules) => {
    if (err) {
      console.error("Error fetching class schedules:", err);
      return res.status(500).json({
        message: "Failed to fetch class schedules",
        error: err.message,
      });
    }

    // Return the schedules in the format expected by the frontend
    return res.status(200).json({
      message: "Class schedules fetched successfully",
      schedules: schedules || [],
    });
  });
});

router.get("/schedulesByRoomAndDay", (req, res) => {
  const { roomId, dayOfWeek } = req.query;

  if (!roomId || !dayOfWeek) {
    return res.status(400).json({
      message: "Room ID and Day of Week are required!",
    });
  }

  if (isNaN(parseInt(roomId))) {
    return res.status(400).json({
      message: "Room ID must be a valid number!",
    });
  }

  const validDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];
  if (!validDays.includes(dayOfWeek)) {
    return res.status(400).json({
      message: "Invalid day of week! Must be one of: " + validDays.join(", "),
    });
  }

  const query = `
    SELECT 
      cs.id,
      cs.professor_id,
      cs.room_id,
      cs.class_id,
      cs.subject_id,
      cs.day_of_week,
      cs.start_time_id,
      cs.end_time_id,
      cs.purpose,
      cs.created_at,
      r.room_number,
      r.capacity,
      c.class_name,
      s.course_code,
      s.course_name,
      ts_start.time as start_time,
      ts_end.time as end_time,
      p.professor_name,
      u.booking_color
    FROM class_schedules cs
    LEFT JOIN rooms r ON cs.room_id = r.id
    LEFT JOIN classes c ON cs.class_id = c.id
    LEFT JOIN subjects s ON cs.subject_id = s.id
    LEFT JOIN timeslots ts_start ON cs.start_time_id = ts_start.id
    LEFT JOIN timeslots ts_end ON cs.end_time_id = ts_end.id
    LEFT JOIN professors p ON cs.professor_id = p.id
    LEFT JOIN users u ON p.id = u.school_id
    WHERE cs.room_id = ? 
    AND cs.day_of_week = ?
    ORDER BY cs.start_time_id ASC
  `;

  db.query(query, [parseInt(roomId), dayOfWeek], (err, schedules) => {
    if (err) {
      console.error("Error fetching schedules by room and day:", err);
      return res.status(500).json({
        message: "Failed to fetch schedules",
        error: err.message,
      });
    }

    return res.status(200).json({
      message: "Schedules fetched successfully",
      schedules: schedules || [],
    });
  });
});

// GET endpoint to fetch all schedules of a professor
router.get("/userSchedules", (req, res) => {
  const { professorId } = req.query;

  if (!professorId) {
    return res.status(400).json({
      message: "Professor ID is required!",
    });
  }

  if (isNaN(parseInt(professorId))) {
    return res.status(400).json({
      message: "Professor ID must be a valid number!",
    });
  }

  const query = `
    SELECT 
      cs.id,
      cs.professor_id,
      cs.room_id,
      cs.class_id,
      cs.subject_id,
      cs.day_of_week,
      cs.start_time_id,
      cs.end_time_id,
      cs.purpose,
      cs.created_at,
      r.room_number,
      r.capacity,
      c.class_name,
      s.course_code,
      s.course_name,
      ts_start.time as start_time,
      ts_end.time as end_time,
      p.professor_name,
      u.booking_color
    FROM class_schedules cs
    LEFT JOIN rooms r ON cs.room_id = r.id
    LEFT JOIN classes c ON cs.class_id = c.id
    LEFT JOIN subjects s ON cs.subject_id = s.id
    LEFT JOIN timeslots ts_start ON cs.start_time_id = ts_start.id
    LEFT JOIN timeslots ts_end ON cs.end_time_id = ts_end.id
    LEFT JOIN professors p ON cs.professor_id = p.id
    LEFT JOIN users u ON p.id = u.school_id
    WHERE cs.professor_id = ?
    ORDER BY 
      FIELD(cs.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
      cs.start_time_id ASC
  `;

  db.query(query, [parseInt(professorId)], (err, schedules) => {
    if (err) {
      console.error("Error fetching user schedules:", err);
      return res.status(500).json({
        message: "Failed to fetch user schedules",
        error: err.message,
      });
    }

    return res.status(200).json({
      message: "User schedules fetched successfully",
      schedules: schedules || [],
    });
  });
});

module.exports = router;
