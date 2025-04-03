import React from "react";
// import Nav from "../../components/Nav";
import { Link } from "react-router-dom";
import Sidebar from "../../components/Sidebar";

const Dashboard = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="container px-4 pt-8 mx-auto">
        <p>This is dashboard</p>
        <Link to="/bookings">
          Click this to go to bookings {"("}This is supposed to be in the
          sidebar {")"}
        </Link>
      </main>
    </div>
  );
};

export default Dashboard;
