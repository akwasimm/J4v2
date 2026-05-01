import React, { useEffect } from "react";

export default function ResumeAnalyzer() {
  useEffect(() => {
    document.title = "Resume Analyzer — JobFor";
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');
      `}</style>

      {/* ─── Blurred Background Content ── */}
      <div
        style={{
          flex: 1,
          padding: "24px",
          filter: "blur(8px)",
          pointerEvents: "none",
          userSelect: "none",
          height: "100%",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          {/* Placeholder content for blur effect */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "40px" }}>
            <div>
              <div style={{ fontSize: "2.5rem", fontWeight: 900, marginBottom: "16px", color: "#111827" }}>
                Resume Intelligence
              </div>
              <div style={{ fontSize: "0.95rem", color: "#4b5563" }}>
                Deconstruct your career architecture...
              </div>
            </div>
            <div style={{ border: "2px dashed #000", padding: "32px", minHeight: "220px", backgroundColor: "#fff" }}>
              <div style={{ fontSize: "1.25rem", fontWeight: 900 }}>Drop Your Blueprint</div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ border: "2px solid #000", padding: "24px", backgroundColor: "#fff", height: "200px" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 900 }}>ATS Fit Score</div>
            </div>
            <div style={{ border: "2px solid #000", padding: "24px", backgroundColor: "#fff", height: "200px" }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 900 }}>Keyword Target</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Content Area Blur Overlay with Coming Soon ── */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(245, 245, 240, 0.7)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
        }}
      >
        {/* Construction Icon */}
        <div
          style={{
            width: "120px",
            height: "120px",
            backgroundColor: "#fef9c3",
            border: "3px solid #000000",
            boxShadow: "6px 6px 0px 0px #000000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: "64px",
              color: "#ca8a04",
              fontVariationSettings: "'FILL' 1",
            }}
          >
            construction
          </span>
        </div>

        {/* Coming Soon Text */}
        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "2.5rem",
            fontWeight: 900,
            color: "#111827",
            textTransform: "uppercase",
            margin: "0 0 12px 0",
            letterSpacing: "-0.02em",
          }}
        >
          Coming Soon
        </h1>

        <p
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "1rem",
            color: "#6b7280",
            margin: "0 0 24px 0",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          Resume Analyzer is under construction. Get ready for ATS scoring and improvement suggestions.
        </p>

        {/* Badge */}
        <div
          style={{
            backgroundColor: "#000000",
            color: "#ffffff",
            padding: "8px 20px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          🚧 Work in Progress
        </div>
      </div>
    </div>
  );
}
