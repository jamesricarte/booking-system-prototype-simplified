import React, { useEffect, useState } from "react";
import BlankProfile from "../../../assets/image/elipse.png";
import { useAuth } from "../../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const AdminProfile = () => {
  const { user } = useAuth();

  return (
    <main className="container h-full overflow-y-auto bg-white">
      <div className="p-4">
        <h1 className="text-xl">Admin Settings</h1>
      </div>
      <hr />
      <div className="py-7 px-14">
        <div className="flex">
          <div className="flex flex-col items-center w-[280px] mr-6">
            {user?.profile_image ? (
              <img
                src={imagePreview || `${API_URL}${user.profile_image}`}
                alt="Profile"
                className="object-cover mb-4 mr-20 rounded-full w-36 h-36 min-w-36"
              />
            ) : (
              <div className="mb-4 mr-20 bg-[#B3E5FC] rounded-full w-36 h-36 min-w-36 flex justify-center items-center font-bold text-5xl text-white font-arial">
                <p>
                  {user?.username
                    .split(" ")
                    .slice(0, 2)
                    .filter((word) => word.length > 1 || !word.endsWith("."))
                    .map((word) => word[0].toUpperCase())
                    .join("")}
                </p>
              </div>
            )}

            <button className="px-4 py-2 mb-2 text-black bg-[#B3E5FC] rounded hover:bg-blue-300">
              Select Image
            </button>

            <p className="text-sm text-gray-500">
              File size maximum: 2MB
              <br />
              File extension: PNG/JPG
            </p>
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
