import { useState, useEffect } from "react";
import { getRoleTemplates, analyzeSkillGap } from "./services/skillGapService.js";
import { getSkills, updatePreferences, getPreferences } from "./api/client.js";
import { FEATURES } from './config/features'
import ComingSoon from './components/ComingSoon'
import { useAIScore } from './contexts/AIScoreContext'

const NEO = { boxShadow: "4px 4px 0px 0px #000000" };
const NEO_SM = { boxShadow: "2px 2px 0px 0px #000000" };
const B = "border-2 border-black";

const TOP_TECH_ROLES = [
  "Software Engineer",
  "Senior Software Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Mobile Developer",
  "DevOps Engineer",
  "Site Reliability Engineer",
  "Cloud Engineer",
  "Platform Engineer",
  "Data Scientist",
  "Data Engineer",
  "Data Analyst",
  "Machine Learning Engineer",
  "AI Engineer",
  "NLP Engineer",
  "Computer Vision Engineer",
  "Cybersecurity Engineer",
  "Security Analyst",
  "Network Engineer",
  "Systems Engineer",
  "Product Manager",
  "UX Designer",
  "UI/UX Engineer",
  "Technical Product Manager",
  "Engineering Manager",
  "Tech Lead",
  "VP of Engineering",
  "CTO",
  "Blockchain Developer",
  "Embedded Systems Engineer",
  "QA Engineer",
  "Automation Engineer",
  "Solutions Architect",
  "Cloud Architect",
  "Database Administrator",
  "Game Developer"
];

export default function SkillGapAnalysis() {
  const { updateAIScore } = useAIScore();

  // Placeholder check
  if (!FEATURES.skillGap) {
    return <ComingSoon pageName="Skill Gap Analysis" description="Analyze your readiness for target roles" />
  }

  useEffect(() => {
    document.title = "Skill Gap Analysis — JobFor";
  }, []);

  const [selectedRole, setSelectedRole] = useState("Software Engineer");
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbJobs, setDbJobs] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [skillGapData, setSkillGapData] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  
  // Fetch available roles from backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoleTemplates();
        // Backend returns { roles: [...] }
        if (response && response.roles) {
          setAvailableRoles(response.roles);
        }
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };
    fetchRoles();
  }, []);

  // Load saved target role from preferences on mount
  useEffect(() => {
    const loadSavedTargetRole = async () => {
      try {
        const preferences = await getPreferences();
        if (preferences?.target_role) {
          setSelectedRole(preferences.target_role);
        }
      } catch (error) {
        console.error("Failed to load saved target role:", error);
      }
    };
    loadSavedTargetRole();
  }, []);

  // Fetch user skills from profile
  useEffect(() => {
    const fetchUserSkills = async () => {
      try {
        const skills = await getSkills();
        // Backend returns array directly or { skills: [...] }
        const skillsArray = Array.isArray(skills) ? skills : (skills?.skills || []);
        setUserSkills(skillsArray);
      } catch (error) {
        console.error("Failed to fetch user skills:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserSkills();
  }, []);

  // Analyze skill gap when role changes
  useEffect(() => {
    const performSkillGapAnalysis = async () => {
      if (!selectedRole) return;
      setAnalyzing(true);
      try {
        const analysis = await analyzeSkillGap(selectedRole);
        setSkillGapData(analysis);
      } catch (error) {
        console.error("Failed to analyze skill gap:", error);
      } finally {
        setAnalyzing(false);
      }
    };
    performSkillGapAnalysis();
  }, [selectedRole]);
  
  // Mock jobs search
  useEffect(() => {
    if (searchQuery.length > 2) {
      const mockJobs = [
        { id: 1, title: "Software Engineer", company: "Google" },
        { id: 2, title: "Frontend Developer", company: "Meta" },
        { id: 3, title: "Backend Engineer", company: "Amazon" }
      ].filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDbJobs(mockJobs);
    } else {
      setDbJobs([]);
    }
  }, [searchQuery]);
  
  const filteredRoles = TOP_TECH_ROLES.filter(role =>
    role.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectRole = async (role) => {
    setSelectedRole(role);
    setShowRoleSelector(false);
    setSearchQuery("");
    
    // Save target role to user preferences for dashboard personalization
    try {
      await updatePreferences({ target_role: role });
      console.log(`Target role "${role}" saved to preferences`);
    } catch (error) {
      console.error("Failed to save target role to preferences:", error);
    }
  };
  
  const handleSelectJob = async (job) => {
    setSelectedRole(job.title);
    setShowRoleSelector(false);
    setSearchQuery("");
    
    // Save target role to user preferences for dashboard personalization
    try {
      await updatePreferences({ target_role: job.title });
      console.log(`Target role "${job.title}" saved to preferences`);
    } catch (error) {
      console.error("Failed to save target role to preferences:", error);
    }
  };
  
  const handleStartLearning = (skillName) => {
    // Find learning path step for this skill
    const step = learningPath.find(p => p.skill?.toLowerCase() === skillName.toLowerCase());
    if (step && step.resources && step.resources.length > 0) {
      const resource = step.resources[0];
      // If resource is a URL, open it; otherwise search
      if (resource.startsWith('http')) {
        window.open(resource, "_blank");
      } else {
        const searchQuery = encodeURIComponent(`${resource} ${skillName}`);
        window.open(`https://www.google.com/search?q=${searchQuery}`, "_blank");
      }
    } else {
      const searchQuery = encodeURIComponent(`${skillName} tutorial for developers`);
      window.open(`https://www.google.com/search?q=${searchQuery}`, "_blank");
    }
  };
  
  // Get user skills from profile
  const levelOrder = { expert: 4, advanced: 3, intermediate: 2, beginner: 1 };
  
  // Top 5 skills by expertise level
  const topSkills = [...userSkills]
    .sort((a, b) => (levelOrder[b.level?.toLowerCase()] || 0) - (levelOrder[a.level?.toLowerCase()] || 0))
    .slice(0, 5)
    .map(s => ({ skill: s.name || s.skill_name || s.skill, level: s.level?.toLowerCase() || 'beginner' }));
  
  // Get data from AI skill gap analysis and update global AI score
  const readinessScore = skillGapData?.readiness_score || 0;
  
  useEffect(() => {
    if (readinessScore > 0) {
      updateAIScore(readinessScore);
    }
  }, [readinessScore, updateAIScore]);
  const readinessLabel = skillGapData?.readiness_label || 'Unknown';
  const matchedSkills = skillGapData?.matched_skills || [];
  const gapSkills = skillGapData?.missing_skills || [];
  const skillsToImprove = (skillGapData?.skills_to_improve || []).map(skill => ({
    skill: skill,
    currentLevel: userSkills.find(s => (s.name || s.skill_name || s.skill)?.toLowerCase() === skill.toLowerCase())?.level || 'beginner',
    hasSkill: true,
    needsImprovement: true
  }));
  const learningPath = skillGapData?.personalized_learning_path || [];
  const gapSummary = skillGapData?.gap_summary || '';
  
  if (loading) {
    return (
      <div className="bg-gray-50 text-black min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="bg-gray-50 text-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Analyzing your skills...</p>
          <p className="text-gray-600">Comparing your profile with {selectedRole} requirements</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 text-black min-h-screen" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />
      
      <style>{`
        .role-selector-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          max-height: 400px;
          overflow-y: auto;
          padding: 16px;
        }
        .role-card {
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          font-size: 13px;
          font-weight: 500;
          color: #1e293b;
          background: white;
          transition: all 0.15s;
        }
        .role-card:hover {
          border-color: #06b6d4;
          background: #f0fdfa;
          color: #0891b2;
        }
        .role-card.selected {
          border-color: #06b6d4;
          background: #06b6d4;
          color: white;
        }
        .role-search-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          margin-bottom: 12px;
          outline: none;
        }
        .role-search-input:focus {
          border-color: #06b6d4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.1);
        }
        .role-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }
        .role-modal {
          background: white;
          border-radius: 16px;
          width: 90%;
          max-width: 600px;
          max-height: 80vh;
          overflow: hidden;
          border: 2px solid black;
          box-shadow: 4px 4px 0px 0px #000000;
        }
        .role-modal-header {
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .role-modal-body {
          padding: 0;
          overflow-y: auto;
        }
        .search-section-label {
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .db-job {
          border-color: #D8B4FE;
        }
        .db-job:hover {
          background: #faf5ff;
          color: #7c3aed;
        }
      `}</style>
      
      {/* Header */}
      <header className="bg-white border-b-2 border-black px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>
            Skill Gap Analysis
          </h1>
          <p className="text-gray-600 mt-1">Identify your skill gaps and create a learning plan</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Current Role Display */}
        <div className={`bg-white ${B} p-6 mb-8`} style={NEO}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Target Role: {selectedRole}</h2>
              <p className="text-gray-600">Analyzing your skills against the requirements for this role</p>
            </div>
            <button
              onClick={() => setShowRoleSelector(true)}
              className="px-6 py-3 bg-black text-white font-semibold border-2 border-black hover:bg-gray-800 transition-colors"
              style={NEO_SM}
            >
              Change Role
            </button>
          </div>
        </div>

        {/* Skills Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Your Top Skills */}
          <div className={`bg-white ${B} p-6`} style={NEO_SM}>
            <h3 className="text-xl font-bold mb-4">Your Top Skills</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
              {topSkills.map((skill, index) => (
                <div key={index} style={{
                  backgroundColor: "#E0F2FE",
                  border: "2px solid #000000",
                  padding: "12px",
                  borderRadius: "8px"
                }}>
                  <div>
                    <span style={{ fontWeight: 700, display: "block", textTransform: "uppercase", fontSize: "0.75rem" }}>{skill.skill}</span>
                    <span style={{ fontSize: "0.6rem", color: "#1A4D2E", fontWeight: 900, textTransform: "uppercase" }}>{skill.level}</span>
                  </div>
                </div>
              ))}
              {topSkills.length === 0 && (
                <div style={{ gridColumn: "span 2", textAlign: "center", padding: "24px", color: "#6b7280" }}>
                  <p style={{ fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>No Skills Yet</p>
                  <p style={{ fontSize: "0.875rem" }}>Add skills to your profile to see your top skills here</p>
                </div>
              )}
            </div>
          </div>

          {/* Readiness Score */}
          <div style={{
            backgroundColor: "#F3E8FF",
            border: "2px solid #000000",
            padding: "24px",
            borderRadius: "8px",
            boxShadow: "2px 2px 0px 0px #000000"
          }}>
            <h3 className="text-xl font-bold mb-4" style={{ textTransform: "uppercase" }}>Overall Readiness</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                  <circle cx="64" cy="64" r="56" stroke="#1A4D2E" strokeWidth="12" fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - readinessScore / 100)}`}
                          strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">{readinessScore}%</span>
                </div>
              </div>
            </div>
            <p className="text-center" style={{ fontWeight: 700, color: "#1A4D2E", textTransform: "uppercase" }}>{readinessLabel}</p>
            {gapSummary && <p className="text-center text-sm mt-2" style={{ color: "#6b7280" }}>{gapSummary}</p>}
          </div>
        </div>

        {/* Skills to Improve */}
        <div className={`bg-white ${B} p-6 mb-8`} style={NEO}>
          <h3 className="text-xl font-bold mb-4">Skills to Improve</h3>
          {skillsToImprove.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillsToImprove.map((skill, index) => (
                <div key={index} className={`p-4 bg-gray-50 rounded-lg ${B}`} style={NEO_SM}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{skill.skill}</span>
                    <span className="text-xs px-2 py-1 bg-yellow-200 text-black rounded">Needs improvement</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Current level: {skill.currentLevel}</p>
                  <button
                    onClick={() => handleStartLearning(skill.skill)}
                    className="w-full px-4 py-2 bg-black text-white text-sm font-semibold border-2 border-black hover:bg-gray-800 transition-colors"
                  >
                    Start Learning
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills to improve!</p>
          )}
        </div>

        {/* Gap Skills */}
        <div className={`bg-white ${B} p-6 mb-8`} style={NEO}>
          <h3 className="text-xl font-bold mb-4" style={{ textTransform: "uppercase" }}>Missing Skills</h3>
          {gapSkills.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "12px" }}>
              {gapSkills.map((skill, index) => (
                <div key={index} style={{
                  backgroundColor: "#FEE2E2",
                  border: "2px solid #000000",
                  padding: "12px",
                  borderRadius: "8px",
                  boxShadow: "2px 2px 0px 0px #000000"
                }}>
                  <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: "0.75rem", color: "#991B1B" }}>{skill}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#6b7280", fontWeight: 600, textTransform: "uppercase" }}>No missing skills!</p>
          )}
        </div>

        {/* Learning Path Timeline */}
        <section className={`bg-white ${B} p-8`} style={NEO}>
          <h2 className="text-3xl font-extrabold uppercase mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>
            Personalized Learning Path
          </h2>

          <div style={{ position: "relative" }}>
            {/* Vertical line */}
            <div style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: "2px",
              backgroundColor: "#000000",
              transform: "translateX(-50%)"
            }}></div>

            {learningPath.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
                {learningPath.map((step, index) => (
                  <div key={index} style={{
                    display: "flex",
                    justifyContent: index % 2 === 0 ? "flex-start" : "flex-end",
                    width: "100%",
                    position: "relative"
                  }}>
                    {/* Step number badge - centered on line */}
                    <div style={{
                      position: "absolute",
                      left: "50%",
                      top: "16px",
                      transform: "translateX(-50%)",
                      width: "40px",
                      height: "40px",
                      backgroundColor: index % 2 === 0 ? "#1A4D2E" : index % 2 === 1 ? "#D8B4FE" : "#FACC15",
                      border: "2px solid #000000",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: index % 2 === 0 ? "white" : "black",
                      fontWeight: 700,
                      fontSize: "14px",
                      boxShadow: "2px 2px 0px 0px #000000",
                      zIndex: 10
                    }}>
                      {String(step.step || index + 1).padStart(2, '0')}
                    </div>

                    {/* Content box */}
                    <div style={{
                      width: "calc(50% - 40px)",
                      backgroundColor: index % 2 === 0 ? "#E0F2FE" : "#F3E8FF",
                      border: "2px solid #000000",
                      padding: "20px",
                      borderRadius: "8px",
                      boxShadow: "2px 2px 0px 0px #000000"
                    }}>
                      <h4 style={{
                        fontWeight: 700,
                        textTransform: "uppercase",
                        fontSize: "0.875rem",
                        color: "#1A4D2E",
                        marginBottom: "8px"
                      }}>
                        {step.skill?.toUpperCase()}
                      </h4>
                      <p style={{ color: "#374151", marginBottom: "12px", lineHeight: "1.5" }}>{step.action}</p>
                      {step.resources && step.resources.length > 0 && (
                        <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "8px" }}>
                          📚 {step.resources.join(', ')}
                        </p>
                      )}
                      <p style={{ fontSize: "0.875rem", color: "#6b7280", fontWeight: 600 }}>
                        ⏱️ {step.estimated_weeks} week{step.estimated_weeks !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                <p style={{ fontWeight: 600, textTransform: "uppercase" }}>Select a target role to see your personalized learning path.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Role Selector Modal */}
      {showRoleSelector && (
        <div className="role-modal-overlay" onClick={() => setShowRoleSelector(false)}>
          <div className="role-modal" onClick={(e) => e.stopPropagation()}>
            <div className="role-modal-header">
              <h3 className="text-xl font-extrabold uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>Select Target Role</h3>
              <button onClick={() => setShowRoleSelector(false)} className="text-gray-500 hover:text-gray-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="role-modal-body">
              <div className="p-4">
                <input
                  type="text"
                  className="role-search-input"
                  placeholder="Search roles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {searchQuery ? (
                <>
                  <div className="search-section-label">Suggested Roles</div>
                  <div className="role-selector-grid">
                    {filteredRoles.map(role => (
                      <div key={role} className={`role-card ${selectedRole === role ? 'selected' : ''}`} onClick={() => handleSelectRole(role)}>
                        {role}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="role-selector-grid">
                  {(availableRoles.length > 0 ? availableRoles : TOP_TECH_ROLES).map(role => (
                    <div key={role} className={`role-card ${selectedRole === role ? 'selected' : ''}`} onClick={() => handleSelectRole(role)}>
                      {role}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
