import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const RedirectOnLoad = () => {
  const { user } = useAuth();

  //Should fetch first the user in database if matching
  if (!user) {
    return <Navigate to="/login" />;
  } else {
    return (
      <Navigate to={`${user.user_type === 0 ? "/history" : "/bookings"}`} />
    );
  }
};

export default RedirectOnLoad;
