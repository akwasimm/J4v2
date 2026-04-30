// Mock data for market insights
export const mockInsightsData = {
  salary: {
    role: "Software Engineer",
    location: "San Francisco, CA",
    median_salary: 145000,
    salary_range: { min: 100000, max: 220000 },
    percentile_25: 115000,
    percentile_75: 175000,
    by_experience: {
      entry: { min: 80000, max: 120000, median: 100000 },
      mid: { min: 110000, max: 160000, median: 135000 },
      senior: { min: 140000, max: 200000, median: 165000 },
      lead: { min: 170000, max: 250000, median: 200000 }
    },
    by_location: [
      { location: "San Francisco, CA", median: 155000 },
      { location: "New York, NY", median: 140000 },
      { location: "Seattle, WA", median: 145000 },
      { location: "Austin, TX", median: 125000 },
      { location: "Remote", median: 130000 }
    ]
  },
  skills_demand: [
    { skill: "React", demand_score: 95, job_count: 1250, growth: 12 },
    { skill: "Python", demand_score: 92, job_count: 2100, growth: 15 },
    { skill: "AWS", demand_score: 88, job_count: 1800, growth: 18 },
    { skill: "TypeScript", demand_score: 85, job_count: 980, growth: 22 },
    { skill: "Kubernetes", demand_score: 82, job_count: 750, growth: 25 },
    { skill: "Node.js", demand_score: 80, job_count: 1100, growth: 8 },
    { skill: "Machine Learning", demand_score: 78, job_count: 890, growth: 30 },
    { skill: "SQL", demand_score: 75, job_count: 1500, growth: 5 },
    { skill: "Docker", demand_score: 72, job_count: 920, growth: 10 },
    { skill: "Go", demand_score: 65, job_count: 450, growth: 20 }
  ],
  companies: [
    { id: "comp_001", name: "TechCorp", industry: "Technology", size: "1000-5000", open_positions: 45, logo_url: null },
    { id: "comp_002", name: "StartupXYZ", industry: "Technology", size: "50-200", open_positions: 12, logo_url: null },
    { id: "comp_003", name: "InnovateCo", industry: "Healthcare", size: "5000+", open_positions: 78, logo_url: null },
    { id: "comp_004", name: "FinanceHub", industry: "Finance", size: "1000-5000", open_positions: 34, logo_url: null },
    { id: "comp_005", name: "CloudOps Inc", industry: "Technology", size: "200-1000", open_positions: 23, logo_url: null }
  ]
};
