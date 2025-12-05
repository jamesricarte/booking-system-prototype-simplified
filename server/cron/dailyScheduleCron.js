const cron = require("node-cron")
const db = require("../config/db")

function insertDailyBookings() {
  return new Promise(async (resolve, reject) => {
    try {
      db.query("SELECT * FROM cron_log WHERE date = CURDATE() AND executed = 1", async (err, existing) => {
        if (err) {
          console.error("[v0] Error checking cron_log:", err)
          return reject(err)
        }

        if (existing.length > 0) {
          console.log("✔ Daily schedule already executed today.")
          return resolve()
        }

        try {
          console.log("⏳ Generating today's schedule from templates...")

          const dayOfWeek = getDayOfWeekName(new Date())

          // Insert bookings from class_schedules matching today's day_of_week
          const insertSql = `
              INSERT INTO bookings (room_id, professor_id, class_id, subject_id, start_time, end_time, purpose, booking_type, date)
              SELECT 
                cs.room_id, 
                cs.professor_id, 
                cs.class_id, 
                cs.subject_id,
                cs.start_time_id, 
                cs.end_time_id,
                cs.purpose,
                'reservation' AS booking_type,
                CURDATE() AS date
              FROM class_schedules cs
              WHERE cs.day_of_week = ?
            `

          db.query(insertSql, [dayOfWeek], async (insertErr, results) => {
            if (insertErr) {
              console.error("[v0] Error inserting daily bookings:", insertErr)
              return reject(insertErr)
            }

            console.log(`✔ ${results.affectedRows} bookings created for today.`)

            db.query("INSERT INTO cron_log (date, executed) VALUES (CURDATE(), 1)", (logErr) => {
              if (logErr) {
                console.error("[v0] Error logging cron execution:", logErr)
                return reject(logErr)
              }

              console.log("✔ Cron execution logged successfully.")
              resolve()
            })
          })
        } catch (innerErr) {
          console.error("[v0] Error in daily booking logic:", innerErr)
          reject(innerErr)
        }
      })
    } catch (err) {
      console.error("[v0] Error in insertDailyBookings:", err)
      reject(err)
    }
  })
}

function getDayOfWeekName(date) {
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  return daysOfWeek[date.getDay()]
}

cron.schedule("0 7 * * *", () => {
  console.log("🔔 Running daily schedule cron at 7:00 AM...")
  insertDailyBookings().catch((err) => {
    console.error("❌ Cron job failed:", err)
  })
})

module.exports = { insertDailyBookings }
