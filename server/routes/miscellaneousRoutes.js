const express = require('express');
const db = require('../config/db');

const router = express.Router();

//Fetch server date
router.get('/serverDate', (req, res) => {
  try {
    db.query('SELECT CURRENT_DATE() AS server_date', (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: 'Something went wrong', error: err.message });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: 'No current date has found' });
      }

      res.status(200).json({
        message: 'Successfully fetched server date!',
        serverDate: result[0].server_date,
      });
    });
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: 'Internal Server Error', error: error.message });
    }
  }
});

//Fetch Classes
router.get('/classes', (req, res) => {
  try {
    db.query('SELECT * FROM classes', async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: 'Something went wrong', error: err.message });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: 'No classes were found' });
      }

      res
        .status(200)
        .json({ message: 'Successfully fetched classes', classes: result });
    });
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: 'Internal Server Error', error: error.message });
    }
  }
});

//Fetch timeslots
router.get('/timeslots', (req, res) => {
  try {
    db.query('SELECT * FROM timeslots', async (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: 'Something went wrong', error: err.message });
      }

      if (result.length === 0) {
        return res.status(400).json({ message: 'No timeslots were found' });
      }

      res
        .status(200)
        .json({ message: 'Successfully fetched timeslots', timeslots: result });
    });
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: 'Internal Server Error', error: error.message });
    }
  }
});

//Fetch enum booking purposes
router.get('/bookingPurposes', (req, res) => {
  try {
    db.query(
      'SELECT COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ? AND COLUMN_NAME = ?',
      ['bookings', 'purpose'],
      async (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: 'Something went wrong', error: err.message });
        }

        if (!result) {
          return res.status(500).json({
            message: 'Error fetching booking purposes',
            error: result,
          });
        }

        if (result.length === 0) {
          return res
            .status(400)
            .json({ message: 'No booking purposes were found' });
        }

        const enumStr = result[0].COLUMN_TYPE;
        const purposes = enumStr
          .match(/'([^']+)'/g)
          .map((val) => val.replace(/'/g, ''));

        res.status(200).json({
          message: 'Successfully fetched booking purposes',
          bookingPurposes: purposes,
        });
      }
    );
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: 'Internal Server Error', error: error.message });
    }
  }
});

//Fetch professor
router.get('/professor/:schoolId', (req, res) => {
  try {
    const schoolId = req.params.schoolId;

    db.query(
      'SELECT * FROM professors WHERE id = ?',
      [schoolId],
      async (err, result) => {
        if (err) {
          return res
            .status(500)
            .json({ message: 'Something went wrong', error: err.message });
        }

        if (result.length === 0) {
          return res.status(400).json({
            message:
              'The provided school ID is not valid for booking. Booking is not allowed.',
          });
        }

        return res.status(200).json({
          message: 'Successfully fetched professor details',
          professor: { id: result[0].id },
        });
      }
    );
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: 'Internal Server Error', error: error.message });
    }
  }
});

router.get('/history-of-occupancy', async (req, res) => {
  try {
    const query = `
      SELECT 
        r.room_number AS roomNumber,
        c.class_name AS className,
        p.professor_name AS faculty,
        CONCAT( 
          TIME_FORMAT(ts_start.time, '%H:%i'), '-', TIME_FORMAT(ts_end.time, '%H:%i')
        ) AS time,
        b.date AS date,
        p.professor_name AS userAccount
      FROM bookings b
      JOIN rooms r ON b.room_id = r.id
      JOIN classes c ON b.class_id = c.id
      JOIN professors p ON b.professor_id = p.id
      JOIN timeslots ts_start ON b.start_time = ts_start.id
      JOIN timeslots ts_end ON b.end_time = ts_end.id
      ORDER BY b.date DESC;
    `;

    const [results] = await db.promise().query(query);
    res.json(results);
  } catch (error) {
    console.error('Error fetching history of occupancy:', error);
    res.status(500).json({ error: 'Failed to fetch history of occupancy' });
  }
});

module.exports = router;
