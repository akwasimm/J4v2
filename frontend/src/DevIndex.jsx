import React from "react";
import { Link } from "react-router-dom";

const routes = [
  { category: "Public", links: [
    { path: "/", label: "Landing Page" },
    { path: "/v2-landing", label: "Experimental Landing (V2)" },
    { path: "/job", label: "Job Detail" },
    { path: "/skill-gap", label: "Skill Gap Analysis" },
  ]},
  { category: "Auth & Onboarding", links: [
    { path: "/join", label: "Join Community (Sign Up)" },
    { path: "/login", label: "Login" },
    { path: "/reset", label: "Reset Password" },
    { path: "/preferences", label: "Preferences Page" },
    { path: "/upload", label: "Upload Resume Page" },
  ]},
  { category: "Dashboard (Requires Layout)", links: [
    { path: "/user", label: "Dashboard (Now AI Recommendations)" },
    { path: "/user-archived", label: "User Dashboard (Archived)" },
    { path: "/applied", label: "Applied Jobs (Dashboard)" },
    { path: "/saved", label: "Saved Jobs" },
    { path: "/discover", label: "Job Discovery" },
    { path: "/opportunities", label: "Big Opportunities" },
    { path: "/coach", label: "Career Coach (Nova)" },
    { path: "/analyzer", label: "Resume Analyzer" },
    { path: "/ai", label: "AI Recommendations" },
    { path: "/merged", label: "Experimental Merged Board" },
    { path: "/insights", label: "Market Insights" },
    { path: "/profile", label: "Edit Profile" },
    { path: "/settings", label: "Settings" },
  ]}
];

export default function DevIndex() {
  return (
    <>
      <style>{`
        body { font-family: 'Space Grotesk', sans-serif; background-color: #f9f9f9; color: #111111; margin: 0; padding: 0; }
        .dev-link {
          display: block; padding: 12px 16px; margin-bottom: 8px;
          background: #ffffff; border: 2px solid #111111;
          color: #111111; text-decoration: none; font-weight: 700;
          box-shadow: 2px 2px 0px 0px #111111; transition: all 0.15s ease;
        }
        .dev-link:hover {
          transform: translate(-2px, -2px); box-shadow: 4px 4px 0px 0px #1A4D2E;
          background: #D8B4FE;
        }
      `}</style>
      <div style={{ maxWidth: "800px", margin: "40px auto", padding: "20px" }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "3rem", textTransform: "uppercase", marginBottom: "8px" }}>
          Dev Map
        </h1>
        <p style={{ color: "#4b5563", marginBottom: "32px", fontWeight: 500 }}>
          Temporary staging index. Click a link to easily view and test pages.
        </p>
        
        {routes.map((group, i) => (
          <div key={i} style={{ marginBottom: "32px" }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", marginBottom: "16px", color: "#1A4D2E", textTransform: "uppercase", borderBottom: "2px solid #111", paddingBottom: "8px" }}>
              {group.category}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "12px" }}>
              {group.links.map((link) => (
                <Link key={link.path} to={link.path} className="dev-link">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
        
        <div style={{ marginTop: "40px", paddingTop: "20px", borderTop: "2px solid rgba(0,0,0,0.1)", textAlign: "center", fontSize: "0.80rem", color: "#6b7280" }}>
          You can delete DevIndex.jsx when testing is finished.
        </div>
      </div>
    </>
  );
}
