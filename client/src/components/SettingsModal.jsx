import { FiX } from "react-icons/fi";
import { MdLocalPhone } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import PropTypes from "prop-types";
import { useState } from "react";
import LogoutModal from "./LogoutModal";

const SettingsModal = ({ isOpen, closeModal }) => {
  const { logout } = useAuth();
  const [isConfirmLogoutOpen, setIsConfirmLogoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("terms");
  const [reportPreviews, setReportPreviews] = useState([]);

  const handleReportFilesChange = (e) => {
    const files = Array.from(e.target.files);
    setReportPreviews(files.map((file) => URL.createObjectURL(file)));
  };

  if (!isOpen) return null;

  const handleConfirmLogout = () => {
    logout(); // or your custom logout logic
    setIsConfirmLogoutOpen(false);
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
                  <li>
                    Only one active booking per user is allowed at a time.
                  </li>
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
              <div>
                <h2 className="mb-2 font-semibold">
                  Room Usage Responsibilities
                </h2>
                <ul className="ml-6 space-y-2 list-disc list-inside">
                  <li>Leave the room clean and ready for the next user.</li>
                  <li>Do not move or damage any equipment or furniture.</li>
                </ul>
              </div>
              <div>
                <h2 className="mb-2 font-semibold">
                   Booking Appearance (User Color Tag)
                </h2>
                <ul className="ml-6 space-y-2 list-disc list-inside">
                  <li>
                    You may choose your custom color from the Settings tab to
                    personalize your bookings on the time chart.
                  </li>
                  <li>
                    Your selected color will appear in all your bookings for
                    easier identification.
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
                onClick={() => setIsConfirmLogoutOpen(true)}
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

      <LogoutModal
        isOpen={isConfirmLogoutOpen}
        onConfirm={handleConfirmLogout}
        onCancel={() => setIsConfirmLogoutOpen(false)}
      />
    </div>
  );
};

SettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default SettingsModal;
