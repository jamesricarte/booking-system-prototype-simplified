import React, { useState, useEffect, useRef } from "react";
import BlankProfile from "../../../assets/image/elipse.png";
import { useAuth } from "../../../context/AuthContext";
import Input from "../../../components/Input";
import { RiCloseCircleFill } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { handleFormChange } from "../../../utils/formHandlers";
import { HiMiniEyeSlash } from "react-icons/hi2";
import { IoWarningOutline } from "react-icons/io5";
import DeleteImageModal from "./components/modals/DeleteImageModal";
import DeleteAccountModal from "./components/modals/DeleteAccountModal";

const API_URL = import.meta.env.VITE_API_URL;

const UserProfile = () => {
  const { user, login } = useAuth();

  // file upload
  const [file, setFile] = useState(null);

  const [imagePreview, setImagePreview] = useState(BlankProfile);
  const fileInputRef = useRef();

  //Modals
  const [showDeleteImageModal, setShowDeleteImageModal] = useState(false);
  const [changePassswordModal, setChangePasswordModal] = useState(false);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);

  //password input
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  //auth
  const [changePasswordData, setChangePasswordData] = useState({
    id: user.id,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [editProfileForm, setEditProfileForm] = useState({
    isEditable: false,
    id: user.id,
    name: "",
    email: "",
    schoolId: "",
  });
  const [changePasswordResponse, setChangePasswordResponse] = useState({
    isChangePasswordMessage: false,
    message: "",
    type: "",
  });
  const [editProfileResponse, setEditProfileResponse] = useState({
    isEditProfileResponseAvailable: false,
    message: "",
    type: "",
  });

  //loading variable
  const [loading, setLoading] = useState(false);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const [bookingColorLoading, setBookingColorLoading] = useState(false);
  const emailInputRef = useRef(null);

  const [selectedColor, setSelectedColor] = useState("");
  const [isChangeColorSubmitted, setIsChangeColorSubmitted] = useState(true);

  const colors = [
    { hex: "#ff6b6b", name: "Pastel Red" },
    { hex: "#ff9e7d", name: "Light Coral" },
    { hex: "#ffbe76", name: "Light Orange" },
    { hex: "#4ecdc4", name: "Turquoise Blue" },
    { hex: "#1abc9c", name: "Strong Cyan" },
    { hex: "#7851a9", name: "Royal Purple" },
    { hex: "#ff7675", name: "Soft Pink" },
    { hex: "#a4b0be", name: "Pale Gray" },
    { hex: "#2f3542", name: "Charcoal Gray" },
    { hex: "#a55eea", name: "Vivid Purple" },
    { hex: "#8854d0", name: "Medium Purple" },
    { hex: "#303952", name: "Dark Indigo" },
    { hex: "#e74c3c", name: "Strong Red" },
    { hex: "#3498db", name: "Sky Blue" },
    { hex: "#1e90ff", name: "Dodger Blue" },
    { hex: "#2ecc71", name: "Fresh Green" },
    { hex: "#f1c40f", name: "Sunflower Yellow" },
    { hex: "#9b59b6", name: "Amethyst" },
    { hex: "#ff5252", name: "Bright Pink" },
    { hex: "#e67e22", name: "Pumpkin Orange" },
    { hex: "#8b0000", name: "Dark Red" },
    { hex: "#6ab04c", name: "Lime Green" },
    { hex: "#b71540", name: "Deep Rose" },
    { hex: "#badc58", name: "Lime Yellow" },
  ];

  useEffect(() => {
    if (user?.booking_color) {
      setSelectedColor(user.booking_color);
    }
  }, [user]);

  const handleColorClick = (color) => {
    setSelectedColor(color);
  };

  const handleChangePasswordFormData = handleFormChange(
    changePasswordData,
    setChangePasswordData
  );

  const handleEditProfileFormData = handleFormChange(
    editProfileForm,
    setEditProfileForm
  );

  useEffect(() => {
    setEditProfileForm((prev) => ({
      ...prev,
      name: user.name || "",
      email: user.email || "",
      schoolId: user.professor_school_id || "",
    }));
  }, [user]);

  useEffect(() => {
    emailInputRef.current.focus();
  }, [editProfileForm.isEditable]);

  const changePassword = async (e) => {
    e.preventDefault();

    setShowPassword(false);
    setShowConfirmPassword(false);
    setLoading(true);
    const startTime = Date.now();
    let message = {
      isChangePasswordMessage: false,
      message: "",
      type: "",
    };

    try {
      const response = await fetch(`${API_URL}/api/changePassword`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(changePasswordData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      message = {
        isChangePasswordMessage: true,
        message: result.message,
        type: "success",
      };
    } catch (error) {
      const errorMessage =
        error.message === "Failed to fetch"
          ? "Unable to connect to the server. Check your internet connection"
          : error.message;
      message = {
        isChangePasswordMessage: true,
        message: errorMessage,
        type: "error",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        setLoading(false);
        setChangePasswordResponse({
          isChangePasswordMessage: message.isChangePasswordMessage,
          message: message.message,
          type: message.type,
        });

        if (message.type === "success") {
          setChangePasswordModal(false);
          setChangePasswordData((prev) =>
            Object.fromEntries(
              Object.keys(prev).map((key) => [
                key,
                key === "id" ? prev[key] : "",
              ])
            )
          );

          setTimeout(() => {
            setChangePasswordResponse((prev) => ({
              ...prev,
              isChangePasswordMessage: false,
            }));
          }, 3000);
        }
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  const updateProfileInformation = async (e) => {
    e.preventDefault();

    setProfileUpdateLoading(true);
    const startTime = Date.now();
    let message = {
      isEditProfileResponseAvailable: false,
      message: "",
      type: "",
    };

    try {
      const { name, schoolId, ...editProfileData } = editProfileForm;

      const response = await fetch(`${API_URL}/api/updateProfileInformation`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editProfileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
      login({ ...user, email: editProfileData.email });
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
          setEditProfileForm({ ...editProfileForm, isEditable: false });
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
          setImagePreview(BlankProfile);
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
    setLoading(true);
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
        setLoading(false);
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

  const updateBookingColor = async () => {
    setBookingColorLoading(true);
    const startTime = Date.now();
    let message = {
      isEditProfileResponseAvailable: false,
      message: "",
      type: "",
    };

    try {
      const response = await fetch(`${API_URL}/api/updateBookingColor`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, selectedColor: selectedColor }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      const result = await response.json();
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
        setBookingColorLoading(false);
        if (message.type === "success") {
          setIsChangeColorSubmitted(true);
          login({ ...user, booking_color: selectedColor });
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
      setImagePreview(`${API_URL}${user.profile_image}`);
    } else {
      setImagePreview(BlankProfile);
    }
  }, [user?.profile_image]);

  const [activeTab, setActiveTab] = useState("basic-info");

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic-info":
        return (
          <>
            <div className="flex-col w-full ml-2flex mr-7">
              <div className="flex flex-row items-center w-full h-full pt-3 pl-6">
                {user?.profile_image ? (
                  <img
                    src={imagePreview || `${API_URL}${user.profile_image}`}
                    alt="Profile"
                    className="object-cover mb-4 mr-20 rounded-full w-36 h-36 min-w-36"
                  />
                ) : (
                  <div className="mb-4 mr-20 bg-[#B3E5FC] rounded-full w-36 h-36 min-w-36 flex justify-center items-center font-bold text-5xl text-white font-arial">
                    <p>
                      {user?.name
                        .split(" ")
                        .slice(0, 2)
                        .filter(
                          (word) => word.length > 1 || !word.endsWith(".")
                        )
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
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <button
                      className="px-4 py-2 mb-5 text-black bg-[#B3E5FC] rounded hover:bg-blue-300 cursor-pointer"
                      onClick={() => fileInputRef.current.click()}
                    >
                      Select Image
                    </button>

                    {file ? (
                      <>
                        <button
                          className="px-4 py-2 mb-5 text-black bg-[#FFA726] rounded hover:bg-[#FF9800] cursor-pointer"
                          onClick={updateProfileImage}
                          title="Upload image"
                        >
                          Upload
                        </button>

                        <button
                          className="px-4 py-2 mb-5 mr-5 text-red-400 bg-gray-300 rounded cursor-pointer hover:bg-gray-400"
                          onClick={() => {
                            setImagePreview(BlankProfile);
                            setFile(null);
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="px-4 py-2 mb-5 mr-5 text-red-400 bg-gray-300 rounded cursor-pointer hover:bg-gray-400"
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

                  <p className="text-sm text-center text-gray-500">
                    File size maximum: 2MB
                    <br />
                    File extension: PNG/JPG
                  </p>
                </div>
              </div>

              <div className="relative flex-1 pl-6">
                <form className="space-y-4" onSubmit={updateProfileInformation}>
                  <div className="flex justify-between">
                    <h1 className="text-xl">Edit Profile</h1>
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => {
                        setEditProfileForm((prev) => ({
                          ...prev,
                          isEditable: true,
                        }));

                        if (editProfileForm.isEditable) {
                          emailInputRef.current.focus();
                        }
                      }}
                    >
                      <FiEdit className="text-orange-500" />
                      <p className="text-sm text-orange-500">
                        Edit Information
                      </p>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Name
                    </label>
                    <Input
                      type="text"
                      className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                      name="name"
                      value={editProfileForm.name}
                      onChange={handleEditProfileFormData}
                      disabled={true}
                      required={true}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <Input
                      type="email"
                      className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                      name="email"
                      value={editProfileForm.email}
                      onChange={handleEditProfileFormData}
                      disabled={!editProfileForm.isEditable}
                      required={true}
                      ref={emailInputRef}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="schoolId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      School ID
                    </label>
                    <Input
                      type="text"
                      className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                      name="schoolId"
                      value={editProfileForm.schoolId}
                      onChange={handleEditProfileFormData}
                      disabled={true}
                      required={true}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-8">
                    <div className="flex gap-2">
                      {editProfileForm.isEditable && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setEditProfileForm((prev) => ({
                                ...prev,
                                isEditable: false,
                                name: user.name,
                                email: user.email,
                                schoolId: user.professor_school_id,
                              }))
                            }
                            className="px-4 py-2 text-black bg-orange-300 rounded cursor-pointer"
                          >
                            Cancel
                          </button>

                          <input
                            type="submit"
                            value="Save"
                            className={`px-6 py-2 rounded border-gray-500  border-none outline-none focus:ring-1 focus:ring-gray-500 cursor-pointer ${
                              editProfileForm.isEditable
                                ? "bg-[#B3E5FC]"
                                : "bg-gray-200"
                            }`}
                            disabled={!editProfileForm.isEditable}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </form>
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
            {/* end */}
          </>
        );
      case "change-password":
        return (
          <>
            <h1 className="p-2 text-xl">Change Password</h1>
            <form className="flex flex-col gap-3 p-5" onSubmit={changePassword}>
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Password
                </label>
                <Input
                  className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={changePasswordData.currentPassword}
                  onChange={handleChangePasswordFormData}
                  required={true}
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <div className="relative w-full">
                  <Input
                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                    type={showPassword ? "text" : "password"}
                    id="newPassword"
                    name="newPassword"
                    value={changePasswordData.newPassword}
                    onChange={handleChangePasswordFormData}
                    required={true}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 flex items-center text-gray-600 cursor-pointer right-6"
                  >
                    {showPassword ? (
                      <HiMiniEyeSlash size={18} />
                    ) : (
                      <HiMiniEyeSlash size={18} color="#A9ADAB" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm Password
                </label>
                <div className="relative w-full">
                  <Input
                    className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={changePasswordData.confirmPassword}
                    onChange={handleChangePasswordFormData}
                    required={true}
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 flex items-center text-gray-600 cursor-pointer right-6"
                  >
                    {showConfirmPassword ? (
                      <HiMiniEyeSlash size={18} />
                    ) : (
                      <HiMiniEyeSlash size={18} color="#A9ADAB" />
                    )}
                  </button>
                </div>
              </div>

              {changePasswordResponse.isChangePasswordMessage &&
                changePasswordResponse.type === "error" && (
                  <p className="text-sm text-red-500">
                    {changePasswordResponse.message}
                  </p>
                )}

              <div className="flex justify-end">
                <Input
                  type="submit"
                  value="Change"
                  className="block p-2 mt-1 bg-gray-300 rounded-md cursor-pointer"
                />
              </div>
            </form>
          </>
        );
      case "calendarprefs":
        return (
          <>
            <div className="flex flex-col w-full">
              <h1 className="mb-4 text-xl">Choose Your Theme Color</h1>

              <div className="p-4 mb-6 rounded-md">
                <p className="mb-4 text-sm text-gray-600">
                  Note: This change will only affect the appearance of the
                  calendar for your selected booking time. It will not impact
                  the overall system.
                </p>

                {/* Color picker grid */}
                <div className="grid grid-cols-6 gap-4 mb-6 md:grid-cols-12">
                  {colors.map(({ hex, name }) => {
                    const getRingColor = (color) => {
                      if (
                        [
                          "#4ecdc4",
                          "#1abc9c",
                          "#a4b0be",
                          "#2f3542",
                          "#303952",
                          "#3498db",
                          "#1e90ff",
                          "#2ecc71",
                          "#6ab04c",
                          "#badc58",
                        ].includes(color)
                      ) {
                        return "ring-[#F56C18]";
                      } else {
                        return "ring-cyan-500";
                      }
                    };

                    return (
                      <div
                        key={hex}
                        title={name}
                        className={`w-full min-w-8 h-[2vw] rounded cursor-pointer relative ${
                          selectedColor === hex
                            ? `ring-3 ${getRingColor(hex)}`
                            : ""
                        }`}
                        style={{ backgroundColor: hex }}
                        onClick={() => {
                          handleColorClick(hex);
                          setIsChangeColorSubmitted(hex === user.booking_color);
                        }}
                      ></div>
                    );
                  })}
                </div>

                <div className="flex justify-end">
                  <div className="relative">
                    <button
                      className={`h-10 text-black rounded cursor-pointer flex items-center justify-center ${
                        isChangeColorSubmitted
                          ? "bg-gray-300 opacity-60 w-28"
                          : "bg-[#B3E5FC] hover:bg-blue-300 w-36"
                      }`}
                      onClick={updateBookingColor}
                      disabled={isChangeColorSubmitted || bookingColorLoading}
                    >
                      {bookingColorLoading ? (
                        <div
                          className={`w-5 h-5 rounded-full border-3 border-t-transparent border-black animate-spin`}
                        ></div>
                      ) : (
                        <>{isChangeColorSubmitted ? "Saved" : "Save Changes"}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case "accountManagement":
        return (
          <>
            <div className="flex flex-col w-full">
              <div className="flex flex-col gap-1 mb-6">
                <h1 className="text-xl ">Delete Account</h1>
                <p className="text-sm text-gray-600">
                  If you no longer wish to use the system, you can permanently
                  delete your account.
                </p>
              </div>
              <button
                className="px-4 w-46 py-2 text-black bg-[#EF5350] text-white rounded hover:bg-[#E53935] cursor-pointer flex items-center justify-center gap-2"
                onClick={() => setDeleteAccountModal(true)}
              >
                <IoWarningOutline size={17} /> Delete Account
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };
  return (
    <main className="container h-full bg-white">
      <div className="p-4">
        <h1 className="text-xl">Account Settings Section</h1>
      </div>
      <hr />
      <div className="overflow-y-auto py-7 px-7 h-[79vh]">
        <div className="relative flex">
          <div className="flex flex-col mr-5 w-[340px]">
            <button
              onClick={() => setActiveTab("basic-info")}
              className={`p-2 text-left cursor-pointer ${
                activeTab === "basic-info"
                  ? "text-black bg-[#B3E5FC] rounded-sm"
                  : ""
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab("change-password")}
              className={`p-2 text-left cursor-pointer ${
                activeTab === "change-password"
                  ? "text-black bg-[#B3E5FC] rounded-sm"
                  : ""
              }`}
            >
              Change Password
            </button>
            <button
              onClick={() => setActiveTab("calendarprefs")}
              className={`p-2 text-left cursor-pointer ${
                activeTab === "calendarprefs"
                  ? "text-black bg-[#B3E5FC] rounded-sm"
                  : ""
              }`}
            >
              Calendar Preferences
            </button>
            <button
              onClick={() => setActiveTab("accountManagement")}
              className={`p-2 text-left cursor-pointer ${
                activeTab === "accountManagement"
                  ? "text-black bg-[#B3E5FC] rounded-sm"
                  : ""
              }`}
            >
              Account Management
            </button>
          </div>

          <div className="border border-gray-200" />

          <div className="w-full h-full p-6">{renderTabContent()}</div>
        </div>
      </div>

      {/* Change Password Modal */}
      <div
        className={`fixed z-10 w-[30vw] transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-sm shadow-lg top-1/2 left-1/2 ${
          changePassswordModal ? "block" : "hidden"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg">Change password</h2>
          <RiCloseCircleFill
            onClick={() => {
              setChangePasswordModal(false);
              setChangePasswordResponse((prev) => ({
                ...prev,
                message: "",
              }));
              setChangePasswordData((prev) =>
                Object.fromEntries(
                  Object.keys(prev).map((key) => [
                    key,
                    key === "id" ? prev[key] : "",
                  ])
                )
              );
            }}
            className="cursor-pointer"
            color="red"
            size={18}
          />
        </div>

        <hr className="border-gray-500" />
      </div>

      {/* Loading spinner */}
      <div
        className={`fixed z-10 w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-6 rounded-1/2 border-t-transparent border-cyan-500 left-1/2 top-1/2 ${
          loading ? "block animate-spin" : "hidden"
        }`}
      ></div>

      {/* Change Password Response Message */}
      <div
        className={`fixed z-10 p-4 rounded-sm m-0 transform -translate-x-1/2 bg-white left-1/2 shadow-md border border-gray-300 transition-all duration-500 ease ${
          changePasswordResponse.isChangePasswordMessage &&
          changePasswordResponse.type === "success"
            ? "top-12 opacity-100"
            : "-top-10 opacity-0"
        } ${
          changePasswordResponse.type === "success"
            ? "text-cyan-500"
            : "text-red-500"
        }`}
      >
        <p className="text-sm font-bold">{changePasswordResponse.message}</p>
      </div>

      {/* Update Profile Information &  Update Booking Color Message */}
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

      {/*Delete image alert modal */}
      <DeleteImageModal
        isOpen={showDeleteImageModal}
        onClose={() => setShowDeleteImageModal(false)}
        onConfirm={() => {
          deleteImage();
          setShowDeleteImageModal(false);
        }}
        loading={loading}
      />

      <DeleteAccountModal
        isOpen={deleteAccountModal}
        onClose={() => setDeleteAccountModal(false)}
        loading={loading}
        user={user}
      />

      {/* Background Overlay */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black ${
          changePassswordModal || loading
            ? "opacity-30 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />
    </main>
  );
};

export default UserProfile;
