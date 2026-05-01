import React from "react";
import { getProfile } from "../services/profileService.js";

// Helper to prepend backend URL for file paths
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || "http://localhost:8000";
const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

const styles = {
  topbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "64px",
    backgroundColor: "#ffffff",
    borderBottom: "2.5px solid #111111",
    padding: "0 28px",
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#111111",
    letterSpacing: "-0.02em",
    cursor: "pointer",
    userSelect: "none",
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  },
  logoDot: {
    color: "#111111",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "6px",
    borderRadius: "6px",
    color: "#111111",
    transition: "background 0.15s",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: "8px",
    border: "1.5px solid #e0e0d8",
    transition: "background 0.15s",
  },
  avatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#b0c4de",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  avatarInner: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8faec8",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
  },
  userName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#111111",
    letterSpacing: "0.04em",
    whiteSpace: "nowrap",
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  },
  userRole: {
    fontSize: "11px",
    fontWeight: "400",
    color: "#666666",
    letterSpacing: "0.02em",
    whiteSpace: "nowrap",
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  },
};

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const AvatarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="#ffffff" stroke="#ffffff" strokeWidth="1">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

export default function Topbar({
  onSearch,
  onNotifications,
  onLogoClick,
  onProfileClick,
}) {
  const [userName, setUserName] = React.useState("USER");
  const [avatarUrl, setAvatarUrl] = React.useState(getFileUrl(localStorage.getItem("user_avatar_url")) || "");

  React.useEffect(() => {
    const fetchUserName = async () => {
      try {
        const profileData = await getProfile();
        // Backend returns: { profile: { first_name, ... }, ... }
        setUserName((profileData.profile?.first_name || "USER").toUpperCase());
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    // Initial load from localStorage or API
    const storedName = localStorage.getItem("user_first_name");
    if (storedName) {
      setUserName(storedName.toUpperCase());
    } else {
      fetchUserName();
    }
    const storedAvatar = localStorage.getItem("user_avatar_url");
    if (storedAvatar) {
      setAvatarUrl(getFileUrl(storedAvatar));
    }

    // Listen for profile updates
    const handleProfileUpdate = () => {
      fetchUserName();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
      <header style={styles.topbar}>
        {/* Logo */}
        <div style={styles.logo} onClick={onLogoClick}>
          JOBFOR<span style={styles.logoDot}>.</span>
        </div>

        {/* Right Section */}
        <div style={styles.rightSection}>
          {/* Search */}
          <button
            style={styles.iconBtn}
            onClick={onSearch}
            title="Search"
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0ea")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <SearchIcon />
          </button>

          {/* Notifications */}
          <button
            style={styles.iconBtn}
            onClick={onNotifications}
            title="Notifications"
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0ea")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <BellIcon />
          </button>

          {/* User Profile */}
          <div
            style={styles.userSection}
            onClick={onProfileClick}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f0")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <div style={styles.avatar}>
              {getFileUrl(avatarUrl) ? (
                <img src={getFileUrl(avatarUrl)} alt={userName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={styles.avatarInner}>
                  <AvatarIcon />
                </div>
              )}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{userName}</span>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
