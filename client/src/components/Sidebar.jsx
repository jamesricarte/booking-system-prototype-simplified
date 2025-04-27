import React, { use, useEffect, useState } from "react";
import Logo from "../assets/logo/Logo.png";
import BlankProfile from "../assets/image/elipse.png";
import { RiSettings5Fill } from "react-icons/ri";
import { FaRegCalendarAlt } from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatUTCDateWithOrdinal, getDayName } from "../utils/timeUtils";
import SettingsModal from "./SettingsModal";

const API_URL = import.meta.env.VITE_API_URL;

const Sidebar = ({ isAdmin }) => {
  const { user } = useAuth();

  const location = useLocation();
  const isBookingActive =
    location.pathname === "/bookings" || location.pathname.startsWith("/room/");

  const [serverDate, setServerDate] = useState({
    day: "",
    date: "",
  });

  const fetchServerDate = async () => {
    try {
      const response = await fetch(`${API_URL}/api/serverDate`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      setServerDate({
        date: formatUTCDateWithOrdinal(result.serverDate),
        day: getDayName(result.serverDate),
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    fetchServerDate();
  }, []);

  // Modal Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleClick = (e) => {
    e.preventDefault(); // Stop NavLink from navigating
    setIsSettingsOpen(true);
  };

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
            <span className="text-lg">
              {serverDate.day}, {serverDate.date}
            </span>
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
                    `p-2 transition-colors text-2xl rounded-sm ${
                      isActive ? "bg-[#B3E5FC]" : "text-black hover:bg-white/20"
                    }`
                  }
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/bookings"
                  className={`p-2 transition-colors text-2xl rounded-sm ${
                    isBookingActive
                      ? "bg-[#B3E5FC]"
                      : "text-black hover:bg-white/20"
                  }`}
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
              <img
                src={
                  user?.profile_image
                    ? `${API_URL}${user.profile_image}`
                    : BlankProfile
                }
                alt="User profile"
                className="object-cover w-12 h-12 border border-gray-300 rounded-full min-w-12 min-h-12"
              />
            </NavLink>
            <div>
              <NavLink to={`${isAdmin ? "/AdminProfile" : "/UserProfile"}`}>
                <h1 className="text-[20px]">
                  {isAdmin ? user.username : user.name}
                </h1>
              </NavLink>
              <NavLink to={`${isAdmin ? "/AdminProfile" : "/UserProfile"}`}>
                <p className="text-sm">{user.email}</p>
              </NavLink>
            </div>
          </div>
          <button onClick={handleClick}>
            <RiSettings5Fill
              className={`text-[41px] transition-colors cursor-pointer ${
                isSettingsOpen ? "text-[#B3E5FC]" : "text-[#757575]"
              }`}
            />
          </button>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        closeModal={() => setIsSettingsOpen(false)}
      />
    </aside>
  );
};

export default Sidebar;
