import React, { useState, useEffect, useCallback } from "react";
import { fetchJobs } from "./services/jobsService.js";
import { FEATURES } from './config/features'
import ComingSoon from './components/ComingSoon'

// ─── Constants ────────────────────────────────────────────────────────────────

const FRESHER_EXP_LEVELS = [
  { label: "Any",          value: null,  badge: null },
  { label: "Fresher",      value: 0,     badge: "0 yr" },
  { label: "Up to 1 yr",   value: 1,     badge: "≤ 1yr" },
  { label: "Up to 2 yrs",  value: 2,     badge: "≤ 2yr" },
];

const WORK_MODES = [
  { label: "Any",    value: null,            icon: "public" },
  { label: "Remote", value: "remote",        icon: "home_work" },
  { label: "Hybrid", value: "hybrid",        icon: "swap_horiz" },
  { label: "Onsite", value: "onsite",        icon: "corporate_fare" },
];

const QUICK_SKILLS = [
  "Python", "React", "SQL", "Java", "Excel",
  "Marketing", "Design", "Node.js", "Data Analysis", "Content Writing",
];

const PAGE_SIZE = 10;

const LOGO_COLORS = ["#D8B4FE", "#FDE68A", "#BBF7D0", "#BFDBFE", "#FCA5A5", "#C4B5FD"];
const LOGO_ICONS  = ["work", "business_center", "apartment", "hub", "rocket_launch", "corporate_fare"];

function getCompanyStyle(name = "") {
  const idx = name.charCodeAt(0) % LOGO_COLORS.length;
  return { bg: LOGO_COLORS[idx], icon: LOGO_ICONS[idx] };
}

// ─── Reusable Components ──────────────────────────────────────────────────────

function MatchBar({ value }) {
  return (
    <div style={{ maxWidth: "384px", marginBottom: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.625rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", fontFamily: "'Space Grotesk', sans-serif" }}>
        <span>Match Compatibility</span>
        <span style={{ color: "#1A4D2E" }}>{value}%</span>
      </div>
      <div style={{ width: "100%", height: "12px", backgroundColor: "#f3f4f6", border: "2px solid #000000", overflow: "hidden", padding: "2px" }}>
        <div style={{ backgroundColor: "#1A4D2E", height: "100%", width: `${value}%`, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function NeoBtn({ children, bg, color = "#000", shadow = true, onClick, style = {} }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: bg, color, fontWeight: 900, padding: "12px 24px",
        border: shadow ? "3px solid #000" : "2px solid #000",
        boxShadow: shadow ? (hovered ? "none" : "3px 3px 0px 0px #000000") : "none",
        transform: shadow && hovered ? "translate(2px,2px)" : "translate(0,0)",
        transition: "all 0.15s ease", textTransform: "uppercase",
        fontSize: "0.625rem", letterSpacing: "0.2em", cursor: "pointer",
        fontFamily: "'Space Grotesk', sans-serif", ...style,
      }}
    >
      {children}
    </button>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({ label, icon, selected, onClick, accentColor = "#D8B4FE" }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: "6px",
        padding: "8px 14px",
        border: selected ? "2.5px solid #000" : "2px solid rgba(0,0,0,0.25)",
        backgroundColor: selected ? accentColor : hovered ? "#f9f9f9" : "#fff",
        fontWeight: 900, fontSize: "0.7rem", textTransform: "uppercase",
        letterSpacing: "0.1em", cursor: "pointer",
        fontFamily: "'Space Grotesk', sans-serif",
        boxShadow: selected ? "3px 3px 0px 0px #000" : hovered ? "2px 2px 0px 0px rgba(0,0,0,0.3)" : "none",
        transform: selected ? "translate(-1px,-1px)" : "translate(0,0)",
        transition: "all 0.15s ease",
        color: "#000",
        whiteSpace: "nowrap",
      }}
    >
      {icon && (
        <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>{icon}</span>
      )}
      {label}
    </button>
  );
}

// ─── Skill Tag Chip ───────────────────────────────────────────────────────────

function SkillChip({ label, active, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "5px 10px",
        border: active ? "2px solid #000" : "1.5px solid rgba(0,0,0,0.2)",
        backgroundColor: active ? "#1A4D2E" : hovered ? "#f3f4f6" : "#fff",
        color: active ? "#fff" : "#000",
        fontWeight: 800, fontSize: "0.6rem", textTransform: "uppercase",
        letterSpacing: "0.1em", cursor: "pointer",
        fontFamily: "'Space Grotesk', sans-serif",
        boxShadow: active ? "2px 2px 0px 0px #000" : "none",
        transition: "all 0.12s ease",
      }}
    >
      {label}
    </button>
  );
}

// ─── Section Label ────────────────────────────────────────────────────────────

function FilterLabel({ children }) {
  return (
    <p style={{
      fontSize: "0.55rem", fontWeight: 900, textTransform: "uppercase",
      letterSpacing: "0.2em", marginBottom: "12px",
      fontFamily: "'Space Grotesk', sans-serif",
      color: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", gap: "6px",
    }}>
      <span style={{ display: "inline-block", width: "12px", height: "2px", backgroundColor: "#1A4D2E" }} />
      {children}
    </p>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────

function JobCard({ job }) {
  const [saved, setSaved] = useState(false);
  const [cardHover, setCardHover] = useState(false);
  const [saveHover, setSaveHover] = useState(false);

  const { bg, icon } = getCompanyStyle(job.company_name);
  const matchScore = 80 + (job.id.charCodeAt(0) % 20);

  const salaryLabel = job.salary_max
    ? `₹${(job.salary_min / 1000).toFixed(0)}k – ₹${(job.salary_max / 1000).toFixed(0)}k`
    : "Salary Not Disclosed";

  const tags = (job.core_skills || []).slice(0, 5);

  const workModelMap = { remote: "Remote", hybrid: "Hybrid", onsite: "On-site", not_specified: null };
  const workModelLabel = workModelMap[job.work_model] || null;

  const workModelColor = {
    Remote: "#BBF7D0",
    Hybrid: "#FDE68A",
    "On-site": "#BFDBFE",
  }[workModelLabel] || "#f3f4f6";

  return (
    <div
      onMouseEnter={() => setCardHover(true)}
      onMouseLeave={() => setCardHover(false)}
      style={{
        backgroundColor: "#ffffff", padding: "20px", border: "2px solid #000000",
        boxShadow: cardHover ? "8px 8px 0px 0px rgba(0,0,0,1)" : "5px 5px 0px 0px #000000",
        transform: cardHover ? "translate(-1px,-1px)" : "translate(0,0)",
        transition: "all 0.15s ease", position: "relative",
      }}
    >
      {/* Bookmark */}
      <div style={{ position: "absolute", top: "16px", right: "16px" }}>
        <button
          onClick={() => setSaved(!saved)}
          onMouseEnter={() => setSaveHover(true)}
          onMouseLeave={() => setSaveHover(false)}
          style={{
            padding: "10px", border: "2px solid #000000",
            backgroundColor: saved ? "#D8B4FE" : saveHover ? "#D8B4FE" : "#ffffff",
            boxShadow: saved ? "none" : "3px 3px 0px 0px #000000",
            cursor: "pointer", transition: "all 0.15s ease",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: saved ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 600", display: "block", fontSize: "20px" }}>
            {saved ? "bookmark" : "bookmark_border"}
          </span>
        </button>
      </div>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {/* Logo */}
        <div style={{ width: "60px", height: "60px", border: "2px solid #000000", backgroundColor: bg, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0, boxShadow: "3px 3px 0px 0px #000000" }}>
          {job.company_logo_url ? (
            <img src={job.company_logo_url} alt={job.company_name} style={{ width: "52px", height: "52px", objectFit: "contain" }} />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: "1.75rem", color: "#000" }}>{icon}</span>
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0, paddingRight: "60px" }}>
          <div style={{ marginBottom: "14px" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "-0.025em", marginBottom: "8px", fontFamily: "'Syne', sans-serif", cursor: "pointer" }}>
              {job.title}
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", color: "rgba(0,0,0,0.8)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.05em", fontFamily: "'Space Grotesk', sans-serif" }}>
              <span style={{ display: "flex", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "15px", marginRight: "4px" }}>business</span>
                {job.company_name}
              </span>
              <span style={{ color: "rgba(0,0,0,0.3)" }}>•</span>
              <span style={{ display: "flex", alignItems: "center" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "15px", marginRight: "4px" }}>location_on</span>
                {job.location}
              </span>
              {workModelLabel && (
                <>
                  <span style={{ color: "rgba(0,0,0,0.3)" }}>•</span>
                  <span style={{ backgroundColor: workModelColor, color: "#000000", padding: "2px 8px", border: "1.5px solid rgba(0,0,0,0.3)", fontSize: "0.65rem" }}>{workModelLabel}</span>
                </>
              )}
              <span style={{ color: "rgba(0,0,0,0.3)" }}>•</span>
              <span style={{ backgroundColor: "#1A4D2E", color: "#ffffff", padding: "2px 8px" }}>{salaryLabel}</span>
              {job.min_experience_years > 0 && (
                <>
                  <span style={{ color: "rgba(0,0,0,0.3)" }}>•</span>
                  <span style={{ display: "flex", alignItems: "center" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "15px", marginRight: "4px" }}>schedule</span>
                    {job.min_experience_years}+ yrs
                  </span>
                </>
              )}
              {job.min_experience_years === 0 && (
                <>
                  <span style={{ color: "rgba(0,0,0,0.3)" }}>•</span>
                  <span style={{ backgroundColor: "#BBF7D0", color: "#000", padding: "2px 8px", border: "1.5px solid rgba(0,0,0,0.3)", fontSize: "0.65rem", fontWeight: 900 }}>Fresher OK</span>
                </>
              )}
            </div>
          </div>

          <MatchBar value={matchScore} />

          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
              {tags.map((tag) => (
                <span key={tag} style={{ backgroundColor: "#f3f4f6", padding: "4px 10px", fontWeight: 900, fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.1em", border: "1.5px solid #000000", fontFamily: "'Space Grotesk', sans-serif" }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <NeoBtn bg="#D8B4FE" color="#000000">Quick Apply</NeoBtn>
            <NeoBtn bg="#ffffff" color="#000000" shadow={false} style={{ border: "2px solid #000" }}>View Details</NeoBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ padding: "20px", border: "2px dashed #d1d5db", opacity: 0.6 }}>
      <style>{`
        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .skeleton {
          background: linear-gradient(90deg, #f8f8f8 25%, #efeff1 50%, #f8f8f8 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }
      `}</style>
      <div style={{ display: "flex", gap: "16px" }}>
        <div className="skeleton" style={{ width: "60px", height: "60px", border: "2px solid #000", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="skeleton" style={{ height: "22px", width: "45%" }} />
          <div className="skeleton" style={{ height: "12px", width: "35%" }} />
          <div className="skeleton" style={{ height: "10px", width: "60%" }} />
          <div style={{ display: "flex", gap: "14px" }}>
            <div className="skeleton" style={{ height: "38px", width: "130px" }} />
            <div className="skeleton" style={{ height: "38px", width: "130px" }} />
          </div>
        </div>
      </div>
      <p style={{ textAlign: "center", marginTop: "28px", fontWeight: 900, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(0,0,0,0.3)", fontFamily: "'Space Grotesk', sans-serif" }}>
        Syncing latest matches...
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function JobDiscovery() {
  // Placeholder check
  if (!FEATURES.jobDiscovery) {
    return <ComingSoon pageName="Job Discovery" description="Browse and search all available jobs" />
  }

  useEffect(() => {
    document.title = "Job Discovery — JobFor";
  }, []);

  const [searchQuery, setSearchQuery]     = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [workMode, setWorkMode]           = useState(WORK_MODES[0]);
  const [expLevel, setExpLevel]           = useState(FRESHER_EXP_LEVELS[0]);
  const [activeSkill, setActiveSkill]     = useState(null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [sortBy, setSortBy]               = useState("Newest First");
  const [searchBtnHover, setSearchBtnHover] = useState(false);

  const [jobListings, setJobListings] = useState([]);
  const [totalJobs, setTotalJobs]     = useState(0);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const totalPages = Math.max(1, Math.ceil(totalJobs / PAGE_SIZE));

  // Effective search query merges typed keyword + quick skill tag
  const effectiveQ = activeSkill
    ? (searchQuery ? `${searchQuery} ${activeSkill}` : activeSkill)
    : searchQuery;

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchJobs({
        q:          effectiveQ    || undefined,
        location:   locationQuery  || undefined,
        work_model: workMode.value || undefined,
        // expLevel.value=null means "Any" (no filter), expLevel.value=0 means Fresher (must pass through)
        min_exp:    expLevel.value !== null ? expLevel.value : undefined,
        page:       currentPage,
        page_size:  PAGE_SIZE,
      });
      setJobListings(data.items || []);
      setTotalJobs(data.total  || 0);
    } catch (err) {
      console.error("Failed fetching jobs:", err);
      setError("Could not load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [effectiveQ, locationQuery, workMode, expLevel, currentPage]);

  useEffect(() => {
    const delay = setTimeout(loadJobs, 350);
    return () => clearTimeout(delay);
  }, [loadJobs]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, locationQuery, workMode, expLevel, activeSkill]);

  const handleSearch = () => {
    setCurrentPage(1);
    loadJobs();
  };

  const handleResetFilters = () => {
    setWorkMode(WORK_MODES[0]);
    setExpLevel(FRESHER_EXP_LEVELS[0]);
    setActiveSkill(null);
    setSearchQuery("");
    setLocationQuery("");
    setCurrentPage(1);
  };

  const activeFilterCount = [
    workMode.value,
    expLevel.value !== null,
    activeSkill,
  ].filter(Boolean).length;

  const pageWindow = () => {
    const delta = 2;
    const range = [];
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      range.push(i);
    }
    return range;
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
          color: #000000;
          -webkit-font-smoothing: antialiased;
        }

        h1, h2, h3, h4 { font-family: 'Syne', sans-serif; text-transform: uppercase; font-weight: 800; letter-spacing: -0.025em; }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 600, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
          font-style: normal; font-size: 24px; line-height: 1;
          letter-spacing: normal; text-transform: none;
          display: inline-block; white-space: nowrap; direction: ltr;
        }

        .neo-select {
          border: 3px solid #000000; font-weight: 900;
          padding: 10px 16px; font-size: 0.75rem; text-transform: uppercase;
          letter-spacing: 0.1em; background: #ffffff;
          font-family: 'Space Grotesk', sans-serif; cursor: pointer;
        }
        .neo-select:focus { outline: none; }

        .search-input {
          width: 100%; border: none; outline: none;
          font-size: 1rem; font-weight: 700; padding: 0;
          font-family: 'Space Grotesk', sans-serif; background: transparent;
        }
        .search-input::placeholder { color: rgba(0,0,0,0.3); }

        .page-btn {
          width: 44px; height: 44px; border: 2px solid #000000;
          display: flex; align-items: center; justify-content: center;
          font-weight: 900; cursor: pointer; transition: all 0.15s ease;
          font-family: 'Space Grotesk', sans-serif; font-size: 0.9rem;
          background: #ffffff;
        }
        .page-btn:hover:not(:disabled) { background: #f3f4f6; }
        .page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .filter-divider {
          width: 100%; height: 1px; background: rgba(0,0,0,0.1); margin: 20px 0;
        }

        @media (max-width: 1024px) {
          .main-layout { flex-direction: column !important; }
          .sidebar { width: 100% !important; }
        }
      `}</style>

      {/* ── Search Bar ── */}
      <div style={{ backgroundColor: "#000000", padding: "32px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ backgroundColor: "#BBF7D0", color: "#000", padding: "3px 10px", fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "'Space Grotesk', sans-serif", border: "1.5px solid rgba(255,255,255,0.3)" }}>
              For Freshers &amp; Early Careers
            </span>
          </div>
          <h1 style={{ color: "#ffffff", fontSize: "2.5rem", marginBottom: "24px", fontFamily: "'Syne', sans-serif" }}>
            Discover{" "}
            <span style={{ backgroundColor: "#D8B4FE", color: "#000", padding: "0 12px" }}>
              Opportunities
            </span>
          </h1>
          <div style={{ display: "flex", gap: "0", border: "3px solid #ffffff", backgroundColor: "#ffffff" }}>
            {/* Job title */}
            <div style={{ flex: 2, display: "flex", alignItems: "center", padding: "16px 20px", gap: "12px", borderRight: "2px solid #000" }}>
              <span className="material-symbols-outlined" style={{ color: "#000", flexShrink: 0 }}>search</span>
              <input
                id="job-search-input"
                className="search-input"
                placeholder="Job title, keyword, company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            {/* Location */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "16px 20px", gap: "12px", borderRight: "2px solid #000" }}>
              <span className="material-symbols-outlined" style={{ color: "#000", flexShrink: 0 }}>location_on</span>
              <input
                id="location-search-input"
                className="search-input"
                placeholder="City, state, remote..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            {/* Search btn */}
            <button
              id="job-search-btn"
              onMouseEnter={() => setSearchBtnHover(true)}
              onMouseLeave={() => setSearchBtnHover(false)}
              onClick={handleSearch}
              style={{
                backgroundColor: searchBtnHover ? "#D8B4FE" : "#1A4D2E",
                color: searchBtnHover ? "#000" : "#fff",
                fontWeight: 900, padding: "16px 32px",
                border: "none", textTransform: "uppercase", fontSize: "0.75rem",
                letterSpacing: "0.15em", cursor: "pointer", transition: "all 0.15s ease",
                fontFamily: "'Space Grotesk', sans-serif", flexShrink: 0,
              }}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
        <div className="main-layout" style={{ display: "flex", gap: "48px" }}>

          {/* ── Sidebar Filters ── */}
          <aside className="sidebar" style={{ width: "290px", flexShrink: 0 }}>
            <div style={{ border: "3px solid #000", padding: "24px", boxShadow: "5px 5px 0px 0px #000" }}>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", paddingBottom: "16px", borderBottom: "2px solid #000" }}>
                <h3 style={{ fontSize: "0.8rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Filters
                </h3>
                {activeFilterCount > 0 && (
                  <span style={{ backgroundColor: "#D8B4FE", color: "#000", padding: "2px 8px", fontSize: "0.6rem", fontWeight: 900, border: "1.5px solid #000", fontFamily: "'Space Grotesk', sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {activeFilterCount} active
                  </span>
                )}
              </div>

              {/* ── Work Mode ── */}
              <FilterLabel>Work Mode</FilterLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                {WORK_MODES.map((mode) => (
                  <FilterChip
                    key={mode.label}
                    label={mode.label}
                    icon={mode.icon}
                    selected={workMode.value === mode.value}
                    onClick={() => setWorkMode(mode)}
                    accentColor="#BBF7D0"
                  />
                ))}
              </div>

              <div className="filter-divider" />

              {/* ── Experience Level ── */}
              <FilterLabel>Experience Level</FilterLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" }}>
                {FRESHER_EXP_LEVELS.map((lvl) => (
                  <FilterChip
                    key={lvl.label}
                    label={lvl.label}
                    icon={lvl.badge ? "schedule" : "all_inclusive"}
                    selected={expLevel.label === lvl.label}
                    onClick={() => setExpLevel(lvl)}
                    accentColor="#D8B4FE"
                  />
                ))}
              </div>

              <div className="filter-divider" />

              {/* ── Quick Skill Tags ── */}
              <FilterLabel>Quick Skill Tags</FilterLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                {QUICK_SKILLS.map((skill) => (
                  <SkillChip
                    key={skill}
                    label={skill}
                    active={activeSkill === skill}
                    onClick={() => setActiveSkill(activeSkill === skill ? null : skill)}
                  />
                ))}
              </div>

              <div className="filter-divider" />

              {/* Reset */}
              <button
                onClick={handleResetFilters}
                style={{
                  width: "100%", padding: "12px", border: "2px solid #000",
                  fontWeight: 900, fontSize: "0.625rem", textTransform: "uppercase",
                  letterSpacing: "0.1em", cursor: "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                  backgroundColor: activeFilterCount > 0 ? "#FDE68A" : "#f3f4f6",
                  transition: "all 0.15s ease",
                  boxShadow: activeFilterCount > 0 ? "2px 2px 0px 0px #000" : "none",
                }}
              >
                {activeFilterCount > 0 ? `✕ Clear ${activeFilterCount} Filter${activeFilterCount > 1 ? "s" : ""}` : "Clear Filters"}
              </button>
            </div>

            {/* Live stats */}
            <div style={{ border: "3px solid #000", padding: "20px", boxShadow: "5px 5px 0px 0px #000", marginTop: "24px", backgroundColor: "#1A4D2E" }}>
              <p style={{ fontSize: "0.55rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "#D8B4FE", marginBottom: "12px", fontFamily: "'Space Grotesk', sans-serif" }}>
                Live Database
              </p>
              <p style={{ fontSize: "2rem", fontWeight: 900, color: "#ffffff", fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
                {loading ? "..." : totalJobs.toLocaleString()}
              </p>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", marginTop: "4px", fontFamily: "'Space Grotesk', sans-serif" }}>
                matching opportunities
              </p>
            </div>

            {/* Fresher tip card */}
            <div style={{ border: "3px solid #000", padding: "20px", boxShadow: "5px 5px 0px 0px rgba(0,0,0,0.15)", marginTop: "24px", backgroundColor: "#FDE68A" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>tips_and_updates</span>
                <p style={{ fontSize: "0.6rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Fresher Tip
                </p>
              </div>
              <p style={{ fontSize: "0.75rem", fontWeight: 600, lineHeight: 1.5, fontFamily: "'Space Grotesk', sans-serif" }}>
                Filter by <strong>"Fresher"</strong> experience and <strong>"Remote"</strong> mode to find the most entry-level friendly jobs across India.
              </p>
            </div>
          </aside>

          {/* ── Job Listings ── */}
          <section style={{ flex: 1, minWidth: 0 }}>
            {/* Results header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
              <p style={{ fontWeight: 900, fontSize: "1.05rem", fontFamily: "'Space Grotesk', sans-serif" }}>
                Found{" "}
                <span style={{ backgroundColor: "#D8B4FE", padding: "2px 8px", border: "2px solid #000", boxShadow: "3px 3px 0px 0px #000", margin: "0 4px" }}>
                  {loading ? "..." : totalJobs.toLocaleString()}
                </span>
                {" "}opportunities
                {effectiveQ && <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "rgba(0,0,0,0.5)", marginLeft: "8px" }}>for "<em>{effectiveQ}</em>"</span>}
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <span style={{ fontSize: "0.625rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "'Space Grotesk', sans-serif" }}>Sort:</span>
                <select className="neo-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  {["Newest First", "Most Relevant"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Active filter pills row */}
            {activeFilterCount > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                {workMode.value && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#BBF7D0", padding: "4px 10px", border: "1.5px solid #000", fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>home_work</span>
                    {workMode.label}
                    <button onClick={() => setWorkMode(WORK_MODES[0])} style={{ border: "none", background: "none", cursor: "pointer", padding: "0 0 0 4px", fontWeight: 900, fontSize: "0.75rem", lineHeight: 1 }}>×</button>
                  </span>
                )}
                {expLevel.value !== null && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#D8B4FE", padding: "4px 10px", border: "1.5px solid #000", fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>schedule</span>
                    {expLevel.label}
                    <button onClick={() => setExpLevel(FRESHER_EXP_LEVELS[0])} style={{ border: "none", background: "none", cursor: "pointer", padding: "0 0 0 4px", fontWeight: 900, fontSize: "0.75rem", lineHeight: 1 }}>×</button>
                  </span>
                )}
                {activeSkill && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px", backgroundColor: "#1A4D2E", color: "#fff", padding: "4px 10px", border: "1.5px solid #000", fontSize: "0.65rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Space Grotesk', sans-serif" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>code</span>
                    {activeSkill}
                    <button onClick={() => setActiveSkill(null)} style={{ border: "none", background: "none", cursor: "pointer", padding: "0 0 0 4px", fontWeight: 900, fontSize: "0.75rem", lineHeight: 1, color: "#fff" }}>×</button>
                  </span>
                )}
              </div>
            )}

            {/* Error state */}
            {error && (
              <div style={{ padding: "32px", border: "2px solid #EF4444", backgroundColor: "#FEF2F2", marginBottom: "24px" }}>
                <p style={{ fontWeight: 700, color: "#B91C1C" }}>{error}</p>
              </div>
            )}

            {/* Cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
              ) : jobListings.length > 0 ? (
                jobListings.map((job) => <JobCard key={job.id} job={job} />)
              ) : (
                <div style={{ padding: "64px 40px", textAlign: "center", border: "2px dashed #000" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "3rem", marginBottom: "16px", display: "block", opacity: 0.4 }}>search_off</span>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>No matches found</h3>
                  <p style={{ marginTop: "8px", fontWeight: 700, opacity: 0.6 }}>Try adjusting your search or filters</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div style={{ marginTop: "56px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                <button className="page-btn" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>chevron_left</span>
                </button>
                {pageWindow()[0] > 1 && (
                  <>
                    <button className="page-btn" onClick={() => setCurrentPage(1)}>1</button>
                    {pageWindow()[0] > 2 && <span style={{ padding: "0 4px", fontWeight: 900 }}>…</span>}
                  </>
                )}
                {pageWindow().map((pg) => (
                  <button
                    key={pg} className="page-btn"
                    onClick={() => setCurrentPage(pg)}
                    style={{
                      backgroundColor: currentPage === pg ? "#D8B4FE" : "#ffffff",
                      boxShadow: currentPage === pg ? "none" : "3px 3px 0px 0px #000000",
                      transform: currentPage === pg ? "translate(1px,1px)" : "translate(0,0)",
                    }}
                  >
                    {pg}
                  </button>
                ))}
                {pageWindow()[pageWindow().length - 1] < totalPages && (
                  <>
                    {pageWindow()[pageWindow().length - 1] < totalPages - 1 && <span style={{ padding: "0 4px", fontWeight: 900 }}>…</span>}
                    <button className="page-btn" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
                  </>
                )}
                <button className="page-btn" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>chevron_right</span>
                </button>
                <span style={{ marginLeft: "8px", fontSize: "0.75rem", fontWeight: 700, color: "rgba(0,0,0,0.5)", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Page {currentPage} of {totalPages.toLocaleString()}
                </span>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
