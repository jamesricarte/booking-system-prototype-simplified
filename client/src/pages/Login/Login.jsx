import React, { useState } from "react";
import Input from "../../components/Input";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const [user, setUser] = useState({
    schoolId: "",
    password: "",
  });

  const { login } = useAuth();

  const [response, setResponse] = useState({
    isResponseAvailable: false,
    message: "",
    type: "",
  });

  const navigate = useNavigate();

  const handleUserInput = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

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

      const result = await response.json();
      login(result.fetchedUser);
      setResponse({
        isResponseAvailable: true,
        message: result.message,
        type: "success",
      });
      if (result.fetchedUser.userType === 1) {
        navigate("/admin");
      } else if (result.fetchedUser.userType === 2) {
        navigate("/dashboard");
      }
    } catch (error) {
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
        <h2>Welcome to Classroom Booking</h2>
        <h3>Please enter the credentials to login</h3>
        <form className="flex flex-col" onSubmit={loginUser}>
          <label htmlFor="schoolId">School Id:</label>
          <Input
            type="text"
            id="schoolId"
            name="schoolId"
            value={user.schoolId}
            onChange={handleUserInput}
          />
          <label htmlFor="password">Password:</label>
          <Input
            type="password"
            id="password"
            name="password"
            value={user.password}
            onChange={handleUserInput}
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
          <p>
            Forget password? <a href="">Go here</a>
          </p>
          <Input type="submit" value="Login" />
        </form>
      </main>
    </>
  );
};

export default Login;
