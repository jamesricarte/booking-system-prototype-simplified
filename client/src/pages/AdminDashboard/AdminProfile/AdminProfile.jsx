import React, { useEffect, useState } from "react";
import BlankProfile from "../../../assets/image/elipse.png";
import { useAuth } from "../../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const AdminProfile = () => {
  const { logout, user } = useAuth();

  return (
    <main className="container h-full overflow-y-auto bg-white">
      <div className="p-4">
        <h1 className="text-xl">Admin Settings Section</h1>
      </div>
      <hr />
      <div className="py-7 px-14">
        <div className="flex">
          <div className="flex flex-col items-center w-[280px] mr-6">
            <img
              src={BlankProfile}
              alt="Profile"
              className="object-cover mb-4 rounded-full w-36 h-36"
            />

            <button className="px-4 py-2 mb-2 text-black bg-[#B3E5FC] rounded hover:bg-blue-300">
              Select Image
            </button>

            <p className="text-sm text-gray-500">
              File size maximum: 2MB
              <br />
              File extension: PNG/JPG
            </p>

            <button
              onClick={logout}
              className="px-4 py-2 mt-auto mb-[20%] text-white bg-red-500 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          <div className="border border-gray-200" />

          <div className="flex-1 pl-6">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={user.username || ""}
                  readOnly
                  className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email || ""}
                  readOnly
                  className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminProfile;
