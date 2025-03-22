const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const miscellaneousRoutes = require("./routes/miscellaneousRoutes");

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));
app.use("/api", userRoutes);
app.use("/api", roomRoutes);
app.use("/api", bookingRoutes);
app.use("/api", miscellaneousRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port: ${process.env.PORT}`);
});
