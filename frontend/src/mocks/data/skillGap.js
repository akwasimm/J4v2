// Mock data for skill gap analysis
export const mockSkillGapData = {
  role_templates: [
    {
      id: "role_001",
      name: "Senior Frontend Developer",
      category: "Engineering",
      required_skills: [
        { name: "React", level: "expert", importance: "required" },
        { name: "TypeScript", level: "expert", importance: "required" },
        { name: "CSS/SCSS", level: "advanced", importance: "required" },
        { name: "State Management", level: "advanced", importance: "required" },
        { name: "Testing", level: "intermediate", importance: "preferred" }
      ],
      avg_years_experience: 5,
      salary_range: { min: 130000, max: 180000 }
    },
    {
      id: "role_002",
      name: "Full Stack Engineer",
      category: "Engineering",
      required_skills: [
        { name: "Node.js", level: "advanced", importance: "required" },
        { name: "React", level: "advanced", importance: "required" },
        { name: "Database Design", level: "intermediate", importance: "required" },
        { name: "API Development", level: "advanced", importance: "required" },
        { name: "DevOps", level: "intermediate", importance: "preferred" }
      ],
      avg_years_experience: 4,
      salary_range: { min: 110000, max: 160000 }
    },
    {
      id: "role_003",
      name: "Data Scientist",
      category: "Data",
      required_skills: [
        { name: "Python", level: "expert", importance: "required" },
        { name: "Machine Learning", level: "advanced", importance: "required" },
        { name: "SQL", level: "advanced", importance: "required" },
        { name: "Statistics", level: "advanced", importance: "required" },
        { name: "Data Visualization", level: "intermediate", importance: "preferred" }
      ],
      avg_years_experience: 3,
      salary_range: { min: 120000, max: 170000 }
    },
    {
      id: "role_004",
      name: "DevOps Engineer",
      category: "Engineering",
      required_skills: [
        { name: "AWS/Azure/GCP", level: "expert", importance: "required" },
        { name: "Kubernetes", level: "advanced", importance: "required" },
        { name: "CI/CD", level: "advanced", importance: "required" },
        { name: "Terraform", level: "intermediate", importance: "required" },
        { name: "Monitoring", level: "intermediate", importance: "preferred" }
      ],
      avg_years_experience: 4,
      salary_range: { min: 130000, max: 190000 }
    }
  ],
  learning_paths: [
    {
      id: "path_001",
      skill_name: "React",
      difficulty_level: "intermediate",
      estimated_hours: 40,
      steps: [
        { order: 1, title: "React Fundamentals", type: "course", resource_url: "#" },
        { order: 2, title: "Hooks & State Management", type: "course", resource_url: "#" },
        { order: 3, title: "Build a Portfolio Project", type: "project", resource_url: "#" }
      ]
    },
    {
      id: "path_002",
      skill_name: "TypeScript",
      difficulty_level: "intermediate",
      estimated_hours: 25,
      steps: [
        { order: 1, title: "TypeScript Basics", type: "course", resource_url: "#" },
        { order: 2, title: "Advanced Types", type: "course", resource_url: "#" },
        { order: 3, title: "Integrate with React", type: "project", resource_url: "#" }
      ]
    },
    {
      id: "path_003",
      skill_name: "AWS",
      difficulty_level: "advanced",
      estimated_hours: 60,
      steps: [
        { order: 1, title: "AWS Core Services", type: "course", resource_url: "#" },
        { order: 2, title: "Serverless Architecture", type: "course", resource_url: "#" },
        { order: 3, title: "Deploy a Full Application", type: "project", resource_url: "#" }
      ]
    }
  ]
};
