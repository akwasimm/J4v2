import React, { useState, useEffect } from "react";
import {
  getSettings, updateSettings, changePassword,
  getConnectedAccounts, disconnectAccount, exportData, deleteAccount,
} from "./services/settingsService.js";
import { FEATURES } from './config/features'
import ComingSoon from './components/ComingSoon'

// ─── Data ────────────────────────────────────────────────────────────────────

const billingHistory = [
  { date: "Sep 24, 2026", invoiceId: "INV-88210-JF", amount: "₹29.00", status: "Paid" },
  { date: "Aug 24, 2026", invoiceId: "INV-77102-JF", amount: "₹29.00", status: "Paid" },
  { date: "Jul 24, 2026", invoiceId: "INV-66044-JF", amount: "₹29.00", status: "Paid" },
];

const languages = ["English (US)", "German", "French"];

const digestOptions = [
  { id: "daily", label: "Daily Updates" },
  { id: "weekly", label: "Weekly Summary" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  // Placeholder check
  if (!FEATURES.settings) {
    return <ComingSoon pageName="Settings" description="Account and notification preferences" />
  }

  useEffect(() => {
    document.title = "Settings — JobFor";
  }, []);

  const [twoFactor, setTwoFactor] = useState(true);
  const [theme, setTheme] = useState("light");
  const [language, setLanguage] = useState("English (US)");
  const [digest, setDigest] = useState("daily");

  // New settings
  const [jobAlerts, setJobAlerts] = useState(true);
  const [applicationAlerts, setApplicationAlerts] = useState(true);
  const [messageAlerts, setMessageAlerts] = useState(true);

  // Connected accounts
  const [connectedAccounts, setConnectedAccounts] = useState({
    linkedin: true,
    github: true,
    leetcode: false,
  });

  // Loading states
  const [loading, setLoading] = useState(false);

  const [manageBillingHover, setManageBillingHover] = useState(false);
  const [cancelHover, setCancelHover] = useState(false);
  const [exportHover, setExportHover] = useState(false);
  const [deleteHover, setDeleteHover] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getSettings();
        setTheme(data.theme || "light");
        setLanguage(data.language || "English (US)");
        setTwoFactor(data.two_factor_enabled || false);
        setDigest(data.email_digest_frequency || "daily");
        setJobAlerts(data.job_alerts_enabled !== false);
        setApplicationAlerts(data.application_alerts_enabled !== false);
        setMessageAlerts(data.message_alerts_enabled !== false);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    const loadConnectedAccounts = async () => {
      try {
        const data = await getConnectedAccounts();
        const accountsMap = {};
        data.forEach(acc => {
          accountsMap[acc.platform] = acc.connected;
        });
        setConnectedAccounts(accountsMap);
      } catch (error) {
        console.error("Failed to load connected accounts:", error);
      }
    };

    loadSettings();
    loadConnectedAccounts();
  }, []);

  const inputStyle = {
    width: "100%",
    padding: "10px",
    border: "2px solid #000000",
    backgroundColor: "#ffffff",
    fontFamily: "Space Grotesk, sans-serif",
    fontSize: "0.875rem",
    fontWeight: 500,
    outline: "none",
    transition: "box-shadow 0.15s ease",
    borderRadius: 0,
};

  return (
    <>
      <style>{`
        .neo-input:focus { box-shadow: 2px 2px 0px 0px #1A4D2E; border-color: #1A4D2E; }
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
          font-size: 24px; line-height: 1; display: inline-block; direction: ltr;
          flex-shrink: 0;
        }

        .toggle-track {
          width: 64px;
          height: 32px;
          background-color: #000000;
          border: 2px solid #000000;
          display: flex;
          align-items: center;
          padding: 4px;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .toggle-thumb {
          width: 24px;
          height: 24px;
          background-color: #D8B4FE;
          border: 2px solid #000000;
          transition: transform 0.2s ease;
        }

        .toggle-track.off .toggle-thumb {
          background-color: #e2e2e2;
        }

        .toggle-track.on .toggle-thumb {
          transform: translateX(32px);
        }

        .theme-btn {
          flex: 1;
          padding: 8px;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.15s ease;
          border: none;
          font-family: 'Syne', sans-serif;
        }

        .theme-btn.active {
          background-color: #1A4D2E;
          color: #ffffff;
        }

        .theme-btn:not(.active) {
          background-color: #e2e2e2;
          color: #000000;
          border-left: 2px solid #000000;
        }

        .radio-custom {
          width: 20px;
          height: 20px;
          border: 2px solid #000000;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          border-radius: 0;
          background: #ffffff;
          flex-shrink: 0;
        }

        .radio-custom:checked {
          background-color: #1A4D2E;
        }

        @media (max-width: 1024px) {
          .bento-grid { grid-template-columns: 1fr !important; }
          .security-membership { grid-template-columns: 1fr !important; }
          .preferences-grid { grid-template-columns: 1fr !important; }
        }

        @media (max-width: 768px) {
          .form-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>


      <main
          style={{
            flex: 1,
            padding: "32px",
          }}
        >
          <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "40px" }}>



            {/* ── Security & Membership ── */}
            <div
              className="security-membership"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
              }}
            >
              {/* Security Card */}
              <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "-0.025em",
                    fontFamily: "Syne, sans-serif",
                  }}
                >
                  Security & Privacy
                </h2>

                <div
                  style={{
                    backgroundColor: "#f4f3f3",
                    border: "2px solid #000000",
                    padding: "24px",
                    boxShadow: "4px 4px 0px 0px #000000",
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                  }}
                >
                  {/* Two Factor */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <h3
                        style={{
                          fontWeight: 900,
                          textTransform: "uppercase",
                          fontSize: "1rem",
                          fontFamily: "Syne, sans-serif",
                        }}
                      >
                        Two-Factor Auth
                      </h3>
                      <p style={{ fontSize: "0.875rem", color: "#4b5563", fontFamily: "Space Grotesk, sans-serif" }}>Add an extra layer of security</p>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#D8B4FE", textTransform: "uppercase", backgroundColor: "#000000", padding: "2px 6px", marginLeft: "8px" }}>Coming Soon</span>
                    </div>

                    <div
                      className={`toggle-track ${twoFactor ? "on" : "off"}`}
                      onClick={async () => {
                        const newValue = !twoFactor;
                        setTwoFactor(newValue);
                        try {
                          await updateSettings({ two_factor_enabled: newValue });
                        } catch (error) {
                          console.error("Failed to update 2FA:", error);
                          setTwoFactor(!newValue); // Revert on error
                        }
                      }}
                    >
                      <div className="toggle-thumb" />
                    </div>
                  </div>

                  {/* Change Password */}
                  <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "24px" }}>
                    <button
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        fontSize: "0.875rem",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "Space Grotesk, sans-serif",
                        color: "#000000",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#1A4D2E")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#000000")}
                      onClick={async () => {
                        const oldPassword = prompt("Enter current password:");
                        const newPassword = prompt("Enter new password:");
                        if (oldPassword && newPassword) {
                          try {
                            await changePassword(oldPassword, newPassword);
                            alert("Password changed successfully");
                          } catch (error) {
                            alert("Failed to change password: " + error.message);
                          }
                        }
                      }}
                    >
                      <span className="material-symbols-outlined">key</span>
                      Change Password
                    </button>
                  </div>

                  {/* Active Sessions */}
                  <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "24px" }}>
                    <h4
                      style={{
                        fontWeight: 900,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        marginBottom: "16px",
                        color: "#4b5563",
                        fontFamily: "Space Grotesk, sans-serif",
                      }}
                    >
                      Active Sessions
                    </h4>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "#ffffff",
                        padding: "12px",
                        border: "2px solid #000000",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className="material-symbols-outlined">desktop_windows</span>
                        <div style={{ fontSize: "0.875rem", fontFamily: "Space Grotesk, sans-serif" }}>
                          <p style={{ fontWeight: 700 }}>Chrome on MacOS</p>
                          <p style={{ fontSize: "0.75rem", color: "#4b5563" }}>London, UK • Active Now</p>
                        </div>
                      </div>
                      <button
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 900,
                          textTransform: "uppercase",
                          color: "#ba1a1a",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "Syne, sans-serif",
                        }}
                        onClick={async () => {
                          alert("Session logged out (placeholder - needs session management endpoint)");
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Membership Card */}
              <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "-0.025em",
                      fontFamily: "Syne, sans-serif",
                    }}
                  >
                    Membership
                  </h2>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#D8B4FE", textTransform: "uppercase", backgroundColor: "#000000", padding: "2px 6px" }}>Coming Soon</span>
                </div>

                <div
                  style={{
                    backgroundColor: "#1A4D2E",
                    border: "2px solid #000000",
                    padding: "24px",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "4px 4px 0px 0px #000000",
                  }}
                >
                  {/* Pro badge */}
                  <div
                    style={{
                      position: "absolute",
                      right: "-16px",
                      top: "-16px",
                      width: "100px",
                      height: "100px",
                      backgroundColor: "#D8B4FE",
                      border: "2px solid #000000",
                      transform: "rotate(12deg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 900,
                        color: "#000000",
                        transform: "rotate(-12deg)",
                        fontFamily: "Syne, sans-serif",
                        textTransform: "uppercase",
                      }}
                    >
                      PRO
                    </span>
                  </div>

                  <h3
                    style={{
                      color: "#ffffff",
                      fontWeight: 900,
                      fontSize: "1.25rem",
                      textTransform: "uppercase",
                      marginBottom: "8px",
                      fontFamily: "Syne, sans-serif",
                    }}
                  >
                    Architect Plan
                  </h3>
                  <p style={{ color: "#e5e7eb", fontSize: "0.875rem", marginBottom: "32px", fontFamily: "Space Grotesk, sans-serif" }}>
                    Next billing cycle: Oct 24, 2026
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "Space Grotesk, sans-serif" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        color: "#ffffff",
                        borderBottom: "1px solid rgba(255,255,255,0.3)",
                        paddingBottom: "8px",
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>Monthly Charge</span>
                      <span style={{ fontWeight: 900 }}>₹29.00</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        color: "#ffffff",
                        borderBottom: "1px solid rgba(255,255,255,0.3)",
                        paddingBottom: "8px",
                      }}
                    >
                      <span style={{ fontWeight: 500 }}>Total Storage</span>
                      <span style={{ fontWeight: 900 }}>50GB</span>
                    </div>
                  </div>

                  <div style={{ marginTop: "48px", display: "flex", gap: "16px" }}>
                    <button
                      onMouseEnter={() => setManageBillingHover(true)}
                      onMouseLeave={() => setManageBillingHover(false)}
                      style={{
                        flex: 1,
                        padding: "10px",
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        fontWeight: 900,
                        border: "2px solid #000000",
                        boxShadow: manageBillingHover ? "none" : "4px 4px 0px 0px #000000",
                        transform: manageBillingHover ? "translate(2px,2px)" : "translate(0,0)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        textTransform: "uppercase",
                        fontFamily: "Space Grotesk, sans-serif",
                        fontSize: "0.875rem",
                      }}
                    >
                      Manage Billing
                    </button>

                    <button
                      onMouseEnter={() => setCancelHover(true)}
                      onMouseLeave={() => setCancelHover(false)}
                      style={{
                        padding: "10px",
                        backgroundColor: "#ba1a1a",
                        color: "#ffffff",
                        border: "2px solid #000000",
                        boxShadow: cancelHover ? "none" : "4px 4px 0px 0px #000000",
                        transform: cancelHover ? "translate(2px,2px)" : "translate(0,0)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span className="material-symbols-outlined">cancel</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* ── Preferences Section ── */}
            <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-0.025em",
                  fontFamily: "Syne, sans-serif",
                }}
              >
                Preferences
              </h2>

              <div
                className="preferences-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "24px",
                }}
              >
                {/* Language */}
                <div
                  style={{
                    backgroundColor: "#eaddff",
                    border: "2px solid #000000",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    boxShadow: "4px 4px 0px 0px #000000"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "2rem", marginBottom: "16px" }}>
                    language
                  </span>
                  <h3 style={{ fontWeight: 900, textTransform: "uppercase", fontFamily: "Syne, sans-serif", fontSize: "1rem" }}>
                    Language
                  </h3>
                  <p style={{ fontSize: "0.875rem", marginTop: "8px", marginBottom: "24px", fontFamily: "Space Grotesk, sans-serif" }}>
                    Set your interface language
                  </p>
                  <select
                    value={language}
                    onChange={async (e) => {
                      setLanguage(e.target.value);
                      try {
                        await updateSettings({ language: e.target.value });
                      } catch (error) {
                        console.error("Failed to update language:", error);
                      }
                    }}
                    style={{
                      width: "100%",
                      backgroundColor: "#ffffff",
                      border: "2px solid #000000",
                      fontWeight: 700,
                      padding: "8px",
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    {languages.map((lang) => (
                      <option key={lang}>{lang}</option>
                    ))}
                  </select>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#D8B4FE", textTransform: "uppercase", backgroundColor: "#000000", padding: "2px 6px", marginTop: "8px" }}>Coming Soon</span>
                </div>

                {/* Theme */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "2px solid #000000",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    boxShadow: "4px 4px 0px 0px #000000"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "2rem", marginBottom: "16px" }}>
                    dark_mode
                  </span>
                  <h3 style={{ fontWeight: 900, textTransform: "uppercase", fontFamily: "Syne, sans-serif", fontSize: "1rem" }}>
                    Theme
                  </h3>
                  <p style={{ fontSize: "0.875rem", marginTop: "8px", marginBottom: "24px", fontFamily: "Space Grotesk, sans-serif" }}>
                    Choose how JobFor looks
                  </p>
                  <div style={{ display: "flex", border: "2px solid #000000", width: "100%", overflow: "hidden" }}>
                    <button
                      className={`theme-btn ${theme === "light" ? "active" : ""}`}
                      onClick={async () => {
                        setTheme("light");
                        try {
                          await updateSettings({ theme: "light" });
                        } catch (error) {
                          console.error("Failed to update theme:", error);
                        }
                      }}
                      style={{ borderLeft: "none" }}
                    >
                      Light
                    </button>
                    <button
                      className={`theme-btn ${theme === "dark" ? "active" : ""}`}
                      onClick={async () => {
                        setTheme("dark");
                        try {
                          await updateSettings({ theme: "dark" });
                        } catch (error) {
                          console.error("Failed to update theme:", error);
                        }
                      }}
                    >
                      Dark
                    </button>
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#D8B4FE", textTransform: "uppercase", backgroundColor: "#000000", padding: "2px 6px", marginTop: "8px" }}>Coming Soon</span>
                </div>

                {/* Email Digests */}
                <div
                  style={{
                    backgroundColor: "#dde1ff",
                    border: "2px solid #000000",
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    boxShadow: "4px 4px 0px 0px #000000"
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "2rem", marginBottom: "16px" }}>
                    mail
                  </span>
                  <h3 style={{ fontWeight: 900, textTransform: "uppercase", fontFamily: "Syne, sans-serif", fontSize: "1rem" }}>
                    Email Digests
                  </h3>
                  <p style={{ fontSize: "0.875rem", marginTop: "8px", marginBottom: "24px", fontFamily: "Space Grotesk, sans-serif" }}>
                    How often we ping you
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", textAlign: "left" }}>
                    {digestOptions.map((opt) => (
                      <label
                        key={opt.id}
                        style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontFamily: "Space Grotesk, sans-serif" }}
                      >
                        <input
                          type="radio"
                          name="digest"
                          className="radio-custom"
                          checked={digest === opt.id}
                          onChange={async () => {
                            setDigest(opt.id);
                            try {
                              await updateSettings({ email_digest_frequency: opt.id });
                            } catch (error) {
                              console.error("Failed to update email digest:", error);
                            }
                          }}
                        />
                        <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── Notification Preferences ── */}
            <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-0.025em",
                  fontFamily: "Syne, sans-serif",
                }}
              >
                Notification Preferences
              </h2>

              <div
                style={{
                  border: "2px solid #000000",
                  padding: "24px",
                  backgroundColor: "#ffffff",
                  boxShadow: "4px 4px 0px 0px #000000",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                {/* Job Alerts */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontWeight: 900, textTransform: "uppercase", fontSize: "1rem", fontFamily: "Syne, sans-serif" }}>
                      Job Match Alerts
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "#4b5563", fontFamily: "Space Grotesk, sans-serif" }}>
                      Get notified when jobs match your profile
                    </p>
                  </div>
                  <div
                    className={`toggle-track ${jobAlerts ? "on" : "off"}`}
                    onClick={async () => {
                      const newValue = !jobAlerts;
                      setJobAlerts(newValue);
                      try {
                        await updateSettings({ job_alerts_enabled: newValue });
                      } catch (error) {
                        console.error("Failed to update job alerts:", error);
                        setJobAlerts(!newValue);
                      }
                    }}
                  >
                    <div className="toggle-thumb" />
                  </div>
                </div>

                {/* Application Alerts */}
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontWeight: 900, textTransform: "uppercase", fontSize: "1rem", fontFamily: "Syne, sans-serif" }}>
                      Application Updates
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "#4b5563", fontFamily: "Space Grotesk, sans-serif" }}>
                      Get notified about your application status
                    </p>
                  </div>
                  <div
                    className={`toggle-track ${applicationAlerts ? "on" : "off"}`}
                    onClick={async () => {
                      const newValue = !applicationAlerts;
                      setApplicationAlerts(newValue);
                      try {
                        await updateSettings({ application_alerts_enabled: newValue });
                      } catch (error) {
                        console.error("Failed to update application alerts:", error);
                        setApplicationAlerts(!newValue);
                      }
                    }}
                  >
                    <div className="toggle-thumb" />
                  </div>
                </div>

                {/* Message Alerts */}
                <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ fontWeight: 900, textTransform: "uppercase", fontSize: "1rem", fontFamily: "Syne, sans-serif" }}>
                      Message Notifications
                    </h3>
                    <p style={{ fontSize: "0.875rem", color: "#4b5563", fontFamily: "Space Grotesk, sans-serif" }}>
                      Get notified when you receive messages
                    </p>
                  </div>
                  <div
                    className={`toggle-track ${messageAlerts ? "on" : "off"}`}
                    onClick={async () => {
                      const newValue = !messageAlerts;
                      setMessageAlerts(newValue);
                      try {
                        await updateSettings({ message_alerts_enabled: newValue });
                      } catch (error) {
                        console.error("Failed to update message alerts:", error);
                        setMessageAlerts(!newValue);
                      }
                    }}
                  >
                    <div className="toggle-thumb" />
                  </div>
                </div>
              </div>
            </section>

            {/* ── Connected Accounts ── */}
            <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-0.025em",
                  fontFamily: "Syne, sans-serif",
                }}
              >
                Connected Accounts
              </h2>

              <div
                style={{
                  border: "2px solid #000000",
                  padding: "24px",
                  backgroundColor: "#ffffff",
                  boxShadow: "4px 4px 0px 0px #000000",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* LinkedIn */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", border: "2px solid #000000", backgroundColor: connectedAccounts.linkedin ? "#F3E8FF" : "#f4f3f3" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>business</span>
                    <div>
                      <h4 style={{ fontWeight: 900, textTransform: "uppercase", fontSize: "0.875rem", fontFamily: "Syne, sans-serif" }}>LinkedIn</h4>
                      <p style={{ fontSize: "0.75rem", color: "#4b5563", fontFamily: "Space Grotesk, sans-serif" }}>
                        {connectedAccounts.linkedin ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  {connectedAccounts.linkedin && (
                    <button
                      onClick={async () => {
                        try {
                          await disconnectAccount("linkedin");
                          setConnectedAccounts(prev => ({ ...prev, linkedin: false }));
                        } catch (error) {
                          console.error("Failed to disconnect LinkedIn:", error);
                        }
                      }}
                      style={{
                        padding: "6px 12px",
                        border: "2px solid #000000",
                        backgroundColor: "#ba1a1a",
                        color: "#ffffff",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                {/* GitHub */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", border: "2px solid #000000", backgroundColor: connectedAccounts.github ? "#F3E8FF" : "#f4f3f3" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>code</span>
                    <div>
                      <h4 style={{ fontWeight: 900, textTransform: "uppercase", fontSize: "0.875rem", fontFamily: "Syne, sans-serif" }}>GitHub</h4>
                      <p style={{ fontSize: "0.75rem", color: "#4b5563", fontFamily: "Space Grotesk, sans-serif" }}>
                        {connectedAccounts.github ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  {connectedAccounts.github && (
                    <button
                      onClick={async () => {
                        try {
                          await disconnectAccount("github");
                          setConnectedAccounts(prev => ({ ...prev, github: false }));
                        } catch (error) {
                          console.error("Failed to disconnect GitHub:", error);
                        }
                      }}
                      style={{
                        padding: "6px 12px",
                        border: "2px solid #000000",
                        backgroundColor: "#ba1a1a",
                        color: "#ffffff",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      Disconnect
                    </button>
                  )}
                </div>

                {/* LeetCode */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", border: "2px solid #000000", backgroundColor: connectedAccounts.leetcode ? "#F3E8FF" : "#f4f3f3" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>terminal</span>
                    <div>
                      <h4 style={{ fontWeight: 900, textTransform: "uppercase", fontSize: "0.875rem", fontFamily: "Syne, sans-serif" }}>LeetCode</h4>
                      <p style={{ fontSize: "0.75rem", color: "#4b5563", fontFamily: "Space Grotesk, sans-serif" }}>
                        {connectedAccounts.leetcode ? "Connected" : "Not connected"}
                      </p>
                    </div>
                  </div>
                  {connectedAccounts.leetcode && (
                    <button
                      onClick={async () => {
                        try {
                          await disconnectAccount("leetcode");
                          setConnectedAccounts(prev => ({ ...prev, leetcode: false }));
                        } catch (error) {
                          console.error("Failed to disconnect LeetCode:", error);
                        }
                      }}
                      style={{
                        padding: "6px 12px",
                        border: "2px solid #000000",
                        backgroundColor: "#ba1a1a",
                        color: "#ffffff",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                      }}
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* ── Account Management ── */}
            <section style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-0.025em",
                  fontFamily: "Syne, sans-serif",
                }}
              >
                Account Management
              </h2>

              <div
                style={{
                  border: "2px solid #000000",
                  padding: "24px",
                  backgroundColor: "#fef2f2",
                  boxShadow: "4px 4px 0px 0px #000000",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <h3 style={{ fontWeight: 900, textTransform: "uppercase", fontSize: "1rem", fontFamily: "Syne, sans-serif", color: "#ba1a1a" }}>
                  Danger Zone
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#4b5563", fontFamily: "Space Grotesk, sans-serif" }}>
                  These actions are irreversible. Please be careful.
                </p>

                <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
                  <button
                    onMouseEnter={() => setExportHover(true)}
                    onMouseLeave={() => setExportHover(false)}
                    onClick={async () => {
                      try {
                        await exportData();
                        alert("Data export initiated");
                      } catch (error) {
                        alert("Failed to export data: " + error.message);
                      }
                    }}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#ffffff",
                      color: "#000000",
                      fontWeight: 900,
                      border: "2px solid #000000",
                      boxShadow: exportHover ? "none" : "4px 4px 0px 0px #000000",
                      transform: exportHover ? "translate(2px,2px)" : "translate(0,0)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      textTransform: "uppercase",
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: "0.875rem",
                    }}
                  >
                    Export Data
                  </button>

                  <button
                    onMouseEnter={() => setDeleteHover(true)}
                    onMouseLeave={() => setDeleteHover(false)}
                    onClick={async () => {
                      if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                        return;
                      }
                      const password = prompt("Enter your password to confirm account deletion:");
                      if (!password) {
                        return;
                      }
                      try {
                        await deleteAccount(password);
                        alert("Account deleted successfully");
                        // Clear auth and redirect to landing
                        localStorage.clear();
                        window.location.href = "/";
                      } catch (error) {
                        alert("Failed to delete account: " + error.message);
                      }
                    }}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#ba1a1a",
                      color: "#ffffff",
                      fontWeight: 900,
                      border: "2px solid #000000",
                      boxShadow: deleteHover ? "none" : "4px 4px 0px 0px #000000",
                      transform: deleteHover ? "translate(2px,2px)" : "translate(0,0)",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                      textTransform: "uppercase",
                      fontFamily: "Space Grotesk, sans-serif",
                      fontSize: "0.875rem",
                    }}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </section>

            {/* ── Billing History ── */}
            <section style={{ display: "flex", flexDirection: "column", gap: "24px", paddingBottom: "80px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "-0.025em",
                    fontFamily: "Syne, sans-serif",
                  }}
                >
                  Billing History
                </h2>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#D8B4FE", textTransform: "uppercase", backgroundColor: "#000000", padding: "2px 6px" }}>Coming Soon</span>
              </div>

              <div
                style={{
                  border: "2px solid #000000",
                  overflow: "hidden",
                  boxShadow: "4px 4px 0px 0px #000000",
                  filter: "blur(4px)",
                  pointerEvents: "none"
                }}
              >
                <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#000000",
                        color: "#ffffff",
                        fontFamily: "Space Grotesk, sans-serif",
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        letterSpacing: "0.1em",
                      }}
                    >
                      <th style={{ padding: "12px", borderRight: "1px solid rgba(255,255,255,0.2)" }}>Date</th>
                      <th style={{ padding: "12px", borderRight: "1px solid rgba(255,255,255,0.2)" }}>Invoice ID</th>
                      <th style={{ padding: "12px", borderRight: "1px solid rgba(255,255,255,0.2)" }}>Amount</th>
                      <th style={{ padding: "12px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody style={{ backgroundColor: "#ffffff", fontFamily: "Space Grotesk, sans-serif" }}>
                    {billingHistory.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: i < billingHistory.length - 1 ? "1px solid #e5e7eb" : "none",
                          transition: "background-color 0.15s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f4f3f3")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ffffff")}
                      >
                        <td style={{ padding: "12px", fontWeight: 700, borderRight: "1px solid #e5e7eb" }}>
                          {row.date}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            color: "#4b5563",
                            fontFamily: "monospace",
                            borderRight: "1px solid #e5e7eb",
                          }}
                        >
                          {row.invoiceId}
                        </td>
                        <td style={{ padding: "12px", fontWeight: 900, borderRight: "1px solid #e5e7eb" }}>
                          {row.amount}
                        </td>
                        <td style={{ padding: "12px" }}>
                          <span
                            style={{
                              backgroundColor: "#D8B4FE",
                              color: "#000000",
                              fontSize: "0.625rem",
                              fontWeight: 900,
                              padding: "4px 8px",
                              textTransform: "uppercase",
                              border: "1px solid #000000",
                            }}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
    </>
  );
}
