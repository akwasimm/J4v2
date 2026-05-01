import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Topbar from "./Topbar";
import AppSidebar from "./AppSidebar";
import Footer from "./Footer";
import { fetchMe } from "../services/authService.js";

export default function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const hideFooter = location.pathname === "/coach";

  React.useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    fetchMe().catch(() => {});
  }, []);

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "#f5f5f0", width: "100%" }}>
      {/* Full-width Topbar */}
      <Topbar onProfileClick={handleProfileClick} />

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* Left Sidebar */}
        <AppSidebar />

        {/* Main Area */}
        <div style={{ 
          flex: 1, 
          overflowY: "auto", 
          position: "relative", 
          backgroundColor: "#ffffff",
          minHeight: 0,
          minWidth: 0
        }}>
          {children}
        </div>
      </div>

      {/* Full-width Footer - Hidden on Coach page */}
      {!hideFooter && <Footer />}
    </div>
  );
}
