import React, { useState, useEffect } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const strongKeywords = [
  "Strategic Architecture",
  "Scalability",
  "Technical Lead",
  "Cloud Native",
];

const missingKeywords = ["Neo-brutalism", "SASS", "System Design"];

const enhancements = [
  {
    id: 1,
    iconBg: "#D8B4FE", // matching dashboard lavender
    icon: "bolt",
    title: "Impact Verbs",
    subtitle: "Upgrade passive voice to power actions",
    priority: "High",
    priorityBg: "#f3e8ff",
    before:
      '"Responsible for managing a team of developers and overseeing the deployment process."',
    after:
      '"Architected and engineered large-scale deployments while mentoring a high-performance team of 12."',
  },
  {
    id: 2,
    iconBg: "#1A4D2E", // matching dashboard deep green
    icon: "bar_chart",
    title: "Quantify Results",
    subtitle: "Adding data increases interview rate by 40%",
    priority: "Medium",
    priorityBg: "#dcfce7",
    before:
      '"Improved the application load speed for better user experience."',
    after:
      '"Reduced frontend latency by 65% across core modules, resulting in a 22% uplift in user retention."',
  },
];

// ─── Radial Progress ──────────────────────────────────────────────────────────

function RadialProgress({ percent = 75 }) {
  const r = 50;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * percent) / 100;

  return (
    <div style={{ position: "relative", width: "120px", height: "120px" }}>
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle cx="60" cy="60" r={r} fill="transparent" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="transparent"
          stroke="#1A4D2E"
          strokeWidth="12"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: "1.75rem",
            fontWeight: 900,
            fontFamily: "'Syne', sans-serif",
            lineHeight: 1,
            color: "#111827"
          }}
        >
          {percent}%
        </span>
        <span
          style={{
            fontSize: "0.5rem",
            fontWeight: 900,
            textTransform: "uppercase",
            color: "#6b7280",
            marginTop: "2px"
          }}
        >
          Optimized
        </span>
      </div>
    </div>
  );
}

// ─── Enhancement Card ─────────────────────────────────────────────────────────

function EnhancementCard({ item }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "#ffffff",
        border: "2px solid #000000",
        padding: "20px",
        boxShadow: hovered ? "none" : "4px 4px 0px 0px #000000",
        transform: hovered ? "translate(2px, 2px)" : "translate(0, 0)",
        transition: "all 0.15s ease",
      }}
    >
      {/* Card Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "16px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              backgroundColor: item.iconBg,
              padding: "8px",
              color: item.iconBg === "#1A4D2E" ? "#ffffff" : "#000000",
              border: "2px solid #000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>{item.icon}</span>
          </div>
          <div>
            <h4
              style={{
                fontSize: "1rem",
                fontWeight: 900,
                lineHeight: 1.2,
                fontFamily: "'Syne', sans-serif",
                textTransform: "uppercase",
                color: "#111827"
              }}
            >
              {item.title}
            </h4>
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: "#6b7280",
                textTransform: "uppercase",
              }}
            >
              {item.subtitle}
            </p>
          </div>
        </div>

        <span
          style={{
            fontSize: "0.6rem",
            fontWeight: 900,
            textTransform: "uppercase",
            padding: "4px 8px",
            backgroundColor: item.priorityBg,
            border: "2px solid #000000",
            fontFamily: "'Space Grotesk', sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          Priority: {item.priority}
        </span>
      </div>

      {/* Before / After */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
        }}
        className="before-after-grid"
      >
        <div
          style={{
            padding: "16px",
            backgroundColor: "#F9FAFB",
            border: "2px solid #000000",
          }}
        >
          <p
            style={{
              fontSize: "0.6rem",
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#6b7280",
              marginBottom: "8px",
            }}
          >
            Before
          </p>
          <p
            style={{
              fontStyle: "italic",
              color: "#4b5563",
              fontWeight: 500,
              lineHeight: 1.5,
              fontSize: "0.85rem"
            }}
          >
            {item.before}
          </p>
        </div>

        <div
          style={{
            padding: "16px",
            backgroundColor: "#dcfce7",
            border: "2px solid #000000",
          }}
        >
          <p
            style={{
              fontSize: "0.6rem",
              fontWeight: 900,
              textTransform: "uppercase",
              color: "#14532d",
              marginBottom: "8px",
            }}
          >
            After
          </p>
          <p
            style={{
              fontWeight: 700,
              color: "#064e3b",
              lineHeight: 1.5,
              fontSize: "0.85rem"
            }}
          >
            {item.after}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ResumeAnalyzer() {
  useEffect(() => {
    document.title = "Resume Analyzer — JobFor";
  }, []);

  const [browseHover, setBrowseHover] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fabHover, setFabHover] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        .analyzer-body {
          font-family: 'Space Grotesk', sans-serif;
          background-color: #F9FAFB;
          color: #111827;
        }

        .analyzer-body h1, .analyzer-body h2, .analyzer-body h3, .analyzer-body h4 { 
          font-family: 'Syne', sans-serif; 
        }

        .keyword-tag-strong {
          background-color: #dcfce7;
          color: #1A4D2E;
          border: 2px solid #000000;
          padding: 4px 10px;
          font-weight: 700;
          font-size: 0.70rem;
          text-transform: uppercase;
        }

        .keyword-tag-missing {
          background-color: #f3e8ff;
          color: #3b0764;
          border: 2px solid #000000;
          padding: 4px 10px;
          font-weight: 700;
          font-size: 0.70rem;
          text-transform: uppercase;
        }

        @media (max-width: 1024px) {
          .bento-grid { grid-template-columns: 1fr !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 768px) {
          .keyword-grid { grid-template-columns: 1fr !important; }
          .before-after-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── Main Content ── */}
      <div className="analyzer-body" style={{ flex: 1, padding: "24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

          {/* ── Hero Section ── */}
          <section
            className="hero-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "32px",
              alignItems: "center",
              marginBottom: "40px",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "2.5rem",
                  fontWeight: 900,
                  marginBottom: "16px",
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  textTransform: "uppercase"
                }}
              >
                Resume
                <br />
                <span style={{ color: "#1A4D2E", textDecoration: "underline", textDecorationColor: "#D8B4FE", textDecorationThickness: "4px", textUnderlineOffset: "4px" }}>Intelligence</span>
              </h1>
              <p
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: "#4b5563",
                  maxWidth: "400px",
                  lineHeight: 1.5,
                }}
              >
                Deconstruct your career architecture. Our ATS-optimized neural
                engine analyzes your blueprint for high-impact market fit.
              </p>
            </div>

            {/* Upload Zone */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  position: "absolute",
                  inset: "-6px",
                  backgroundColor: "#D8B4FE",
                  border: "2px solid #000000",
                  zIndex: 0,
                  transition: "transform 0.15s ease",
                  transform: dragOver ? "translate(6px,6px)" : "translate(0,0)",
                }}
              />
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
                style={{
                  position: "relative",
                  zIndex: 1,
                  backgroundColor: "#ffffff",
                  border: "2px dashed #000000",
                  padding: "32px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "220px",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "3rem", marginBottom: "12px", color: "#1A4D2E" }}
                >
                  upload_file
                </span>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 900,
                    marginBottom: "6px",
                    textTransform: "uppercase"
                  }}
                >
                  Drop Your Blueprint
                </h2>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    color: "#6b7280",
                  }}
                >
                  PDF, DOCX (Max 10MB)
                </p>
                <button
                  onMouseEnter={() => setBrowseHover(true)}
                  onMouseLeave={() => setBrowseHover(false)}
                  style={{
                    marginTop: "20px",
                    backgroundColor: "#1A4D2E",
                    color: "#ffffff",
                    border: "2px solid #000000",
                    padding: "10px 24px",
                    fontWeight: 900,
                    boxShadow: browseHover ? "none" : "3px 3px 0px 0px #000000",
                    transform: browseHover ? "translate(2px, 2px)" : "translate(0,0)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: "0.8rem",
                    textTransform: "uppercase"
                  }}
                >
                  BROWSE FILES
                </button>
              </div>
            </div>
          </section>

          {/* ── Bento Grid Stats ── */}
          <div
            className="bento-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginBottom: "40px",
            }}
          >
            {/* ATS Compatibility */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "2px solid #000000",
                padding: "24px",
                boxShadow: "4px 4px 0px 0px #000000",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "20px",
                  alignSelf: "flex-start",
                  textTransform: "uppercase",
                  fontWeight: 900,
                }}
              >
                ATS Fit Score
              </h3>

              <RadialProgress percent={75} />

              <p
                style={{
                  marginTop: "24px",
                  textAlign: "center",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  color: "#4b5563",
                  lineHeight: 1.5,
                }}
              >
                Your resume is readable but lacks <span style={{ color: "#1A4D2E", fontWeight: 900 }}>3 core architectural keywords</span>.
              </p>
            </div>

            {/* Keyword Deep Dive */}
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "2px solid #000000",
                padding: "24px",
                boxShadow: "4px 4px 0px 0px #000000",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "24px",
                  textTransform: "uppercase",
                  fontWeight: 900,
                }}
              >
                Keyword Target
              </h3>

              <div
                className="keyword-grid"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      color: "#9ca3af",
                      marginBottom: "12px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Found
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {strongKeywords.map((kw) => (
                      <span key={kw} className="keyword-tag-strong">{kw}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      color: "#9ca3af",
                      marginBottom: "12px",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Missing
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {missingKeywords.map((kw) => (
                      <span key={kw} className="keyword-tag-missing">{kw}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pro Tip */}
              <div
                style={{
                  marginTop: "32px",
                  padding: "16px",
                  backgroundColor: "#fef9c3",
                  border: "2px solid #000000",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className="material-symbols-outlined" style={{ color: "#ca8a04", flexShrink: 0, fontSize: "20px" }}>
                    lightbulb
                  </span>
                  <p style={{ fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.4 }}>
                    Add "System Design" to your Experience to boost ranking!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Actionable Intelligence ── */}
          <section>
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginBottom: "24px",
                borderBottom: "2px solid #000000",
                paddingBottom: "12px",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                }}
              >
                Insights
              </h2>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  padding: "4px 10px",
                }}
              >
                2 Found
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {enhancements.map((item) => (
                <EnhancementCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* ── Floating Action Button ── */}
      <div style={{ position: "fixed", bottom: "32px", right: "32px", zIndex: 50 }}>
        <button
          onMouseEnter={() => setFabHover(true)}
          onMouseLeave={() => setFabHover(false)}
          style={{
            backgroundColor: "#1A4D2E",
            color: "#ffffff",
            width: "56px",
            height: "56px",
            border: "2px solid #000000",
            boxShadow: fabHover ? "none" : "3px 3px 0px 0px rgba(0,0,0,1)",
            transform: fabHover ? "translate(2px, 2px)" : "translate(0,0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "24px", fontVariationSettings: "'FILL' 1" }}
          >
            document_scanner
          </span>
        </button>
      </div>
    </>
  );
}
