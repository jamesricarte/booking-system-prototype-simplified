import React, { useState } from "react";
import Input from "../../components/Input";
import { Link, useNavigate } from "react-router-dom";
import { handleFormChange } from "../../utils/formHandlers";

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
      message = {
        isResponseAvailable: true,
        message: error.message,
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
          }, 1500);
        }
      }, Math.max(0, minimumTime - elapsedTime));
    }
  };
  return (
    <>
      <main className="flex flex-col items-center justify-center h-screen">
        <h3>Sign up</h3>
        <form className="flex flex-col" onSubmit={registerUser}>
          <label htmlFor="email">Email Address:</label>
          <Input
            type="text"
            id="email"
            name="email"
            value={user.email}
            onChange={handleUserInput}
            required={true}
          />
          <label htmlFor="schoolId">School Id:</label>
          <Input
            type="text"
            id="schoolId"
            name="schoolId"
            value={user.schoolId}
            onChange={handleUserInput}
            required={true}
          />
          <label htmlFor="password">Password:</label>
          <Input
            type="password"
            id="password"
            name="password"
            value={user.password}
            onChange={handleUserInput}
            required={true}
          />
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <Input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={user.confirmPassword}
            onChange={handleUserInput}
            required={true}
          />

          {response.isResponseAvailable && (
            <p
              className={`${
                response.type === "success" ? "text-green-500" : "text-red-500"
              }`}
            >
              {response.message}
            </p>
          )}
          <Input type="submit" value="Register" />
        </form>
        <p>
          Already have an account? <Link to="/login">login</Link>
        </p>

        {/* Loading spinner */}
        <div
          className={`absolute z-10 w-5 h-5 transform -translate-x-1/2 -translate-y-1/2 rounded-full border-5 rounded-1/2 border-t-transparent border-cyan-500 left-1/2 top-1/2 ${
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

export default Register;
