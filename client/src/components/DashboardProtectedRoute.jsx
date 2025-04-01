import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const DashboardProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return user.user_type === 1 ? children : <Navigate to="/admin" />;
};

export default DashboardProtectedRoute;
