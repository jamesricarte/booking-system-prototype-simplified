import React, { useState, useEffect } from "react";
import BlankProfile from "../../assets/image/elipse.png";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import Input from "../../components/Input";

const API_URL = import.meta.env.VITE_API_URL;

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState([]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user/${user.school_id}`, {
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
      setUserData(result.user);
    } catch (error) {
      console.error("Error fetching user: ", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <main className="w-full h-full overflow-y-auto bg-white ccontainer">
      <div className="p-4">
        <h1 className="text-xl">Account Settings Section</h1>
      </div>
      <hr />
      <div className="py-7 px-14">
        <div className="flex">
          {/* LEFT SECTION */}
          <div className="flex flex-col items-center w-[280px] mr-6">
            <img
              src={BlankProfile}
              alt="Profile"
              className="object-cover mb-4 rounded-full w-36 h-36"
            />

            <button className="px-4 py-2 mb-2 text-black bg-[#B3E5FC] rounded hover:bg-blue-300">
              Select Image
            </button>

            <p className="text-sm text-center text-gray-500">
              File size maximum: 2MB
              <br />
              File extension: PNG/JPG
            </p>

            <button
              onClick={logout}
              className="px-4 py-2 mt-6 text-white bg-red-500 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          {/* VERTICAL LINE */}
          <div className="border-l border-gray-300" />

          {/* RIGHT SECTION */}
          <div className="flex-1 pl-6">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <Input
                  type="text"
                  defaultValue={userData?.username || ""}
                  className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  type="email"
                  defaultValue={userData?.email || ""}
                  className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Student ID
                </label>
                <Input
                  type="text"
                  defaultValue={userData?.school_id || ""}
                  className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Input
                  type="password"
                  className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <Input
                  type="password"
                  className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                />
              </div>

              <div className="flex pt-2 space-x-2">
                <Button
                  type="submit"
                  className="px-4 py-2 text-black bg-[#B3E5FC] rounded hover:bg-blue-300"
                >
                  Save
                </Button>
                <Button
                  type="button"
                  className="px-4 py-2 text-gray-800 bg-[#FFCC80] rounded hover:bg-[#ffc080]"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserProfile;
