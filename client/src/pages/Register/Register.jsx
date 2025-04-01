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

  const navigate = useNavigate();

  const handleUserInput = handleFormChange(user, setUser);

  const registerUser = async (e) => {
    e.preventDefault();

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
      setResponse({
        isResponseAvailable: true,
        message: result.message,
        type: "success",
      });
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error(error);
      setResponse({
        isResponseAvailable: true,
        message: error.message,
        type: "error",
      });
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
      </main>
    </>
  );
};

export default Register;
