import React from "react";
import Nav from "../../components/Nav";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <>
      <Nav />
      <main className="flex flex-col items-center mt-36">
        <p>This is dashboard</p>
        <Link to="/bookings">
          Click this to go to bookings {"("}This is supposed to be in the
          sidebar {")"}
        </Link>
      </main>
    </>
  );
};

export default Dashboard;
