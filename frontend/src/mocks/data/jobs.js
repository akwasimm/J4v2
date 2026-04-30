// Mock data for jobs
export const mockJobsData = {
  jobs: [
    {
      id: "job_001",
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "San Francisco, CA",
      work_model: "hybrid",
      salary_min: 120000,
      salary_max: 160000,
      description: "Join our team to build cutting-edge web applications using React and modern technologies.",
      requirements: ["5+ years React experience", "TypeScript proficiency", "Team leadership"],
      posted_at: "2024-06-15T10:00:00Z",
      logo_url: null
    },
    {
      id: "job_002",
      title: "Full Stack Engineer",
      company: "StartupXYZ",
      location: "Remote",
      work_model: "remote",
      salary_min: 100000,
      salary_max: 140000,
      description: "Looking for a versatile developer comfortable with both frontend and backend technologies.",
      requirements: ["Node.js", "React", "PostgreSQL", "AWS"],
      posted_at: "2024-06-14T14:30:00Z",
      logo_url: null
    },
    {
      id: "job_003",
      title: "Product Manager",
      company: "InnovateCo",
      location: "New York, NY",
      work_model: "onsite",
      salary_min: 130000,
      salary_max: 180000,
      description: "Lead product development from ideation to launch in our fast-paced environment.",
      requirements: ["3+ years PM experience", "Agile/Scrum", "Data analysis"],
      posted_at: "2024-06-13T09:00:00Z",
      logo_url: null
    },
    {
      id: "job_004",
      title: "UX Designer",
      company: "DesignStudio",
      location: "Austin, TX",
      work_model: "hybrid",
      salary_min: 90000,
      salary_max: 130000,
      description: "Create beautiful, intuitive user experiences for our diverse client base.",
      requirements: ["Figma", "User research", "Prototyping", "HTML/CSS basics"],
      posted_at: "2024-06-12T16:00:00Z",
      logo_url: null
    },
    {
      id: "job_005",
      title: "DevOps Engineer",
      company: "CloudOps Inc",
      location: "Seattle, WA",
      work_model: "remote",
      salary_min: 140000,
      salary_max: 190000,
      description: "Build and maintain our cloud infrastructure and CI/CD pipelines.",
      requirements: ["Kubernetes", "Terraform", "AWS/GCP", "CI/CD"],
      posted_at: "2024-06-11T11:30:00Z",
      logo_url: null
    }
  ],
  search: {
    items: [],
    total: 5,
    page: 1,
    page_size: 20
  }
};

// Initialize search items from jobs
mockJobsData.search.items = [...mockJobsData.jobs];
