import React, { useEffect, useState } from "react";
import Input from "../../../components/Input";
import Background from "../../../assets/background/Background_bu.png";
import Logo from "../../../assets/logo/Logo.png";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const email = searchParams.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState({
    isMessageAvailable: false,
    message: "",
    type: "",
  });

  const [loading, setLoading] = useState(false);

  const handleClose = () => navigate("/login");

  useEffect(() => {
    const resetDone = localStorage.getItem("passwordResetDone");

    if (!email || !location.state?.verifiedCode) {
      return navigate("/accountRecovery");
    }

    if (resetDone) {
      navigate("/accountRecovery");
    }
  }, [email, location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const startTime = Date.now();
    let result;
    let message = { isMessageAvailable: false, message: "", type: "" };

    try {
      const response = await fetch(`${API_URL}/api/resetPassword`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: newPassword,
          confirmPassword: confirmPassword,
          email: email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      result = await response.json();
      message = {
        isMessageAvailable: true,
        message: result.message,
        type: "success",
      };
    } catch (error) {
      const errormessage =
        error.message === "Failed to fetch"
          ? "Something went wrong with the server."
          : error.message;

      message = {
        isMessageAvailable: true,
        message: errormessage,
        type: "error",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        setLoading(false);

        setTimeout(() => {
          if (message.type === "success") {
            localStorage.setItem("passwordResetDone", "true");
            navigate("/login");
          }
        }, 2000);
        setMessage({
          isMessageAvailable: message.isMessageAvailable,
          message: message.message,
          type: message.type,
        });
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  return (
    <main
      className="flex items-center justify-center min-h-screen bg-black/30"
      style={{
        backgroundImage: `url(${Background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="relative bg-white py-4 rounded-xs shadow-lg w-[40vw] h-[80vh] flex flex-col justify-center overflow-y-auto">
        <div
          onClick={handleClose}
          className="absolute flex items-center cursor-pointer top-6 right-6"
        >
          <button className="flex items-center justify-center w-4 h-4 mb-0.5 text-lg font-bold text-white bg-red-500 rounded-full cursor-pointer">
            ×
          </button>
          <span className="ml-2 font-bold text-red-500">Cancel</span>
        </div>

        <div className="flex flex-col px-[4vw]">
          <div className="flex flex-col items-center justify-center mb-10">
            <img src={Logo} alt="BU Logo" className="w-22" />
            <span className="text-xl font-bold">
              Bicol University College of Engineering
            </span>
          </div>

          <div className="flex flex-col pb-10">
            <span className="text-lg font-semibold">Reset your password</span>
            <span className="pb-8 text-sm text-gray-500">
              Please enter your new password below.
            </span>
            <form onSubmit={handleSubmit}>
              <label htmlFor="newPassword" className="block mb-2 font-medium">
                New Password
              </label>
              <Input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="block w-full p-4 mb-5 text-sm bg-gray-100 rounded-md"
              />
              <label
                htmlFor="confirmPassword"
                className="block mb-2 font-medium"
              >
                Confirm Password
              </label>
              <Input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="block w-full p-4 mb-5 text-sm bg-gray-100 rounded-md"
              />

              {message.isMessageAvailable && (
                <p
                  className={`mb-4 ${
                    message.type === "success"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {message.message}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#B3E5FC] rounded-md font-bold cursor-pointer"
              >
                Reset Password
              </button>
            </form>
          </div>
        </div>

        {/* White background */}
        <div
          className={`absolute top-0 left-0 w-full h-full bg-white opacity-50 pointer-events-auto z-10 ${
            loading ? "block" : "hidden"
          }`}
        ></div>
      </div>

      {/* Loading spinner */}
      <div
        className={`absolute z-10 w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-6 rounded-1/2 border-t-transparent border-cyan-500 left-1/2 top-1/2 ${
          loading ? "block animate-spin" : "hidden"
        }`}
      ></div>
    </main>
  );
};

export default ResetPassword;
