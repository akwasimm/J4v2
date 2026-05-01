import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getProfile } from "../services/profileService.js";
import { useAIScore } from "../contexts/AIScoreContext";

const navItems = [
  {
    id: "dashboard",
    label: "DASHBOARD",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    id: "discover",
    label: "DISCOVER JOBS",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    id: "insights",
    label: "INSIGHTS",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <polyline points="7 16 10 11 13 14 16 9" />
      </svg>
    ),
  },
  {
    id: "bigopps",
    label: "BIG OPPS",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: "saved",
    label: "SAVED JOBS",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "aicoach",
    label: "AI COACH",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="10" r="3" />
        <path d="M6.168 18.849A4 4 0 0 1 10 16h4a4 4 0 0 1 3.834 2.855" />
      </svg>
    ),
  },
  {
    id: "resume",
    label: "RESUME ANALYZER",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <line x1="8" y1="8" x2="16" y2="8" />
        <line x1="8" y1="12" x2="16" y2="12" />
        <line x1="8" y1="16" x2="12" y2="16" />
        <polyline points="15 14 17 16 21 12" />
      </svg>
    ),
  },
  {
    id: "skillgap",
    label: "SKILL GAP",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20V10" />
        <path d="M18 20V4" />
        <path d="M6 20v-4" />
        <line x1="2" y1="22" x2="22" y2="22" />
        <circle cx="12" cy="10" r="2" fill="currentColor" />
        <circle cx="18" cy="4" r="2" fill="currentColor" />
        <circle cx="6" cy="16" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "settings",
    label: "SETTINGS",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

const styles = {
  sidebar: {
    display: "flex",
    flexDirection: "column",
    width: "220px",
    height: "100%",
    backgroundColor: "#f5f5f0",
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
    position: "relative",
    borderRight: "1px solid #e0e0d8",
  },
  nav: {
    flex: 1,
    paddingTop: "8px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "13px 20px",
    cursor: "pointer",
    color: "#1a1a1a",
    fontSize: "13px",
    fontWeight: "600",
    letterSpacing: "0.06em",
    transition: "background 0.15s ease",
    userSelect: "none",
    borderLeft: "3px solid transparent",
  },
  navItemActive: {
    backgroundColor: "#2d6a4f",
    color: "#ffffff",
    borderLeft: "3px solid #1a4a35",
  },
  navItemHover: {
    backgroundColor: "#e8e8e2",
  },
  icon: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  matchScoreBox: {
    margin: "12px",
    padding: "14px 16px",
    backgroundColor: "#d8b4fe",
    borderRadius: "6px",
  },
  matchScoreLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: "0.05em",
    marginBottom: "2px",
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  },
  matchScoreValue: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#1a1a1a",
    lineHeight: 1.1,
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
    letterSpacing: "-0.01em",
  },
  matchScoreSubtext: {
    fontSize: "11px",
    color: "#3a3a3a",
    marginTop: "3px",
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  },
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { aiScore } = useAIScore();
  const [profileCompletion, setProfileCompletion] = useState(0);

  // Skip showing AI score on /discover and /user pages
  const hideAIScore = location.pathname === "/discover" || location.pathname === "/user";

  useEffect(() => {
    const fetchProfileCompletion = async () => {
      try {
        const profileData = await getProfile();
        // Backend returns: { profile: { profile_completion, ... }, ... }
        setProfileCompletion(profileData.profile?.profile_completion || 0);
      } catch (error) {
        console.error("Error fetching profile completion:", error);
      }
    };
    fetchProfileCompletion();

    // Listen for profile updates from other components
    const handleProfileUpdate = () => {
      fetchProfileCompletion();
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [location.pathname]);

  const getPathForId = (id) => {
    switch(id) {
      case "dashboard": return "/user";
      case "discover": return "/discover";
      case "insights": return "/insights";
      case "bigopps": return "/opportunities";
      case "saved": return "/saved";
      case "aicoach": return "/coach";
      case "resume": return "/analyzer";
      case "skillgap": return "/skillgap";
      case "settings": return "/settings";
      default: return "/";
    }
  };

  const getIdForPath = (pathname) => {
    if (pathname.includes("/user")) return "dashboard";
    if (pathname.includes("/discover")) return "discover";
    if (pathname.includes("/insights")) return "insights";
    if (pathname.includes("/opportunities")) return "bigopps";
    if (pathname.includes("/saved")) return "saved";
    if (pathname.includes("/coach")) return "aicoach";
    if (pathname.includes("/analyzer")) return "resume";
    if (pathname.includes("/skillgap")) return "skillgap";
    if (pathname.includes("/settings")) return "settings";
    return "dashboard";
  };

  const [active, setActive] = useState(getIdForPath(location.pathname));
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    setActive(getIdForPath(location.pathname));
  }, [location.pathname]);

  const handleClick = (id) => {
    setActive(id);
    navigate(getPathForId(id));
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
      <div style={styles.sidebar}>
        <nav style={styles.nav}>
          {navItems.map((item) => {
            const isActive = active === item.id;
            const isHovered = hovered === item.id && !isActive;

            return (
              <div
                key={item.id}
                style={{
                  ...styles.navItem,
                  ...(isActive ? styles.navItemActive : {}),
                  ...(isHovered ? styles.navItemHover : {}),
                }}
                onClick={() => handleClick(item.id)}
                onMouseEnter={() => setHovered(item.id)}
                onMouseLeave={() => setHovered(null)}
              >
                <span style={styles.icon}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* AI Match Score Box - Hidden on /discover and /user */}
        {!hideAIScore && (
          <div style={styles.matchScoreBox}>
            <div style={styles.matchScoreLabel}>AI MATCH SCORE</div>
            <div style={styles.matchScoreValue}>{aiScore !== null ? `${aiScore}%` : "--"}</div>
            <div style={styles.matchScoreSubtext}>Profile is {profileCompletion}% complete</div>
          </div>
        )}
      </div>
    </>
  );
}
