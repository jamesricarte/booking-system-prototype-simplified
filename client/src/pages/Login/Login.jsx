import React, { useState } from "react";
import Input from "../../components/Input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { handleFormChange } from "../../utils/formHandlers";
import BackGroundBu from "../../assets/background/Background_bu.png";
import Logo from "../../assets/logo/Logo.png";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
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

  const navigate = useNavigate();

  const handleUserInput = handleFormChange(user, setUser);

  const loginUser = async (e) => {
    e.preventDefault();

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
      //Use this errror handling for checking errors⬆️

      const result = await response.json();
      login(result.fetchedUser);
      setResponse({
        isResponseAvailable: true,
        message: result.message,
        type: "success",
      });
      if (result.fetchedUser.user_type === 0) {
        navigate("/admin");
      } else if (result.fetchedUser.user_type === 1) {
        navigate("/dashboard");
      }
    } catch (error) {
      //error variable will be the same as the response you gave from express (object)
      const errorMessage =
        error.message === "Failed to fetch"
          ? "Something went wrong with the server."
          : error.message;
      setResponse({
        isResponseAvailable: true,
        message: errorMessage,
        type: "error",
      });
    }
  };

  return (
    <div className="flex">
      <div className="h-screen">
        <img src={BackGroundBu} alt="" className="object-cover w-full h-full" />
      </div>
      <div className="flex flex-col flex-grow px-4 py-16">
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
        <form className="flex flex-col py-6 px-13" onSubmit={loginUser}>
          <h1 className="mb-5 text-2xl">Login</h1>
          <div className="flex flex-col gap-4 mb-5">
            <label htmlFor="email">Email address:</label>
            <Input
              type="text"
              id="email"
              name="email"
              value={user.email}
              onChange={handleUserInput}
              required={true}
            />
          </div>
          <div className="flex flex-col gap-4 mb-5">
            <label htmlFor="password">Password:</label>
            <Input
              type="password"
              id="password"
              name="password"
              value={user.password}
              onChange={handleUserInput}
              required={true}
            />
          </div>

          {response.isResponseAvailable && (
            <p
              className={`${
                response.type === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
              {response.message}
            </p>
          )}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="w-3 h-3" />
              <label htmlFor="" className="text-[19px]">
                Remember me
              </label>
            </div>
            <p className="text-[19px] text-[#FFA726]">Forget password?</p>
          </div>
          <Input
            type="submit"
            value="Login"
            className="mb-2 bg-[#B3E5FC] p-4 rounded-md"
          />
        </form>
        <p className="text-[19px] text-center mb-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#FFA726]">
            Register
          </Link>
        </p>
        <div className=" mt-80">
          <p className="mt-auto text-center">
            © 2025 BUCENG | All Rights Reserved{" "}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
