import React, { useState } from "react";
import Input from "../../components/Input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { handleFormChange } from "../../utils/formHandlers";
import BackGroundBu from "../../assets/background/Background_bu.png";
import Logo from "../../assets/logo/Logo.png";
import { useBooking } from "../../context/BookingContext";
import { HiMiniEyeSlash } from "react-icons/hi2";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const { refreshUserOccupancyAndReservationData } = useBooking();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const { login } = useAuth();

  const [response, setResponse] = useState({
    isResponseAvailable: false,
    message: "",
    type: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleUserInput = handleFormChange(user, setUser);

  const loginUser = async (e) => {
    e.preventDefault();

    setLoading(true);
    const startTime = Date.now();
    let result;
    let message = { isResponseAvailable: false, message: "", type: "" };

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw errorData;
      }

      result = await response.json();
      login(result.fetchedUser);
      refreshUserOccupancyAndReservationData();
      result = result;
      message = {
        isResponseAvailable: true,
        message: result.message,
        type: "success",
      };
    } catch (error) {
      const errorMessage =
        error.message === "Failed to fetch"
          ? "Unable to connect to the server. Check your internet connection"
          : error.message;
      message = {
        isResponseAvailable: true,
        message: errorMessage,
        type: "error",
      };
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minimumTime = 1000;

      setTimeout(() => {
        setLoading(false);
        if (result?.fetchedUser.user_type === 0) {
          navigate("/admin");
        } else if (result?.fetchedUser.user_type === 1) {
          navigate("/dashboard");
        }
        setResponse({
          isResponseAvailable: message.isResponseAvailable,
          message: message.message,
          type: message.type,
        });
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  return (
    <>
      <main className="flex">
        <div className="w-[63vw] min-h-screen bg-white">
          <img
            src={BackGroundBu}
            alt=""
            className="object-cover w-full h-full opacity-90"
          />
        </div>

        <div className="flex flex-col flex-grow h-screen px-4 py-4 overflow-y-auto">
          <div className="my-auto">
            <div className="flex flex-col items-center gap-2 px-8">
              <img
                src={Logo}
                alt="Bicol University Logo"
                className="w-[80px]"
              />
              <h2 className="text-[22px]">
                Bicol University College of Engineering
              </h2>
            </div>
            <form className="flex flex-col py-6 px-13" onSubmit={loginUser}>
              <h1 className="mb-5 text-xl">Login</h1>
              <div className="flex flex-col gap-4 mb-3">
                <label htmlFor="email">Email Address</label>
                <Input
                  type="text"
                  id="email"
                  name="email"
                  value={user.email}
                  onChange={handleUserInput}
                  required={true}
                />
              </div>
              <div className="flex flex-col gap-4 mb-3">
                <label htmlFor="password">Password</label>
                <div className="relative w-full">
                  <Input
                    additionalClassName="w-full"
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={user.password}
                    onChange={handleUserInput}
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

              {response.isResponseAvailable && (
                <p
                  className={`mb-4 ${
                    response.type === "success"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {response.message}
                </p>
              )}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    className="w-3 h-3 cursor-pointer"
                  />
                  <label htmlFor="rememberMe">Remember me</label>
                </div>
                <Link
                  to="/accountRecovery"
                  className="text-[#FFA726] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type="submit"
                value="Login"
                className="mb-2 bg-[#B3E5FC] p-4 rounded-md cursor-pointer"
              />
            </form>
            <p className="mb-4 text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#FFA726]">
                Register
              </Link>
            </p>
            <div className="mt-12">
              <p className="text-sm text-center">
                © 2025 BUCENG | All Rights Reserved{" "}
              </p>
            </div>
          </div>
        </div>

        {/* Loading spinner */}
        <div
          className={`absolute z-10 w-8 h-8 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-6 rounded-1/2 border-t-transparent border-cyan-500 left-1/2 top-1/2 ${
            loading ? "block animate-spin" : "hidden"
          }`}
        ></div>

        {/* Background */}
        <div
          className={`fixed top-0 left-0 w-full h-full bg-white opacity-60 pointer-events-auto ${
            loading ? "block" : "hidden"
          }`}
        ></div>
      </main>
    </>
  );
};

export default Login;
