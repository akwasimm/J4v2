import React from "react";

const styles = {
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "52px",
    backgroundColor: "#ffffff",
    borderTop: "2.5px solid #111111",
    padding: "0 28px",
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  },
  logo: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#111111",
    letterSpacing: "-0.02em",
    userSelect: "none",
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  },
  copyright: {
    fontSize: "12px",
    fontWeight: "500",
    color: "#111111",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
    display: "flex",
    alignItems: "center",
    gap: "5px",
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
  },
  heart: {
    color: "#e5333a",
    fontSize: "14px",
    lineHeight: 1,
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  link: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#111111",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 0.15s",
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif",
    background: "none",
    border: "none",
    padding: 0,
  },
};

const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#e5333a" stroke="#e5333a" strokeWidth="0">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

export default function Footer({
  year = 2026,
  companyName = "JOBFOR",
  onTerms,
  onPrivacy,
  onSecurity,
}) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />
      <footer style={styles.footer}>
        {/* Logo */}
        <div style={styles.logo}>
          {companyName}<span>.</span>
        </div>

        {/* Copyright */}
        <div style={styles.copyright}>
          © {year} {companyName}. ALL RIGHTS RESERVED. MADE IN INDIA WITH&nbsp;
          <HeartIcon />
        </div>

        {/* Links */}
        <nav style={styles.links}>
          {[
            { label: "TERMS", handler: onTerms },
            { label: "PRIVACY", handler: onPrivacy },
            { label: "SECURITY", handler: onSecurity },
          ].map(({ label, handler }) => (
            <button
              key={label}
              style={styles.link}
              onClick={handler}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#2d6a4f")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#111111")}
            >
              {label}
            </button>
          ))}
        </nav>
      </footer>
    </>
  );
}
