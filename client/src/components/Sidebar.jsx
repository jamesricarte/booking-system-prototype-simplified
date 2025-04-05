import React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo/Logo.png";
import BlankProfile from "../assets/image/elipse.png";
import { RiSettings5Fill } from "react-icons/ri";
import { NavLink } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-[465px] min-h-screen p-5 shadow-lg flex flex-col justify-between">
      <div>
        {/* Logo and title */}
        <div className="flex items-center">
          <img src={Logo} alt="" />
          <h1 className="text-3xl">Bicol University</h1>
        </div>

        <div className="p-6">
          {/* Date and time */}
          <h1 className="mb-2 text-2xl">Monday, 21st March, 2025</h1>
          <hr className="mb-8" />

          <nav className="flex flex-col space-y-2 text-2xl">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `p-2 transition-colors ${
                  isActive ? "bg-[#B3E5FC]" : "text-black hover:bg-white/20"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/bookings"
              className={({ isActive }) =>
                `p-2 transition-colors ${
                  isActive ? "bg-[#B3E5FC]" : "text-black hover:bg-white/20"
                }`
              }
            >
              Bookings
            </NavLink>
          </nav>
        </div>
      </div>

      <div>
        <hr className="-mx-5 border-t-2 border-gray-300" />
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <img src={BlankProfile} alt="" />
            <div>
              <h1 className="text-2xl">James Bond</h1>
              <p className="text-lg">James@gmail.com</p>
            </div>
          </div>
          <RiSettings5Fill className="text-4xl text-[#757575]" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
