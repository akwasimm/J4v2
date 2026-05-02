import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const preferences = [
  {
    id: "fulltime",
    label: "Full-time",
    description: "Standard 40h/week. Stability and long-term growth.",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="0" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    ),
    checkedBg: "#dcfce7",
    span: 3,
    size: "large",
  },
  {
    id: "remote",
    label: "Remote",
    description: "Work from anywhere. Async culture and flexibility.",
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    checkedBg: "rgba(216,180,254,0.3)",
    span: 3,
    size: "large",
  },
  {
    id: "parttime",
    label: "Part-time",
    description: "Under 30h/week schedules.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    checkedBg: "rgba(216,180,254,0.3)",
    span: 2,
    size: "small",
  },
  {
    id: "contract",
    label: "Contract",
    description: "Fixed-term or project-based work.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    checkedBg: "#dcfce7",
    span: 2,
    size: "small",
  },
  {
    id: "internship",
    label: "Internship",
    description: "Learning roles for early career.",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
    checkedBg: "rgba(216,180,254,0.3)",
    span: 2,
    size: "small",
  },
];

const avatars = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBmldR-Ac9hi9eBEKEm4dxv7l1oLYwbz0ujEIb6d0pSDwQMXE1mamtYhQtQlmTnUZCnZCDyIjLfktqu12Mk5ce_3U81CzMzAAnmUA7bSU5rN_1OD0hXT6rs2inP9j2a9lwZkvmrtOtEURPr70nPk_z6vUpKUMupWfbPFAdqcf4Ls5YI2SlHTAdUq8JlE2V-MR1CMTgCl1uM7_YnF9icr9PYUlypkxf80d6aIbeHOubOUHS4e2f8_bS90qCueUSKY0ck5WYp5UH4HCc",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA7oWpl9sVDFOvusl6orRvnByuZpHUg8vLTRknYzzyqm_ycGLGvcCcgtxKeiZ1QzFT2tyVl3G7TaqQxhP_rSghKS66qNDv1AsxTJA_sVH-gUWWklnAZ6svAulIHEVmvpByMApm5naMT4A3ux7VX0l8FFgu4dZCiR2W4VyDrCXIytXDHGiQg4H5Dq_l44EYnFx5eFEq8bPaMr5nhhnT4WYXV8BW3X4suCBdp2mS8Xu807n3D2ujcE0qesdq62F91zWtMGA5ywKze4hY",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCvr6OfHkZ31w3kf1r40iPm0vCHE8bGOK2Xn4GBDixHa_ms3DSf7F1L59KTCe04Snrq8OiH1HVrPBGHSg3Yrcgbyp3k1wU9a0S1EuGFD-Vbrb2r5IU3_4lJJ5fOEXRI-WnkeJudqMFyfLP0EUg56JltqVAR-osb8pOYX1wG-qlLy_2y5vOP-UTowMDnJxrn9M2bGMhIgG0qUagzhH-LZzK1ry84eYnQrk9BZUg4i7WkGzcAp8DQ_spzzzSPnlraF6lM7M9nYBpI05E",
];

export default function PreferencesPage() {
  useEffect(() => {
    document.title = "Preferences — JobFor";
  }, []);

  const navigate = useNavigate();
  const [selected, setSelected] = useState({ fulltime: true });

  const toggle = (id) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; }
        
        .bento-card {
            transition: all 0.15s ease;
            box-shadow: 4px 4px 0px 0px #111111;
        }
        .bento-card.checked {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0px 0px #111111;
        }
        .bento-card:hover:not(.checked) {
            transform: translate(-3px, -3px);
            box-shadow: 7px 7px 0px 0px #111111;
        }

        .pref-btn {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 800;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border: 2px solid #111111;
            box-shadow: 4px 4px 0px 0px #111111;
            cursor: pointer;
            transition: all 0.15s;
        }
        .pref-btn:hover {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0px 0px #111111;
        }
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        <div style={{ maxWidth: "800px", width: "100%" }}>

          {/* Header */}
          <div style={{ marginBottom: "32px", textAlign: "center" }}>
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                color: "#111111",
                textTransform: "uppercase",
                letterSpacing: "-0.025em",
                lineHeight: 1.05,
                marginBottom: "12px",
              }}
            >
              Work on your{" "}
              <span style={{ color: "#D8B4FE" }}>terms.</span>
            </h1>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "#4b5563",
                maxWidth: "540px",
                margin: "0 auto",
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              What are your preferences? Select all that apply to your ideal next role.
            </p>
          </div>

          {/* Bento Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            {preferences.map((pref) => {
              const isChecked = !!selected[pref.id];
              const isLarge = pref.size === "large";

              return (
                <div
                  key={pref.id}
                  style={{ gridColumn: `span ${pref.span}` }}
                  onClick={() => toggle(pref.id)}
                >
                  <div
                    className={`bento-card ${isChecked ? "checked" : ""}`}
                    style={{
                      backgroundColor: isChecked ? pref.checkedBg : "#ffffff",
                      border: "2px solid #111111",
                      padding: isLarge ? "24px" : "20px",
                      cursor: "pointer",
                      height: "100%",
                      userSelect: "none",
                    }}
                  >
                    {isLarge ? (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                          <span style={{ color: "#111111" }}>{pref.icon}</span>
                          {/* Checkbox */}
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              border: "2px solid #111111",
                              backgroundColor: isChecked ? "#1A4D2E" : "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {isChecked && (
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <h3
                          style={{
                            fontFamily: "'Syne', sans-serif",
                            fontWeight: 800,
                            fontSize: "1.125rem",
                            color: "#111111",
                            textTransform: "uppercase",
                            marginBottom: "6px",
                          }}
                        >
                          {pref.label}
                        </h3>
                        <p style={{ fontSize: "0.80rem", color: "#4b5563" }}>{pref.description}</p>
                      </>
                    ) : (
                      <>
                        <span style={{ color: "#111111", display: "block", marginBottom: "12px" }}>{pref.icon}</span>
                        <h3
                          style={{
                            fontFamily: "'Syne', sans-serif",
                            fontWeight: 800,
                            fontSize: "0.9375rem",
                            color: "#111111",
                            textTransform: "uppercase",
                            marginBottom: "4px",
                          }}
                        >
                          {pref.label}
                        </h3>
                        <p style={{ fontSize: "0.75rem", color: "#4b5563" }}>{pref.description}</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              paddingTop: "24px",
              borderTop: "2px solid rgba(0,0,0,0.1)",
            }}
          >
            {/* Avatars + Social Proof */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ display: "flex" }}>
                {avatars.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="user"
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "2px solid #111111",
                      objectFit: "cover",
                      borderRadius: "50%",
                      marginLeft: i !== 0 ? "-8px" : "0",
                      boxShadow: "2px 2px 0px 0px #111111"
                    }}
                  />
                ))}
              </div>
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#111111",
                  fontFamily: "'Space Grotesk', sans-serif",
                }}
              >
                +2,400 peers joined today
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                className="pref-btn"
                onClick={() => navigate(-1)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#ffffff",
                  color: "#111111",
                }}
              >
                Back
              </button>
              <button
                className="pref-btn"
                onClick={() => navigate("/upload")}
                style={{
                  padding: "12px 32px",
                  backgroundColor: "#1A4D2E",
                  color: "#ffffff",
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </div>

        {/* Floating Toast */}
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            backgroundColor: "#1A4D2E",
            color: "#ffffff",
            border: "2px solid #111111",
            padding: "20px",
            boxShadow: "4px 4px 0px 0px #111111",
            maxWidth: "280px",
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#D8B4FE" stroke="#D8B4FE" strokeWidth="0.5" flexShrink="0" style={{ flexShrink: 0 }}>
              <path d="M12 2a7 7 0 0 1 7 7c0 3.5-2.5 6-4 7.5V18H9v-1.5C7.5 15 5 12.5 5 9a7 7 0 0 1 7-7zm-1 18h2v1a1 1 0 0 1-2 0v-1z" />
            </svg>
            <div>
              <h4
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "-0.025em",
                  marginBottom: "4px",
                }}
              >
                Smart Match
              </h4>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.80rem", fontWeight: 500, opacity: 0.9, lineHeight: 1.4 }}>
                Selecting "Remote" increases your visibility to 40% more international startups.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
