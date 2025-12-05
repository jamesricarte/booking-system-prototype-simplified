import "./styles/App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import RedirectOnLoad from "./components/RedirectOnLoad";
import AppTitleManager from "./components/AppTitleManager";

//Auth
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import AccountRecovery from "./pages/Login/AccountRecovery/AccountRecovery";
import VerifyCode from "./pages/Login/AccountRecovery/VerifyCode";
import ResetPassword from "./pages/Login/AccountRecovery/ResetPassword";

//Dashboard
import DashboardProtectedRoute from "./components/DashboardProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout/DashboardLayout";
import Bookings from "./pages/Dashboard/Bookings/Bookings";
import MyClassSchedule from "./pages/Dashboard/MyClassSchedule/MyClassSchedule";
import RoomDetails from "./pages/Dashboard/RoomDetails/RoomDetails";
import UserProfile from "./pages/Dashboard/UserProfile/UserProfile";

//Admin
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AdminLayout from "./layouts/AdminLayout/AdminLayout";
import AdminBookings from "./pages/AdminDashboard/AdminBookings/AdminBookings";
import AdminRoomDetails from "./pages/AdminDashboard/AdminRoomDetails/AdminRoomDetails";
import HistoryOfOccupancy from "./pages/AdminDashboard/HistoryOfOccupancy/HistoryOfOccupancy";
import AdminProfile from "./pages/AdminDashboard/AdminProfile/AdminProfile";

const App = () => {
  const location = useLocation();

  return (
    <>
      <AppTitleManager />

      <Routes>
        {/* Auth */}
        <Route path="/" element={<RedirectOnLoad />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/register" element={<Register />}></Route>
        <Route path="/accountRecovery" element={<AccountRecovery />} />
        <Route path="/accountRecovery/verification" element={<VerifyCode />} />
        <Route path="/accountRecovery/reset" element={<ResetPassword />} />

        {/* Dashboard */}
        <Route
          element={
            <DashboardProtectedRoute>
              <DashboardLayout />
            </DashboardProtectedRoute>
          }
        >
          <Route path="/bookings" element={<Bookings />}></Route>
          <Route path="/myClassSchedule" element={<MyClassSchedule />}></Route>
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
          <Route path="/adminBookings" element={<AdminBookings />}></Route>
          <Route
            path="/admin/room/:id"
            element={<AdminRoomDetails key={location.key} />}
          ></Route>
          <Route path="/history" element={<HistoryOfOccupancy />}></Route>
          <Route path="/adminProfile" element={<AdminProfile />}></Route>
        </Route>
      </Routes>
    </>
  );
};

export default App;
