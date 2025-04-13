import React from "react";
import Logo from "../assets/logo/Logo.png";
import BlankProfile from "../assets/image/elipse.png";
import { RiSettings5Fill } from "react-icons/ri";
import { FaRegCalendarAlt } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const Sidebar = ({ isAdmin }) => {
  return (
    <aside className="w-[372px] min-h-screen p-4 shadow-lg flex flex-col justify-between">
      <div>
        {/* Logo and title */}
        <div className="flex items-center">
          <img src={Logo} alt="" className="w-24 h-24" />
          <h1 className="text-[22px]">Bicol University</h1>
        </div>

        <div className="p-6">
          {/* Date and time */}
          <div className="flex items-center gap-2 mb-2">
            <FaRegCalendarAlt className="text-xl" />
            <span className="text-lg">Monday, 21st March, 2025</span>
          </div>
          <hr className="mb-8" />

          <nav className="flex flex-col space-y-2 text-lg">
            {isAdmin ? (
              <>
                <NavLink
                  to="admin"
                  className={({ isActive }) =>
                    `p-2 transition-colors text-2xl ${
                      isActive ? "bg-[#B3E5FC]" : "text-black hover:bg-white/20"
                    }`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/history"
                  className={({ isActive }) =>
                    `p-2 transition-colors text-2xl ${
                      isActive ? "bg-[#B3E5FC]" : "text-black hover:bg-white/20"
                    }`
                  }
                >
                  History of Occupancy
                </NavLink>
                <NavLink
                  to="/rooms"
                  className={({ isActive }) =>
                    `p-2 transition-colors text-2xl ${
                      isActive ? "bg-[#B3E5FC]" : "text-black hover:bg-white/20"
                    }`
                  }
                >
                  Rooms
                </NavLink>
                <NavLink
                  to="/users"
                  className={({ isActive }) =>
                    `p-2 transition-colors text-2xl ${
                      isActive ? "bg-[#B3E5FC]" : "text-black hover:bg-white/20"
                    }`
                  }
                >
                  User
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `p-2 transition-colors text-2xl ${
                      isActive ? "bg-[#B3E5FC]" : "text-black hover:bg-white/20"
                    }`
                  }
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/bookings"
                  className={({ isActive }) =>
                    `p-2 transition-colors text-2xl ${
                      isActive ? "bg-[#B3E5FC]" : "text-black hover:bg-white/20"
                    }`
                  }
                >
                  Bookings
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </div>

      <div>
        <hr className="-mx-5 border-t-2 border-gray-300" />
        <div className="flex items-center justify-between p-5">
          <div className="flex items-center gap-4">
            <NavLink to={`${isAdmin ? "/AdminProfile" : "/UserProfile"}`}>
              <img src={BlankProfile} alt="" className="w-12 h-12" />
            </NavLink>
            <div>
              <NavLink to={`${isAdmin ? "/AdminProfile" : "/UserProfile"}`}>
                <h1 className="text-[22px]">James Bond</h1>
              </NavLink>
              <NavLink to={`${isAdmin ? "/AdminProfile" : "/UserProfile"}`}>
                <p className="text-sm">James@gmail.com</p>
              </NavLink>
            </div>
          </div>
          <NavLink to={`${isAdmin ? "/AdminProfile" : "/UserProfile"}`}>
            {({ isActive }) => (
              <RiSettings5Fill
                className={`text-[41px] transition-colors ${
                  isActive ? "text-[#B3E5FC]" : "text-[#757575]"
                }`}
              />
            )}
          </NavLink>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
