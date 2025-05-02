import React, { useEffect, useRef, useState } from "react";
import BlankProfile from "../../../assets/image/elipse.png";
import { useAuth } from "../../../context/AuthContext";
import DeleteImageModal from "./components/modals/DeleteImageModal";

const API_URL = import.meta.env.VITE_API_URL;

const AdminProfile = () => {
  const { user, login } = useAuth();
  const profileImageUrl = `${API_URL}/uploads/users/${user.id}/profileImages/${user.profile_image}`;

  // file upload
  const [file, setFile] = useState(null);

  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef();
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);

  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [editProfileResponse, setEditProfileResponse] = useState({
    isEditProfileResponseAvailable: false,
    message: "",
    type: "",
  });

  const updateProfileImage = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", user.id);

    setProfileUpdateLoading(true);
    const startTime = Date.now();
    let result;
    let message = {
      isEditProfileResponseAvailable: false,
      message: "",
      type: "",
    };

    try {
      const res = await fetch(`${API_URL}/api/uploadProfile`, {
        method: "POST",
        body: formData,
        headers: {
          userid: String(user.id),
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw errorData;
      }

      result = await res.json();
      message = {
        isEditProfileResponseAvailable: true,
        message: result.message,
        type: "success",
      };
    } catch (error) {
      const errorMessage =
        error.message === "Failed to fetch"
          ? "Unable to connect to the server. Check your internet connection"
          : error.message;
      message = {
        isEditProfileResponseAvailable: true,
        message: errorMessage,
        type: "error",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        setProfileUpdateLoading(false);
        if (message.type === "success") {
          login({ ...user, profile_image: result?.filePath });
          setImagePreview(`${API_URL}/${result?.filePath.replace(/^\/?/, "")}`);
        } else {
          setImagePreview(null);
        }

        setFile(null);
        setEditProfileResponse({
          isEditProfileResponseAvailable:
            message.isEditProfileResponseAvailable,
          message: message.message,
          type: message.type,
        });
        setTimeout(() => {
          setEditProfileResponse((prev) => ({
            ...prev,
            isEditProfileResponseAvailable: false,
          }));
        }, 2000);
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  const deleteImage = async () => {
    setProfileUpdateLoading(true);
    const startTime = Date.now();
    let success;
    let message = {
      isEditProfileResponseAvailable: false,
      message: "",
      type: "",
    };

    try {
      const response = await fetch(`${API_URL}/api/deleteImageProfile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          userProfileImage: user.profile_image,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      success = result?.success;
      message = {
        isEditProfileResponseAvailable: true,
        message: result.message,
        type: "error",
      };
    } catch (error) {
      const errorMessage =
        error.message === "Failed to fetch"
          ? "Unable to connect to the server. Check your internet connection"
          : error.message;
      message = {
        isEditProfileResponseAvailable: true,
        message: errorMessage,
        type: "error",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        setProfileUpdateLoading(false);
        if (success) {
          login({ ...user, profile_image: null });
        }
        setEditProfileResponse({
          isEditProfileResponseAvailable:
            message.isEditProfileResponseAvailable,
          message: message.message,
          type: message.type,
        });
        setTimeout(() => {
          setEditProfileResponse((prev) => ({
            ...prev,
            isEditProfileResponseAvailable: false,
          }));
        }, 2000);
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  // upload profile useEffect
  useEffect(() => {
    // console.log("Full user object →", user);
    if (user?.profile_image && user.profile_image.trim() !== "") {
      setImagePreview(profileImageUrl);
    } else {
      setImagePreview(null);
    }
  }, [user?.profile_image]);

  return (
    <main className="container relative h-full overflow-y-auto bg-white">
      <div className="p-4">
        <h1 className="text-xl">Admin Settings</h1>
      </div>
      <hr />
      <div className="py-7 px-14">
        <div className="flex">
          <div className="flex flex-col items-center justify-center w-[280px] mr-6">
            {user?.profile_image || file ? (
              <img
                src={imagePreview || profileImageUrl}
                alt="Profile"
                className="object-cover mb-4 rounded-full w-36 h-36 min-w-36"
              />
            ) : (
              <div className="mb-4 bg-[#B3E5FC] rounded-full w-36 h-36 min-w-36 flex justify-center items-center font-bold text-5xl text-white font-arial">
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

            <input
              type="file"
              accept="image/png, image/jpeg"
              className="hidden"
              ref={fileInputRef}
              onChange={(e) => {
                const selectedFile = e.target.files[0];
                if (!selectedFile) return;

                if (selectedFile.size > 2 * 1024 * 1024) {
                  return alert("File size exceeds 2MB");
                }

                const allowedTypes = ["image/png", "image/jpeg"];

                if (!allowedTypes.includes(selectedFile.type)) {
                  return alert("Only PNG and JPG are allowed");
                }

                setFile(selectedFile);
                setImagePreview(URL.createObjectURL(selectedFile));
              }}
            />

            <div className="flex flex-col justify-center gap-4 mb-5">
              <button
                className="px-4 py-2 text-black bg-[#B3E5FC] rounded hover:bg-blue-300 cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                Select Image
              </button>

              {file ? (
                <>
                  <button
                    className="px-4 py-2 text-black bg-[#FFA726] rounded hover:bg-[#FF9800] cursor-pointer"
                    onClick={updateProfileImage}
                    title="Upload image"
                  >
                    Upload
                  </button>

                  <button
                    className="px-4 py-2 text-red-400 bg-gray-300 rounded cursor-pointer hover:bg-gray-400"
                    onClick={() => {
                      setImagePreview(null);
                      setFile(null);
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="px-4 py-2 text-red-400 bg-gray-300 rounded cursor-pointer hover:bg-gray-400"
                  onClick={() => {
                    if (user.profile_image) {
                      setShowDeleteImageModal(true);
                    } else {
                      deleteImage();
                    }
                  }}
                >
                  Delete Image
                </button>
              )}
            </div>

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

        {/*Profile Loading spinner */}
        <div
          className={`absolute z-10 w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-6 rounded-1/2 border-t-transparent border-cyan-500 left-1/2 top-1/2 ${
            profileUpdateLoading ? "block animate-spin" : "hidden"
          }`}
        ></div>

        {/* White background */}
        <div
          className={`absolute top-0 left-0 w-full h-full bg-white opacity-50 pointer-events-auto z-10 ${
            profileUpdateLoading ? "block" : "hidden"
          }`}
        ></div>
      </div>

      {/* Update Image, delete image response */}
      <div
        className={`fixed z-10 p-4 rounded-sm m-0 transform -translate-x-1/2 bg-white left-1/2 shadow-md border border-gray-300 transition-all duration-500 ease ${
          editProfileResponse.isEditProfileResponseAvailable
            ? "top-12 opacity-100"
            : "-top-10 opacity-0"
        } ${
          editProfileResponse.type === "success"
            ? "text-cyan-500"
            : "text-red-500"
        }`}
      >
        <p className="text-sm font-bold">{editProfileResponse.message}</p>
      </div>

      <DeleteImageModal
        isOpen={showDeleteImageModal}
        onClose={() => setShowDeleteImageModal(false)}
        onConfirm={() => {
          deleteImage();
          setShowDeleteImageModal(false);
        }}
        loading={profileUpdateLoading}
      />
    </main>
  );
};

export default AdminProfile;
