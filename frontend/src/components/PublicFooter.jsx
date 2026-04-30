import React from "react";
import { Link } from "react-router-dom";

const FOOTER_LINKS = ["Privacy Policy", "Terms of Service"];

export default function PublicFooter() {
  return (
    <footer style={{ borderTop: "3px solid #000000", backgroundColor: "#ffffff" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <Link to="/" style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Syne', sans-serif", letterSpacing: "-0.05em", color: "#1A4D2E", textDecoration: "none" }}>
          JOBFOR<span style={{ color: "#D8B4FE" }}>.</span>
        </Link>
        <div style={{ color: "#000000", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Space Grotesk', sans-serif", textAlign: "center" }}>
          © 2026 Jobfor. All rights reserved. Made in India with ❤️
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          {FOOTER_LINKS.map((link) => (
            <a key={link} href="#" style={{ color: "#000000", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", textDecoration: "none" }}>
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
