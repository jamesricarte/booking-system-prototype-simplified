import React from "react";
import Sidebar from "../../components/Sidebar";
import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 bg-gradient-to-r from-[#0085CA] to-[#FD8112] p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
