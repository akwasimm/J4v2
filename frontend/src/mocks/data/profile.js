// Mock data for user profile
export const mockProfileData = {
  profile: {
    id: "user_001",
    email: "demo@jobfor.io",
    first_name: "Demo",
    last_name: "User",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    title: "Senior Software Engineer",
    bio: "Passionate developer with 8+ years of experience building scalable web applications.",
    avatar_url: null,
    resume_url: null,
    linkedin_url: "https://linkedin.com/in/demouser",
    github_url: "https://github.com/demouser",
    portfolio_url: "https://demouser.dev",
    preferred_work_model: "hybrid",
    salary_expectation_min: 130000,
    salary_expectation_max: 170000,
    years_experience: 8,
    is_profile_complete: true
  },
  skills: [
    { id: "skill_001", name: "React", level: "expert", years: 6 },
    { id: "skill_002", name: "TypeScript", level: "expert", years: 4 },
    { id: "skill_003", name: "Node.js", level: "advanced", years: 5 },
    { id: "skill_004", name: "Python", level: "intermediate", years: 3 },
    { id: "skill_005", name: "PostgreSQL", level: "advanced", years: 4 }
  ],
  experience: [
    {
      id: "exp_001",
      company: "TechCorp",
      title: "Senior Frontend Developer",
      location: "San Francisco, CA",
      start_date: "2021-03-01",
      end_date: null,
      is_current: true,
      description: "Leading frontend development for the core product."
    },
    {
      id: "exp_002",
      company: "StartupXYZ",
      title: "Full Stack Developer",
      location: "Remote",
      start_date: "2018-06-01",
      end_date: "2021-02-28",
      is_current: false,
      description: "Built and maintained multiple client projects."
    }
  ],
  education: [
    {
      id: "edu_001",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      start_date: "2012-09-01",
      end_date: "2016-05-15",
      gpa: "3.8"
    }
  ],
  resumes: [
    {
      id: "resume_001",
      filename: "Demo_User_Resume.pdf",
      url: null,
      is_default: true,
      uploaded_at: "2024-06-01T10:00:00Z"
    }
  ],
  preferences: {
    job_types: ["full_time", "contract"],
    work_models: ["hybrid", "remote"],
    preferred_locations: ["San Francisco, CA", "Remote"],
    salary_min: 130000,
    salary_max: 170000,
    industries: ["Technology", "Healthcare", "Finance"],
    company_sizes: ["startup", "mid_size"],
    notifications: {
      email_daily_digest: true,
      email_new_jobs: true,
      push_enabled: false
    }
  }
};
