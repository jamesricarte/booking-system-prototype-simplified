import React from 'react';
import './styles/App.css';
import { Routes, Route, useLocation } from 'react-router-dom';
import RedirectOnLoad from './components/RedirectOnLoad';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import DashboardProtectedRoute from './components/DashboardProtectedRoute';
import Bookings from './pages/Dashboard/Bookings/Bookings';
import RoomDetails from './pages/Dashboard/RoomDetails/RoomDetails';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminLayout from './layouts/AdminLayout/AdminLayout';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import UserProfile from './pages/Dashboard/UserProfile/UserProfile';
import HistoryOfOccupancy from './pages/AdminDashboard/HistoryOfOccupancy/HistoryOfOccupancy';
import Rooms from './pages/AdminDashboard/Rooms/rooms';
import Users from './pages/AdminDashboard/Users/users';
import AdminProfile from './pages/AdminDashboard/AdminProfile/AdminProfile';
import PasswordReset from './pages/Login/PasswordReset/PasswordReset';

const App = () => {
  const location = useLocation();

  return (
    <Routes>
      {/* Auth */}
      <Route path="/" element={<RedirectOnLoad />}></Route>
      <Route path="/login" element={<Login />}></Route>
      <Route path="/register" element={<Register />}></Route>
      <Route path="/password-reset" element={<PasswordReset />} />

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
        <Route
          path="/room/:id"
          element={<RoomDetails key={location.key} />}
        ></Route>
        <Route path="/userProfile" element={<UserProfile />}></Route>
      </Route>

      {/* Admin */}
      <Route
        element={
          <AdminProtectedRoute>
            <AdminLayout />
          </AdminProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboard />}></Route>
        <Route path="/history" element={<HistoryOfOccupancy />}></Route>
        <Route path="/rooms" element={<Rooms />}></Route>
        <Route path="/users" element={<Users />}></Route>
        <Route path="/adminProfile" element={<AdminProfile />}></Route>
      </Route>
    </Routes>
  );
};

export default App;
