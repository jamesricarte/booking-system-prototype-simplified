import React, { useState, useEffect, useRef } from "react";
import BlankProfile from "../../../assets/image/elipse.png";
import { useAuth } from "../../../context/AuthContext";
import Input from "../../../components/Input";
import { RiCloseCircleFill } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { handleFormChange } from "../../../utils/formHandlers";

const API_URL = import.meta.env.VITE_API_URL;

const UserProfile = () => {
  const { user, login } = useAuth();

  // file upload
  const [file, setFile] = useState(null);

  const [imagePreview, setImagePreview] = useState(BlankProfile);
  const fileInputRef = useRef();

  //auth
  const [changePassswordModal, setChangePasswordModal] = useState(false);
  const [changePasswordData, setChangePasswordData] = useState({
    id: user.id,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changePasswordResponse, setChangePasswordResponse] = useState({
    isChangePasswordMessage: false,
    message: "",
    type: "",
  });

  const [loading, setLoading] = useState(false);
  const [profileUpdateLoading, setProfileUpdateLoading] = useState(false);
  const emailInputRef = useRef(null);

  const [editProfileForm, setEditProfileForm] = useState({
    isEditable: false,
    id: user.id,
    name: "",
    email: "",
    schoolId: "",
  });
  const [editProfileResponse, setEditProfileResponse] = useState({
    isEditProfileResponseAvailable: false,
    message: "",
    type: "",
  });

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
      schoolId: user.school_id || "",
    }));
  }, [user]);

  useEffect(() => {
    emailInputRef.current.focus();
  }, [editProfileForm.isEditable]);

  const changePassword = async (e) => {
    e.preventDefault();

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
      message = {
        isChangePasswordMessage: true,
        message: error.message,
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
    let message = { isBookingMessageAvaialable: false, message: "", type: "" };

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
      message = {
        isEditProfileResponseAvailable: true,
        message: error.message,
        type: "error",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        setProfileUpdateLoading(false);
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
      setImagePreview(`http://localhost:3000${user.profile_image}`);
    } else {
      setImagePreview(BlankProfile);
    }
  }, [user?.profile_image]);

  return (
    <main className="w-full h-full overflow-y-auto bg-white ccontainer">
      <div className="p-4">
        <h1 className="text-xl">Account Settings Section</h1>
      </div>
      <hr />
      <div className="py-7 px-14">
        <div className="relative flex">
          <div className="flex flex-col items-center w-[280px] mr-6">
            <img
              src={imagePreview || `http://localhost:3000${user.profile_image}`}
              alt="Profile"
              className="object-cover mb-4 rounded-full w-36 h-36"
            />

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

            <button
              className="px-4 py-2 mb-2 text-black bg-[#B3E5FC] rounded hover:bg-blue-300 cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              Select Image
            </button>

            {file && (
              <button
                className="px-4 py-2 mb-2 text-black bg-[#FFA726] rounded hover:bg-[#FFA720] cursor-pointer"
                onClick={async () => {
                  const formData = new FormData();
                  formData.append("file", file);
                  formData.append("id", user.id);

                  try {
                    const res = await fetch(`${API_URL}/api/uploadProfile`, {
                      method: "POST",
                      body: formData,
                    });

                    const result = await res.json();
                    setImagePreview(
                      `http://localhost:3000/${result.filePath.replace(
                        /^\/?/,
                        ""
                      )}`
                    );
                    login({ ...user, profile_image: result.filePath });
                    setFile(null);
                  } catch (error) {
                    console.error("Upload Failed", error);
                  }
                }}
              >
                Upload
              </button>
            )}

            <p className="text-sm text-center text-gray-500">
              File size maximum: 2MB
              <br />
              File extension: PNG/JPG
            </p>
          </div>

          <div className="border border-gray-200" />

          <div className="relative flex-1 pl-6">
            <form className="space-y-4" onSubmit={updateProfileInformation}>
              <div className="flex justify-end">
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
                  <p className="text-sm text-orange-500">Edit Information</p>
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
                <button
                  type="button"
                  onClick={() => setChangePasswordModal(true)}
                  className="px-4 py-2 text-black bg-[#EFEFEF] rounded hover:bg-gray-300 cursor-pointer"
                >
                  Change password
                </button>

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
                            schoolId: user.school_id,
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
            <Input
              className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
              type="password"
              id="newPassword"
              name="newPassword"
              value={changePasswordData.newPassword}
              onChange={handleChangePasswordFormData}
              required={true}
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <Input
              className="block w-full p-2 mt-1 border border-gray-300 rounded-md"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={changePasswordData.confirmPassword}
              onChange={handleChangePasswordFormData}
              required={true}
            />
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

          {/* White background */}
          <div
            className={`fixed top-0 left-0 w-full h-full bg-white opacity-50 pointer-events-auto z-10 ${
              loading ? "block" : "hidden"
            }`}
          ></div>
        </form>
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
        <p className="text-sm">{changePasswordResponse.message}</p>
      </div>

      {/* Update Profile Information Message */}
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
        <p className="text-sm">{editProfileResponse.message}</p>
      </div>

      {/* Background Overlay */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-black ${
          changePassswordModal
            ? "opacity-30 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />
    </main>
  );
};

export default UserProfile;
