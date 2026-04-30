import React, { useRef, useState, useEffect } from "react";
import { getProfile } from "./services/profileService.js";

// ─── Data ───────────────────────────────────────────────────────────────────

const topPicks = [
  {
    id: 1,
    match: "98% MATCH",
    matchBg: "#D8B4FE",
    matchColor: "#000000",
    cardBg: "#D8B4FE",
    title: "Senior UX Architect",
    team: "Design Systems Team",
    location: "Remote",
    salary: "₹160k - ₹190k",
    btnBg: "#000000",
    btnColor: "#ffffff",
    btnHoverBg: "#ffffff",
    btnHoverColor: "#000000",
  },
  {
    id: 2,
    match: "94% MATCH",
    matchBg: "#1A4D2E",
    matchColor: "#ffffff",
    cardBg: "#ffffff",
    title: "Lead Product Designer",
    team: "Growth Division",
    location: "New York, NY",
    salary: "₹145k - ₹175k",
    btnBg: "#1A4D2E",
    btnColor: "#ffffff",
    btnHoverBg: "#000000",
    btnHoverColor: "#ffffff",
  },
  {
    id: 3,
    match: "92% MATCH",
    matchBg: "#1A4D2E",
    matchColor: "#ffffff",
    cardBg: "#ffffff",
    title: "Creative Director",
    team: "Brand Experience",
    location: "Berlin (Hybrid)",
    salary: "€90k - €120k",
    btnBg: "#1A4D2E",
    btnColor: "#ffffff",
    btnHoverBg: "#000000",
    btnHoverColor: "#ffffff",
  },
];

const matchBars = [
  { label: "Skills Alignment", value: 92, color: "#1A4D2E" },
  { label: "Experience Fit", value: 80, color: "#D8B4FE" },
  { label: "Location Preferred", value: 100, color: "#1A4D2E" },
  { label: "Salary Expectations", value: 75, color: "#D8B4FE" },
];

const whyItMatches = [
  "Expert knowledge in Figma & Design Systems",
  "Previous experience in B2B SaaS sector",
  "Perfect overlap with desired timezone (EST)",
  "Competitive package with full health benefits",
];

const newJobs = [
  { id: 1, icon: "terminal", title: "UI Engineer", company: "Pixel Perfect Ltd", match: "88% MATCH" },
  { id: 2, icon: "auto_awesome_motion", title: "Motion Designer", company: "Vortex Creative", match: "85% MATCH" },
  { id: 3, icon: "brush", title: "Visual Designer", company: "Studio 99", match: "82% MATCH" },
];

const missedJobs = [
  { id: 1, icon: "architecture", title: "Solutions Architect", company: "CloudScale Inc", match: "91% MATCH" },
  { id: 2, icon: "hub", title: "Interaction Designer", company: "Interlink Web", match: "89% MATCH" },
  { id: 3, icon: "settings_account_box", title: "Product Lead", company: "Nexus Finance", match: "87% MATCH" },
];

const footerResources = ["API Documentation", "Match Algorithm", "Career Growth"];
const footerSupport = ["Privacy Policy", "Terms of Service", "Help Center"];

// ─── Radial Progress ─────────────────────────────────────────────────────────

function RadialProgress({ percent = 85 }) {
  const size = 120;
  const strokeWidth = 10;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (circumference * percent) / 100;
  const center = size / 2;

  return (
    <div style={{ margin: "0 auto 16px auto", width: `${size}px`, height: `${size}px` }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: "block" }}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc — rotated via transform so it starts at top */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#1A4D2E"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          transform={`rotate(-90 ${center} ${center})`}
        />
        {/* Outer ring border */}
        <circle
          cx={center}
          cy={center}
          r={center - 1}
          fill="none"
          stroke="#000000"
          strokeWidth="2"
        />
        {/* Percentage text */}
        <text
          x={center}
          y={center - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Syne', sans-serif"
          fontWeight="800"
          fontSize="22"
          fill="#000000"
        >
          {percent}%
        </text>
        {/* Label text */}
        <text
          x={center}
          y={center + 16}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Space Grotesk', sans-serif"
          fontWeight="700"
          fontSize="9"
          fill="#4b5563"
          letterSpacing="1"
        >
          OVERALL
        </text>
      </svg>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIRecommendations() {
  useEffect(() => {
    document.title = "Dashboard — JobFor";
  }, []);

  const cardRef = useRef(null);
  const [firstName, setFirstName] = useState("User");
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const profileData = await getProfile();
        setFirstName(profileData.first_name || "User");
      } catch (error) {
        console.error("Error fetching user name:", error);
      }
    };

    const storedName = localStorage.getItem("user_first_name");
    const storedIsNew = localStorage.getItem("is_new_user");

    if (storedName) setFirstName(storedName);
    else fetchUserName();

    if (storedIsNew === "true") {
      setIsNew(true);
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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Space Grotesk', sans-serif;
          background-color: #ffffff;
          color: #000000;
          min-height: 100vh;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: 'Syne', sans-serif;
        }

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

        .shadow-neo    { box-shadow: 4px 4px 0px 0px #000000; }
        .shadow-neo-sm { box-shadow: 2px 2px 0px 0px #000000; }
        .shadow-neo-lg { box-shadow: 8px 8px 0px 0px #000000; }

        .top-card {
          border: 2px solid #000000;
          padding: 16px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .top-card:hover {
          transform: translate(4px, 4px);
          box-shadow: none !important;
        }

        .job-row {
          background: #ffffff;
          border: 2px solid #000000;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .job-row:hover {
          transform: translate(4px, 4px);
          box-shadow: none !important;
        }

        .missed-row {
          background: rgba(216,180,254,0.1);
          border: 2px solid #000000;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .missed-row:hover {
          transform: translate(4px, 4px);
          box-shadow: none !important;
        }

        .nav-btn {
          width: 40px;
          height: 40px;
          border: 2px solid #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .nav-btn:hover { background: #f3f4f6; }

        .analyze-btn {
          width: 100%;
          padding: 12px;
          font-weight: 700;
          border: 2px solid #000000;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.875rem;
          transition: background-color 0.15s ease, color 0.15s ease;
        }

        .learn-btn {
          width: 100%;
          background: #D8B4FE;
          color: #000000;
          padding: 16px;
          font-weight: 700;
          border: 2px solid #000000;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 2px 2px 0px 0px #000000;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .learn-btn:hover {
          transform: translate(4px, 4px);
          box-shadow: none;
        }

        .social-icon {
          width: 40px;
          height: 40px;
          border: 1px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: 700;
          transition: background-color 0.15s ease, color 0.15s ease;
          font-family: 'Space Grotesk', sans-serif;
        }
        .social-icon:hover {
          background-color: #D8B4FE;
          color: #000000;
        }

        @media (max-width: 768px) {
          .top-picks-grid { grid-template-columns: 1fr !important; }
          .analysis-inner { flex-direction: column !important; }
          .analysis-cols  { grid-template-columns: 1fr !important; }
          .bottom-grid    { grid-template-columns: 1fr !important; }
          .footer-grid    { grid-template-columns: 1fr !important; }
          .nav-links      { display: none !important; }
          .h1-main        { font-size: 2.5rem !important; }
        }
      `}</style>



      {/* ── Main ── */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 16px" }}>

        {/* Header */}
        <header style={{ marginBottom: "40px" }}>
          <div style={{
            display: "inline-block",
            backgroundColor: isNew ? "#bbf7d0" : "#fef08a",
            color: "#000000",
            padding: "8px 16px",
            border: "2px solid #000000",
            boxShadow: "4px 4px 0px 0px #000000",
            fontSize: "1rem",
            fontWeight: 700,
            marginBottom: "24px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            fontFamily: "'Space Grotesk', sans-serif",
            transform: "rotate(-2deg)",
          }}>
            {isNew ? `Hiiii ${firstName} 👋` : `Welcome back, ${firstName} ⚡`}
          </div>
          <h1
            className="h1-main"
            style={{
              fontSize: "2.25rem",
              fontWeight: 800,
              letterSpacing: "-0.05em",
              marginBottom: "8px",
              textTransform: "uppercase",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            Your AI <span style={{ backgroundColor: "#D8B4FE", padding: "0 8px", border: "2px solid #000" }}>Recommendations</span>
          </h1>
          <p
            style={{
              color: "#4b5563",
              fontWeight: 500,
              fontFamily: "'Space Grotesk', sans-serif",
              marginTop: "8px",
            }}
          >
            Personalized job matches based on your unique profile and activity.
          </p>
        </header>

        {/* ── Section 1: Top Picks ── */}
        <section style={{ marginBottom: "64px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textTransform: "uppercase",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "#1A4D2E" }}>
                stars
              </span>
              Top Picks For You
            </h2>

            <div style={{ display: "flex", gap: "8px" }}>
              {["chevron_left", "chevron_right"].map((icon) => (
                <button key={icon} className="nav-btn shadow-neo-sm">
                  <span className="material-symbols-outlined">{icon}</span>
                </button>
              ))}
            </div>
          </div>

          <div
            className="top-picks-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "24px",
            }}
          >
            {topPicks.map((job) => (
              <div
                key={job.id}
                className="top-card shadow-neo"
                style={{ backgroundColor: job.cardBg }}
              >
                {/* Match badge + bookmark */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: job.matchBg,
                      color: job.matchColor,
                      border: "2px solid #000000",
                      padding: "4px 12px",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {job.match}
                  </div>
                  <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <span className="material-symbols-outlined">bookmark_add</span>
                  </button>
                </div>

                {/* Title */}
                <div style={{ marginBottom: "16px" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      marginBottom: "4px",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    {job.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      opacity: 0.8,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {job.team}
                  </p>
                </div>

                {/* Location + Salary */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    marginBottom: "24px",
                    flexWrap: "wrap",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>location_on</span>
                  {job.location}
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", marginLeft: "8px" }}>payments</span>
                  {job.salary}
                </div>

                {/* CTA */}
                <button
                  className="analyze-btn"
                  style={{ backgroundColor: job.btnBg, color: job.btnColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = job.btnHoverBg;
                    e.currentTarget.style.color = job.btnHoverColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = job.btnBg;
                    e.currentTarget.style.color = job.btnColor;
                  }}
                >
                  Analyze Match
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: Deep Match Analysis ── */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "32px",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "#1A4D2E" }}>analytics</span>
            Deep Match Analysis
          </h2>

          <div
            className="analysis-cols"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,8fr) minmax(0,4fr)",
              gap: "32px",
            }}
          >
            {/* Left card */}
            <div
              className="shadow-neo-lg"
              style={{
                backgroundColor: "#ffffff",
                border: "2px solid #000000",
                padding: "32px",
              }}
            >
              <div
                className="analysis-inner"
                style={{ display: "flex", alignItems: "center", gap: "48px" }}
              >
                {/* Radial */}
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <RadialProgress percent={85} />
                  <h3 style={{ fontWeight: 700, fontSize: "1.125rem", fontFamily: "'Syne', sans-serif" }}>
                    Senior UX Architect
                  </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    Acme Global Systems
                  </p>
                </div>

                {/* Bars */}
                <div style={{ flexGrow: 1, width: "100%" }}>
                  {matchBars.map((bar) => (
                    <div key={bar.label} style={{ marginBottom: "24px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          marginBottom: "4px",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        <span>{bar.label}</span>
                        <span>{bar.value}%</span>
                      </div>
                      <div
                        style={{
                          height: "16px",
                          width: "100%",
                          backgroundColor: "#f3f4f6",
                          border: "2px solid #000000",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${bar.value}%`,
                            backgroundColor: bar.color,
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why it matches */}
              <div style={{ marginTop: "48px", paddingTop: "48px", borderTop: "2px solid #000000" }}>
                <h4
                  style={{
                    fontWeight: 700,
                    marginBottom: "16px",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: "#16a34a" }}>verified</span>
                  Why it matches
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                  {whyItMatches.map((reason, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: 500,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ color: "#1A4D2E", flexShrink: 0 }}>
                        check_circle
                      </span>
                      {reason}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right card — Missing Skill */}
            <div
              className="shadow-neo-lg"
              style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                border: "2px solid #000000",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#D8B4FE",
                  color: "#000000",
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "24px",
                  border: "2px solid #ffffff",
                }}
              >
                <span className="material-symbols-outlined">warning</span>
              </div>

              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "16px",
                  textTransform: "uppercase",
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                Missing Skill Alert
              </h3>

              <p
                style={{
                  marginBottom: "24px",
                  opacity: 0.8,
                  fontFamily: "'Space Grotesk', sans-serif",
                  lineHeight: 1.6,
                }}
              >
                This role highly values{" "}
                <span
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    padding: "2px 8px",
                    fontWeight: 700,
                  }}
                >
                  TypeScript
                </span>
                . We noticed it's not on your profile.
              </p>

              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  padding: "16px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  marginBottom: "32px",
                  flexGrow: 1,
                }}
              >
                <h4 style={{ fontWeight: 700, marginBottom: "8px", fontFamily: "'Syne', sans-serif" }}>
                  Recommendation:
                </h4>
                <p style={{ fontSize: "0.875rem", fontStyle: "italic", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Completing a TypeScript certification could increase your match rate to 95%.
                </p>
              </div>

              <button className="learn-btn">Learn Now</button>
            </div>
          </div>
        </section>

        {/* ── Section 3: New Jobs + Missed Jobs ── */}
        <section
          className="bottom-grid"
          style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "48px" }}
        >
          {/* New Jobs */}
          <div>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "24px",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "#1A4D2E" }}>new_releases</span>
              New Jobs For Your Skills
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {newJobs.map((job) => (
                <div key={job.id} className="job-row shadow-neo">
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      backgroundColor: "#f3f4f6",
                      border: "2px solid #000000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "2rem" }}>{job.icon}</span>
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: "4px" }}>{job.title}</h4>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {job.company}
                    </p>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#1A4D2E",
                      color: "#ffffff",
                      border: "2px solid #000000",
                      padding: "4px 12px",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      flexShrink: 0,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {job.match}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missed Jobs */}
          <div>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "24px",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "#1A4D2E" }}>history</span>
              Jobs You Missed
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {missedJobs.map((job) => (
                <div key={job.id} className="missed-row shadow-neo">
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      backgroundColor: "#ffffff",
                      border: "2px solid #000000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "2rem" }}>{job.icon}</span>
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    <h4 style={{ fontWeight: 700, fontFamily: "'Syne', sans-serif", marginBottom: "4px" }}>{job.title}</h4>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {job.company}
                    </p>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      border: "2px solid #000000",
                      padding: "4px 12px",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      flexShrink: 0,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {job.match}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

    </>
  );
}
