import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function AppTitleManager() {
  const location = useLocation();

  useEffect(() => {
    const titles = {
      "/login": "Login",
      "/register": "Register",
      "/accountRecovery": "Account Recovery",
      "/accountRecovery/verification": "Verify Code",
      "/accountRecovery/reset": "Reset Password",
      "/dashboard": "Dashboard",
      "/bookings": "Bookings",
      "/UserProfile": "User Profile",
      "/admin": "Admin Dashboard",
      "/history": "Occupancy History",
      "/rooms": "Rooms",
      "/users": "Users",
      "/AdminProfile": "Admin Profile",
    };

    const baseTitle = "Bicol University College of Engineering";
    const path = location.pathname;

    let pageTitle;

    // Detect /room/:id pattern
    const roomMatch = path.match(/^\/room\/(\d+)$/);
    if (roomMatch) {
      const roomId = roomMatch[1];
      pageTitle = `Room ${roomId}`;
    } else {
      pageTitle = titles[path] || "";
    }

    document.title = pageTitle ? `${baseTitle} | ${pageTitle}` : baseTitle;
  }, [location.pathname]);

  return null;
}
