import React, { useEffect, useState } from "react";
import Logo from "../assets/logo/Logo.png";
import BlankProfile from "../assets/image/elipse.png";
import { RiSettings5Fill } from "react-icons/ri";
import { FaRegCalendarAlt } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatUTCDateWithOrdinal, getDayName } from "../utils/timeUtils";
import { FaPhoneAlt } from "react-icons/fa";
import { FiX } from "react-icons/fi";

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

  // SETTINGMODAL
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
    <div className="relative w-[70%] h-[80%] bg-white rounded-lg shadow-lg p-6">
      
      <button
        onClick={closeModal}
        className="absolute flex items-center justify-center w-6 h-6 text-white bg-red-500 rounded-full top-3 right-4 hover:bg-red-600"
      >
        <FiX size={16} />
      </button>

      <div className="mb-4">
        <h1 className="text-xl font-semibold">User Settings Section</h1>
      </div>

      <hr className="mb-4" />

      <div className="flex gap-6 h-[calc(100%-100px)]">
        
        <div className="w-1/3 pr-4 border-r">
          <div className="mb-2 cursor-pointer">Terms & Conditions</div>
          <div className="px-2 py-1 mb-2 font-medium text-black bg-[#B3E5FC] rounded cursor-pointer">
            Help & Support
          </div>
          <div className="mb-2 cursor-pointer">Report a Bug</div>
          <button className="px-4 py-2 mt-6 text-white bg-red-500 rounded hover:bg-red-400">
            Logout User
          </button>
        </div>

        <div className="flex flex-col justify-between w-2/3 pl-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">Help Center</h2>
              <p className="text-sm text-[#F56C18] flex items-center gap-1">
                <FaPhoneAlt className="text-base" /> Contact us
              </p>
            </div>
            <p>Write us a message: </p>
            <textarea
              placeholder="Enter your message here....."
              rows={4}
              className="w-full p-2 mb-3 bg-gray-200 border-none rounded resize-none"
            />
      
            <button className="px-4 py-2 text-black bg-[#B3E5FC] rounded hover:bg-[#9cdcf8]">
              Send Message
            </button>
          </div>

          <div className="mt-6">
            <h4 className="mb-2 font-semibold">FAQ’s</h4>
            <div className="space-y-1">
              <div className="p-2 bg-gray-100 rounded cursor-pointer">
                Lorem ipsum dolor sit amet
              </div>
              <div className="p-2 bg-gray-100 rounded cursor-pointer">
                Lorem ipsum dolor sit amet
              </div>
            </div>
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
