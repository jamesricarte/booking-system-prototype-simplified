import React, { useEffect, useState } from "react";
import Logo from "../assets/logo/Logo.png";
import BlankProfile from "../assets/image/elipse.png";
import { RiSettings5Fill } from "react-icons/ri";
import { FaRegCalendarAlt } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatUTCDateWithOrdinal, getDayName } from "../utils/timeUtils";
import { FiX } from "react-icons/fi";
import { MdLocalPhone } from "react-icons/md";
import { FaPlus } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL;

const Sidebar = ({ isAdmin }) => {
  const { user } = useAuth();

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

  const closeModal = () => setIsSettingsOpen(false);

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
                  className={({ isActive }) =>
                    `p-2 transition-colors text-2xl rounded-sm ${
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
                <h1 className="text-[20px]">
                  {isAdmin ? user.username : user.name}
                </h1>
              </NavLink>
              <NavLink to={`${isAdmin ? "/AdminProfile" : "/UserProfile"}`}>
                <p className="text-sm">{user.email}</p>
              </NavLink>
            </div>
          </div>
          <NavLink to="/Settings" onClick={handleClick}>
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

      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative w-[70%] h-[80%] bg-white rounded-lg shadow-lg">
            <div className="flex justify-between px-6 py-4">
              <div>
                <h1 className="text-xl ">User Settings Section</h1>
              </div>

              <button
                onClick={closeModal}
                className="flex items-center justify-center w-6 h-6 text-white bg-red-500 rounded-full cursor-pointer "
              >
                <FiX />
              </button>
            </div>
            <hr className="mb-4" />
            <div className="flex h-[80%] ">
              <aside className="flex flex-col justify-between w-1/4 h-full p-6 border-r border-gray-300 ">
                <nav className="flex flex-col gap-2 space-y-2 text-xl font-medium">
                  <NavLink className="p-2">Terms & Condition</NavLink>
                  <NavLink className="p-2 text-xl text-black transition-colors bg-[#B3E5FC] rounded-sm">
                    Help & Support
                  </NavLink>
                  <NavLink className="p-2">Report a Bug</NavLink>
                </nav>
                <div className="flex items-center justify-center">
                  <button className="px-4 py-2 text-white bg-red-500 rounded cursor-pointer hover:bg-red-600">
                    Logout User
                  </button>
                </div>
              </aside>

              <div className="w-2/3 p-6">
                <div className="flex justify-between ">
                  <h1 className="text-2xl">Help Center</h1>

                  <div className="flex items-center gap-2 text-[#FFA726] mb-7">
                    <MdLocalPhone className="text-lg" />
                    <h2 className="text-lg">Contact us</h2>
                  </div>
                </div>

                <div className="mb-4">
                  <label
                    htmlFor="userMessage"
                    className="block mb-2 font-light"
                  >
                    Write us a message :
                  </label>
                  <textarea
                    name=""
                    id=""
                    className="w-full bg-[#EFEFEF] border-gray-300 rounded-md h-40 p-3 resize-none"
                  ></textarea>
                </div>
                <div className="flex justify-end mb-8">
                  <button className="px-4 py-2  bg-[#B3E5FC] text-black rounded cursor-pointer">
                    Send Message
                  </button>
                </div>

                <div className="flex flex-col w-full gap-2">
                  <h1 className="text-xl">FAQ's</h1>
                  <ul className="flex flex-col gap-2 text-base">
                    <li className="px-4 py-2 text-black transition-colors flex items-center justify-between bg-[#EFEFEF] rounded-sm cursor-pointer">
                      Is the system okay?
                      <FaPlus className="text-[#A9ADAB]" />
                    </li>
                    <li className="px-4 flex items-center justify-between py-2 text-black transition-colors bg-[#EFEFEF] rounded-sm cursor-pointer">
                      What is its main purpose?
                      <FaPlus className="text-[#A9ADAB]" />
                    </li>
                    <li className="px-4 py-2 text-black transition-colors flex items-center justify-between bg-[#EFEFEF] rounded-sm cursor-pointer">
                      What is its main purpose?
                      <FaPlus className="text-[#A9ADAB]" />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
