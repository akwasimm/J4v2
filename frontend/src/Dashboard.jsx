import React, { useRef, useState, useEffect } from "react";
import { getProfile } from "./services/profileService.js";
import { getPreferences } from "./api/client.js";
import { getDashboardProfileByRole } from "./utils/dashboardRoleMapping.js";

// ─── Profile Completion Data Helper ─────────────────────────────────────────

const createProfileData = (completion) => ({
  completion: completion || 75,
  incompleteSections: [
    { id: "photo", label: "Profile Photo", weight: 10, status: "missing", quickWin: true },
    { id: "skills", label: "Add 3+ Skills", weight: 20, status: "partial", quickWin: false },
    { id: "experience", label: "Work Experience", weight: 25, status: "missing", quickWin: false },
    { id: "preferences", label: "Job Preferences", weight: 15, status: "missing", quickWin: true },
    { id: "resume", label: "Upload Resume", weight: 15, status: "complete", quickWin: true },
    { id: "bio", label: "Professional Summary", weight: 15, status: "missing", quickWin: true },
  ],
  nextMilestone: {
    target: 50,
    remaining: 100 - (completion || 75),
    fastestPath: ["preferences", "bio"],
  },
});

// ─── Locked Features Preview Data ───────────────────────────────────────────

const lockedFeatures = [
  { icon: "route", title: "Career Roadmap", description: "Visual timeline from your current role to dream position with skill gaps highlighted" },
  { icon: "filter_alt", title: "Application Pipeline", description: "Track your job applications through every stage from Applied to Offer" },
  { icon: "payments", title: "Salary Benchmark", description: "See how your current salary compares to market rates for your target role" },
  { icon: "local_fire_department", title: "Hot Skills Analysis", description: "Discover which skills will boost your salary and career growth" },
  { icon: "analytics", title: "Deep Match Analysis", description: "AI-powered breakdown of why jobs match your profile" },
  { icon: "notifications_active", title: "Smart Next Steps", description: "Personalized reminders for follow-ups and deadlines" },
];

// ─── Hardcoded Data ───────────────────────────────────────────────────────────

// Note: topPicks is now generated inside the component from dynamic dashboardData

const matchBars = [
  { label: "Skills Alignment", value: 92, color: "#1A4D2E" },
  { label: "Experience Fit", value: 80, color: "#D8B4FE" },
  { label: "Location Preferred", value: 100, color: "#1A4D2E" },
  { label: "Salary Expectations", value: 75, color: "#D8B4FE" },
];

const whyItMatches = [
  "Expert knowledge in Figma & Design Systems",
  "Previous experience in B2B SaaS sector",
  "Perfect overlap with desired timezone (EST)",
  "Competitive package with full health benefits",
];

// ─── Option 1: Career Progress Roadmap ───────────────────────────────────────

const careerRoadmap = {
  currentRole: "Product Designer",
  nextTarget: "Senior UX Architect",
  dreamRole: "Design Director",
  currentProgress: 65,
  skillsToNext: [
    { name: "Design Systems", status: "completed", progress: 100 },
    { name: "TypeScript", status: "in_progress", progress: 45 },
    { name: "User Research", status: "pending", progress: 0 },
    { name: "Team Leadership", status: "pending", progress: 0 },
  ],
};

// ─── Option 1: Weekly Wins ────────────────────────────────────────────────────

const weeklyWins = [
  { id: 1, icon: "send", title: "Application Sent", detail: "TechCorp • Product Designer", date: "Today", type: "milestone" },
  { id: 2, icon: "school", title: "Course Progress", detail: "Figma Advanced • Module 3/8", date: "Yesterday", type: "learning" },
  { id: 3, icon: "person_add", title: "Network Growth", detail: "Connected with 3 hiring managers", date: "2 days ago", type: "networking" },
  { id: 4, icon: "description", title: "Profile Update", detail: "Added TypeScript skill", date: "3 days ago", type: "profile" },
];

// ─── Option 3: Application Pipeline ────────────────────────────────────────────

const applicationPipeline = {
  applied: { count: 12, companies: ["TechCorp", "Designify", "Innovate Labs"] },
  screening: { count: 3, companies: ["Google", "Meta"] },
  interview: { count: 1, companies: ["Stripe"] },
  offer: { count: 0, companies: [] },
};

const nextSteps = [
  { id: 1, task: "Send thank-you email to Stripe", deadline: "Today, 5:00 PM", urgency: "high", company: "Stripe", type: "follow_up" },
  { id: 2, task: "Complete take-home assignment", deadline: "Tomorrow, 11:59 PM", urgency: "high", company: "Google", type: "assignment" },
  { id: 3, task: "Update portfolio with case study", deadline: "Friday", urgency: "medium", company: null, type: "profile" },
];

// ─── Option 4: Salary Benchmark ──────────────────────────────────────────────

const salaryBenchmark = {
  currentSalary: "₹12,00,000",
  targetRoleSalary: {
    min: "₹18,00,000",
    max: "₹25,00,000",
    median: "₹21,00,000",
  },
  location: "Bangalore",
  experience: "4 years",
  gap: "₹9,00,000",
  bridgeSkills: ["TypeScript", "Design Systems", "User Research"],
};

const hotSkillsForNextRole = [
  { name: "TypeScript", demandScore: 92, salaryBoost: "+₹3L", trend: "up", youHave: false },
  { name: "Design Systems", demandScore: 88, salaryBoost: "+₹2.5L", trend: "up", youHave: true },
  { name: "React/Next.js", demandScore: 85, salaryBoost: "+₹2L", trend: "up", youHave: false },
  { name: "User Research", demandScore: 78, salaryBoost: "+₹1.5L", trend: "stable", youHave: false },
  { name: "Figma Variables", demandScore: 75, salaryBoost: "+₹1L", trend: "up", youHave: true },
  { name: "AI Design Tools", demandScore: 70, salaryBoost: "+₹0.8L", trend: "up", youHave: false },
];

// ─── Radial Progress ─────────────────────────────────────────────────────────

function RadialProgress({ percent = 85 }) {
  const size = 120;
  const strokeWidth = 10;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (circumference * percent) / 100;
  const center = size / 2;

  return (
    <div style={{ margin: "0 auto 16px auto", width: `${size}px`, height: `${size}px` }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: "block" }}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#1A4D2E"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="butt"
          transform={`rotate(-90 ${center} ${center})`}
        />
        {/* Outer ring border */}
        <circle
          cx={center}
          cy={center}
          r={center - 1}
          fill="none"
          stroke="#000000"
          strokeWidth="2"
        />
        {/* Percentage text */}
        <text
          x={center}
          y={center - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Syne', sans-serif"
          fontWeight="800"
          fontSize="22"
          fill="#000000"
        >
          {percent}%
        </text>
        {/* Label text */}
        <text
          x={center}
          y={center + 16}
          textAnchor="middle"
          dominantBaseline="middle"
          fontFamily="'Space Grotesk', sans-serif"
          fontWeight="700"
          fontSize="9"
          fill="#4b5563"
          letterSpacing="1"
        >
          OVERALL
        </text>
      </svg>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AIRecommendations() {
  const cardRef = useRef(null);
  const isNew = false;

  // Dashboard state - Dynamic based on user's target role
  const [userData, setUserData] = useState({
    firstName: "",
    targetRole: null,
    profileCompletion: 75,
    isLoading: true
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const cardsPerPage = 3;

  // Fetch user profile and preferences on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setUserData(prev => ({ ...prev, isLoading: true }));
        
        // Fetch profile data (for first_name)
        const profileResponse = await getProfile();
        const firstName = profileResponse?.profile?.first_name || "User";
        
        // Fetch preferences (for target_role)
        const preferences = await getPreferences();
        const targetRole = preferences?.target_role || null;
        const profileCompletion = profileResponse?.profile?.profile_completion || 75;
        
        // Get dashboard profile based on target role
        const { profileData: roleBasedProfileData } = getDashboardProfileByRole(targetRole);
        
        setUserData({
          firstName,
          targetRole,
          profileCompletion,
          isLoading: false
        });
        
        setDashboardData(roleBasedProfileData);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Fallback to default data
        const { profileData: defaultProfileData } = getDashboardProfileByRole(null);
        
        setUserData({
          firstName: "User",
          targetRole: null,
          profileCompletion: 75,
          isLoading: false
        });
        
        setDashboardData(defaultProfileData);
      }
    };
    
    fetchUserData();
  }, []);

  // Use loaded dashboard data or fallback
  const activeDashboardData = dashboardData || getDashboardProfileByRole(null).profileData;
  const { firstName, profileCompletion, isLoading } = userData;
  
  // Create profile completion data
  const profileData = createProfileData(profileCompletion);
  const completion = profileData.completion;
  const isComplete = completion >= 50;

  // Generate topPicks from dashboard data
  const topPicks = (activeDashboardData?.top_picks || []).map((job, index) => ({
    id: job.job_id || index + 1,
    match: `${Math.round(job.match_score || 0)}% MATCH`,
    matchBg: job.matchBg || "#D8B4FE",
    matchColor: job.matchColor || "#000000",
    cardBg: job.cardBg || "#ffffff",
    title: job.title || "Job Title",
    team: job.company || "Company",
    location: job.location || "Location",
    salary: job.salary_range || "Salary",
    btnBg: "#000000",
    btnColor: "#ffffff",
    btnHoverBg: "#ffffff",
    btnHoverColor: "#000000",
  }));

  // Filter sections by status (only used for incomplete dashboard)
  const missingSections = profileData.incompleteSections.filter(s => s.status !== "complete");
  const quickWins = missingSections.filter(s => s.quickWin);
  const deepWork = missingSections.filter(s => !s.quickWin);
  const fastestPath = profileData.nextMilestone.fastestPath.map(id =>
    profileData.incompleteSections.find(s => s.id === id)
  ).filter(Boolean);

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
          min-height: 100vh;
        }

        h1, h2, h3, h4, h5, h6 {
          font-family: 'Syne', sans-serif;
        }

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

        .shadow-neo    { box-shadow: 4px 4px 0px 0px #000000; }
        .shadow-neo-sm { box-shadow: 2px 2px 0px 0px #000000; }
        .shadow-neo-lg { box-shadow: 8px 8px 0px 0px #000000; }

        .top-card {
          border: 2px solid #000000;
          padding: 16px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .top-card:hover {
          transform: translate(4px, 4px);
          box-shadow: none !important;
        }

        .job-row {
          background: #ffffff;
          border: 2px solid #000000;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .job-row:hover {
          transform: translate(4px, 4px);
          box-shadow: none !important;
        }

        .missed-row {
          background: rgba(216,180,254,0.1);
          border: 2px solid #000000;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .missed-row:hover {
          transform: translate(4px, 4px);
          box-shadow: none !important;
        }

        .nav-btn {
          width: 40px;
          height: 40px;
          border: 2px solid #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ffffff;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .nav-btn:hover { background: #f3f4f6; }

        .analyze-btn {
          width: 100%;
          padding: 12px;
          font-weight: 700;
          border: 2px solid #000000;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.875rem;
          transition: background-color 0.15s ease, color 0.15s ease;
        }

        .learn-btn {
          width: 100%;
          background: #D8B4FE;
          color: #000000;
          padding: 16px;
          font-weight: 700;
          border: 2px solid #000000;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 2px 2px 0px 0px #000000;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .learn-btn:hover {
          transform: translate(4px, 4px);
          box-shadow: none;
        }

        .social-icon {
          width: 40px;
          height: 40px;
          border: 1px solid #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: 700;
          transition: background-color 0.15s ease, color 0.15s ease;
          font-family: 'Space Grotesk', sans-serif;
        }
        .social-icon:hover {
          background-color: #D8B4FE;
          color: #000000;
        }

        .profile-progress-large {
          width: 160px;
          height: 160px;
        }

        .section-card {
          border: 2px solid #000000;
          padding: 16px;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          cursor: pointer;
        }
        .section-card:hover {
          transform: translate(4px, 4px);
          box-shadow: none !important;
        }

        .section-card.missing { background-color: #fef3c7; }
        .section-card.partial { background-color: #ffffff; }
        .section-card.complete { background-color: #dcfce7; opacity: 0.7; }

        .locked-card {
          border: 2px dashed #9ca3af;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          padding: 24px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .locked-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(0,0,0,0.02) 10px,
            rgba(0,0,0,0.02) 20px
          );
          pointer-events: none;
        }

        .quick-win-badge {
          background-color: #D8B4FE;
          color: #000000;
          padding: 4px 8px;
          font-size: 0.625rem;
          font-weight: 700;
          text-transform: uppercase;
          border: 1px solid #000000;
        }

        .profile-btn {
          background-color: #000000;
          color: #ffffff;
          padding: 16px 32px;
          font-weight: 700;
          border: 2px solid #000000;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 4px 4px 0px 0px #D8B4FE;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          text-decoration: none;
          display: inline-block;
        }
        .profile-btn:hover {
          transform: translate(4px, 4px);
          box-shadow: none;
        }

        @media (max-width: 768px) {
          .top-picks-grid { grid-template-columns: 1fr !important; }
          .analysis-inner { flex-direction: column !important; }
          .analysis-cols  { grid-template-columns: 1fr !important; }
          .bottom-grid    { grid-template-columns: 1fr !important; }
          .footer-grid    { grid-template-columns: 1fr !important; }
          .nav-links      { display: none !important; }
          .h1-main        { font-size: 2.5rem !important; }
          .incomplete-grid { grid-template-columns: 1fr !important; }
          .locked-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }

        @media (max-width: 1024px) {
          .top-picks-grid { grid-template-columns: repeat(2, 1fr) !important; }
          section[style*="gridTemplateColumns: 'repeat(4, 1fr)'"] { grid-template-columns: repeat(2, 1fr) !important; }
          section[style*="gridTemplateColumns: 'repeat(3, 1fr)'"] { grid-template-columns: repeat(2, 1fr) !important; }
          section[style*="gridTemplateColumns: '2fr 1fr'"] { grid-template-columns: 1fr !important; }
          section[style*="gridTemplateColumns: '1fr 2fr'"] { grid-template-columns: 1fr !important; }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>



      {/* ── Main ── */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "24px 16px" }}>

        {!isComplete ? (
          <>
            {/* ════════════════════════════════════════════════════════════
                INCOMPLETE PROFILE DASHBOARD (< 50%)
                ════════════════════════════════════════════════════════════ */}

            {/* Section 1: Hero Progress Banner */}
            <section style={{ marginBottom: "48px", textAlign: "center" }}>
              <div style={{
                display: "inline-block",
                backgroundColor: "#fef08a",
                color: "#000000",
                padding: "8px 16px",
                border: "2px solid #000000",
                boxShadow: "4px 4px 0px 0px #000000",
                fontSize: "0.875rem",
                fontWeight: 700,
                marginBottom: "24px",
                textTransform: "uppercase",
                fontFamily: "'Space Grotesk', sans-serif",
              }}>
                Profile {profileCompletion}% Complete
              </div>

              <h1 style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                marginBottom: "16px",
                textTransform: "uppercase",
                fontFamily: "'Syne', sans-serif",
              }}>
                Complete Your Profile to <span style={{ backgroundColor: "#D8B4FE", padding: "0 8px", border: "2px solid #000" }}>Unlock</span> AI Insights
              </h1>

              <p style={{
                color: "#4b5563",
                fontWeight: 500,
                fontSize: "1.125rem",
                maxWidth: "600px",
                margin: "0 auto 32px",
                lineHeight: 1.6,
              }}>
                You're <strong>{profileData.nextMilestone.remaining}% away</strong> from seeing your personalized career roadmap, salary benchmarks, and AI job recommendations.
              </p>

              <a href="/profile" className="profile-btn">
                <span className="material-symbols-outlined" style={{ marginRight: "8px", verticalAlign: "middle" }}>edit</span>
                Complete Your Profile
              </a>
            </section>

            {/* Section 2: Quick Wins vs Deep Work */}
            <section style={{ marginBottom: "48px" }}>
              <div className="incomplete-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                {/* Quick Wins */}
                <div>
                  <h2 style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: "16px",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "'Syne', sans-serif",
                    color: "#16a34a",
                  }}>
                    <span className="material-symbols-outlined">bolt</span>
                    Quick Wins ({quickWins.reduce((acc, s) => acc + s.weight, 0)}%)
                  </h2>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "16px" }}>
                    Complete in under 2 minutes each
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {quickWins.map((section) => (
                      <a
                        key={section.id}
                        href="/profile"
                        className={`section-card shadow-neo-sm ${section.status}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{section.label}</span>
                          <span className="quick-win-badge">{section.weight}%</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "#6b7280" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                            {section.status === "partial" ? "progress_activity" : "add_circle"}
                          </span>
                          {section.status === "partial" ? "Continue" : "Add now"}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Deep Work */}
                <div>
                  <h2 style={{
                    fontSize: "1rem",
                    fontWeight: 700,
                    marginBottom: "16px",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "'Syne', sans-serif",
                    color: "#1A4D2E",
                  }}>
                    <span className="material-symbols-outlined">construction</span>
                    Deep Work ({deepWork.reduce((acc, s) => acc + s.weight, 0)}%)
                  </h2>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "16px" }}>
                    Worth the time investment
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {deepWork.map((section) => (
                      <a
                        key={section.id}
                        href="/profile"
                        className={`section-card shadow-neo-sm ${section.status}`}
                        style={{ textDecoration: "none", color: "inherit" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>{section.label}</span>
                          <span className="quick-win-badge">{section.weight}%</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.75rem", color: "#6b7280" }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                            {section.status === "partial" ? "progress_activity" : "add_circle"}
                          </span>
                          {section.status === "partial" ? "Continue" : "Add now"}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Fastest Path to 50% */}
            <section style={{ marginBottom: "48px" }}>
              <div className="shadow-neo-lg" style={{ backgroundColor: "#D8B4FE", border: "2px solid #000000", padding: "24px" }}>
                <h2 style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  marginBottom: "16px",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "'Syne', sans-serif",
                }}>
                  <span className="material-symbols-outlined">star</span>
                  Fastest Path to Unlock Your Dashboard
                </h2>
                <p style={{ marginBottom: "16px", fontSize: "0.875rem" }}>
                  Focus on these {fastestPath.length} sections to reach 50% and unlock your personalized AI dashboard:
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {fastestPath.map((section) => (
                    <a
                      key={section.id}
                      href="/profile"
                      style={{
                        backgroundColor: "#ffffff",
                        border: "2px solid #000000",
                        padding: "12px 20px",
                        textDecoration: "none",
                        color: "inherit",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "2px 2px 0px 0px #000000",
                        transition: "transform 0.15s ease, box-shadow 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translate(2px, 2px)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "2px 2px 0px 0px #000000";
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{section.label}</span>
                      <span style={{ backgroundColor: "#000000", color: "#ffffff", padding: "2px 8px", fontSize: "0.75rem" }}>+{section.weight}%</span>
                    </a>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 4: Teaser Preview - Locked Features */}
            <section style={{ marginBottom: "48px" }}>
              <h2 style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                marginBottom: "24px",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontFamily: "'Syne', sans-serif",
                color: "#6b7280",
              }}>
                <span className="material-symbols-outlined">lock</span>
                Unlock These Features at 50%
              </h2>
              <div className="locked-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                {lockedFeatures.map((feature) => (
                  <div key={feature.icon} className="locked-card">
                    <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "#9ca3af", marginBottom: "12px" }}>{feature.icon}</span>
                    <h4 style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "8px", fontFamily: "'Syne', sans-serif", color: "#6b7280" }}>
                      {feature.title}
                    </h4>
                    <p style={{ fontSize: "0.75rem", color: "#9ca3af", lineHeight: 1.5 }}>
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            {/* ════════════════════════════════════════════════════════════
                COMPLETE PROFILE DASHBOARD (≥ 50%)
                ════════════════════════════════════════════════════════════ */}

            {/* Header - Personalized Welcome */}
            <header style={{ marginBottom: "40px" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                marginBottom: "24px",
              }}>
                {/* Avatar placeholder with initials */}
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "#1A4D2E",
                  border: "3px solid #000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  fontFamily: "'Syne', sans-serif",
                }}>
                  {firstName ? firstName.charAt(0).toUpperCase() : "?"}
                </div>
                
                <div>
                  {/* Time-based greeting with user name */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "8px",
                  }}>
                    <span style={{
                      backgroundColor: "#D8B4FE",
                      color: "#000000",
                      padding: "4px 12px",
                      border: "2px solid #000000",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}>
                      GOOD MORNING
                    </span>
                    <span style={{
                      backgroundColor: "#1A4D2E",
                      color: "#ffffff",
                      padding: "4px 12px",
                      border: "2px solid #000000",
                      fontSize: "0.875rem",
                      fontWeight: 700,
                      fontFamily: "'Syne', sans-serif",
                    }}>
                      {firstName || "There"}
                    </span>
                  </div>
                  
                  <h1
                    className="h1-main"
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      letterSpacing: "-0.03em",
                      textTransform: "none",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    Your career <span style={{ backgroundColor: "#fef08a", padding: "0 8px", border: "2px solid #000" }}>awaits</span> ✨
                  </h1>
                </div>
              </div>
              
              <p
                style={{
                  color: "#4b5563",
                  fontWeight: 500,
                  fontSize: "1.125rem",
                  fontFamily: "'Space Grotesk', sans-serif",
                  marginLeft: "72px",
                  maxWidth: "600px",
                  lineHeight: "1.6",
                }}
              >
                Here are your personalized job matches, curated just for your unique skills and experience.
              </p>
            </header>

        {/* ── Section 1: Top Picks ── */}
        <section style={{ marginBottom: "64px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginBottom: "16px",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                textTransform: "uppercase",
                fontFamily: "'Syne', sans-serif",
              }}
            >
              <span className="material-symbols-outlined" style={{ color: "#1A4D2E" }}>
                stars
              </span>
              Top Picks For You
            </h2>

            {/* Navigation arrows on the right */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ fontSize: "0.875rem", color: "#6b7280", marginRight: "8px" }}>
                {currentPage + 1} / {Math.ceil(topPicks.length / cardsPerPage)}
              </span>
              <button 
                className="nav-btn shadow-neo-sm" 
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                style={{ opacity: currentPage === 0 ? 0.4 : 1 }}
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                className="nav-btn shadow-neo-sm"
                onClick={() => {
                  const maxPage = Math.ceil(topPicks.length / cardsPerPage) - 1;
                  setCurrentPage(prev => Math.min(maxPage, prev + 1));
                }}
                disabled={currentPage >= Math.ceil(topPicks.length / cardsPerPage) - 1}
                style={{ opacity: currentPage >= Math.ceil(topPicks.length / cardsPerPage) - 1 ? 0.4 : 1 }}
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>

          <div
            className="top-picks-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "24px",
              overflow: "hidden",
            }}
          >
            {/* Use static topPicks data */}
            {topPicks
              .slice(currentPage * cardsPerPage, (currentPage + 1) * cardsPerPage)
              .map((job, index) => (
              <div
                key={job.job_id || job.id || `job-${index}`}
                className="top-card shadow-neo"
                style={{ backgroundColor: job.cardBg }}
              >
                {/* Match badge + bookmark */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: job.matchBg || "#1A4D2E",
                      color: job.matchColor || "#ffffff",
                      border: "2px solid #000000",
                      padding: "4px 12px",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                    }}
                  >
                    {job.match_score ? `${Math.round(job.match_score)}% MATCH` : job.match}
                  </div>
                  <button
                    style={{
                      background: "none",
                      border: "2px solid #000",
                      cursor: "pointer",
                      padding: "4px",
                      transition: "all 0.15s ease"
                    }}
                    title="Save this job"
                  >
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                      bookmark_add
                    </span>
                  </button>
                </div>

                {/* Title */}
                <div style={{ marginBottom: "16px" }}>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      marginBottom: "4px",
                      fontFamily: "'Syne', sans-serif",
                    }}
                  >
                    {job.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      opacity: 0.8,
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    {job.team}
                  </p>
                </div>

                {/* Location + Salary */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    marginBottom: "24px",
                    flexWrap: "wrap",
                    fontFamily: "'Space Grotesk', sans-serif",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>location_on</span>
                  {job.location}
                  <span className="material-symbols-outlined" style={{ fontSize: "18px", marginLeft: "8px" }}>payments</span>
                  {job.salary}
                </div>

                {/* CTA */}
                <button
                  className="analyze-btn"
                  style={{ backgroundColor: job.btnBg, color: job.btnColor }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = job.btnHoverBg;
                    e.currentTarget.style.color = job.btnHoverColor;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = job.btnBg;
                    e.currentTarget.style.color = job.btnColor;
                  }}
                >
                  Analyze Match
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: Deep Match Analysis ── */}
        <section style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "32px",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "#1A4D2E" }}>analytics</span>
            Deep Match Analysis
          </h2>

          <div
            className="analysis-cols"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0,8fr) minmax(0,4fr)",
              gap: "32px",
            }}
          >
            {/* Left card */}
            <div
              className="shadow-neo-lg"
              style={{
                backgroundColor: "#ffffff",
                border: "2px solid #000000",
                padding: "32px",
              }}
            >
              <div
                className="analysis-inner"
                style={{ display: "flex", alignItems: "center", gap: "48px" }}
              >
                {/* Radial */}
                <div style={{ textAlign: "center", flexShrink: 0 }}>
                  <RadialProgress percent={85} />
                  <h3 style={{ fontWeight: 700, fontSize: "1.125rem", fontFamily: "'Syne', sans-serif" }}>
                    Senior UX Architect
                  </h3>
                  <p
                    style={{
                      fontSize: "0.875rem",
                      color: "#6b7280",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      fontFamily: "'Space Grotesk', sans-serif",
                    }}
                  >
                    Acme Global Systems
                  </p>
                </div>

                {/* Bars */}
                <div style={{ flexGrow: 1, width: "100%" }}>
                  {matchBars.map((bar) => (
                    <div key={bar.label} style={{ marginBottom: "24px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          marginBottom: "4px",
                          fontFamily: "'Space Grotesk', sans-serif",
                        }}
                      >
                        <span>{bar.label}</span>
                        <span>{bar.value}%</span>
                      </div>
                      <div
                        style={{
                          height: "16px",
                          width: "100%",
                          backgroundColor: "#f3f4f6",
                          border: "2px solid #000000",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${bar.value}%`,
                            backgroundColor: bar.color,
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why it matches */}
              <div style={{ marginTop: "48px", paddingTop: "48px", borderTop: "2px solid #000000" }}>
                <h4
                  style={{
                    fontWeight: 700,
                    marginBottom: "16px",
                    textTransform: "uppercase",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ color: "#16a34a" }}>verified</span>
                  Why it matches
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
                  {whyItMatches.map((reason, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: 500,
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ color: "#1A4D2E", flexShrink: 0 }}>
                        check_circle
                      </span>
                      {reason}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right card — Missing Skill */}
            <div
              className="shadow-neo-lg"
              style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                border: "2px solid #000000",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#D8B4FE",
                  color: "#000000",
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "24px",
                  border: "2px solid #ffffff",
                }}
              >
                <span className="material-symbols-outlined">warning</span>
              </div>

              <h3
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "16px",
                  textTransform: "uppercase",
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                Missing Skill Alert
              </h3>

              <p
                style={{
                  marginBottom: "24px",
                  opacity: 0.8,
                  fontFamily: "'Space Grotesk', sans-serif",
                  lineHeight: 1.6,
                }}
              >
                This role highly values{" "}
                <span
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#000000",
                    padding: "2px 8px",
                    fontWeight: 700,
                  }}
                >
                  TypeScript
                </span>
                . We noticed it's not on your profile.
              </p>

              <div
                style={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  padding: "16px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  marginBottom: "32px",
                  flexGrow: 1,
                }}
              >
                <h4 style={{ fontWeight: 700, marginBottom: "8px", fontFamily: "'Syne', sans-serif" }}>
                  Recommendation:
                </h4>
                <p style={{ fontSize: "0.875rem", fontStyle: "italic", fontFamily: "'Space Grotesk', sans-serif" }}>
                  Completing a TypeScript certification could increase your match rate to 95%.
                </p>
              </div>

              <button className="learn-btn">Learn Now</button>
            </div>
          </div>
        </section>

        {/* ── Section 3: Career Progress Roadmap ──────────────────────────────── */}
        <section style={{ marginBottom: "64px" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "24px",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "#1A4D2E" }}>route</span>
            Your Career Roadmap
          </h2>

          {/* Roadmap Visual */}
          <div className="shadow-neo-lg" style={{ backgroundColor: "#ffffff", border: "2px solid #000000", padding: "32px" }}>
            {/* Role Timeline */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", position: "relative" }}>
              {/* Current */}
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "#1A4D2E",
                  color: "#ffffff",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  border: "3px solid #000000",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>person</span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Current</p>
                <h4 style={{ fontWeight: 700, fontFamily: "'Syne', sans-serif", fontSize: "0.875rem" }}>{careerRoadmap.currentRole}</h4>
              </div>

              {/* Progress Line */}
              <div style={{ flex: 2, height: "4px", backgroundColor: "#e5e7eb", position: "relative", margin: "0 16px" }}>
                <div style={{ width: `${careerRoadmap.currentProgress}%`, height: "100%", backgroundColor: "#1A4D2E" }} />
                <div style={{ position: "absolute", top: "-24px", left: `${careerRoadmap.currentProgress}%`, transform: "translateX(-50%)", backgroundColor: "#D8B4FE", padding: "4px 12px", border: "2px solid #000000", fontWeight: 700, fontSize: "0.75rem" }}>
                  {careerRoadmap.currentProgress}% Ready
                </div>
              </div>

              {/* Next Target */}
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "#D8B4FE",
                  color: "#000000",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  border: "3px solid #000000",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>target</span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Next Target</p>
                <h4 style={{ fontWeight: 700, fontFamily: "'Syne', sans-serif", fontSize: "0.875rem" }}>{careerRoadmap.nextTarget}</h4>
              </div>

              {/* Arrow */}
              <div style={{ padding: "0 16px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "#6b7280" }}>arrow_forward</span>
              </div>

              {/* Dream */}
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  backgroundColor: "#ffffff",
                  color: "#000000",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                  border: "3px dashed #000000",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>stars</span>
                </div>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 700, textTransform: "uppercase" }}>Dream Role</p>
                <h4 style={{ fontWeight: 700, fontFamily: "'Syne', sans-serif", fontSize: "0.875rem", opacity: 0.6 }}>{careerRoadmap.dreamRole}</h4>
              </div>
            </div>

            {/* Skills Gap */}
            <div style={{ borderTop: "2px solid #000000", paddingTop: "24px" }}>
              <h4 style={{ fontWeight: 700, marginBottom: "16px", fontFamily: "'Syne', sans-serif", fontSize: "0.875rem", textTransform: "uppercase" }}>
                Skills to Bridge the Gap
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                {careerRoadmap.skillsToNext.map((skill) => (
                  <div key={skill.name} style={{
                    padding: "16px",
                    border: "2px solid #000000",
                    backgroundColor: skill.status === "completed" ? "#dcfce7" : skill.status === "in_progress" ? "#fef3c7" : "#f3f4f6",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.875rem", fontFamily: "'Syne', sans-serif" }}>{skill.name}</span>
                      <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                        {skill.status === "completed" ? "check_circle" : skill.status === "in_progress" ? "progress_activity" : "schedule"}
                      </span>
                    </div>
                    <div style={{ height: "8px", backgroundColor: "#e5e7eb", border: "1px solid #000000" }}>
                      <div style={{ width: `${skill.progress}%`, height: "100%", backgroundColor: skill.status === "completed" ? "#16a34a" : "#D8B4FE" }} />
                    </div>
                    <p style={{ fontSize: "0.75rem", marginTop: "8px", fontWeight: 600, textTransform: "uppercase" }}>
                      {skill.status === "completed" ? "Complete" : skill.status === "in_progress" ? `${skill.progress}% Done` : "Not Started"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4: Application Pipeline ───────────────────────────────────── */}
        <section style={{ marginBottom: "64px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "32px" }}>
            {/* Pipeline Funnel */}
            <div>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "24px",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                <span className="material-symbols-outlined" style={{ color: "#1A4D2E" }}>filter_alt</span>
                Your Application Pipeline
              </h2>

              <div className="shadow-neo-lg" style={{ backgroundColor: "#ffffff", border: "2px solid #000000", padding: "24px" }}>
                <div style={{ display: "flex", gap: "16px" }}>
                  {/* Applied */}
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{
                      backgroundColor: "#f3f4f6",
                      border: "2px solid #000000",
                      padding: "20px",
                      marginBottom: "12px",
                    }}>
                      <p style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>{applicationPipeline.applied.count}</p>
                      <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Applied</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {applicationPipeline.applied.companies.map((company, i) => (
                        <span key={i} style={{ fontSize: "0.75rem", color: "#6b7280" }}>{company}</span>
                      ))}
                      {applicationPipeline.applied.companies.length < applicationPipeline.applied.count && (
                        <span style={{ fontSize: "0.75rem", color: "#6b7280", fontStyle: "italic" }}>+{applicationPipeline.applied.count - applicationPipeline.applied.companies.length} more</span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="material-symbols-outlined" style={{ color: "#D8B4FE" }}>arrow_forward</span>
                  </div>

                  {/* Screening */}
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{
                      backgroundColor: "#fef3c7",
                      border: "2px solid #000000",
                      padding: "20px",
                      marginBottom: "12px",
                    }}>
                      <p style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>{applicationPipeline.screening.count}</p>
                      <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Screening</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {applicationPipeline.screening.companies.map((company, i) => (
                        <span key={i} style={{ fontSize: "0.75rem", color: "#6b7280" }}>{company}</span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="material-symbols-outlined" style={{ color: "#D8B4FE" }}>arrow_forward</span>
                  </div>

                  {/* Interview */}
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{
                      backgroundColor: "#D8B4FE",
                      border: "2px solid #000000",
                      padding: "20px",
                      marginBottom: "12px",
                    }}>
                      <p style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>{applicationPipeline.interview.count}</p>
                      <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Interview</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                      {applicationPipeline.interview.companies.map((company, i) => (
                        <span key={i} style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 700 }}>{company}</span>
                      ))}
                    </div>
                  </div>

                  {/* Arrow */}
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span className="material-symbols-outlined" style={{ color: "#D8B4FE" }}>arrow_forward</span>
                  </div>

                  {/* Offer */}
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{
                      backgroundColor: applicationPipeline.offer.count > 0 ? "#dcfce7" : "#f3f4f6",
                      border: "2px solid #000000",
                      borderStyle: applicationPipeline.offer.count > 0 ? "solid" : "dashed",
                      padding: "20px",
                      marginBottom: "12px",
                    }}>
                      <p style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "'Syne', sans-serif", color: applicationPipeline.offer.count > 0 ? "#16a34a" : "#9ca3af" }}>
                        {applicationPipeline.offer.count}
                      </p>
                      <p style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Offer</p>
                    </div>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", fontStyle: "italic" }}>
                      {applicationPipeline.offer.count > 0 ? "🎉 Congratulations!" : "Keep pushing!"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "24px",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                <span className="material-symbols-outlined" style={{ color: "#dc2626" }}>notifications_active</span>
                Next Steps
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {nextSteps.map((step) => (
                  <div key={step.id} className="shadow-neo" style={{
                    backgroundColor: step.urgency === "high" ? "#fef2f2" : "#ffffff",
                    border: "2px solid #000000",
                    padding: "16px",
                    borderLeft: step.urgency === "high" ? "6px solid #dc2626" : "2px solid #000000",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <span style={{
                        backgroundColor: step.urgency === "high" ? "#dc2626" : "#D8B4FE",
                        color: step.urgency === "high" ? "#ffffff" : "#000000",
                        padding: "2px 8px",
                        fontSize: "0.625rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}>
                        {step.urgency}
                      </span>
                      {step.company && (
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1A4D2E" }}>{step.company}</span>
                      )}
                    </div>
                    <p style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "4px", fontFamily: "'Space Grotesk', sans-serif" }}>
                      {step.task}
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>schedule</span>
                      {step.deadline}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 5: Salary Benchmark + Hot Skills ──────────────────────────── */}
        <section style={{ marginBottom: "64px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px" }}>
            {/* Salary Benchmark */}
            <div>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "24px",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                <span className="material-symbols-outlined" style={{ color: "#1A4D2E" }}>payments</span>
                Salary Benchmark
              </h2>

              <div className="shadow-neo-lg" style={{ backgroundColor: "#000000", color: "#ffffff", border: "2px solid #000000", padding: "24px" }}>
                {/* Current vs Target */}
                <div style={{ marginBottom: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <div>
                      <p style={{ fontSize: "0.75rem", opacity: 0.7, textTransform: "uppercase", marginBottom: "4px" }}>Your Current</p>
                      <p style={{ fontSize: "1.5rem", fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>{salaryBenchmark.currentSalary}</p>
                    </div>
                    <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "#D8B4FE" }}>trending_up</span>
                  </div>

                  <div style={{ height: "4px", backgroundColor: "rgba(255,255,255,0.2)", marginBottom: "16px" }}>
                    <div style={{ width: "60%", height: "100%", backgroundColor: "#D8B4FE" }} />
                  </div>

                  <div>
                    <p style={{ fontSize: "0.75rem", opacity: 0.7, textTransform: "uppercase", marginBottom: "4px" }}>Target Role Range</p>
                    <p style={{ fontSize: "1.25rem", fontWeight: 700, fontFamily: "'Syne', sans-serif", color: "#D8B4FE" }}>
                      {salaryBenchmark.targetRoleSalary.min} - {salaryBenchmark.targetRoleSalary.max}
                    </p>
                  </div>
                </div>

                {/* Gap Alert */}
                <div style={{
                  backgroundColor: "rgba(216,180,254,0.2)",
                  border: "2px solid #D8B4FE",
                  padding: "16px",
                  marginBottom: "16px",
                }}>
                  <p style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "8px" }}>
                    Potential Increase: <span style={{ color: "#D8B4FE" }}>{salaryBenchmark.gap}</span>
                  </p>
                  <p style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                    Learn these 3 skills to bridge the gap:
                  </p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                    {salaryBenchmark.bridgeSkills.map((skill, i) => (
                      <span key={i} style={{ backgroundColor: "#ffffff", color: "#000000", padding: "4px 8px", fontSize: "0.75rem", fontWeight: 700 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <p style={{ fontSize: "0.75rem", opacity: 0.6, textAlign: "center" }}>
                  Based on {salaryBenchmark.experience} exp • {salaryBenchmark.location} market
                </p>
              </div>
            </div>

            {/* Hot Skills */}
            <div>
              <h2
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "24px",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "'Syne', sans-serif",
                }}
              >
                <span className="material-symbols-outlined" style={{ color: "#1A4D2E" }}>local_fire_department</span>
                Hot Skills For {careerRoadmap.nextTarget}
              </h2>

              <div className="shadow-neo-lg" style={{ backgroundColor: "#ffffff", border: "2px solid #000000", padding: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                  {hotSkillsForNextRole.map((skill) => (
                    <div key={skill.name} style={{
                      padding: "16px",
                      border: "2px solid #000000",
                      backgroundColor: skill.youHave ? "#dcfce7" : "#ffffff",
                      position: "relative",
                    }}>
                      {skill.youHave && (
                        <div style={{
                          position: "absolute",
                          top: "-10px",
                          right: "-10px",
                          backgroundColor: "#16a34a",
                          color: "#ffffff",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check</span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <h4 style={{ fontWeight: 700, fontSize: "0.875rem", fontFamily: "'Syne', sans-serif" }}>{skill.name}</h4>
                        <span className="material-symbols-outlined" style={{ fontSize: "20px", color: skill.trend === "up" ? "#16a34a" : "#6b7280" }}>
                          {skill.trend === "up" ? "trending_up" : "trending_flat"}
                        </span>
                      </div>
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "4px" }}>
                          <span>Demand</span>
                          <span style={{ fontWeight: 700 }}>{skill.demandScore}%</span>
                        </div>
                        <div style={{ height: "6px", backgroundColor: "#e5e7eb", border: "1px solid #000000" }}>
                          <div style={{ width: `${skill.demandScore}%`, height: "100%", backgroundColor: skill.youHave ? "#16a34a" : "#D8B4FE" }} />
                        </div>
                      </div>
                      <div style={{
                        backgroundColor: skill.youHave ? "#16a34a" : "#D8B4FE",
                        color: skill.youHave ? "#ffffff" : "#000000",
                        padding: "4px 8px",
                        textAlign: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        border: "1px solid #000000",
                      }}>
                        {skill.youHave ? "You have this!" : `+${skill.salaryBoost} potential`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 6: Weekly Wins ────────────────────────────────────────────── */}
        <section style={{ marginBottom: "64px" }}>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              marginBottom: "24px",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            <span className="material-symbols-outlined" style={{ color: "#1A4D2E" }}>emoji_events</span>
            Your Recent Activity
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
            {weeklyWins.map((win) => (
              <div key={win.id} className="shadow-neo" style={{
                backgroundColor: win.type === "milestone" ? "#D8B4FE" : win.type === "learning" ? "#fef3c7" : win.type === "networking" ? "#dcfce7" : "#ffffff",
                border: "2px solid #000000",
                padding: "20px",
                textAlign: "center",
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: "#000000",
                  color: "#ffffff",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}>
                  <span className="material-symbols-outlined">{win.icon}</span>
                </div>
                <h4 style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "4px", fontFamily: "'Syne', sans-serif" }}>{win.title}</h4>
                <p style={{ fontSize: "0.75rem", color: "#6b7280", marginBottom: "8px" }}>{win.detail}</p>
                <span style={{ fontSize: "0.625rem", color: "#6b7280" }}>{win.date}</span>
              </div>
            ))}
          </div>
        </section>
          </>
        )}
      </main>

    </>
  );
}
