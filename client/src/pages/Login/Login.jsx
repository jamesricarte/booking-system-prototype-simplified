import React, { useState } from "react";
import Input from "../../components/Input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { handleFormChange } from "../../utils/formHandlers";

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
    <>
      <main className="flex flex-col items-center justify-center h-screen">
        <h2>Welcome to Classroom Booking</h2>
        <h3>Please enter the credentials to login</h3>
        <form className="flex flex-col" onSubmit={loginUser}>
          <label htmlFor="email">Email address:</label>
          <Input
            type="text"
            id="email"
            name="email"
            value={user.email}
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
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </main>
    </>
  );
};

export default Login;
