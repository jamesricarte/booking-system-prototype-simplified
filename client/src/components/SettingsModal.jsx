import { FiX } from "react-icons/fi";
import { MdLocalPhone } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const SettingsModal = ({ isOpen, closeModal }) => {
  if (!isOpen) {
    return null;
  }

  return (
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
              <label htmlFor="userMessage" className="block mb-2 font-light">
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
  );
};

export default SettingsModal;
