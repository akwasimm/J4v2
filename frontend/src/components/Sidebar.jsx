import React, { useState } from "react";

const activityData = [
  { id: 1, color: "#1A4D2E", text: 'Applied to "Senior Designer"', path: "/coach", label: "Career Coach (Lume)", time: "2 hours ago" },
  { id: 2, color: "#D8B4FE", text: "Updated your Portfolio link", time: "5 hours ago" },
  { id: 3, color: "#FACC15", text: 'Saved "Lead Engineer" position at Flow Systems', time: "Yesterday" },
  { id: 4, color: "#1A4D2E", text: "Interview confirmed with Stellar Startups", time: "2 days ago" },
];

export default function Sidebar() {
  const [historyHover, setHistoryHover] = useState(false);
  const [updateSkillsHover, setUpdateSkillsHover] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px", width: "100%" }}>
      {/* Recent Activity */}
      <div style={{ backgroundColor: "#ffffff", border: "2px solid #000000", padding: "16px", boxShadow: "4px 4px 0px 0px #000000" }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "16px", borderBottom: "3px solid #D8B4FE", paddingBottom: "6px", display: "inline-block", fontFamily: "'Syne', sans-serif", margin: 0 }}>
          Recent Activity
        </h3>
        <ul style={{ display: "flex", flexDirection: "column", gap: "16px", listStyle: "none", padding: 0, margin: "16px 0 0 0" }}>
          {activityData.map((item) => (
            <li key={item.id} style={{ display: "flex", gap: "16px" }}>
              <div style={{ marginTop: "6px", width: "12px", height: "12px", backgroundColor: item.color, border: "2px solid #000000", flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 700, fontSize: "0.875rem", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>{item.text}</p>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "4px", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>{item.time}</p>
              </div>
            </li>
          ))}
        </ul>
        <button
          onMouseEnter={() => setHistoryHover(true)}
          onMouseLeave={() => setHistoryHover(false)}
          style={{ width: "100%", marginTop: "32px", border: "2px solid #000000", padding: "12px", fontWeight: 700, backgroundColor: historyHover ? "#f3f4f6" : "#ffffff", cursor: "pointer", transition: "background-color 0.15s ease", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.875rem" }}
        >
          View Full History
        </button>
      </div>

      {/* AI Coach Tip */}
      <div style={{ backgroundColor: "#1A4D2E", color: "#ffffff", border: "2px solid #000000", padding: "16px", boxShadow: "4px 4px 0px 0px #000000", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: "-16px", bottom: "-16px", opacity: 0.2 }}>
          <span className="material-symbols-outlined" style={{ fontSize: "6rem" }}>smart_toy</span>
        </div>
        <h3 style={{ fontSize: "1rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px", fontFamily: "'Syne', sans-serif", margin: 0 }}>
          <span className="material-symbols-outlined">lightbulb</span>
          AI Coach Tip
        </h3>
        <p style={{ fontSize: "0.875rem", fontWeight: 500, lineHeight: 1.7, fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
          "Your profile match for Tech Roles could increase by 15% if you add 'Systems Design' to your skill list based on your recent applications."
        </p>
        <button
          onMouseEnter={() => setUpdateSkillsHover(true)}
          onMouseLeave={() => setUpdateSkillsHover(false)}
          style={{ marginTop: "24px", backgroundColor: "#D8B4FE", color: "#000000", fontWeight: 700, padding: "8px 16px", border: "2px solid #000000", fontSize: "0.75rem", textTransform: "uppercase", boxShadow: updateSkillsHover ? "none" : "3px 3px 0px 0px #000000", transform: updateSkillsHover ? "translate(1px,1px)" : "translate(0,0)", cursor: "pointer", transition: "all 0.15s ease", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}
        >
          Update Skills
        </button>
      </div>

      {/* Next Interview */}
      <div style={{ backgroundColor: "rgba(216,180,254,0.2)", border: "2px solid #000000", padding: "16px", boxShadow: "4px 4px 0px 0px #000000" }}>
        <h3 style={{ fontSize: "1.125rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "16px", fontFamily: "'Syne', sans-serif", margin: 0 }}>
          Next Interview
        </h3>
        <div style={{ backgroundColor: "#ffffff", border: "2px solid #000000", padding: "16px", boxShadow: "3px 3px 0px 0px #000000" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 900, color: "#1A4D2E", textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>
            Tomorrow at 10:00 AM
          </p>
          <h4 style={{ fontWeight: 700, marginTop: "4px", fontFamily: "'Syne', sans-serif", margin: 0 }}>Product Strategy Meeting</h4>
          <p style={{ fontSize: "0.875rem", color: "#4b5563", fontFamily: "'Space Grotesk', sans-serif", margin: 0 }}>With Jane Doe from InnovateX</p>
          <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
            <button style={{ backgroundColor: "#000000", color: "#ffffff", padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", border: "none", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>Join Call</button>
            <button style={{ backgroundColor: "#ffffff", color: "#000000", padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", border: "1px solid #000000", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif" }}>Details</button>
          </div>
        </div>
      </div>
    </div>
  );
}
