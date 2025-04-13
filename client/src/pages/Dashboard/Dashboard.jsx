import React from "react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <main className="container w-full h-full overflow-y-auto bg-white">
      <div className="p-4">
        <h1 className="text-xl">Dashboard Section</h1>
      </div>
      <hr />
      <div className="px-10 py-7">
        <div className="grid grid-cols-2 gap-8">
          <Link className="shadow-md p-28 bg-[#F5F5F5] flex items-center justify-center rounded-lg text-[27px] text-center">
            Today's Schedule Bookings
          </Link>
          <Link className="shadow-md p-28 bg-[#F5F5F5] flex items-center justify-center rounded-lg text-[27px]">
            Available Rooms
          </Link>
          <Link className="shadow-md p-28  bg-[#F5F5F5] flex items-center justify-center rounded-lg text-[27px]">
            Weekly Overview
          </Link>
          <Link className="shadow-md  p-28  bg-[#F5F5F5] flex items-center justify-center rounded-lg text-[27px] text-center">
            Quick Actions Shortcut
          </Link>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
