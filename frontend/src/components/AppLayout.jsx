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
  const [showFooter, setShowFooter] = React.useState(false);
  const contentRef = React.useRef(null);
  const hideTimeoutRef = React.useRef(null);

  React.useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    fetchMe().catch(() => {});
  }, []);

  React.useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = content;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;

      if (isAtBottom) {
        // Show immediately when at bottom
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        setShowFooter(true);
      } else {
        // Delay hiding by 3 seconds
        if (showFooter && !hideTimeoutRef.current) {
          hideTimeoutRef.current = setTimeout(() => {
            setShowFooter(false);
            hideTimeoutRef.current = null;
          }, 3000);
        }
      }
    };

    content.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => {
      content.removeEventListener("scroll", handleScroll);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [showFooter]);

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
        <div 
          ref={contentRef}
          style={{ 
            flex: 1, 
            overflowY: "auto", 
            position: "relative", 
            backgroundColor: "#ffffff",
            minHeight: 0,
            minWidth: 0
          }}
        >
          {children}
        </div>
      </div>

      {/* Full-width Footer - Hidden on Coach page, shown only at bottom */}
      {!hideFooter && showFooter && <Footer />}
    </div>
  );
}
