import React, { useState, useEffect } from "react";
import BlankProfile from "../../assets/image/elipse.png";

const API_URL = import.meta.env.VITE_API_URL;

const UserProfile = () => {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const schoolId = storedUser?.school_id;

      const response = await fetch(`${API_URL}/api/user/${schoolId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(response);

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw errorData;
      // }

      const result = await response.json();
      setUser(result.user);
    } catch (error) {
      console.error("Error: ", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  

  return (
    <main className="w-full h-full bg-white ccontainer">
      <div className="p-4">
        <h1 className="text-xl">Account Settings Section</h1>
      </div>
      <hr />
      <div className="pt-7 px-14">
        <div className="flex">
          <div className="flex flex-col items-center w-[280px] mr-6">
            <img src={BlankProfile} alt="Profile" className="object-cover mb-4 rounded-full w-36 h-36" />
            <button className="px-4 py-2 mb-2 text-black bg-[#B3E5FC] rounded hover:bg-blue-300">Select Image</button>
            <p className="text-sm text-gray-500">File size maximum: 2MB<br />File extension: PNG/JPG</p>
            <button className="px-4 py-2 mt-6 text-white bg-red-500 rounded hover:bg-red-600">Logout</button>
          </div>

          <div className="border-l border-gray-300" />

          <div className="flex-1 pl-6">
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input type="text" defaultValue={user?.username || ""} className="block w-full p-2 mt-1 border border-gray-300 rounded-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" defaultValue={user?.email || ""} className="block w-full p-2 mt-1 border border-gray-300 rounded-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Student ID</label>
                <input type="text" defaultValue={user?.school_id || ""} className="block w-full p-2 mt-1 border border-gray-300 rounded-md" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input type="password" className="block w-full p-2 mt-1 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <input type="password" className="block w-full p-2 mt-1 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input type="password" className="block w-full p-2 mt-1 border border-gray-300 rounded-md" />
              </div>

              <div className="flex pt-2 space-x-2">
                <button type="submit" className="px-4 py-2 text-black bg-[#B3E5FC] rounded hover:bg-blue-300">Save</button>
                <button type="button" className="px-4 py-2 text-gray-800 bg-[#FFCC80] rounded hover:bg-[#ffc080]">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserProfile;