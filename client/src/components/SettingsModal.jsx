import { FiX } from "react-icons/fi";
import { MdLocalPhone } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import { IoIosAlert } from "react-icons/io";

const SettingsModal = ({ isOpen, closeModal }) => {
  const { logout } = useAuth();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("terms");

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    logout(); // or your custom logout logic
    setIsLogoutConfirmOpen(false);
    closeModal(); // close settings modal too if you want
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "terms":
        return <p> </p>; // James
      case "help":
        return (
          <div>
            <div className="flex justify-between mb-7">
              <h1 className="text-2xl">Help Center</h1>
              <div className="flex items-center gap-2 text-[#FFA726]">
                <MdLocalPhone className="text-lg" />
                <h2 className="text-lg">Contact us</h2>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="userMessage" className="block mb-2 font-light">
                Write us a message:
              </label>
              <textarea className="w-full h-40 p-3 bg-[#EFEFEF] border-gray-300 rounded-md resize-none"></textarea>
            </div>

            <div className="flex justify-end mb-8">
              <button className="px-4 py-2 bg-[#B3E5FC] text-black rounded cursor-pointer">
                Send Message
              </button>
            </div>

            <div className="flex flex-col w-full gap-2">
              <h1 className="text-xl">FAQ's</h1>
              <ul className="flex flex-col gap-2 text-base">
                {[
                  "How do I create an account?",
                  "What is its main purpose?",
                  "I forgot my password. How can I reset it?",
                  "Is my personal information safe?",
                  "How do I contact customer support?",
                ].map((faq, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 flex items-center justify-between text-black bg-[#EFEFEF] rounded-sm cursor-pointer"
                  >
                    {faq}
                    <FaPlus className="text-[#A9ADAB]" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      case "report":
        return <p></p>; // James
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-[70%] h-[80%] bg-white rounded-lg shadow-lg">
        <div className="flex justify-between px-6 py-4">
          <h1 className="text-xl">User Settings Section</h1>
          <button
            onClick={closeModal}
            className="flex items-center justify-center w-6 h-6 text-white bg-red-500 rounded-full cursor-pointer"
          >
            <FiX />
          </button>
        </div>

        <hr className="mb-4" />

        <div className="flex h-[80%]">
          <aside className="flex flex-col justify-between w-1/4 h-full p-6 border-r border-gray-300">
            <nav className="flex flex-col gap-2 text-xl font-medium">
              <button
                onClick={() => setActiveTab("terms")}
                className={`p-2 text-left cursor-pointer ${
                  activeTab === "terms"
                    ? "text-black bg-[#B3E5FC] rounded-sm"
                    : ""
                }`}
              >
                Terms & Condition
              </button>
              <button
                onClick={() => setActiveTab("help")}
                className={`p-2 text-left cursor-pointer ${
                  activeTab === "help"
                    ? "text-black bg-[#B3E5FC] rounded-sm"
                    : ""
                }`}
              >
                Help & Support
              </button>
              <button
                onClick={() => setActiveTab("report")}
                className={`p-2 text-left cursor-pointer ${
                  activeTab === "report"
                    ? "text-black bg-[#B3E5FC] rounded-sm"
                    : ""
                }`}
              >
                Report a Bug
              </button>
            </nav>
            <div className="flex items-center justify-center">
              <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="px-4 py-2 text-white bg-red-500 rounded cursor-pointer hover:bg-red-600"
              >
                Logout User
              </button>
            </div>
          </aside>
          <div className="w-2/3 h-full p-6 overflow-y-auto">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-60">
          <div className="w-full max-w-sm bg-white rounded-md shadow-xl">
            <div className="items-center gap-2">
              <div className="flex p-4">
                <h1 className="text-lg ">Confirm Logout</h1>
              </div>
            </div>

            <hr />

            <div className="flex flex-col gap-5 p-5">
              <h2 className="font-normal ">Are you sure you want to logout?</h2>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsLogoutConfirmOpen(false)}
                  className="px-4 py-2 bg-[#B3E5FC] rounded cursor-pointer hover:bg-[#99d3ee]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="px-4 py-2 text-white bg-red-500 rounded cursor-pointer hover:bg-red-600"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModal;
