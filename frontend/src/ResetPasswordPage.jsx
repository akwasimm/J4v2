import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "./api/client";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // The backend puts the one-hour token in the emailed link. When the page is
  // opened with ?token=... it switches to the "choose a new password" step, so
  // the same route serves both halves of the flow.
  const tokenFromLink = params.get("token");

  useEffect(() => {
    document.title = tokenFromLink ? "Choose a New Password — JobFor" : "Reset Password — JobFor";
  }, [tokenFromLink]);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [backHover, setBackHover] = useState(false);
  const [, setInputFocused] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    setError("");
    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Could not send the reset link. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleNewPassword = async (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Those passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(tokenFromLink, newPassword);
      setDone(true);
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Could not reset the password. The link may have expired.");
    } finally {
      setBusy(false);
    }
  };

  const backToLogin = () => navigate("/login");

  // ── Step 2: arrived from the emailed link, choose a new password ──────────
  if (tokenFromLink) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

          body {
            font-family: 'Space Grotesk', sans-serif;
            background-color: #D8B4FE;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }

          h1, h2, h3 { font-family: 'Syne', sans-serif; }

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

          .reset-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #111111;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 1rem;
            font-weight: 500;
            background: #ffffff;
          }
          .reset-input:focus { outline: 3px solid #1A4D2E; outline-offset: 2px; }

          .submit-btn {
            width: 100%;
            padding: 16px;
            background: #1A4D2E;
            color: #ffffff;
            border: 2px solid #111111;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.9375rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: '0.05em';
            cursor: pointer;
            box-shadow: 3px 3px 0px 0px #111111;
            transition: transform 0.15s ease, box-shadow 0.15s ease;
          }
          .submit-btn:hover:not(:disabled) { transform: translate(2px, 2px); box-shadow: none; }
          .submit-btn:disabled { opacity: 0.6; cursor: wait; }

          .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: none;
            border: none;
            cursor: pointer;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.875rem;
            font-weight: 700;
            padding: 8px;
          }
          .back-link .link-text { text-decoration: underline; text-underline-offset: 4px; }

          .error-box {
            background: #fee2e2;
            border: 2px solid #991b1b;
            color: #7f1d1d;
            padding: 12px;
            font-size: 0.875rem;
            font-weight: 700;
          }
        `}</style>

        <div style={{ width: "100%", maxWidth: "440px" }}>
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #111111",
              padding: "40px",
              boxShadow: "6px 6px 0px 0px #1A4D2E",
            }}
          >
            {done ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "#1A4D2E",
                    border: "2px solid #111111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 20px",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: "#ffffff", fontSize: "28px" }}>
                    check
                  </span>
                </div>
                <h1
                  style={{
                    fontSize: "1.875rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "-0.025em",
                    marginBottom: "12px",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  Password Updated
                </h1>
                <p style={{ color: "#4b5563", fontWeight: 500, lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif" }}>
                  You can now sign in with your new password.
                </p>
                <button
                  className="submit-btn"
                  onClick={backToLogin}
                  style={{ marginTop: "28px" }}
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "32px" }}>
                  <h1
                    style={{
                      fontSize: "1.875rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "-0.025em",
                      marginBottom: "8px",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    Choose a New Password
                  </h1>
                  <p style={{ color: "#4b5563", fontWeight: 500, lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif" }}>
                    This link works once and expires an hour after it was sent.
                  </p>
                </div>

                <form onSubmit={handleNewPassword} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {error && <div className="error-box" role="alert">{error}</div>}

                  <div>
                    <label
                      htmlFor="new-password"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: "8px",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      New Password
                    </label>
                    <input
                      id="new-password"
                      className="reset-input"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="confirm-password"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: "8px",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirm-password"
                      className="reset-input"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <p style={{ fontSize: "0.75rem", color: "#4b5563", fontWeight: 500, lineHeight: 1.5, marginTop: "-8px" }}>
                    At least 8 characters, including one letter and one number.
                  </p>

                  <button type="submit" className="submit-btn" disabled={busy}>
                    {busy ? "Updating…" : "Update Password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </>
    );
  }

  // ── Step 1: request a link ────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Space Grotesk', sans-serif;
          background-color: #D8B4FE;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        h1, h2, h3 { font-family: 'Syne', sans-serif; }

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

        .reset-input {
          width: 100%;
          padding: 12px;
          border: 2px solid #111111;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          font-weight: 500;
          color: #111111;
          background: #ffffff;
          outline: none;
          transition: box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .reset-input::placeholder { color: #9ca3af; }
        .reset-input:focus {
          box-shadow: 2px 2px 0px 0px #1A4D2E;
          border-color: #111111;
        }

        .submit-btn {
          width: 100%;
          background-color: #1A4D2E;
          color: #ffffff;
          font-weight: 800;
          padding: 12px 24px;
          border: 2px solid #111111;
          box-shadow: 4px 4px 0px 0px #111111;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.15s ease;
        }
        .submit-btn:hover {
          transform: translate(2px, 2px);
          box-shadow: none;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #111111;
          font-weight: 700;
          text-decoration: none;
          font-family: 'Space Grotesk', sans-serif;
          transition: text-decoration 0.15s ease;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          font-size: 1rem;
        }
        .back-link:hover .link-text { text-decoration: underline; }

        .success-icon {
          width: 64px;
          height: 64px;
          background-color: #1A4D2E;
          border: 2px solid #111111;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px auto;
          box-shadow: 4px 4px 0px 0px #111111;
        }
      `}</style>

      {/* Page background wrapper */}
      <div
        style={{
          backgroundColor: "#D8B4FE",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          width: "100%",
        }}
      >
        <div style={{ width: "100%", maxWidth: "448px" }}>

          {/* ── Logo ── */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <a
              href="/"
              style={{
                fontSize: "2.25rem",
                fontWeight: 800,
                fontFamily: "'Syne', sans-serif",
                letterSpacing: "-0.05em",
                color: "#111111",
                textDecoration: "none",
              }}
            >
              JobFor
              <span style={{ color: "#ffffff", WebkitTextStroke: "1px #111111" }}>.</span>
            </a>
          </div>

          {/* ── Card ── */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "2px solid #111111",
              padding: "40px",
              boxShadow: "6px 6px 0px 0px #1A4D2E",
              position: "relative",
            }}
          >
            {!submitted ? (
              <>
                {/* Header */}
                <div style={{ marginBottom: "32px" }}>
                  <h1
                    style={{
                      fontSize: "1.875rem",
                      fontWeight: 800,
                      color: "#111111",
                      textTransform: "uppercase",
                      letterSpacing: "-0.025em",
                      marginBottom: "8px",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    Reset Password
                  </h1>
                  <p style={{ color: "#4b5563", fontWeight: 500, lineHeight: 1.6, fontFamily: "'Space Grotesk', sans-serif" }}>
                    Enter your email address and we'll send you a link to get back into your account.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {error && (
                    <div
                      role="alert"
                      style={{
                        backgroundColor: "#fee2e2",
                        border: "2px solid #991b1b",
                        color: "#7f1d1d",
                        padding: "12px",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="email"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        marginBottom: "8px",
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      Email Address
                    </label>
                    <input
                      id="email"
                      className="reset-input"
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="hello@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                    />
                  </div>

                  <button type="submit" className="submit-btn" disabled={busy}>
                    {busy ? "Sending…" : "Send Reset Link"}
                  </button>
                </form>

                {/* Back Link */}
                <div
                  style={{
                    marginTop: "40px",
                    paddingTop: "24px",
                    borderTop: "2px solid rgba(0,0,0,0.1)",
                    textAlign: "center",
                  }}
                >
                  <button
                    className="back-link"
                    onClick={backToLogin}
                    onMouseEnter={() => setBackHover(true)}
                    onMouseLeave={() => setBackHover(false)}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontWeight: 700,
                        transform: backHover ? "translateX(-4px)" : "translateX(0)",
                        transition: "transform 0.15s ease",
                      }}
                    >
                      arrow_back
                    </span>
                    <span className="link-text">Back to Login</span>
                  </button>
                </div>
              </>
            ) : (
              /* ── Success State ── */
              <div style={{ textAlign: "center", padding: "16px 0" }}>
                <div className="success-icon">
                  <span className="material-symbols-outlined" style={{ color: "#ffffff", fontSize: "32px" }}>
                    mark_email_read
                  </span>
                </div>

                <h1
                  style={{
                    fontSize: "1.875rem",
                    fontWeight: 800,
                    color: "#111111",
                    textTransform: "uppercase",
                    letterSpacing: "-0.025em",
                    marginBottom: "12px",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  Check Your Email
                </h1>

                <p style={{ color: "#4b5563", fontWeight: 500, lineHeight: 1.6, marginBottom: "8px", fontFamily: "'Space Grotesk', sans-serif" }}>
                  We sent a reset link to
                </p>
                <p
                  style={{
                    fontWeight: 800,
                    color: "#1A4D2E",
                    fontSize: "1rem",
                    marginBottom: "32px",
                    fontFamily: "'Space Grotesk', sans-serif",
                    wordBreak: "break-word",
                  }}
                >
                  {email}
                </p>

                <div
                  style={{
                    backgroundColor: "rgba(216,180,254,0.2)",
                    border: "2px solid #111111",
                    padding: "16px",
                    marginBottom: "32px",
                    textAlign: "left",
                  }}
                >
                  <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.6 }}>
                    <strong>Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
                  </p>
                  {import.meta.env.DEV && (
                    <p
                      style={{
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        color: "#7f1d1d",
                        fontFamily: "'Space Grotesk', sans-serif",
                        lineHeight: 1.5,
                        marginTop: "10px",
                        wordBreak: "break-all",
                      }}
                    >
                      No mailer is configured yet, so nothing was sent. In dev the link is
                      in the backend log: docker compose logs backend | findstr reset
                    </p>
                  )}
                </div>

                <button
                  className="submit-btn"
                  onClick={() => { setSubmitted(false); setEmail(""); }}
                  style={{ marginBottom: "24px" }}
                >
                  Try Another Email
                </button>

                <div style={{ paddingTop: "24px", borderTop: "2px solid rgba(0,0,0,0.1)" }}>
                  <button
                    className="back-link"
                    onClick={backToLogin}
                    onMouseEnter={() => setBackHover(true)}
                    onMouseLeave={() => setBackHover(false)}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontWeight: 700,
                        transform: backHover ? "translateX(-4px)" : "translateX(0)",
                        transition: "transform 0.15s ease",
                      }}
                    >
                      arrow_back
                    </span>
                    <span className="link-text">Back to Login</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
