import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FEATURES } from './config/features'
import ComingSoon from './components/ComingSoon'
import { fetchJobById, fetchJobs, saveJob, unsaveJob, applyToJob, getSavedJobs } from './api/client'

// ─── Formatting ──────────────────────────────────────────────────────────────
// Salary is stored in rupees per year (min 0, max 95,000,000 in the DB), so it
// is shown in lakhs the way the rest of the product does.

function formatSalary(min, max) {
  const L = 100000
  const one = (v) => (v >= L ? `₹${Math.round(v / L)}L` : `₹${v.toLocaleString('en-IN')}`)
  if (min && max) return min === max ? one(min) : `${one(min)} - ${one(max)}`
  if (min) return `From ${one(min)}`
  if (max) return `Up to ${one(max)}`
  return null
}

function timeAgo(value) {
  if (!value) return null
  const then = new Date(value)
  if (Number.isNaN(then.getTime())) return null
  const days = Math.floor((Date.now() - then.getTime()) / 86400000)
  if (days < 0) return "Just posted"
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`
  return `${Math.floor(months / 12)}y ago`
}

const humanize = (value) =>
  value ? String(value).replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase()) : null;

// ─── Radial Match Score ──────────────────────────────────────────────────────

function MatchScore({ percent }) {
  const r = 40;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (circumference * percent) / 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: "96px", height: "96px" }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="48" cy="48" r={r} fill="transparent" stroke="#000000" strokeWidth="8" />
          <circle
            cx="48"
            cy="48"
            r={r}
            fill="transparent"
            stroke="#1A4D2E"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: "1.25rem",
            fontFamily: "'Syne', sans-serif",
          }}
        >
          {percent}%
        </span>
      </div>
      <p
        style={{
          marginTop: "8px",
          fontWeight: 900,
          textTransform: "uppercase",
          fontSize: "0.75rem",
          fontFamily: "'Space Grotesk', sans-serif",
        }}
      >
        Match Score
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JobDetail() {
  // Placeholder check
  if (!FEATURES.jobDetail) {
    return <ComingSoon pageName="Job Detail" description="View full job details and AI match score" />
  }

  return <JobDetailView />;
}

function JobDetailView() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [activeTab, setActiveTab] = useState("Description");
  const [status, setStatus] = useState("loading"); // loading | ready | missing | error
  const [error, setError] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(null); // null | 'apply' | 'save'
  const [notice, setNotice] = useState(null); // { tone, text }

  const load = useCallback(async () => {
    if (!jobId) {
      setStatus("missing");
      return;
    }
    setStatus("loading");
    setError(null);
    try {
      const res = await fetchJobById(jobId);
      const data = res?.data ?? res;
      if (!data) {
        setStatus("missing");
        return;
      }
      setJob(data);
      setStatus("ready");
      document.title = `${data.title} — JobFor`;
    } catch (err) {
      if (err?.status === 404) setStatus("missing");
      else {
        setError(err?.message || "Could not load this job.");
        setStatus("error");
      }
    }
  }, [jobId]);

  useEffect(() => { load(); }, [load]);

  // Is this job already saved? Auth-only, so it is skipped for anonymous
  // visitors rather than firing a request that can only 401.
  useEffect(() => {
    if (status !== "ready" || !jobId) return;
    if (!localStorage.getItem("auth_token")) return;
    getSavedJobs()
      .then((res) => {
        const rows = res?.data ?? [];
        setSaved(rows.some((s) => (s.job_id ?? s.job?.id ?? s.id) === jobId));
      })
      .catch(() => { /* Save will report the failure if the user acts on it */ });
  }, [status, jobId]);

  // Similar vacancies, from the same search endpoint the discovery page uses.
  useEffect(() => {
    if (status !== "ready") return;
    let cancelled = false;
    fetchJobs({ page_size: 4 })
      .then((res) => {
        if (cancelled) return;
        const items = res?.items ?? res?.data?.items ?? [];
        setSimilar(items.filter((j) => j.id !== jobId).slice(0, 3));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [status, jobId]);

  const onSave = async () => {
    if (!job || busy) return;
    setBusy("save");
    setNotice(null);
    try {
      if (saved) {
        await unsaveJob(job.id);
        setSaved(false);
        setNotice({ tone: "ok", text: "Removed from saved jobs." });
      } else {
        await saveJob(job.id, job.match_score ?? null);
        setSaved(true);
        setNotice({ tone: "ok", text: "Saved to your list." });
      }
    } catch (err) {
      setNotice({ tone: "err", text: err?.message || "Could not update saved jobs." });
    } finally {
      setBusy(null);
    }
  };

  const onApply = async () => {
    if (!job || busy) return;
    setBusy("apply");
    setNotice(null);
    try {
      await applyToJob(job.id, job.match_score ?? null);
      setNotice({ tone: "ok", text: "Application recorded in Applied." });
    } catch (err) {
      if (err?.status === 401) setNotice({ tone: "err", text: "Sign in to track this application." });
      else setNotice({ tone: "err", text: err?.message || "Could not record the application." });
    } finally {
      setBusy(null);
    }
  };

  // Only show a tab when the data behind it exists. requirements and benefits
  // are null for every row in the jobs table today, so in practice this renders
  // the Description tab alone rather than two permanently empty panels. Held in
  // a ref-like derivation so the hook above is never called conditionally.
  const tabSignature = job
    ? (() => {
        const candidates = [
          ["Description", null, job.description],
          ["Requirements", job.requirements, null],
          ["Benefits", job.benefits, null],
        ].filter(([, items, body]) => (items ? items.length > 0 : Boolean(body)));
        return candidates.map(([key]) => key).join("|");
      })()
    : "";

  useEffect(() => {
    setActiveTab((current) =>
      tabSignature.split("|").includes(current) ? current : tabSignature.split("|")[0] ?? "Description"
    );
  }, [tabSignature]);

  const tabKeys = tabSignature ? tabSignature.split("|") : [];

  if (status === "loading") {
    return <Centered title="Loading job" text="Fetching the full listing…" />;
  }
  if (status === "missing") {
    return (
      <Centered
        title="Job not found"
        text={jobId ? "This listing may have been removed or the link is wrong." : "No job was selected."}
        action={{ label: "Browse jobs", onClick: () => navigate("/discover") }}
      />
    );
  }
  if (status === "error") {
    return (
      <Centered
        title="Could not load this job"
        text={error}
        action={{ label: "Try again", onClick: load }}
      />
    );
  }

  const salary = formatSalary(job.salary_min, job.salary_max);
  const skills = (job.core_skills || []).slice(0, 8);
  const posted = timeAgo(job.posted_at || job.created_at);

  const active = (() => {
    if (!job) return null;
    if (activeTab === "Requirements") return { key: "Requirements", items: job.requirements || [] };
    if (activeTab === "Benefits") return { key: "Benefits", items: job.benefits || [] };
    return { key: "Description", items: null, body: job.description };
  })();
  const overview = [
    { label: "Job Type", value: humanize(job.job_type), hasBadge: true },
    { label: "Experience", value: humanize(job.experience_level) ?? (job.min_experience_years != null ? `${job.min_experience_years}+ yrs` : null), hasBadge: false },
    { label: "Work Model", value: humanize(job.work_model), hasBadge: false },
    { label: "Posted", value: posted, hasBadge: false },
  ].filter((o) => o.value);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Space Grotesk', sans-serif;
          background-color: rgba(216, 180, 254, 0.1);
          color: #111827;
          min-height: 100vh;
        }

        h1, h2, h3, h4, h5, h6 { font-family: 'Syne', sans-serif; }

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

        .neo-border    { border: 3px solid #000000; }
        .neo-border-sm { border: 2px solid #000000; }
        .shadow-neo    { box-shadow: 6px 6px 0px 0px #000000; }
        .shadow-neo-sm { box-shadow: 3px 3px 0px 0px #000000; }

        .apply-btn, .save-btn {
          width: 100%;
          font-weight: 900;
          padding: 16px 24px;
          border: 3px solid #000000;
          box-shadow: 3px 3px 0px 0px #000000;
          cursor: pointer;
          text-transform: uppercase;
          font-size: 1.125rem;
          font-family: 'Space Grotesk', sans-serif;
          transition: all 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .apply-btn:hover:not(:disabled), .save-btn:hover:not(:disabled) {
          transform: translate(2px, 2px);
          box-shadow: none;
        }
        .apply-btn:disabled, .save-btn:disabled { opacity: 0.6; cursor: wait; }
        .apply-btn { background-color: #1A4D2E; color: #ffffff; }
        .save-btn  { background-color: #ffffff; color: #000000; }
        .save-btn.is-saved { background-color: #1A4D2E; color: #ffffff; }

        .tab-btn {
          padding: 16px 32px;
          font-weight: 900;
          text-transform: uppercase;
          border-right: 3px solid #000000;
          background: transparent;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.875rem;
          transition: background-color 0.15s ease;
        }
        .tab-btn:last-child { border-right: none; }
        .tab-btn.active { background-color: #ffffff; }
        .tab-btn:hover  { background-color: #ffffff; }

        .share-btn {
          width: 40px;
          height: 40px;
          background: #ffffff;
          border: 2px solid #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .share-btn:hover { background: #000000; color: #ffffff; }

        .similar-card {
          background: #ffffff;
          border: 3px solid #000000;
          padding: 24px;
          box-shadow: 6px 6px 0px 0px #000000;
          cursor: pointer;
          transition: transform 0.15s ease;
          text-align: left;
          width: 100%;
          font: inherit;
          color: inherit;
        }
        .similar-card:hover { transform: translateY(-4px); }

        @media (max-width: 1024px) {
          .main-grid     { grid-template-columns: 1fr !important; }
          .aside-sticky  { position: static !important; }
        }

        @media (max-width: 768px) {
          .nav-links          { display: none !important; }
          .header-inner       { flex-direction: column !important; }
          .match-inner        { flex-direction: column !important; }
          .match-skills-grid  { grid-template-columns: 1fr !important; }
          .similar-grid       { grid-template-columns: 1fr !important; }
          .footer-inner       { flex-direction: column !important; text-align: center; }
          .h1-main            { font-size: 2rem !important; }
          .tabs-bar           { overflow-x: auto; }
          .tab-btn            { padding: 12px 16px; font-size: 0.75rem; white-space: nowrap; }
        }
      `}</style>


      {/* ── Main ── */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        <div
          className="main-grid"
          style={{ display: "grid", gridTemplateColumns: "minmax(0, 8fr) minmax(0, 4fr)", gap: "32px" }}
        >
          {/* ── Left Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>

            {/* Header Card */}
            <header className="neo-border shadow-neo" style={{ backgroundColor: "#ffffff", padding: "32px" }}>
              <div className="header-inner" style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                {job.company_logo_url ? (
                  <img
                    className="neo-border"
                    src={job.company_logo_url}
                    alt={`${job.company_name} logo`}
                    style={{ width: "80px", height: "80px", objectFit: "cover", flexShrink: 0, backgroundColor: "#ffffff" }}
                  />
                ) : (
                  <div
                    className="neo-border"
                    style={{
                      width: "80px",
                      height: "80px",
                      backgroundColor: "#1A4D2E",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ color: "#ffffff", fontSize: "2.5rem" }}>
                      bolt
                    </span>
                  </div>
                )}

                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    <h1
                      className="h1-main"
                      style={{
                        fontSize: "2.25rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        letterSpacing: "-0.025em",
                        fontFamily: "'Syne', sans-serif",
                      }}
                    >
                      {job.title}
                    </h1>
                    {posted === "Today" && (
                      <span
                        className="neo-border-sm"
                        style={{
                          backgroundColor: "#FACC15",
                          padding: "4px 12px",
                          fontSize: "0.75rem",
                          fontWeight: 900,
                          textTransform: "uppercase",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        New
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: "16px",
                      fontSize: "1.125rem",
                      fontWeight: 700,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <span className="material-symbols-outlined" style={{ color: "#1A4D2E" }}>business</span>
                      {job.company_name}
                    </span>
                    {job.location && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#6b7280" }}>
                        <span className="material-symbols-outlined">location_on</span>
                        {job.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* Match Section - only when the backend scored this user */}
            {job.match_score != null && (
              <section
                className="neo-border shadow-neo"
                style={{ backgroundColor: "rgba(216,180,254,0.2)", padding: "32px" }}
              >
                <div className="match-inner" style={{ display: "flex", alignItems: "center", gap: "32px" }}>
                  <MatchScore percent={job.match_score} />

                  <div style={{ flexGrow: 1 }}>
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        marginBottom: "16px",
                        fontFamily: "'Syne', sans-serif",
                      }}
                    >
                      What this role asks for
                    </h3>

                    <div
                      className="match-skills-grid"
                      style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}
                    >
                      {skills.map((skill, i) => (
                        <div
                          key={`${skill}-${i}`}
                          className="neo-border-sm"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: 700,
                            padding: "8px",
                            backgroundColor: "#ffffff",
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ color: "#16a34a", fontWeight: 900 }}>
                            check_circle
                          </span>
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Tabs + Content */}
            <div className="neo-border shadow-neo" style={{ backgroundColor: "#ffffff", overflow: "hidden" }}>
              {/* Tab Bar */}
              <div
                className="tabs-bar"
                style={{ display: "flex", borderBottom: "3px solid #000000", backgroundColor: "#f9fafb" }}
              >
                {tabKeys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`tab-btn ${activeTab === key ? "active" : ""}`}
                    onClick={() => setActiveTab(key)}
                  >
                    {key}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div style={{ padding: "32px" }}>
                {active && active.items ? (
                  <>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "16px", fontFamily: "'Syne', sans-serif" }}>
                      {active.key}
                    </h3>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "12px" }}>
                      {active.items.map((item, i) => (
                        <li key={i} style={{ display: "flex", gap: "8px", fontWeight: 500, color: "#374151", fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1.6 }}>
                          <span style={{ color: "#1A4D2E", fontWeight: 900 }}>•</span>
                          {typeof item === "string" ? item : JSON.stringify(item)}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <h3 style={{ fontSize: "1.5rem", fontWeight: 900, textTransform: "uppercase", marginBottom: "16px", fontFamily: "'Syne', sans-serif" }}>
                      The Role
                    </h3>
                    {String(job.description || "")
                      .split(/\n{2,}/)
                      .filter((p) => p.trim())
                      .map((para, i) => (
                        <p key={i} style={{ fontWeight: 500, color: "#374151", lineHeight: 1.8, marginBottom: "16px", fontFamily: "'Space Grotesk', sans-serif" }}>
                          {para.trim()}
                        </p>
                      ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Column (Sidebar) ── */}
          <aside>
            <div
              className="aside-sticky"
              style={{ position: "sticky", top: "112px", display: "flex", flexDirection: "column", gap: "24px" }}
            >
              {/* Main sidebar card */}
              <div className="neo-border shadow-neo" style={{ backgroundColor: "#ffffff", padding: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {/* Salary */}
                  {salary ? (
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase", color: "#6b7280", marginBottom: "4px", fontFamily: "'Space Grotesk', sans-serif" }}>
                        Annual Salary
                      </p>
                      <p style={{ fontSize: "1.875rem", fontWeight: 800, color: "#1A4D2E", fontFamily: "'Syne', sans-serif" }}>
                        {salary}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 900, textTransform: "uppercase", color: "#6b7280", marginBottom: "4px", fontFamily: "'Space Grotesk', sans-serif" }}>
                        Annual Salary
                      </p>
                      <p style={{ fontSize: "1.25rem", fontWeight: 800, color: "#6b7280", fontFamily: "'Syne', sans-serif" }}>
                        Not disclosed
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: "8px" }}>
                    <button type="button" className="apply-btn" onClick={onApply} disabled={busy !== null}>
                      {busy === "apply" ? "Recording…" : "Apply Now"}
                    </button>
                    <button
                      type="button"
                      className={`save-btn ${saved ? "is-saved" : ""}`}
                      onClick={onSave}
                      disabled={busy !== null}
                      aria-pressed={saved}
                    >
                      <span className="material-symbols-outlined">{saved ? "bookmark_added" : "bookmark"}</span>
                      {busy === "save" ? "Saving…" : saved ? "Saved" : "Save Job"}
                    </button>
                    {notice && (
                      <p
                        role="status"
                        style={{
                          fontWeight: 700,
                          fontSize: "0.875rem",
                          color: notice.tone === "err" ? "#b91c1c" : "#166534",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        {notice.text}
                      </p>
                    )}
                  </div>
                </div>

                {/* Job Overview */}
                {overview.length > 0 && (
                  <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "2px dashed #000000" }}>
                    <h4 style={{ fontWeight: 900, textTransform: "uppercase", marginBottom: "16px", fontFamily: "'Syne', sans-serif" }}>
                      Job Overview
                    </h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {overview.map((item) => (
                        <div
                          key={item.label}
                          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", gap: "12px" }}
                        >
                          <span style={{ color: "#6b7280", textTransform: "uppercase", fontSize: "0.75rem" }}>{item.label}</span>
                          {item.hasBadge ? (
                            <span
                              className="neo-border-sm"
                              style={{ backgroundColor: "rgba(216,180,254,0.3)", padding: "2px 8px", fontSize: "0.875rem" }}
                            >
                              {item.value}
                            </span>
                          ) : (
                            <span style={{ textAlign: "right" }}>{item.value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Share card */}
              <div className="neo-border shadow-neo" style={{ backgroundColor: "#FACC15", padding: "24px" }}>
                <h4 style={{ fontWeight: 900, textTransform: "uppercase", marginBottom: "8px", fontFamily: "'Syne', sans-serif" }}>
                  Share this job
                </h4>
                <p style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "16px", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Help a friend find their next dream role!
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    type="button"
                    className="share-btn"
                    aria-label="Copy job link"
                    onClick={() => {
                      navigator.clipboard?.writeText(window.location.href)
                        .then(() => setNotice({ tone: "ok", text: "Link copied." }))
                        .catch(() => setNotice({ tone: "err", text: "Could not copy the link." }));
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>link</span>
                  </button>
                  <button
                    type="button"
                    className="share-btn"
                    aria-label="Share job"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: job.title, text: `${job.title} at ${job.company_name}`, url: window.location.href })
                          .catch(() => {});
                      } else {
                        setNotice({ tone: "err", text: "Sharing is not available in this browser." });
                      }
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>send</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Similar Vacancies ── */}
        {similar.length > 0 && (
          <section style={{ marginTop: "80px" }}>
            <h2
              style={{
                fontSize: "1.875rem",
                fontWeight: 800,
                textTransform: "uppercase",
                marginBottom: "32px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              Similar{" "}
              <span style={{ color: "#ffffff", backgroundColor: "#000000", padding: "4px 8px" }}>
                Vacancies
              </span>
            </h2>

            <div
              className="similar-grid"
              style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}
            >
              {similar.map((s) => {
                const sSalary = formatSalary(s.salary_min, s.salary_max);
                const sInfo = [s.company_name, sSalary].filter(Boolean).join(" • ");
                return (
                  <button
                    key={s.id}
                    type="button"
                    className="similar-card"
                    onClick={() => navigate(`/job/${s.id}`)}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                      <div
                        className="neo-border-sm"
                        style={{
                          width: "48px",
                          height: "48px",
                          backgroundColor: "#e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ color: "#111827" }}>work</span>
                      </div>
                      {humanize(s.work_model) && (
                        <span
                          className="neo-border-sm"
                          style={{
                            backgroundColor: "#f3f4f6",
                            padding: "2px 8px",
                            fontSize: "0.75rem",
                            fontWeight: 900,
                            textTransform: "uppercase",
                            alignSelf: "flex-start",
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          {humanize(s.work_model)}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "4px", fontFamily: "'Syne', sans-serif" }}>
                      {s.title}
                    </h3>
                    <p style={{ fontSize: "0.875rem", fontWeight: 700, color: "#6b7280", marginBottom: "16px", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {sInfo || "Salary not disclosed"}
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                      {(s.core_skills || []).slice(0, 2).map((tag, i) => (
                        <span
                          key={`${tag}-${i}`}
                          className="neo-border-sm"
                          style={{
                            backgroundColor: "rgba(216,180,254,0.2)",
                            padding: "4px 8px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            fontFamily: "'Space Grotesk', sans-serif",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </main>

    </>
  );
}

// ─── Loading / error / not-found ─────────────────────────────────────────────

function Centered({ title, text, action }) {
  return (
    <main style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div
        className="neo-border shadow-neo"
        style={{ backgroundColor: "#ffffff", padding: "40px", maxWidth: "520px", textAlign: "center" }}
      >
        <h1 style={{ fontSize: "1.75rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "12px", fontFamily: "'Syne', sans-serif" }}>
          {title}
        </h1>
        <p style={{ fontWeight: 500, color: "#374151", marginBottom: action ? "24px" : "0", fontFamily: "'Space Grotesk', sans-serif" }}>
          {text}
        </p>
        {action && (
          <button type="button" className="apply-btn" onClick={action.onClick} style={{ width: "auto" }}>
            {action.label}
          </button>
        )}
      </div>
    </main>
  );
}
