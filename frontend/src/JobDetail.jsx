import React, { useState, useEffect } from "react";

// ─── Data ───────────────────────────────────────────────────────────────────

const matchSkills = [
  { label: "UI/UX Design (5+ years)", match: true },
  { label: "Figma Mastery", match: true },
  { label: "B2B SaaS Experience", match: true },
  { label: "React Basics (Nice to have)", match: false },
];

const tabs = ["Description", "Requirements", "Benefits"];

const whatYoullDo = [
  "Design end-to-end user flows and high-fidelity interfaces for complex web applications.",
  'Maintain and evolve our design system, "FlowDesign", across multiple platforms.',
  "Conduct user research and usability testing to validate design decisions.",
];

const jobOverview = [
  { label: "Job Type", value: "Full-time", hasBadge: true },
  { label: "Experience", value: "Senior (5+ yrs)", hasBadge: false },
  { label: "Posted", value: "2 days ago", hasBadge: false },
];

const similarJobs = [
  {
    id: 1,
    icon: "animation",
    iconBg: "#dbeafe",
    iconColor: "#2563eb",
    badge: "Remote",
    title: "Interaction Designer",
    info: "Creative Agency • ₹110k - ₹140k",
    tags: ["Motion", "After Effects"],
  },
  {
    id: 2,
    icon: "brush",
    iconBg: "#dcfce7",
    iconColor: "#16a34a",
    badge: "London",
    title: "Brand Designer",
    info: "GrowthSpike • ₹60k - ₹80k",
    tags: ["Branding", "Illustrator"],
  },
  {
    id: 3,
    icon: "layers",
    iconBg: "#f3e8ff",
    iconColor: "#9333ea",
    badge: "Contract",
    title: "Visual Designer",
    info: "WebFlow Inc. • ₹80 - ₹110 /hr",
    tags: ["UI Design", "Design Systems"],
  },
];

// ─── Radial Match Score ──────────────────────────────────────────────────────

function MatchScore({ percent = 85 }) {
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (circumference * percent) / 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: "96px", height: "96px" }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="48" cy="48" r={r} fill="transparent" stroke="#000000" strokeWidth="8" />
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="transparent"
            stroke="#1A4D2E"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: "1.25rem",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          {percent}%
        </span>
      </div>
      <p
        style={{
          marginTop: "8px",
          fontWeight: 900,
          textTransform: "uppercase",
          fontSize: "0.75rem",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        Match Score
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JobDetail() {
  useEffect(() => {
    document.title = "Job Details — JobFor";
  }, []);

  const [activeTab, setActiveTab] = useState("Description");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Space Grotesk', sans-serif;
          background-color: rgba(216, 180, 254, 0.1);
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

        .neo-border    { border: 3px solid #000000; }
        .neo-border-sm { border: 2px solid #000000; }
        .shadow-neo    { box-shadow: 6px 6px 0px 0px #000000; }
        .shadow-neo-sm { box-shadow: 3px 3px 0px 0px #000000; }
        .shadow-neo-lg { box-shadow: 10px 10px 0px 0px #000000; }

        .apply-btn, .save-btn {
          width: 100%;
          font-weight: 900;
          padding: 16px 24px;
          border: 3px solid #000000;
          box-shadow: 3px 3px 0px 0px #000000;
          cursor: pointer;
          text-transform: uppercase;
          font-size: 1.125rem;
          font-family: 'Space Grotesk', sans-serif;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .apply-btn:hover, .save-btn:hover {
          transform: translate(2px, 2px);
          box-shadow: none;
        }
        .apply-btn { background-color: #1A4D2E; color: #ffffff; }
        .save-btn  { background-color: #ffffff; color: #000000; }

        .tab-btn {
          padding: 16px 32px;
          font-weight: 900;
          text-transform: uppercase;
          border-right: 3px solid #000000;
          background: transparent;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.875rem;
          transition: background-color 0.15s ease;
        }
        .tab-btn:last-child { border-right: none; }
        .tab-btn.active { background-color: #ffffff; }
        .tab-btn:hover  { background-color: #ffffff; }

        .share-btn {
          width: 40px;
          height: 40px;
          background: #ffffff;
          border: 2px solid #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .share-btn:hover { background: #000000; color: #ffffff; }

        .similar-card {
          background: #ffffff;
          border: 3px solid #000000;
          padding: 24px;
          box-shadow: 6px 6px 0px 0px #000000;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .similar-card:hover { transform: translateY(-4px); }

        @media (max-width: 1024px) {
          .main-grid     { grid-template-columns: 1fr !important; }
          .aside-sticky  { position: static !important; }
        }

        @media (max-width: 768px) {
          .nav-links          { display: none !important; }
          .header-inner       { flex-direction: column !important; }
          .match-inner        { flex-direction: column !important; }
          .match-skills-grid  { grid-template-columns: 1fr !important; }
          .similar-grid       { grid-template-columns: 1fr !important; }
          .footer-inner       { flex-direction: column !important; text-align: center; }
          .h1-main            { font-size: 2rem !important; }
          .tabs-bar           { overflow-x: auto; }
          .tab-btn            { padding: 12px 16px; font-size: 0.75rem; white-space: nowrap; }
        }
      `}</style>


      {/* ── Main ── */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        <div
          className="main-grid"
          style={{ display: "grid", gridTemplateColumns: "minmax(0, 8fr) minmax(0, 4fr)", gap: "32px" }}
        >
          {/* ── Left Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

            {/* Header Card */}
            <header className="neo-border shadow-neo" style={{ backgroundColor: "#ffffff", padding: "32px" }}>
              <div className="header-inner" style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                <div
                  className="neo-border"
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "#1A4D2E",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: "#ffffff", fontSize: "2.5rem" }}>
                    bolt
                  </span>
                </div>

                <div style={{ flexGrow: 1 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <h1
                      className="h1-main"
                      style={{
                        fontSize: "2.25rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "-0.025em",
                        fontFamily: "'Syne', sans-serif",
                      }}
                    >
                      Senior Product Designer
                    </h1>
                    <span
                      className="neo-border-sm"
                      style={{
                        backgroundColor: "#FACC15",
                        padding: "4px 12px",
                        fontSize: "0.75rem",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      Urgent
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "16px",
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span className="material-symbols-outlined" style={{ color: "#1A4D2E" }}>business</span>
                      TechFlow Inc.
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#6b7280" }}>
                      <span className="material-symbols-outlined">location_on</span>
                      Remote / New York
                    </span>
                  </div>
                </div>
              </div>
            </header>

            {/* Match Section */}
            <section
              className="neo-border shadow-neo"
              style={{ backgroundColor: "rgba(216,180,254,0.2)", padding: "32px" }}
            >
              <div className="match-inner" style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                <MatchScore percent={85} />

                <div style={{ flexGrow: 1 }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      marginBottom: "16px",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    Why you're a great fit:
                  </h3>

                  <div
                    className="match-skills-grid"
                    style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}
                  >
                    {matchSkills.map((skill, i) => (
                      <div
                        key={i}
                        className="neo-border-sm"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontWeight: 700,
                          padding: "8px",
                          backgroundColor: skill.match ? "#ffffff" : "rgba(255,255,255,0.5)",
                          borderStyle: skill.match ? "solid" : "dashed",
                          color: skill.match ? "#000000" : "#6b7280",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ color: skill.match ? "#16a34a" : "#6b7280", fontWeight: 900 }}
                        >
                          {skill.match ? "check_circle" : "info"}
                        </span>
                        {skill.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Tabs + Content */}
            <div className="neo-border shadow-neo" style={{ backgroundColor: "#ffffff", overflow: "hidden" }}>
              {/* Tab Bar */}
              <div
                className="tabs-bar"
                style={{ display: "flex", borderBottom: "3px solid #000000", backgroundColor: "#f9fafb" }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div style={{ padding: "32px" }}>
                {activeTab === "Description" && (
                  <>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "16px", fontFamily: "'Syne', sans-serif" }}>
                      The Role
                    </h3>
                    <p style={{ fontWeight: 500, color: "#374151", lineHeight: 1.8, marginBottom: "16px", fontFamily: "'Space Grotesk', sans-serif" }}>
                      We are looking for a Senior Product Designer to join our core product team. You will be responsible
                      for leading the design direction of our enterprise dashboard, ensuring a seamless experience for
                      over 100k daily active users.
                    </p>
                    <p style={{ fontWeight: 500, color: "#374151", lineHeight: 1.8, marginBottom: "32px", fontFamily: "'Space Grotesk', sans-serif" }}>
                      In this role, you'll collaborate closely with engineering and product management to define the future
                      of our platform. You should be someone who obsesses over details but never loses sight of the big
                      picture.
                    </p>

                    <h3 style={{ fontSize: "1.5rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "16px", fontFamily: "'Syne', sans-serif" }}>
                      What You'll Do
                    </h3>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {whatYoullDo.map((item, i) => (
                        <li key={i} style={{ display: "flex", gap: "8px", fontWeight: 500, color: "#374151", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.6 }}>
                          <span style={{ color: "#1A4D2E", fontWeight: 900 }}>•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {activeTab === "Requirements" && (
                  <>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "16px", fontFamily: "'Syne', sans-serif" }}>
                      Requirements
                    </h3>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {[
                        "5+ years of product design experience",
                        "Expert-level proficiency in Figma",
                        "Experience with design systems at scale",
                        "Strong portfolio demonstrating end-to-end product thinking",
                        "Excellent communication and collaboration skills",
                      ].map((item, i) => (
                        <li key={i} style={{ display: "flex", gap: "8px", fontWeight: 500, color: "#374151", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.6 }}>
                          <span style={{ color: "#1A4D2E", fontWeight: 900 }}>•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}

                {activeTab === "Benefits" && (
                  <>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "16px", fontFamily: "'Syne', sans-serif" }}>
                      Benefits & Perks
                    </h3>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {[
                        "Competitive salary: ₹140k - ₹185k",
                        "Fully remote with optional NYC office access",
                        "Unlimited PTO and flexible work hours",
                        "Health, dental, and vision insurance",
                        "₹5,000 annual learning & development budget",
                        "Latest MacBook Pro and design tools",
                      ].map((item, i) => (
                        <li key={i} style={{ display: "flex", gap: "8px", fontWeight: 500, color: "#374151", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.6 }}>
                          <span style={{ color: "#1A4D2E", fontWeight: 900 }}>✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Column (Sidebar) ── */}
          <aside>
            <div
              className="aside-sticky"
              style={{ position: "sticky", top: "112px", display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* Main sidebar card */}
              <div className="neo-border shadow-neo" style={{ backgroundColor: "#ffffff", padding: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Salary */}
                  <div>
                    <p style={{ fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase", color: "#6b7280", marginBottom: "4px", fontFamily: "'Space Grotesk', sans-serif" }}>
                      Annual Salary
                    </p>
                    <p style={{ fontSize: "1.875rem", fontWeight: 800, color: "#1A4D2E", fontFamily: "'Syne', sans-serif" }}>
                      ₹140k - ₹185k
                    </p>
                  </div>

                  {/* Map */}
                  <div
                    className="neo-border-sm"
                    style={{ backgroundColor: "#f3f4f6", aspectRatio: "16/9", position: "relative", overflow: "hidden" }}
                  >
                    <img
                      alt="Map Preview"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBPUoe2aE-wqj0-es8Ssm7dNCQyi0YZiIi5_RaZ9z411eXOIBJEsh7b-0_KYJLNXZxt3zR0nYdcvV0uNj3w0LVsymfeOtLlwFgRi84kOgvRVTiZBHQY4x7ehkYr53RktcuRTkbBuJVIHjYE2wEUZHVxbYYi2oKe5xXMIyD27xQPhpNBWuP0b_htAj7UzlsK7-GVZmL9grH36kotketzLwhFEPP5lTtfFRypvN04iZbpN5oPWiuHtohJ2SnKRa3CqxFjwoz8j4zmGNE"
                      style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(100%)", opacity: 0.5 }}
                    />
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <div
                        className="neo-border-sm"
                        style={{
                          backgroundColor: "#ffffff",
                          padding: "8px 16px",
                          fontWeight: 900,
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontFamily: "'Space Grotesk', sans-serif",
                          fontSize: "0.875rem",
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ color: "#ef4444" }}>location_on</span>
                        VIEW MAP
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "8px" }}>
                    <button className="apply-btn">Apply Now</button>
                    <button className="save-btn">
                      <span className="material-symbols-outlined">bookmark</span>
                      Save Job
                    </button>
                  </div>
                </div>

                {/* Job Overview */}
                <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "2px dashed #000000" }}>
                  <h4 style={{ fontWeight: 900, textTransform: "uppercase", marginBottom: "16px", fontFamily: "'Syne', sans-serif" }}>
                    Job Overview
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {jobOverview.map((item, i) => (
                      <div
                        key={i}
                        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        <span style={{ color: "#6b7280", textTransform: "uppercase", fontSize: "0.75rem" }}>{item.label}</span>
                        {item.hasBadge ? (
                          <span
                            className="neo-border-sm"
                            style={{ backgroundColor: "rgba(216,180,254,0.3)", padding: "2px 8px", fontSize: "0.875rem" }}
                          >
                            {item.value}
                          </span>
                        ) : (
                          <span>{item.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Share card */}
              <div className="neo-border shadow-neo" style={{ backgroundColor: "#FACC15", padding: "24px" }}>
                <h4 style={{ fontWeight: 900, textTransform: "uppercase", marginBottom: "8px", fontFamily: "'Syne', sans-serif" }}>
                  Share this job
                </h4>
                <p style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "16px", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Help a friend find their next dream role!
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["link", "send"].map((icon) => (
                    <button key={icon} className="share-btn">
                      <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Similar Vacancies ── */}
        <section style={{ marginTop: "80px" }}>
          <h2
            style={{
              fontSize: "1.875rem",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: "32px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            Similar{" "}
            <span style={{ color: "#ffffff", backgroundColor: "#000000", padding: "4px 8px" }}>
              Vacancies
            </span>
          </h2>

          <div
            className="similar-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}
          >
            {similarJobs.map((job) => (
              <div key={job.id} className="similar-card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                  <div
                    className="neo-border-sm"
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: job.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ color: job.iconColor }}>{job.icon}</span>
                  </div>
                  <span
                    className="neo-border-sm"
                    style={{
                      backgroundColor: "#f3f4f6",
                      padding: "2px 8px",
                      fontSize: "0.75rem",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      alignSelf: "flex-start",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {job.badge}
                  </span>
                </div>

                <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "4px", fontFamily: "'Syne', sans-serif" }}>
                  {job.title}
                </h3>
                <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#6b7280", marginBottom: "16px", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {job.info}
                </p>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="neo-border-sm"
                      style={{
                        backgroundColor: "rgba(216,180,254,0.2)",
                        padding: "4px 8px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

    </>
  );
}
