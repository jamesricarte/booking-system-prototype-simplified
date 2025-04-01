import React from "react";
import "./styles/App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import DashboardProtectedRoute from "./components/DashboardProtectedRoute";
import Dashboard from "./pages/Dashboard/Dashboard";
import Bookings from "./pages/Dashboard/Bookings/Bookings";
import RoomDetails from "./pages/Dashboard/RoomDetails/RoomDetails";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Admin from "./pages/Admin/Admin";

const App = () => {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<Login />}></Route>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/register" element={<Register />}></Route>

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <DashboardProtectedRoute>
            <Dashboard />
          </DashboardProtectedRoute>
        }
      ></Route>

      <Route
        path="/bookings"
        element={
          <DashboardProtectedRoute>
            <Bookings />
          </DashboardProtectedRoute>
        }
      ></Route>

      <Route
        path="/room/:id"
        element={
          <DashboardProtectedRoute>
            <RoomDetails />
          </DashboardProtectedRoute>
        }
      ></Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <Admin />
          </AdminProtectedRoute>
        }
      ></Route>
    </Routes>
  );
};

export default App;
