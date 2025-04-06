import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <main className="container w-full h-full bg-white">
      <div className="p-4">
        <h1>Dashboard Section</h1>
      </div>
      <hr />
      <div className="pt-7 px-14">
        <div className="grid grid-cols-2 gap-8 place ">
          <Link className="shadow-md p-44 bg-[#F5F5F5] flex items-center justify-center rounded-md ">
            Today's Schedule Bookings
          </Link>
          <Link className="shadow-md p-44 bg-[#F5F5F5] flex items-center justify-center rounded-md">
            Available Rooms
          </Link>
          <Link className="shadow-md p-44 bg-[#F5F5F5] flex items-center justify-center rounded-md">
            Weekly Overview
          </Link>
          <Link className="shadow-md p-44 bg-[#F5F5F5] flex items-center justify-center rounded-md">
            Quick Actions Shortcut
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
