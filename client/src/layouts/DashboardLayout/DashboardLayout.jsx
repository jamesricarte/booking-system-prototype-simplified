import React from "react";
import Sidebar from "../../components/Sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex w-screen h-screen">
      <Sidebar />
      <div className="flex-1 bg-[linear-gradient(to_right,_#0085ca,_#fdb112)] p-10">
        <div className="w-full h-full rounded-lg g-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
