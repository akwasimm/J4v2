import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Discover", to: "/discover" },
  { label: "Insights", to: "/insights" },
  { label: "Skill Gap", to: "/skill-gap" },
  { label: "Career Coach", to: "/coach" },
  { label: "Big Opps", to: "/opportunities" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const linkStyle = (active) => ({
    fontFamily: "'Inter', sans-serif",
    fontWeight: 700,
    fontSize: "0.875rem",
    textDecoration: "none",
    color: active ? "#1A4D2E" : "#1a1c1c",
    padding: "6px 10px",
    borderBottom: active ? "4px solid #1A4D2E" : "4px solid transparent",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@700;900&family=Inter:wght@500;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        .pub-nav-link:hover { color: #1A4D2E !important; border-bottom-color: #D8B4FE !important; }

        .pub-login-btn {
          display: flex; align-items: center; justify-content: center;
          padding: 10px 20px;
          border: 3px solid #1a1c1c;
          background: #ffffff;
          font-family: 'Lexend', sans-serif; font-weight: 900; font-size: 0.8rem;
          text-transform: uppercase; letter-spacing: 0.05em; color: #1a1c1c;
          text-decoration: none;
          box-shadow: 3px 3px 0 0 #1a1c1c;
          transition: all 0.15s ease;
          cursor: pointer;
          white-space: nowrap;
        }
        .pub-login-btn:hover { box-shadow: 5px 5px 0 0 #1a1c1c; transform: translate(-1px,-1px); }
        .pub-login-btn:active { box-shadow: none; transform: translate(3px,3px); }

        .pub-join-btn {
          display: flex; align-items: center; justify-content: center;
          padding: 10px 20px;
          border: 3px solid #1a1c1c;
          background: #1A4D2E;
          font-family: 'Lexend', sans-serif; font-weight: 900; font-size: 0.8rem;
          text-transform: uppercase; letter-spacing: 0.05em; color: #ffffff;
          text-decoration: none;
          box-shadow: 3px 3px 0 0 #1a1c1c;
          transition: all 0.15s ease;
          cursor: pointer;
          white-space: nowrap;
        }
        .pub-join-btn:hover { box-shadow: 5px 5px 0 0 #1a1c1c; transform: translate(-1px,-1px); background: #0f2a1a; }
        .pub-join-btn:active { box-shadow: none; transform: translate(3px,3px); }

        .pub-mobile-link {
          display: block; padding: 16px 24px;
          font-family: 'Lexend', sans-serif; font-weight: 700; font-size: 0.875rem;
          text-transform: uppercase; letter-spacing: 0.05em;
          text-decoration: none; color: #1a1c1c;
          border-bottom: 2px solid #e5e5e5;
          transition: background-color 0.15s ease;
        }
        .pub-mobile-link:hover { background-color: #f0ffe8; }
        .pub-mobile-link.active { color: #1A4D2E; background-color: #f0ffe8; border-left: 4px solid #1A4D2E; }

        @media (max-width: 900px) {
          .pub-nav-center { display: none !important; }
          .pub-nav-buttons { display: none !important; }
          .pub-hamburger { display: flex !important; }
        }
        @media (min-width: 901px) {
          .pub-hamburger { display: none !important; }
          .pub-mobile-menu { display: none !important; }
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
          font-size: 24px; line-height: 1; display: inline-block; direction: ltr;
        }
      `}</style>

      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 80, backgroundColor: "#ffffff",
        borderBottom: "4px solid #1a1c1c",
        boxShadow: "0 4px 0 0 #1a1c1c",
      }}>
        <div style={{
          height: "100%", maxWidth: 1400, margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "0 32px",
        }}>
          {/* Brand */}
          <Link to="/" style={{
            fontFamily: "'Lexend', sans-serif", fontWeight: 900, fontSize: "1.5rem",
            color: "#1A4D2E", textDecoration: "none", textTransform: "uppercase",
            letterSpacing: "-0.05em", flexShrink: 0,
          }}>
            JobFor<span style={{ color: "#D8B4FE" }}>.</span>
          </Link>

          {/* Desktop nav links */}
          <nav className="pub-nav-center" style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {NAV_LINKS.map(({ label, to }) => (
              <Link key={to} to={to} className="pub-nav-link" style={linkStyle(pathname === to)}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop buttons */}
          <div className="pub-nav-buttons" style={{ display: "flex", gap: 12, flexShrink: 0 }}>
            <Link to="/login" className="pub-login-btn">Login</Link>
            <Link to="/join" className="pub-join-btn">Join Free</Link>
          </div>

          {/* Hamburger */}
          <button
            className="pub-hamburger"
            onClick={() => setOpen(!open)}
            style={{
              background: "none", border: "2px solid #1a1c1c", padding: 8,
              cursor: "pointer", display: "none", alignItems: "center",
            }}
          >
            <span className="material-symbols-outlined">{open ? "close" : "menu"}</span>
          </button>
        </div>

        {/* Mobile dropdown */}
        {open && (
          <div className="pub-mobile-menu" style={{
            position: "absolute", top: 80, left: 0, right: 0,
            backgroundColor: "#ffffff", borderBottom: "4px solid #1a1c1c",
            boxShadow: "0 8px 0 0 #1a1c1c", zIndex: 99,
          }}>
            {NAV_LINKS.map(({ label, to }) => (
              <Link key={to} to={to} className={`pub-mobile-link${pathname === to ? " active" : ""}`} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            <div style={{ display: "flex", gap: 12, padding: 16, borderTop: "2px solid #e5e5e5" }}>
              <Link to="/login" className="pub-login-btn" style={{ flex: 1 }} onClick={() => setOpen(false)}>Login</Link>
              <Link to="/join" className="pub-join-btn" style={{ flex: 1 }} onClick={() => setOpen(false)}>Join Free</Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
