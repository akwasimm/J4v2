import { useState, useEffect } from "react";
import { getRoleTemplates, getLearningPaths } from "./services/skillGapService.js";

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
  useEffect(() => {
    document.title = "Skill Gap Analysis — JobFor";
  }, []);

  const [selectedRole, setSelectedRole] = useState("Software Engineer");
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbJobs, setDbJobs] = useState([]);
  const [userProfile, setUserProfile] = useState({
    resume_ai_data: {
      skills_inventory: [
        { skill: "JavaScript", level: "advanced" },
        { skill: "React", level: "intermediate" },
        { skill: "TypeScript", level: "intermediate" },
        { skill: "CSS", level: "advanced" },
        { skill: "HTML", level: "expert" },
        { skill: "Python", level: "beginner" },
        { skill: "Node.js", level: "beginner" }
      ]
    }
  });
  const [roleSkillsTemplates, setRoleSkillsTemplates] = useState({});
  const [learningPaths, setLearningPaths] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Fetch role skills templates from database
  useEffect(() => {
    const fetchRoleTemplates = async () => {
      try {
        const templates = await getRoleTemplates();
        const templatesMap = {};
        templates.forEach(template => {
          templatesMap[template.role_name] = {
            required_skills: template.required_skills,
            skill_levels: template.skill_levels
          };
        });
        setRoleSkillsTemplates(templatesMap);
      } catch (error) {
        console.error("Failed to fetch role templates:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRoleTemplates();
  }, []);
  
  // Fetch learning paths from database
  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        const paths = await getLearningPaths();
        const pathsMap = {};
        paths.forEach(path => {
          pathsMap[path.skill_name] = path;
        });
        setLearningPaths(pathsMap);
      } catch (error) {
        console.error("Failed to fetch learning paths:", error);
      }
    };
    fetchLearningPaths();
  }, []);
  
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
  
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setShowRoleSelector(false);
    setSearchQuery("");
  };
  
  const handleSelectJob = (job) => {
    setSelectedRole(job.title);
    setShowRoleSelector(false);
    setSearchQuery("");
  };
  
  const handleStartLearning = (skillName) => {
    const learningPath = learningPaths[skillName];
    if (learningPath && learningPath.resource_links && learningPath.resource_links.length > 0) {
      window.open(learningPath.resource_links[0], "_blank");
    } else {
      const searchQuery = encodeURIComponent(`${skillName} tutorial for developers`);
      window.open(`https://www.google.com/search?q=${searchQuery}`, "_blank");
    }
  };
  
  // Get user skills from profile
  const skillsInventory = userProfile?.resume_ai_data?.skills_inventory || [];
  const levelOrder = { expert: 4, advanced: 3, intermediate: 2, beginner: 1 };
  
  // Top 5 skills by expertise level
  const topSkills = [...skillsInventory]
    .sort((a, b) => (levelOrder[b.level] || 0) - (levelOrder[a.level] || 0))
    .slice(0, 5);
  
  // Get required skills for selected role
  let requiredSkills = roleSkillsTemplates[selectedRole]?.required_skills || [];
  
  // Fallback if no required skills found
  if (requiredSkills.length === 0) {
    requiredSkills = ["Python", "JavaScript", "Git", "SQL", "REST APIs", "Data Structures", "Algorithms", "System Design", "CI/CD", "Docker"];
  }
  
  // Skills to improve (matched but need improvement)
  const skillsToImprove = requiredSkills.map(reqSkill => {
    const userSkill = skillsInventory.find(
      s => s.skill.toLowerCase() === reqSkill.toLowerCase()
    );
    
    if (userSkill) {
      return {
        skill: reqSkill,
        currentLevel: userSkill.level,
        hasSkill: true,
        needsImprovement: userSkill.level === "beginner" || userSkill.level === "intermediate"
      };
    } else {
      return {
        skill: reqSkill,
        currentLevel: "none",
        hasSkill: false,
        needsImprovement: true
      };
    }
  }).filter(s => s.needsImprovement);
  
  // Skills completely missing (gap skills)
  const gapSkills = requiredSkills.filter(reqSkill =>
    !skillsInventory.some(
      s => s.skill.toLowerCase() === reqSkill.toLowerCase()
    )
  );
  
  if (loading) {
    return (
      <div className="bg-gray-50 text-black min-h-screen flex items-center justify-center">
        <p>Loading...</p>
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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>
              Skill Gap Analysis
            </h1>
            <p className="text-gray-600 mt-1">Identify your skill gaps and create a learning plan</p>
          </div>
          <button
            onClick={() => setShowRoleSelector(true)}
            className="px-6 py-3 bg-black text-white font-semibold border-2 border-black hover:bg-gray-800 transition-colors"
            style={NEO_SM}
          >
            Change Role
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Current Role Display */}
        <div className={`bg-white ${B} p-6 mb-8`} style={NEO}>
          <h2 className="text-2xl font-bold mb-2">Target Role: {selectedRole}</h2>
          <p className="text-gray-600">Analyzing your skills against the requirements for this role</p>
        </div>

        {/* Skills Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Your Top Skills */}
          <div className={`bg-white ${B} p-6`} style={NEO_SM}>
            <h3 className="text-xl font-bold mb-4">Your Top Skills</h3>
            <div className="space-y-3">
              {topSkills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{skill.skill}</span>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full" 
                        style={{
                          backgroundColor: skill.level === "expert" ? "#1A4D2E" : 
                                         skill.level === "advanced" ? "#06b6d4" : 
                                         skill.level === "intermediate" ? "#FACC15" : "#e2e8f0",
                          color: skill.level === "intermediate" ? "#000000" : "white"
                        }}>
                    {skill.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Readiness Score */}
          <div className={`bg-white ${B} p-6`} style={NEO_SM}>
            <h3 className="text-xl font-bold mb-4">Overall Readiness</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                  <circle cx="64" cy="64" r="56" stroke="#1A4D2E" strokeWidth="12" fill="none"
                          strokeDasharray={`${2 * Math.PI * 56}`}
                          strokeDashoffset={`${2 * Math.PI * 56 * (1 - 0.72)}`}
                          strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold">72%</span>
                </div>
              </div>
            </div>
            <p className="text-center text-gray-600">You're 72% ready for this role</p>
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
                    <span className="text-xs px-2 py-1 bg-yellow-200 text-black rounded">Est. 8 hours</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Current: {skill.currentLevel}</p>
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
          <h3 className="text-xl font-bold mb-4">Missing Skills</h3>
          {gapSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {gapSkills.map((skill, index) => (
                <span key={index} className="px-4 py-2 bg-red-100 text-red-800 rounded-full font-medium border-2 border-red-300">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No missing skills!</p>
          )}
        </div>

        {/* Learning Path Timeline */}
        <section className={`bg-white ${B} p-8`} style={NEO}>
          <h2 className="text-3xl font-extrabold uppercase mb-8" style={{ fontFamily: "'Syne', sans-serif" }}>
            Personalized Learning Path
          </h2>

          <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-black">
            {gapSkills.length > 0 && learningPaths[gapSkills[0]]?.modules ? (
              learningPaths[gapSkills[0]].modules.map((module, index) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal gap-4 group">
                  <div className={`flex items-center justify-center w-10 h-10 ${B} ${index === 0 ? 'bg-[#1A4D2E] text-white' : index === 1 ? 'bg-[#D8B4FE] text-black' : 'bg-[#FACC15] text-black'} shrink-0 md:order-1 md:-translate-x-1/2`}>
                    <span className="font-bold">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white ${B} p-6`} style={NEO_SM}>
                    <time className="font-extrabold text-[#1A4D2E] text-sm block mb-2 uppercase" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {module.week ? `WEEK ${module.week}: ${module.title.toUpperCase()}` : module.title.toUpperCase()}
                    </time>
                    <p className="text-gray-600 mb-4">{module.description}</p>
                    <p className="text-sm text-gray-500 mb-2">⏱️ {module.hours} hours</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-center py-8">
                {gapSkills.length > 0 ? (
                  <p>Learning path for {gapSkills[0]} will be loaded from database.</p>
                ) : (
                  <p>No learning path available.</p>
                )}
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
                  {TOP_TECH_ROLES.map(role => (
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
