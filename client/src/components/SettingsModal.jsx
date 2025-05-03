import { FiX } from "react-icons/fi";
import { MdLocalPhone } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import PropTypes from "prop-types";
import { useState } from "react";

const SettingsModal = ({ isOpen, closeModal }) => {
  const { logout } = useAuth();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("terms");
  const [reportPreviews, setReportPreviews] = useState([]);

  const handleReportFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setReportPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    logout(); // or your custom logout logic
    setIsLogoutConfirmOpen(false);
    closeModal(); // close settings modal too if you want
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "terms":
        return (
          <div className="text-black">
            <h1 className="mb-4 text-2xl">Terms & Conditions</h1>
            <div className="ml-6 space-y-6">
              <div>
                <h1 className="mb-3 text-xl">Classroom Booking Policy</h1>
                <p className="mb-4">
                  Please read and follow these simple guidelines to ensure fair
                  and smooth use of the booking system.
                </p>
                <h2 className="mb-2 font-semibold">Booking Usage:</h2>
                <ul className="ml-6 space-y-2 list-disc list-inside">
                  <li>
                    Bookings are available for active faculty members only.
                  </li>
                  <li>Only one actve booking per user is allowed at a time.</li>
                  <li>Bookings must be made at least 15 minutes in advance.</li>
                  <li>Time slots are first-come,first-served basis.</li>
                </ul>
              </div>
              <div>
                <h2 className="mb-2 font-semibold">Check-in and Checkout:</h2>
                <ul className="ml-6 space-y-2 list-disc list-inside">
                  <li>
                    You must check in within 10 minutes of your booking time.
                  </li>
                  <li>
                    Checkout is expected to be done before or at the scheduled
                    end time.
                  </li>
                </ul>
              </div>
              <div>
                <h2 className="mb-2 font-semibold">
                  Cancellations and No-shows:
                </h2>
                <ul className="ml-6 space-y-2 list-disc list-inside">
                  <li>
                    Please cancel or end your booking if you no longer need the
                    room.
                  </li>
                  <li>
                    No-shows may lead to temporary restrictions on your booking
                    access.
                  </li>
                  <li>
                    You can cancel or end your booking early via the Room
                    Details page.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        );
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
            </nav>
            <div className="flex items-center justify-center">
              <button
                onClick={() => setIsLogoutConfirmOpen(true)}
                className="px-4 py-2 text-white bg-[#EF5350] rounded cursor-pointer hover:bg-[#E53935]"
              >
                Logout User
              </button>
            </div>
          </aside>
          <div className="flex-1 h-full p-6 mr-4 overflow-y-auto">
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

SettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default SettingsModal;
