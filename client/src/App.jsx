import React from "react";
import "./styles/App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import DashboardProtectedRoute from "./components/DashboardProtectedRoute";
import Dashboard from "./pages/Dashboard/Dashboard";
import RoomDetails from "./pages/Dashboard/RoomDetails/RoomDetails";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import Admin from "./pages/Admin/Admin";

import BookingCalendar from "./pages/Dashboard/BookingCalendar";
import TrackingPositionTest from "./pages/Dashboard/TrackingPositionTest";

const App = () => {
  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<Login />}></Route>
      <Route path="/login" element={<Login />}></Route>

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
        path="/room/:id"
        element={
          <DashboardProtectedRoute>
            <RoomDetails />
          </DashboardProtectedRoute>
        }
      ></Route>

      <Route path="/booking/calendar" element={<BookingCalendar />}></Route>
      <Route
        path="/TrackingPositionTest"
        element={<TrackingPositionTest />}
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
