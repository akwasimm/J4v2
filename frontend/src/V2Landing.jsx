import { useState, useEffect } from "react";

// ─── DATA ─────────────────────────────────────────────────────────────────

const matchBars = [
  { label: "Core Skills Match", pct: 92 },
  { label: "Exp. Seniority Alignment", pct: 78 },
  { label: "Salary Equilibrium", pct: 88 },
];

const jobCards = [
  {
    id: 1,
    type: "FULL-TIME",
    title: "Senior Design\nLead",
    match: 94,
    headerBg: "#D8B4FE", // Lavender
    company: "Metropolis Lab",
    location: "London, UK • £120k - £150k",
    analysis: "Your portfolio's emphasis on industrial-scale Brutalism perfectly mirrors their upcoming flagship project.",
    tags: ["BIM Expert", "Lead Architect", "Sustainability"],
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRKdqOIYC7566RRsU6uzu37wzPS5-7Vcc55-S9LFrVCQRZClMEYFJogykMOg9SKLtNxRvt7i8weT_0skAf0nuqKZ8sq3qPoI4MH9IuUjJmEAAhY-MVKfM1Z3LHxEhVyUqUI3VqakD7l6qbvKfVwLSuJ_m32CkJJzavKPrva6xxKv7GNNwSeX9_Q-dEnUulaZD8USxdYLTWK_IsRS_o8ArbRiLu265y66VjpNgpVkUc3LpS1mg8FuqoM",
  },
  {
    id: 2,
    type: "REMOTE",
    title: "Front-end\nArchitect",
    match: 88,
    headerBg: "#fef9c3", // Yellow
    company: "Systemic AI",
    location: "Global • $140k - $190k",
    analysis: "High synergy with their React architecture. Note: Slight gap in WebGL proficiency required for visual layers.",
    tags: ["Typescript", "Architecture"],
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgVz-MXYAHAahsdzmLLKYN_BsL53TPsTEvizeVbYXLrmmOAJLZnIijIfVnbA9WdE38YH828TE0cbUG9mFL8tcfbNyiaOC_O-Oe9hUwwtuiRop6sykjN0ZvgdWQlM9OYCUCq4doFktGJXbFJj3j6iM-sDEyOqxiYj0jO7az7TINLAwoR_OoYIyqUsM94VDjLeE50sVFZgF0nRZ9_TLHvwJkbh2hdm2hFemo-tIH0gvs38l-YvRnR6DsTrop2s5NJm45H6dU3SvXckY",
  },
  {
    id: 3,
    type: "CONTRACT",
    title: "Infrastructure\nSpecialist",
    match: 81,
    headerBg: "#dcfce7", // Green
    company: "Core Grid UK",
    location: "Manchester • £95k - £110k",
    analysis: "Your background in urban planning gives you a 15% edge over standard engineering applicants for this specific role.",
    tags: ["Infrastructure", "Urban Planning"],
    logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuCz9nig3G0VlJSFrC_4MQcnou2dAcOMiSPzFh-dQmzVJVY8CQm5NclTDdF_CMCYk8__L3fnudLVrrjTg1nxiVvtpjzmMAKT69RrxvOM5sxaMHeaNDV9n2V3XCA5Sy-bupZq4jxvi1oI5SbAKHNCMYu-nWbramIOCOo068zCWV7eD-HM_EIr75d_f60uU2wXVDRxCGomexq4yIDsRNHAdVgyOBrtadeccKJDY1JkOdQJ0xyXCcyMXrxBsb7b-4rjl-jD0YCs9Q",
  },
];

// ─── ICONS ────────────────────────────────────────────────────────────────

const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A4D2E" stroke="none">
    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm-1.4 14.4-3.6-3.6 1.4-1.4 2.2 2.2 4.6-4.6 1.4 1.4-6 6z"/>
  </svg>
);

const WarnIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#ba1a1a" stroke="none">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>
);

const InsightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1A4D2E" stroke="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const ArrowBack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);

const ArrowForward = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────

function MatchBar({ label, pct }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#000000", fontFamily: "'Space Grotesk', sans-serif" }}>{label}</span>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#1A4D2E" }}>{pct}%</span>
      </div>
      <div style={{ height: "16px", backgroundColor: "#f3f4f6", border: "2px solid #000000" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          backgroundColor: "#1A4D2E",
          borderRight: "2px solid #000000",
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

function JobCard({ job }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "#ffffff",
        border: "2px solid #000000",
        boxShadow: hovered ? "none" : "4px 4px 0px 0px #000000",
        transform: hovered ? "translate(4px, 4px)" : "none",
        transition: "all 0.15s ease",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer"
      }}
    >
      {/* Card Header */}
      <div style={{
        backgroundColor: job.headerBg,
        borderBottom: "2px solid #000000",
        padding: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}>
        <div>
          <span style={{
            backgroundColor: "#000000", color: "#ffffff",
            fontSize: "10px", fontWeight: 700,
            letterSpacing: "0.1em", textTransform: "uppercase",
            padding: "4px 8px", display: "inline-block", marginBottom: "8px",
            fontFamily: "'Space Grotesk', sans-serif"
          }}>{job.type}</span>
          <h4 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: "20px", textTransform: "uppercase",
            letterSpacing: "-0.02em", lineHeight: 1.1,
            color: "#000000", margin: 0,
            whiteSpace: "pre-line",
          }}>{job.title}</h4>
        </div>
        <div style={{
          backgroundColor: "#D8B4FE", color: "#000000",
          border: "2px solid #000000",
          padding: "10px 12px",
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800, fontSize: "18px", lineHeight: 1,
        }}>{job.match}%</div>
      </div>

      {/* Card Body */}
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", flex: 1 }}>
        {/* Company */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={job.logo} alt={job.company} style={{ width: "40px", height: "40px", border: "2px solid #000000", objectFit: "cover" }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: "12px", textTransform: "uppercase", margin: 0, color: "#000000", fontFamily: "'Space Grotesk', sans-serif" }}>{job.company}</p>
            <p style={{ fontSize: "10px", color: "#4b5563", fontWeight: 700, textTransform: "uppercase", margin: "2px 0 0", fontFamily: "'Space Grotesk', sans-serif" }}>{job.location}</p>
          </div>
        </div>

        {/* Match Analysis */}
        <div style={{ backgroundColor: "#f3f4f6", border: "2px solid #000000", padding: "14px", position: "relative" }}>
          <p style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", color: "#000000", marginBottom: "6px", letterSpacing: "0.06em", fontFamily: "'Syne', sans-serif" }}>Match Analysis</p>
          <p style={{ fontSize: "12px", fontWeight: 500, lineHeight: 1.5, margin: 0, color: "#4b5563", fontFamily: "'Space Grotesk', sans-serif" }}>"{job.analysis}"</p>
          <span style={{ position: "absolute", top: "-10px", right: "10px", backgroundColor: "#ffffff", borderRadius: "50%" }}><InsightIcon /></span>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {job.tags.map(tag => (
            <span key={tag} style={{
              border: "2px solid #000000",
              padding: "4px 8px",
              fontSize: "9px", fontWeight: 700,
              textTransform: "uppercase",
              backgroundColor: "#ffffff",
              letterSpacing: "0.08em",
              fontFamily: "'Space Grotesk', sans-serif"
            }}>{tag}</span>
          ))}
        </div>

        {/* CTA */}
        <button
          style={{
            width: "100%", padding: "14px",
            backgroundColor: "#1A4D2E", color: "#ffffff",
            border: "2px solid #000000",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 700, fontSize: "12px",
            textTransform: "uppercase", letterSpacing: "0.06em",
            cursor: "pointer", marginTop: "auto",
            transition: "all 0.15s ease",
            boxShadow: "2px 2px 0px 0px #000000"
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translate(2px,2px)"; e.currentTarget.style.boxShadow = "none"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "2px 2px 0px 0px #000000"; }}
        >
          View Role
        </button>
      </div>
    </article>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────

export default function V2Landing({ onGetStarted, onSearch }) {
  useEffect(() => {
    document.title = "JobFor — AI-Powered Job Search";
  }, []);

  const [searchVal, setSearchVal] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ backgroundColor: "#ffffff", fontFamily: "'Space Grotesk', sans-serif", overflowX: "hidden" }}>

        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section style={{
          maxWidth: "1280px", margin: "0 auto",
          padding: "80px 40px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "60px",
          alignItems: "center",
        }}>
          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <h1 style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(3rem, 6vw, 5.5rem)",
              textTransform: "uppercase",
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
              color: "#000000",
              borderLeft: "8px solid #000000",
              paddingLeft: "24px",
              margin: 0,
            }}>
              AI-DRIVEN<br />CAREER<br />
              <span style={{ color: "#D8B4FE", backgroundColor: "#000000", padding: "0 8px" }}>MATCHING</span>
            </h1>

            <p style={{ fontSize: "16px", fontWeight: 500, color: "#4b5563", maxWidth: "400px", lineHeight: 1.6, margin: 0 }}>
              Deconstruct your career path with architectural precision. Our AI maps your DNA to global high-tier roles.
            </p>

            {/* Search Bar */}
            <div style={{
              display: "flex",
              border: "2px solid #000000",
              backgroundColor: "#ffffff",
              boxShadow: searchFocused ? "none" : "4px 4px 0px 0px #000000",
              transform: searchFocused ? "translate(4px,4px)" : "none",
              transition: "all 0.15s ease",
              maxWidth: "520px",
            }}>
              <span style={{ display: "flex", alignItems: "center", padding: "0 16px", color: "#000000" }}>
                <SearchIcon />
              </span>
              <input
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="ARCHITECTURAL ROLE OR SKILL..."
                style={{
                  flex: 1, padding: "20px 8px",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: "13px",
                  textTransform: "uppercase",
                  border: "none", outline: "none",
                  backgroundColor: "transparent",
                  color: "#000000",
                  letterSpacing: "0.04em",
                }}
              />
              <button
                onClick={() => onSearch && onSearch(searchVal)}
                style={{
                  backgroundColor: "#1A4D2E", color: "#ffffff",
                  padding: "0 28px",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 700, fontSize: "13px",
                  textTransform: "uppercase",
                  border: "none", borderLeft: "2px solid #000000",
                  cursor: "pointer", letterSpacing: "0.06em",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#D8B4FE"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1A4D2E"}
              >
                FIND
              </button>
            </div>
          </div>

          {/* Right — Hero Image */}
          <div style={{ position: "relative" }}>
            <div style={{
              border: "2px solid #000000",
              boxShadow: "8px 8px 0px 0px #000000",
              backgroundColor: "#f3f4f6",
              aspectRatio: "1/1",
              overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "16px",
            }}>
              <img
                src="https://images.unsplash.com/photo-1497215842964-222b430dc094?q=80&w=1470&auto=format&fit=crop"
                alt="Architecture"
                style={{ width: "100%", height: "100%", objectFit: "cover", border: "2px solid #000000" }}
              />
            </div>
            {/* Floating badge */}
            <div style={{
              position: "absolute",
              bottom: "-24px", left: "-24px",
              backgroundColor: "#fef9c3",
              border: "2px solid #000000",
              boxShadow: "4px 4px 0px 0px #000000",
              padding: "20px 24px",
              maxWidth: "220px",
            }}>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "26px", textTransform: "uppercase", lineHeight: 1, margin: 0, color: "#000000" }}>12,482</p>
              <p style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "6px", color: "#4b5563" }}>
                Verified Matches Today
              </p>
            </div>
          </div>
        </section>

        {/* ── AI SPOTLIGHT ─────────────────────────────────────────────── */}
        <section style={{
          backgroundColor: "#1A4D2E",
          borderTop: "2px solid #000000",
          borderBottom: "2px solid #000000",
          padding: "80px 40px",
        }}>
          <div style={{
            maxWidth: "1280px", margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "60px",
            alignItems: "center",
          }}>
            {/* Left text */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <span style={{
                backgroundColor: "#D8B4FE", color: "#000000",
                padding: "4px 14px",
                fontSize: "11px", fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.12em",
                border: "2px solid #000000",
                alignSelf: "flex-start",
              }}>SYSTEM ANALYSIS</span>

              <h2 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
                textTransform: "uppercase", letterSpacing: "-0.02em",
                lineHeight: 1.05, color: "#ffffff", margin: 0,
              }}>
                MATCH BREAKDOWN:<br />
                <span style={{ color: "#D8B4FE" }}>DATA ARCHITECT</span>
              </h2>

              <p style={{ fontSize: "14px", fontWeight: 500, color: "#e5e7eb", lineHeight: 1.6, margin: 0 }}>
                Deep AI mapping compares your technical blueprint against live market demands. Below is a real-time synthesis of your fit for 'Lead Systems Designer'.
              </p>
            </div>

            {/* Right panel */}
            <div style={{
              backgroundColor: "#ffffff",
              border: "2px solid #000000",
              boxShadow: "8px 8px 0px 0px #000000",
              padding: "36px",
            }}>
              {/* Gauge + Bars */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "32px", marginBottom: "28px" }}>
                {/* Circular gauge */}
                <div style={{
                  width: "140px", height: "140px", flexShrink: 0,
                  border: "8px solid #f3f4f6",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    borderRadius: "50%",
                    border: "8px solid #1A4D2E",
                    clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 85%)",
                  }} />
                  <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                    <span style={{ display: "block", fontSize: "32px", fontWeight: 800, color: "#000000", lineHeight: 1, fontFamily: "'Syne', sans-serif" }}>85%</span>
                    <span style={{ fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#4b5563" }}>OVERALL</span>
                  </div>
                </div>

                {/* Bars */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
                  {matchBars.map(b => <MatchBar key={b.label} {...b} />)}
                </div>
              </div>

              {/* Bottom insights */}
              <div style={{
                borderTop: "2px solid #000000",
                paddingTop: "20px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <CheckCircleIcon />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "11px", textTransform: "uppercase", margin: 0, color: "#000000" }}>Technical Surplus</p>
                    <p style={{ fontSize: "11px", lineHeight: 1.4, marginTop: "4px", color: "#4b5563", fontWeight: 500 }}>
                      Exceeds requirements in Python/Scalability frameworks.
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                  <WarnIcon />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "11px", textTransform: "uppercase", margin: 0, color: "#000000" }}>Experience Gap</p>
                    <p style={{ fontSize: "11px", lineHeight: 1.4, marginTop: "4px", color: "#4b5563", fontWeight: 500 }}>
                      Requires 1.5 more years in direct team management roles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PREMIUM ROLES ─────────────────────────────────────────────── */}
        <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 40px" }}>
          {/* Section Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "52px" }}>
            <div>
              <h3 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                textTransform: "uppercase", letterSpacing: "-0.02em",
                color: "#000000", margin: "0 0 10px",
                borderBottom: "4px solid #1A4D2E",
                display: "inline-block", paddingBottom: "4px",
              }}>
                PREMIUM ROLES
              </h3>
              <p style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#4b5563", margin: 0 }}>
                Selected architectural alignments based on your ID.
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {[
                { Icon: ArrowBack, bg: "#ffffff" },
                { Icon: ArrowForward, bg: "#D8B4FE" },
              ].map(({ Icon, bg }, i) => (
                <button key={i} style={{
                  width: "48px", height: "48px",
                  border: "2px solid #000000",
                  backgroundColor: bg,
                  color: "#000000",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer",
                  transition: "background 0.15s",
                  boxShadow: "2px 2px 0px 0px #000000"
                }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = "#1A4D2E"}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = bg}
                >
                  <Icon />
                </button>
              ))}
            </div>
          </div>

          {/* Job Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "28px" }}>
            {jobCards.map(job => <JobCard key={job.id} job={job} />)}
          </div>

          {/* Load More */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "52px" }}>
            <button style={{
              padding: "20px 60px",
              border: "2px solid #000000",
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700, fontSize: "13px",
              textTransform: "uppercase", letterSpacing: "0.08em",
              backgroundColor: "#ffffff",
              color: "#000000",
              cursor: "pointer",
              boxShadow: "4px 4px 0px 0px #000000",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translate(2px,2px)"; e.currentTarget.style.boxShadow = "2px 2px 0px 0px #000000"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "4px 4px 0px 0px #000000"; }}
            >
              LOAD MORE OPPORTUNITIES
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
