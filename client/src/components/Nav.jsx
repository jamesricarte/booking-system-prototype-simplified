import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Nav = () => {
  const { logout } = useAuth();
  return (
    <nav className="flex items-center justify-between">
      <div className="ml-10">
        <Link to="/dashboard" className="text-black no-underline">
          <h2>Booking Classroom</h2>
        </Link>
      </div>
      <div className="flex gap-6 mr-10">
        <p className="cursor-pointer">Account</p>
        <Link onClick={logout}>
          <p className="cursor-pointer">Logout</p>
        </Link>
      </div>
    </nav>
  );
};

export default Nav;
