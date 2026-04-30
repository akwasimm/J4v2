import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "./services/authService.js";

// ─── Data ───────────────────────────────────────────────────────────────────

const communityUsers = [
  { id: 1, src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGsXK-GkLWSZ9lzPS1I13YZI4CAXJP77gMKSNrB-wDFX5X_hwdcWlBcI9wjVZFHmLbfVK1T-D9yV5q0o2VasPgY5T-aN3wNtVOHENvtjLbQp_Q-SL5feTy1IjGO_E8bQ87O8Ir0X_EppNlQvcsTtMMl27gyoRWjq8PRBjccXKkeHizPH2zXqkgPosZtZ11NRgjo_2PO8fu8HHUfY_BmxSjzZ-4HotYKvbgC-zwmU8J-YX9WkGgY_HG3qXh0dmUsVKLJhr3ELcvanM", bg: "#D8B4FE", rotate: "-6deg" },
  { id: 2, src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAF8VUQD2sYcsFo5IHB9wc-76Y9liVPToA8Y2KBvsZxzd8LMMpn0gnlVC2wGBgrCqdtj0shMNsb_v3dPskpsaSeO0lNuPFjBu_CMlhgnrtSKSrT2HiSpopmQhYxAfDiXDHSo-13-dDdz18lhQFNO6p-LweHBSK2gZj7OH7n-XzWB7ZyaMG6xKyKQk25KYIkQiB3by6YMtblQccSthtEAB8zj5GGzJL8FOBwFRKyOzdzx-VbaN7PRn19h57RWeNCESAL-jCojcnWYq8", bg: "#ffffff", rotate: "12deg" },
  { id: 3, src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD4odaUtsZwNy1Yxr-CbKSZUVvHm5gfTbZg7pVwJ0j8oknQj243a6a0tDT_aAOdShkK8mPvA4J2CYojzBTEk7Z8rcWRESRMHCD4ufQgSiG3_9YpT1vnyZZgstN2_iGTAopEGcLOvmYpwznQ4ApjbP2Joal1PV98M02hAgiiaxtc8DkIkeWenXbK5qCP1O6ufreqmYVIU5Vz0j45qvzK9pUhMROR-qt4yC7v3ONJ9O1awUqi7IAYIGFjQgf-fGlsBz-3pzwuIXLK2Rg", bg: "#bbf7d0", rotate: "-12deg" },
  { id: 4, src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD6eGsvDXl6x3UpTdwlUNoCynz-lTMNrAY4PzwRjU0qdhlHFXXvvxfnjIorFTSsyJAWrjfZSMf6kWyYntoUJCy39Iz6SzZpD_dHNckvjk7tgNbJJ1ggeY9CZDohBxj5Sbb5A7GOPbooQK5nh3Law4yMwEaHcwdWbhngyyUPNAuAEwSYyrRxq-tnHovZJ-8yzgH8T-BZl6EJry-3Kyz3XxW34Rt78wyOEPavXkWAOd7qOqZnnWdkghl5QrQ5Lz3QSKVBy1DwzZ_qj_M", bg: "#D8B4FE", rotate: "6deg" },
  { id: 5, src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHTWmjYZ2sbGbB20xmowMckh8Z0nn_hYsKIaPQIFHA1QcDXhq9_ljBDy4LzMslealRXVe7dFhxe9Q4g-vaIDN4DNfkTyekdvBgTfNmYK92xKWLLyOU5ytTgnf_PYmbxyCC1RGp8DE4Je2Sxc6GQ5Lateh544wEhc5SQoFF84hbolTfj0MIysGlqzkN_9rWGYE8KD2N5Mks1R6-hlZKcyrvlWWQMWts4BHEe63zMIgPsqlwBKkNy4mJ2MRcs5AVykKmJ5Cj1iJKLE0", bg: "#ffffff", rotate: "3deg" },
  { id: 6, src: "https://lh3.googleusercontent.com/aida-public/AB6AXuD9zWdDBkN655lYFBLPWUDvKbMf1dB_YJseTbPmC6Wgx_aWJqpgr4qipjd2B_3aPPhH2oYl7G60v7-QexBcuDefovoqVMVkor1yb0I0E6H-B06ZxH8lCx5onUIq_iKsBFmRuC0ax6axUAaBlNiTm-UmTddiC3G1YOBLjB4dHaxyP-IhN6lm4rpUYtCuERnpI0haDyqU5nutjV_bsROm2KAUmnpHXlJRc0x1fXXf9i_mfOuh1urIOzlaj-rv5CHtKF92M-5hVeaqHeY", bg: "#bbf7d0", rotate: "-3deg" },
  { id: 7, src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBimv0EWbpD7YCHcH2jjxIAuTevy7Esg2zGF74YxWgmWHocUaDR1i7gNxCsf5O6XoM9G6S25YTMozcxPjrzDln4_HevaxDgAo1liVJ0tHbVFo14RsB1jqbkGsP_5rs3-VxqvrwdYhbT7khP6nCInivqHzEz2-7A-2qtQVrDT1cNNsDCtSC6eo-8-sJiE5q_oUkgMI79lNwtIKfLU9Bi9rBMbb8F0gfEn7tF_Kyj2OYYh8-WKH1MSPftCWSVu339RdbnRkiTXoOuNMU", bg: "#D8B4FE", rotate: "12deg" },
  { id: 8, src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAnyWcZNbAWSIb43vYfF_N8M0FmJIz2UVycCuNfEKS0KL1bt_KSwAyd7FHAbU1QGOCm9jRE19LA50JqIrrQrGcDMGcGKdJ6fOkXIYrgc3Fea5I4e30LAB1--2jHIhtfzw5jecGbh_72cl8e0Ht9F-jD_2JFDc4laSHc8jE20N6UOTHvju_soBWl0cMA2g91rKF-eZVfkq4KiAhWjFNNHReGWcRqzukqM16ojthNogLY5BEFVvuXuw83v-efuEWV7Xa8nfUBBsl377M", bg: "#ffffff", rotate: "-6deg" },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JoinCommunity() {
  useEffect(() => {
    document.title = "Join Community — JobFor";
  }, []);

  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [btnHover, setBtnHover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Please agree to the Terms of Service.");
      return;
    }

    if (!form.name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/\d/.test(form.password)) {
      setError("Password must contain at least one number.");
      return;
    }
    if (!/[a-zA-Z]/.test(form.password)) {
      setError("Password must contain at least one letter.");
      return;
    }

    const names = form.name.trim().split(" ");
    const firstName = names[0];
    const lastName = names.length > 1 ? names.slice(1).join(" ") : "";

    try {
      setLoading(true);
      await register(form.email, form.password, firstName, lastName);
      // Redirect to onboarding preferences page upon success
      navigate("/preferences");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Space Grotesk', sans-serif;
          background-color: #ffffff;
          color: #111827;
          overflow: hidden;
          height: 100vh;
        }

        h1, h2, h3, h4 { font-family: 'Syne', sans-serif; }

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

        .neo-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #111111;
          box-shadow: none;
          outline: none;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          transition: box-shadow 0.15s ease;
          border-radius: 0;
          background: #ffffff;
        }
        .neo-input:focus { box-shadow: 2px 2px 0px 0px #1A4D2E; }
        .neo-input::placeholder { color: #d1d5db; }

        .submit-btn {
          width: 100%;
          background-color: #D8B4FE;
          color: #111111;
          font-weight: 800;
          text-transform: uppercase;
          padding: 12px 24px;
          border: 2px solid #111111;
          box-shadow: 4px 4px 0px 0px #1A4D2E;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.15s ease;
          letter-spacing: 0.05em;
        }
        .submit-btn:hover {
          transform: translate(2px, 2px);
          box-shadow: 4px 4px 0px 0px #1A4D2E;
        }

        .social-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border: 2px solid #111111;
          padding: 12px;
          font-weight: 700;
          background: #ffffff;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.875rem;
          transition: background-color 0.15s ease;
        }
        .social-btn:hover { background-color: #f9fafb; }

        .step-circle-active {
          width: 32px; height: 32px;
          border-radius: 9999px;
          border: 2px solid #111111;
          background-color: #1A4D2E;
          color: #ffffff;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 2px 2px 0px 0px #111111;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
        }

        .step-circle-inactive {
          width: 32px; height: 32px;
          border-radius: 9999px;
          border: 2px solid #e5e7eb;
          background-color: #f9fafb;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
          color: #9ca3af;
        }

        .avatar {
          width: 64px; height: 64px;
          border-radius: 9999px;
          border: 2px solid #111111;
          overflow: hidden;
          box-shadow: 2px 2px 0px 0px #111111;
        }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }

        .checkbox-custom {
          width: 20px; height: 20px;
          border: 2px solid #111111;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
          background: #ffffff;
          border-radius: 0;
        }
        .checkbox-custom:checked { background-color: #1A4D2E; }
        .checkbox-custom:checked::after {
          content: '✓';
          position: absolute;
          color: white;
          font-size: 13px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
        }

        .arrow-icon { transition: transform 0.15s ease; }
        .submit-btn:hover .arrow-icon { transform: translateX(4px); }

        @media (max-width: 1024px) {
          .left-panel  { display: none !important; }
          .right-panel { width: 100% !important; }
        }
      `}</style>

      <main style={{ display: "flex", height: "100vh", width: "100%", overflow: "hidden" }}>

        {/* ── Left Panel ── */}
        <section
          className="left-panel"
          style={{
            width: "50%",
            backgroundColor: "#1A4D2E",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "48px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Dot grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.1,
              backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
              backgroundSize: "30px 30px",
            }}
          />

          <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
            {/* Logo */}
            <a
              href="/"
              style={{
                display: "inline-block",
                fontSize: "1.875rem",
                fontWeight: 800,
                fontFamily: "'Syne', sans-serif",
                letterSpacing: "-0.05em",
                color: "#ffffff",
                textDecoration: "none",
                marginBottom: "48px",
              }}
            >
              JobFor<span style={{ color: "#D8B4FE" }}>.</span>
            </a>

            {/* Heading */}
            <h1
              style={{
                fontSize: "3.5rem",
                fontWeight: 800,
                color: "#ffffff",
                lineHeight: 1.1,
                textTransform: "uppercase",
                maxWidth: "512px",
                margin: "0 auto 32px auto",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              Join the <br />
              <span style={{ color: "#D8B4FE", WebkitTextStroke: "1px #111111" }}>
                Community
              </span>
            </h1>

            {/* Avatar Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "16px",
                maxWidth: "320px",
                margin: "48px auto 0 auto",
              }}
            >
              {communityUsers.map((user) => (
                <div
                  key={user.id}
                  className="avatar"
                  style={{ backgroundColor: user.bg, transform: `rotate(${user.rotate})` }}
                >
                  <img src={user.src} alt="Community member" />
                </div>
              ))}
            </div>

            {/* Tagline */}
            <p
              style={{
                marginTop: "48px",
                color: "#dcfce7",
                fontSize: "1.125rem",
                fontWeight: 500,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              Over 50,000+ professionals are waiting for you.
            </p>
          </div>
        </section>

        {/* ── Right Panel ── */}
        <section
          className="right-panel"
          style={{
            width: "50%",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            padding: "32px 64px",
            overflowY: "auto",
          }}
        >
          {/* Progress Steps */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#1A4D2E" }}>
              <div className="step-circle-active">1</div>
              <span>Account Details</span>
            </div>
            <div style={{ height: "1px", width: "32px", backgroundColor: "#111111" }} />
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#9ca3af" }}>
              <div className="step-circle-inactive">2</div>
              <span>Preferences</span>
            </div>
          </div>

          {/* Form Container */}
          <div style={{ maxWidth: "448px", width: "100%" }}>
            <h2
              style={{
                fontSize: "2.25rem",
                fontWeight: 800,
                textTransform: "uppercase",
                marginBottom: "8px",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              Create Account
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "24px", fontFamily: "'Space Grotesk', sans-serif" }}>
              Start your journey with JobFor today.
            </p>

            {error && (
              <div style={{ backgroundColor: "#fee2e2", border: "1px solid #ef4444", color: "#b91c1c", padding: "12px", marginBottom: "16px", fontSize: "0.875rem", fontWeight: "500" }}>
                {error.replace(/Value error,\s*/g, "").replace(/String should have/g, "Input must have")}
                {error.toLowerCase().includes("already in use") && (
                  <span style={{ marginLeft: "8px" }}>
                    <Link to="/login" style={{ color: "#b91c1c", textDecoration: "underline", fontWeight: "bold" }}>Log In instead</Link>
                  </span>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Full Name */}
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Full Name
                </label>
                <input className="neo-input" type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} />
              </div>

              {/* Email */}
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Email Address
                </label>
                <input className="neo-input" type="email" name="email" placeholder="john@example.com" value={form.email} onChange={handleChange} />
              </div>

              {/* Password */}
              <div>
                <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    className="neo-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    style={{ paddingRight: "48px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0, display: "flex", alignItems: "center" }}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Terms */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 0" }}>
                <input className="checkbox-custom" type="checkbox" id="terms" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
                <label htmlFor="terms" style={{ fontSize: "0.875rem", fontWeight: 500, color: "#4b5563", fontFamily: "'Space Grotesk', sans-serif", cursor: "pointer" }}>
                  I agree to the{" "}
                  <a
                    href="#"
                    style={{ color: "#1A4D2E", fontWeight: 700, textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                  >
                    Terms of Service
                  </a>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="submit-btn"
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
              >
                {loading ? "Creating..." : "Get Started"}
                {!loading && (
                  <span
                    className="material-symbols-outlined arrow-icon"
                    style={{ transform: btnHover ? "translateX(4px)" : "translateX(0)", transition: "transform 0.15s ease" }}
                  >
                    arrow_forward
                  </span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", margin: "32px 0" }}>
              <div style={{ flexGrow: 1, height: 2, backgroundColor: "#111111" }} />
              <span style={{ padding: "0 12px", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#111111", whiteSpace: "nowrap" }}>
                OR SIGN UP WITH
              </span>
              <div style={{ flexGrow: 1, height: 2, backgroundColor: "#111111" }} />
            </div>

            {/* Social Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button className="social-btn" style={{ width: "100%", padding: "12px", gap: "8px" }}>
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4huHyuKusmR7fnSWTTANvnQWbz_bDRCnHzSuU72Tmoi04KjqC68SQGizCKpsIqeL0A198Zsf78HllDA939Is4PGc6K3bopoTPusJIXivHzqVBRZIcsxSKszv23FPchia0PSUrQpC0axbl6CnK9ZEjik1jY2zoGTrWoHVIrQ8JJjPbWgaDYTOSLJcHg2hw_DfuAC9t657cy6QYjnxroVOsgj7S-LFWuwzAgmjT10jJtaKtkQDo6rvbXTNVVSOTyaE1_cJP80AZRUU"
                  alt="Google"
                  style={{ width: "18px", height: "18px" }}
                />
                Google
              </button>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <button className="social-btn" style={{ gap: "8px", backgroundColor: "#f4f3f3" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e5e5'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f4f3f3'}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>groups</span>
                  LinkedIn
                </button>
                <button className="social-btn" style={{ gap: "8px", backgroundColor: "#111111", color: "#ffffff" }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333333'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#111111'}>
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>code</span>
                  GitHub
                </button>
              </div>
            </div>

            {/* Login Link */}
            <div
              style={{
                marginTop: "32px",
                textAlign: "center"
              }}
            >
              <p style={{ fontWeight: 500, color: "#4b5563", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.875rem" }}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 900,
                    color: "#111111",
                    textDecoration: "underline",
                    textDecorationThickness: "2px",
                    textDecorationColor: "#D8B4FE",
                    textUnderlineOffset: "4px",
                    padding: "0 4px",
                    transition: "background-color 0.15s ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D8B4FE")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  Log In
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <footer
            style={{
              marginTop: "auto",
              paddingTop: "24px",
              fontSize: "0.75rem",
              color: "#9ca3af",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            © 2026 Jobfor. All rights reserved. Made in India with ❤️
          </footer>
        </section>
      </main>
    </>
  );
}
