const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const http = require("http");
const WebSocket = require("ws");

const db = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const miscellaneousRoutes = require("./routes/miscellaneousRoutes");

const { insertDailyBookings } = require("./cron/dailyScheduleCron");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

app.use("/api", userRoutes);
app.use("/api", roomRoutes);
app.use("/api", bookingRoutes);
app.use("/api", scheduleRoutes);
app.use("/api", miscellaneousRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const wss = new WebSocket.Server({ server });
let sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  console.log("WebSocket client connected");

  socket.on("close", () => {
    sockets = sockets.filter((s) => s !== socket);
    console.log("Websocket client disconnected");
  });
});

app.set("sockets", sockets);
app.set("wss", wss);

insertDailyBookings().catch((err) => {
  console.error("❌ Failed to check/generate daily bookings on startup:", err);
});

server.listen(process.env.PORT, "0.0.0.0", () => {
  console.log(`Server is running at port: ${process.env.PORT}`);
});
