import React, { useState, useEffect } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────


const statsData = [
  { id: 1, icon: "send", iconColor: "#1A4D2E", badge: "+12%", badgeBg: "#dcfce7", badgeColor: "#000000", value: "48", label: "Applied Jobs", cardBg: "#ffffff", textColor: "#000000", labelColor: "#4b5563" },
  { id: 2, icon: "bookmark", iconColor: "#000000", badge: "2 New", badgeBg: "rgba(255,255,255,0.5)", badgeColor: "#000000", value: "15", label: "Saved Jobs", cardBg: "#D8B4FE", textColor: "#000000", labelColor: "#000000" },
  { id: 3, icon: "event", iconColor: "#FACC15", badge: "Today", badgeBg: "#fef9c3", badgeColor: "#000000", value: "03", label: "Interviews", cardBg: "#ffffff", textColor: "#000000", labelColor: "#4b5563" },
  { id: 4, icon: "person", iconColor: "#D8B4FE", badge: "Complete", badgeBg: "rgba(255,255,255,0.2)", badgeColor: "#ffffff", value: "85%", label: "Profile Completion", cardBg: "#1A4D2E", textColor: "#ffffff", labelColor: "#bbf7d0" },
];

const jobsData = [
  { id: 1, iconBg: "#dbeafe", icon: "language", iconColor: "#2563eb", title: "Senior UX Designer", company: "Tech Giants • Mountain View, CA", match: 98, tags: ["Remote", "₹150k - ₹220k", "Figma"] },
  { id: 2, iconBg: "#fef9c3", icon: "shopping_cart", iconColor: "#ca8a04", title: "Product Lead", company: "Global Commerce • Seattle, WA", match: 85, tags: ["Hybrid", "₹180k - ₹250k", "Agile"] },
  { id: 3, iconBg: "#dcfce7", icon: "terminal", iconColor: "#16a34a", title: "Frontend Architect", company: "Software Solutions • Redmond, WA", match: 72, tags: ["On-site", "₹160k - ₹210k", "React"] },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ value }) {
  return (
    <div style={{ height: "16px", width: "128px", backgroundColor: "#e5e7eb", border: "2px solid #000000", overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${value}%`, backgroundColor: "#1A4D2E", transition: "width 0.6s ease" }} />
    </div>
  );
}

function NeoButton({ children, onClick, bg = "#ffffff", color = "#000000", border = "2px solid #000000", shadow = "3px 3px 0px 0px #000000", style = {} }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: bg, color, border,
        boxShadow: hovered ? "none" : shadow,
        transform: hovered ? "translate(1px,1px)" : "translate(0,0)",
        transition: "all 0.15s ease",
        fontWeight: 700, padding: "8px 24px", cursor: "pointer",
        fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.875rem",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function JobCard({ job }) {
  return (
    <div style={{ backgroundColor: "#ffffff", border: "2px solid #000000", padding: "16px", boxShadow: "4px 4px 0px 0px #000000", display: "flex", gap: "16px", flexWrap: "wrap" }}>
      <div style={{ width: "48px", height: "48px", backgroundColor: job.iconBg, border: "2px solid #000000", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <span className="material-symbols-outlined" style={{ fontSize: "1.75rem", color: job.iconColor }}>{job.icon}</span>
      </div>

      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <h3 style={{ fontSize: "1rem", fontWeight: 900, fontFamily: "'Syne', sans-serif", marginBottom: "2px" }}>{job.title}</h3>
            <p style={{ fontWeight: 700, color: "#6b7280", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.875rem" }}>{job.company}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase", color: "#1A4D2E", marginBottom: "4px", fontFamily: "'Space Grotesk', sans-serif" }}>
              Match Score: {job.match}%
            </p>
            <ProgressBar value={job.match} />
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
          {job.tags.map((tag) => (
            <span key={tag} style={{ backgroundColor: "#f3f4f6", border: "1px solid #000000", padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" }}>
              {tag}
            </span>
          ))}
        </div>

        <div style={{ display: "flex", gap: "16px", marginTop: "24px", flexWrap: "wrap" }}>
          <NeoButton bg="#1A4D2E" color="#ffffff">Apply Now</NeoButton>
          <NeoButton bg="#ffffff" color="#000000">View</NeoButton>
          <NeoButton bg="#D8B4FE" color="#000000" style={{ padding: "8px 16px" }}>
            <span className="material-symbols-outlined" style={{ verticalAlign: "middle" }}>bookmark</span>
          </NeoButton>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserDashboard() {
  useEffect(() => {
    document.title = "User Dashboard — JobFor";
  }, []);

  const [viewMoreHover, setViewMoreHover] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Space Grotesk', sans-serif;
          background-color: #F9FAFB;
          color: #111827;
          min-height: 100vh;
        }

        h1, h2, h3, h4, h5, h6 { font-family: 'Syne', sans-serif; }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
          font-style: normal;
          font-size: 24px;
          line-height: 1;
          letter-spacing: normal;
          text-transform: none;
          display: inline-block;
          white-space: nowrap;
          direction: ltr;
        }

        .stat-card { border: 2px solid #000000; padding: 12px; box-shadow: 2px 2px 0px 0px #000000; }

        @media (max-width: 768px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .header-row { flex-direction: column; align-items: flex-start !important; gap: 16px; }
          .h1-welcome { font-size: 2rem !important; }
        }

        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <main style={{ padding: "24px", backgroundColor: "#F9FAFB" }}>
          
          {/* Stats Grid */}
          <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
            {statsData.map((stat) => (
              <div key={stat.id} className="stat-card" style={{ backgroundColor: stat.cardBg }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1.25rem", color: stat.iconColor }}>{stat.icon}</span>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", backgroundColor: stat.badgeBg, color: stat.badgeColor, padding: "2px 6px", fontFamily: "'Space Grotesk', sans-serif" }}>
                    {stat.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "2px", color: stat.textColor, fontFamily: "'Syne', sans-serif" }}>{stat.value}</h3>
                <p style={{ fontSize: "0.875rem", fontWeight: 700, color: stat.labelColor, fontFamily: "'Space Grotesk', sans-serif" }}>{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Bottom Grid */}
          <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "32px" }}>

            {/* ── Left: Top Picks ── */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 900, textTransform: "uppercase", textDecoration: "underline", textDecorationColor: "#D8B4FE", textDecorationThickness: "6px", textUnderlineOffset: "4px", fontFamily: "'Syne', sans-serif" }}>
                  Top Picks for You
                </h2>
                <a href="#" style={{ fontWeight: 700, color: "#000000", textDecoration: "none", fontFamily: "'Space Grotesk', sans-serif" }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  See all matches
                </a>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {jobsData.map((job) => <JobCard key={job.id} job={job} />)}

                <div style={{ display: "flex", justifyContent: "center", paddingTop: "24px" }}>
                  <button
                    onMouseEnter={() => setViewMoreHover(true)}
                    onMouseLeave={() => setViewMoreHover(false)}
                    style={{ backgroundColor: "#D8B4FE", border: "2px solid #000000", padding: "10px 32px", fontSize: "0.875rem", fontWeight: 900, textTransform: "uppercase", boxShadow: viewMoreHover ? "none" : "4px 4px 0px 0px #000000", transform: viewMoreHover ? "translate(2px,2px)" : "translate(0,0)", cursor: "pointer", transition: "all 0.15s ease", fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    View More
                  </button>
                </div>
              </div>
            </div>

          </div>
      </main>
    </>
  );
}
