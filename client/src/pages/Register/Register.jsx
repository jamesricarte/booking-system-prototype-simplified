import React, { useState } from "react";
import Input from "../../components/Input";
import { Link, useNavigate } from "react-router-dom";
import { handleFormChange } from "../../utils/formHandlers";
import BackGroundBu from "../../assets/background/Background_bu.png";
import Logo from "../../assets/logo/Logo.png";

const API_URL = import.meta.env.VITE_API_URL;

const Register = () => {
  const [user, setUser] = useState({
    email: "",
    schoolId: "",
    password: "",
    confirmPassword: "",
  });

  const [response, setResponse] = useState({
    isResponseAvailable: false,
    message: "",
    type: "",
  });

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleUserInput = handleFormChange(user, setUser);

  const registerUser = async (e) => {
    e.preventDefault();

    setLoading(true);
    const startTime = Date.now();
    let message = { isResponseAvailable: false, message: "", type: "" };

    try {
      const response = await fetch(`${API_URL}/api/register`, {
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

      const result = await response.json();
      message = {
        isResponseAvailable: true,
        message: result.message,
        type: "success",
      };
    } catch (error) {
      const errorMessage =
        error.message === "Failed to fetch"
          ? "Something went wrong with the server."
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
        setResponse({
          isResponseAvailable: message.isResponseAvailable,
          message: message.message,
          type: message.type,
        });
        if (message.type === "success") {
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        }
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };

  return (
    <main className="flex">
      <div className="w-[70vw] 2xl:w-[65vw] min-h-screen">
        <img
          src={BackGroundBu}
          alt=""
          className="object-cover w-full h-full opacity-80"
        />
      </div>
      <div className="flex flex-col justify-center flex-grow px-4 my-12">
        <div className="flex items-center px-8">
          <img
            src={Logo}
            alt="Bicol University Logo"
            className="w-[91px] h-[91px]"
          />
          <h2 className="text-[22px]">
            Bicol University College of Engineering
          </h2>
        </div>
        <form className="flex flex-col p-6 px-13" onSubmit={registerUser}>
          <h1 className="mb-5 text-2xl">Sign Up</h1>
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
            <label htmlFor="schoolId">School Id</label>
            <Input
              type="text"
              id="schoolId"
              name="schoolId"
              value={user.schoolId}
              onChange={handleUserInput}
              required={true}
            />
          </div>
          <div className="flex flex-col gap-4 mb-3">
            <label htmlFor="password">Password</label>
            <Input
              type="password"
              id="password"
              name="password"
              value={user.password}
              onChange={handleUserInput}
              required={true}
            />
          </div>
          <div className="flex flex-col gap-4 mb-7">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={user.confirmPassword}
              onChange={handleUserInput}
              required={true}
            />
          </div>

          {response.isResponseAvailable && (
            <p
              className={`mb-4 ${
                response.type === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
              {response.message}
              {response.type === "success" && "... Redirecting to login"}
            </p>
          )}
          <Input
            type="submit"
            value="Register"
            className=" bg-[#B3E5FC] p-4 rounded-md cursor-pointer"
          />
        </form>
        <p className="mb-4 text-lg text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-[#FFA726]">
            Login
          </Link>
        </p>
        <div className="mt-12">
          <p className="text-sm text-center">
            © 2025 BUCENG | All Rights Reserved{" "}
          </p>
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
  );
};

export default Register;
