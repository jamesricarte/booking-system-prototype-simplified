import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <main className="container w-full h-full px-4 mx-auto bg-white">
      <Link>Today's Schedule Bookings</Link>
      <Link>Available Rooms</Link>
      <Link>Weekly Overview</Link>
      <Link>Quick Actions Shortcut</Link>
    </main>
  );
};

export default Dashboard;
