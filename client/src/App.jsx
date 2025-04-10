import React from "react";
import "./styles/App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import DashboardProtectedRoute from "./components/DashboardProtectedRoute";
import Bookings from "./pages/Dashboard/Bookings/Bookings";
import RoomDetails from "./pages/Dashboard/RoomDetails/RoomDetails";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

import DashboardLayout from "./layouts/DasboardLayout/DashboardLayout";
import Dashboard from "./pages/Dashboard/Dashboard";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard/AdminDashboard";

const App = () => {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<Login />}></Route>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/register" element={<Register />}></Route>

      {/* Dashboard */}
      <Route
        element={
          <DashboardProtectedRoute>
            <DashboardLayout />
          </DashboardProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />}></Route>
        <Route path="/bookings" element={<Bookings />}></Route>
        <Route path="/room/:id" element={<RoomDetails />}></Route>
      </Route>

      {/* Admin */}
      <Route
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
};

export default App;
