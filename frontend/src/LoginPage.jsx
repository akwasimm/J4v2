import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { login } from "./services/authService.js";
import { getProfile } from "./services/profileService.js";

const footerLinks = ["Privacy Policy", "Terms of Service"];

function NeoButton({ children, type = "button", onClick, bg, color = "#ffffff", fullWidth = false, large = false, shadowSize = "sm", style = {} }) {
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  const shadows = {
    sm: "2px 2px 0px 0px #111111",
    md: "4px 4px 0px 0px #111111",
    lg: "4px 4px 0px 0px #111111",
  };

  const getTransform = () => {
    if (active) return "translate(0,0)";
    if (hovered) return "translate(-2px,-2px)";
    return "translate(0,0)";
  };

  const getBoxShadow = () => {
    if (active) return "none";
    if (hovered) return shadowSize === "sm" ? "4px 4px 0px 0px #111111" : "6px 6px 0px 0px #111111";
    return shadows[shadowSize];
  };

  return (
    <button
      type={type}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false); }}
      onMouseDown={() => setActive(true)}
      onMouseUp={() => setActive(false)}
      style={{
        width: fullWidth ? "100%" : "auto",
        backgroundColor: bg,
        color,
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 900,
        fontSize: large ? "1rem" : "0.875rem",
        textTransform: "uppercase",
        padding: large ? "12px 24px" : "10px 16px",
        border: "2px solid #111111",
        boxShadow: getBoxShadow(),
        transform: getTransform(),
        transition: "all 0.15s ease",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default function LoginPage() {
  useEffect(() => {
    document.title = "Login — JobFor";
  }, []);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRegistered = searchParams.get("registered") === "true";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      const result = await login(email, password);

      // DEBUG: Log the login result
      console.log("Login result:", result);
      console.log("User data:", result?.user);
      console.log("is_new_user flag:", result?.user?.is_new_user);

      // Check if this is a truly new user or an existing user
      // If user has profile data (first_name, headline, etc.), they're existing → skip onboarding
      let hasProfileData = false;
      let profileData = null;
      try {
        profileData = await getProfile();
        console.log("Profile data fetched:", profileData);
        const profile = profileData?.profile || {};
        console.log("Profile object:", profile);
        // Consider user as "existing" if they have any profile data filled in
        hasProfileData = !!(profile.first_name || profile.last_name || profile.headline || profile.location || (profile.profile_completion && profile.profile_completion > 0));
        console.log("Has profile data:", hasProfileData);
      } catch (profileErr) {
        // If profile fetch fails, fall back to is_new_user flag
        console.log("Could not fetch profile:", profileErr);
        console.log("Using is_new_user flag as fallback");
      }

      // Decision logic:
      // - If login succeeded and user has profile data → existing user → dashboard
      // - If login succeeded but no profile data → truly new → onboarding
      if (hasProfileData) {
        console.log("Redirecting to /user (existing user with profile)");
        navigate("/user");
      } else {
        // Use backend flag as fallback
        const isNewUser = result?.user?.is_new_user ?? true;
        console.log("isNewUser from backend:", isNewUser);
        console.log("Redirecting to:", isNewUser ? "/preferences" : "/user");
        navigate(isNewUser ? "/preferences" : "/user");
      }
    } catch (err) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (focused) => ({
    width: "100%",
    backgroundColor: focused ? "#f4f3f3" : "#ffffff",
    border: "2px solid #111111",
    padding: "12px",
    fontWeight: 500,
    outline: "none",
    color: "#111111",
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "0.875rem",
    transition: "box-shadow 0.15s ease, background-color 0.15s ease",
    borderRadius: 0,
    boxShadow: focused ? "2px 2px 0px 0px #1A4D2E" : "none",
    borderColor: focused ? "#1A4D2E" : "#111111"
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&family=Syne:wght@400..800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Space Grotesk', sans-serif;
          background-color: #f9f9f9;
          color: #111111;
          overflow: hidden;
        }

        ::selection { background-color: #1A4D2E; color: #ffffff; }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
          font-size: 24px;
          line-height: 1;
          display: inline-block;
          direction: ltr;
        }

        .input-field::placeholder { color: #8e9591; font-weight: 500; }

        .forgot-link {
          color: #1A4D2E;
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 0.75rem;
          text-transform: uppercase;
          text-decoration: none;
        }
        .forgot-link:hover { text-decoration: underline; text-underline-offset: 4px; }

        .signup-link {
          font-family: 'Syne', sans-serif;
          font-weight: 900;
          color: #111111;
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-decoration-color: #D8B4FE;
          text-underline-offset: 4px;
          padding: 0 4px;
          transition: background-color 0.15s ease;
        }
        .signup-link:hover { background-color: #D8B4FE; }

        .footer-link {
          color: rgba(255,255,255,0.8);
          font-family: 'Syne', sans-serif;
          text-transform: uppercase;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .footer-link:hover { color: #D8B4FE; }

        .dot-pattern {
          background-image: radial-gradient(#111111 2px, transparent 2px);
          background-size: 24px 24px;
        }

        @media (max-width: 768px) {
          .left-panel { display: none !important; }
          .right-panel { width: 100% !important; padding: 24px !important; }
          .mobile-brand { display: block !important; }
          .footer-bar { flex-direction: column !important; text-align: center; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", overflow: "hidden" }}>
        <main style={{ display: "flex", flex: 1 }}>

          {/* ── Left Panel ── */}
          <section
            className="left-panel"
            style={{ width: "50%", backgroundColor: "#f4f3f3", borderRight: "2px solid #111111", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "32px", position: "relative", overflow: "hidden" }}
          >
            <div className="dot-pattern" style={{ position: "absolute", inset: 0, opacity: 0.05, pointerEvents: "none" }} />

            <div style={{ position: "absolute", top: 40, left: 40, width: 100, height: 100, border: "2px solid #111111", backgroundColor: "#D8B4FE", boxShadow: "4px 4px 0px 0px #111111", transform: "rotate(-6deg)" }} />
            <div style={{ position: "absolute", bottom: 40, right: 40, width: 140, height: 140, border: "2px solid #111111", backgroundColor: "#1A4D2E", boxShadow: "4px 4px 0px 0px #111111", transform: "rotate(12deg)" }} />

            <div style={{ position: "relative", zIndex: 10, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
              <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "4.5rem", fontWeight: 900, color: "#111111", lineHeight: 1, letterSpacing: "-0.05em", textTransform: "uppercase" }}>
                Welcome<br />back!
              </h1>

              <div style={{ backgroundColor: "#ffffff", border: "2px solid #111111", padding: "16px 24px", boxShadow: "4px 4px 0px 0px #111111", transform: "rotate(2deg)" }}>
                <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#111111", textTransform: "uppercase", letterSpacing: "-0.025em" }}>
                  Your next career move starts here.
                </p>
              </div>

              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: "16px" }}>
                {[
                  { bg: "#1A4D2E", border: true, color: "#ffffff", icon: "work", fill: true },
                  { bg: "#D8B4FE", border: true, color: "#111111", icon: "architecture", fill: false },
                  { bg: "#ffffff", border: true, color: "#111111", icon: "rocket_launch", fill: false },
                ].map((item, i) => (
                  <div key={i} style={{ width: 44, height: 44, backgroundColor: item.bg, border: item.border ? "2px solid #111111" : "none", display: "flex", alignItems: "center", justifyContent: "center", color: item.color }}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: item.fill ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Right Panel ── */}
          <section
            className="right-panel"
            style={{ width: "50%", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "32px 48px", position: "relative" }}
          >
            <div className="mobile-brand" style={{ position: "absolute", top: 24, left: 24, display: "none" }}>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.25rem", fontWeight: 900, color: "#1A4D2E", textTransform: "uppercase", letterSpacing: "-0.05em" }}>JobFor</span>
            </div>

            <div style={{ width: "100%", maxWidth: 400 }}>
              <header style={{ marginBottom: 32 }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "2.5rem", fontWeight: 900, color: "#111111", textTransform: "uppercase", lineHeight: 1.1, marginBottom: 8 }}>Login</h2>
                <p style={{ color: "#4b5563", fontWeight: 500, fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.875rem" }}>Access your professional workspace.</p>
              </header>

              {isRegistered && !error && (
                <div style={{ backgroundColor: "#dcfce7", border: "1px solid #22c55e", color: "#166534", padding: "12px", marginBottom: "16px", fontSize: "0.875rem", fontWeight: "500" }}>
                  Registration successful! Please log in with your new credentials.
                </div>
              )}
              {error && (
                <div style={{ backgroundColor: "#fee2e2", border: "1px solid #ef4444", color: "#b91c1c", padding: "12px", marginBottom: "16px", fontSize: "0.875rem", fontWeight: "500" }}>
                  {error}
                  {error.toLowerCase().includes("not registered") && (
                    <span style={{ marginLeft: "8px" }}>
                      <Link to="/join" style={{ color: "#b91c1c", textDecoration: "underline", fontWeight: "bold" }}>Register Now</Link>
                    </span>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Email */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <label htmlFor="login-email" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#111111" }}>
                    Email Address
                  </label>
                  <input
                    id="login-email" type="email" required placeholder="name@company.com"
                    className="input-field" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
                    style={inputStyle(emailFocused)}
                  />
                </div>

                {/* Password */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <label htmlFor="login-password" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#111111" }}>
                      Password
                    </label>
                    <a href="#" className="forgot-link">Forgot Password?</a>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      id="login-password" type={showPassword ? "text" : "password"} required placeholder="••••••••"
                      className="input-field" value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)}
                      style={{ ...inputStyle(passwordFocused), paddingRight: 40 }}
                    />
                    <button
                      type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#4b5563", display: "flex", alignItems: "center", padding: 0 }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>{showPassword ? "visibility_off" : "visibility"}</span>
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: "8px" }}>
                  <NeoButton type="submit" bg="#1A4D2E" color="#ffffff" fullWidth large shadowSize="md" style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
                    {loading ? "LOGGING IN..." : "LOGIN"}
                  </NeoButton>
                </div>
              </form>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", margin: "32px 0" }}>
                <div style={{ flexGrow: 1, height: 2, backgroundColor: "#111111" }} />
                <span style={{ padding: "0 12px", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#111111", whiteSpace: "nowrap" }}>
                  OR CONTINUE WITH
                </span>
                <div style={{ flexGrow: 1, height: 2, backgroundColor: "#111111" }} />
              </div>

              {/* Social */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <NeoButton bg="#ffffff" color="#111111" fullWidth shadowSize="sm">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4huHyuKusmR7fnSWTTANvnQWbz_bDRCnHzSuU72Tmoi04KjqC68SQGizCKpsIqeL0A198Zsf78HllDA939Is4PGc6K3bopoTPusJIXivHzqVBRZIcsxSKszv23FPchia0PSUrQpC0axbl6CnK9ZEjik1jY2zoGTrWoHVIrQ8JJjPbWgaDYTOSLJcHg2hw_DfuAC9t657cy6QYjnxroVOsgj7S-LFWuwzAgmjT10jJtaKtkQDo6rvbXTNVVSOTyaE1_cJP80AZRUU" alt="Google" style={{ width: 18, height: 18 }} />
                  Google
                </NeoButton>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <NeoButton bg="#f4f3f3" color="#111111" shadowSize="sm" style={{ width: "100%" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>groups</span>
                    LinkedIn
                  </NeoButton>
                  <NeoButton bg="#111111" color="#ffffff" shadowSize="sm" style={{ width: "100%" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>code</span>
                    GitHub
                  </NeoButton>
                </div>
              </div>

              <footer style={{ marginTop: 32, textAlign: "center" }}>
                <p style={{ fontWeight: 500, color: "#4b5563", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.875rem" }}>
                  Don't have an account?{" "}
                  <Link to="/join" className="signup-link">Sign Up</Link>
                </p>
              </footer>
            </div>
          </section>
        </main>

        {/* ── Footer ── */}
        <footer
          className="footer-bar"
          style={{ width: "100%", padding: "16px 32px", backgroundColor: "#f9f9f9", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, borderTop: "2px solid #111111", flexWrap: "wrap" }}
        >
          <div style={{ color: "#111111", fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.025em" }}>JobFor</div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 16 }}>
            {footerLinks.map((link) => <a key={link} href="#" className="footer-link" style={{color: "#4b5563"}}>{link}</a>)}
          </div>
          <div style={{ color: "#8e9591", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.75rem", fontWeight: 500 }}>
            © 2026 Jobfor. All rights reserved. Made in India with ❤️
          </div>
        </footer>
      </div>
    </>
  );
}
