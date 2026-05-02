import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume } from "./services/profileService.js";

// Update dash border to 4px and color #111111
const dashedBorderStyle = {
  backgroundImage: `url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='%23111111' stroke-width='4' stroke-dasharray='16%2c 16' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e")`,
};

const PdfIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#1A4D2E">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17h8v1H8v-1zm0-3h8v1H8v-1zm0-3h4v1H8v-1z"/>
  </svg>
);

const DocxIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="#D8B4FE">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM8 17h8v1H8v-1zm0-3h8v1H8v-1zm0-3h8v1H8v-1z"/>
  </svg>
);

// Changed color to deep green #1A4D2E
const UploadIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#1A4D2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const LightbulbIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18" />
    <line x1="10" y1="22" x2="14" y2="22" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
  </svg>
);

export default function UploadResumePage() {
  useEffect(() => {
    document.title = "Upload Resume — JobFor";
  }, []);

  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setError("");
      setFile(e.target.files[0]);
    }
  };

  const handleCompleteSetup = async () => {
    if (!file) {
      navigate("/user");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const data = await uploadResume(file);
      console.log("Resume uploaded:", data.resume_url);
      navigate("/user");
    } catch (error) {
      console.error("Upload error:", error);
      setError(error.message || "There was an error uploading your resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        
        *, *::before, *::after { box-sizing: border-box; }
        
        .upload-btn {
            background-color: #D8B4FE;
            color: #111111;
            border: 2px solid #111111;
            padding: 12px 24px;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 800;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            box-shadow: 4px 4px 0px 0px #1A4D2E;
            cursor: pointer;
            transition: all 0.15s;
        }
        .upload-btn:hover {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0px 0px #1A4D2E;
        }
        
        .complete-btn {
            border: 2px solid #111111;
            padding: 14px 32px;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 800;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            background-color: #1A4D2E;
            color: #ffffff;
            cursor: pointer;
            box-shadow: 4px 4px 0px 0px #111111;
            transition: all 0.15s;
        }
        .complete-btn:hover {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0px 0px #111111;
        }

        .skip-btn {
            border: 2px solid #111111;
            padding: 14px 24px;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 800;
            font-size: 0.875rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            background-color: transparent;
            cursor: pointer;
            transition: background 0.15s;
        }
        .skip-btn:hover {
            background-color: #f4f3f3;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#ffffff",
          fontFamily: "'Space Grotesk', sans-serif",
          padding: "24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative BG */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            right: 0,
            zIndex: 0,
            opacity: 0.04,
            pointerEvents: "none",
            width: "300px",
            height: "300px",
            border: "20px solid #111111",
          }}
        />
        <div
          style={{
            position: "fixed",
            top: "80px",
            left: "50%",
            zIndex: 0,
            opacity: 0.02,
            pointerEvents: "none",
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(120px, 15vw, 240px)",
            lineHeight: 1,
            color: "#111111",
            userSelect: "none",
            transform: "translateX(-50%)",
          }}
        >
          JOBFOR
        </div>

        <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative", zIndex: 1 }}>

          {/* Header */}
          <header style={{ marginBottom: "24px", textAlign: "center" }}>
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                color: "#111111",
                textTransform: "uppercase",
                letterSpacing: "-0.025em",
                lineHeight: 1.0,
                marginBottom: "12px",
              }}
            >
              Final Step:<br />
              <span style={{ color: "#ffffff", WebkitTextStroke: "1px #111111" }}>Upload Resume</span>
            </h1>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#4b5563",
                maxWidth: "520px",
                margin: "0 auto",
                fontWeight: 500,
                lineHeight: 1.6,
              }}
            >
              Let's make it official. Our systems will parse your profile. Use a clean PDF or DOCX format for maximum impact.
            </p>
          </header>

          {/* Bento Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "16px",
              alignItems: "stretch",
            }}
          >
            {/* Desktop split layout */}
            <style>{`
              @media (min-width: 768px) {
                .resume-grid {
                  grid-template-columns: 2fr 1fr !important;
                }
              }
            `}</style>

            <div className="resume-grid" style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
              {/* Drop Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current.click()}
                style={{
                  position: "relative",
                  zIndex: 1,
                  backgroundColor: dragOver ? "#f4f3f3" : "#ffffff",
                  border: "2px solid #111111",
                  padding: "32px 24px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  ...dashedBorderStyle,
                }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.docx"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <div style={{ marginBottom: "24px" }}>
                  <UploadIcon />
                </div>
                {file ? (
                  <>
                    <h3
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 800,
                        fontSize: "1.25rem",
                        textTransform: "uppercase",
                        marginBottom: "6px",
                        color: "#1A4D2E",
                      }}
                    >
                      {file.name}
                    </h3>
                    <p style={{ color: "#4b5563", fontWeight: 500, fontSize: "0.875rem" }}>
                      {(file.size / 1024 / 1024).toFixed(2)} MB — Ready to upload
                    </p>
                  </>
                ) : (
                  <>
                    <h3
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 800,
                        fontSize: "1.5rem",
                        textTransform: "uppercase",
                        marginBottom: "8px",
                        color: "#111111",
                      }}
                    >
                      Drop your resume here
                    </h3>
                    <p style={{ color: "#4b5563", fontWeight: 500, marginBottom: "24px", fontSize: "0.875rem" }}>
                      PDF, DOCX up to 10MB
                    </p>
                    <button
                      className="upload-btn"
                      onClick={(e) => { e.stopPropagation(); inputRef.current.click(); }}
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>

              {/* Right Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                {/* Accepted Formats */}
                <div
                  style={{
                    backgroundColor: "#f4f3f3",
                    border: "2px solid #111111",
                    padding: "16px",
                    boxShadow: "4px 4px 0px 0px #111111",
                  }}
                >
                  <h4
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 800,
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: "12px",
                      color: "#111111",
                    }}
                  >
                    Accepted Formats
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      { icon: <PdfIcon />, label: "PDF Document" },
                      { icon: <DocxIcon />, label: "DOCX Word" },
                    ].map(({ icon, label }) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          backgroundColor: "#ffffff",
                          border: "2px solid #111111",
                          padding: "8px 12px",
                        }}
                      >
                        {icon}
                        <span
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            color: "#111111",
                          }}
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tip Card */}
                <div
                  style={{
                    backgroundColor: "#D8B4FE",
                    border: "2px solid #111111",
                    padding: "16px",
                    flex: 1,
                  }}
                >
                  <div style={{ marginBottom: "12px" }}>
                    <LightbulbIcon />
                  </div>
                  <h4
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 800,
                      fontSize: "1rem",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                      color: "#111111",
                    }}
                  >
                    Editor's Tip
                  </h4>
                  <p
                    style={{
                      fontSize: "0.80rem",
                      fontWeight: 500,
                      lineHeight: 1.5,
                      color: "#111111",
                    }}
                  >
                    0px border radius is our brand. Ensure your resume design matches this precision and clarity for better ATS alignment.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          {error ? (
            <div style={{ marginTop: "20px", backgroundColor: "#fef2f2", border: "2px solid #111111", padding: "10px 12px", color: "#991b1b", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>
              {error}
            </div>
          ) : null}

          <div
            style={{
              marginTop: "32px",
              paddingTop: "16px",
              borderTop: "2px solid rgba(0,0,0,0.1)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
            }}
          >
            {/* Security Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#1A4D2E",
                  border: "2px solid #111111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "2px 2px 0px 0px #111111"
                }}
              >
                <ShieldIcon />
              </div>
              <p
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  maxWidth: "180px",
                  lineHeight: 1.4,
                  color: "#111111"
                }}
              >
                Secure encryption. Your data is your property.
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <button
                className="skip-btn"
                onClick={() => navigate("/user")}
              >
                Skip for now
              </button>
              <button
                className="complete-btn"
                onClick={handleCompleteSetup}
                disabled={isUploading}
                style={{ opacity: isUploading ? 0.7 : 1 }}
              >
                {isUploading ? "Uploading..." : "Complete Setup"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
