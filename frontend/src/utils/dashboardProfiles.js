// 10 Hardcoded Dashboard Profiles
// Each profile contains complete static data for dashboard rendering
// Only 4 dynamic elements: greeting, name, missing skill, profile completion

export const dashboardProfiles = {
  // Profile 0: Frontend Developer
  frontend: {
    topPicks: [
      {
        id: 1,
        match: "98% MATCH",
        matchScore: 98,
        title: "Senior Frontend Engineer",
        company: "Flipkart",
        location: "Bangalore",
        salary: "₹25L - ₹38L",
        tags: ["React", "TypeScript", "Next.js"],
        matchReasons: ["98% skill match", "E-commerce scale", "Modern stack"],
        cardBg: "#E6F6D4",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 2,
        match: "95% MATCH",
        matchScore: 95,
        title: "Frontend Developer",
        company: "Swiggy",
        location: "Bangalore",
        salary: "₹20L - ₹32L",
        tags: ["React", "Redux", "Performance"],
        matchReasons: ["95% skill match", "High-growth startup", "Tech-focused"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 3,
        match: "92% MATCH",
        matchScore: 92,
        title: "UI Engineer",
        company: "Razorpay",
        location: "Bangalore",
        salary: "₹22L - ₹35L",
        tags: ["React", "Design Systems", "Fintech"],
        matchReasons: ["92% skill match", "Fintech scale", "Design-driven"],
        cardBg: "#FEF08A",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 4,
        match: "89% MATCH",
        matchScore: 89,
        title: "Senior Frontend Developer",
        company: "CRED",
        location: "Bangalore",
        salary: "₹24L - ₹38L",
        tags: ["React", "TypeScript", "Premium UX"],
        matchReasons: ["89% skill match", "Elite team", "High compensation"],
        cardBg: "#E6F6D4",
        matchBg: "#FEF08A",
        matchColor: "#000000"
      },
      {
        id: 5,
        match: "87% MATCH",
        matchScore: 87,
        title: "Frontend Architect",
        company: "PhonePe",
        location: "Bangalore",
        salary: "₹28L - ₹42L",
        tags: ["Architecture", "Mentoring", "System Design"],
        matchReasons: ["87% skill match", "Engineering-first", "Scale"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 6,
        match: "84% MATCH",
        matchScore: 84,
        title: "React Developer",
        company: "Meesho",
        location: "Bangalore",
        salary: "₹18L - ₹28L",
        tags: ["React", "Social Commerce", "Growth"],
        matchReasons: ["84% skill match", "Bharat users", "Impact"],
        cardBg: "#FEF08A",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      }
    ],
    
    profilePower: {
      overallScore: 88,
      breakdown: [
        { label: "Profile Completeness", value: 82, color: "#1A4D2E" },
        { label: "Skill Diversity", value: 85, color: "#D8B4FE" },
        { label: "Market Alignment", value: 90, color: "#1A4D2E" },
        { label: "Experience Level", value: 78, color: "#D8B4FE" }
      ]
    },
    
    missingSkillTemplate: {
      title: "Missing Skill Alert",
      description: "You're missing {skillName} — a skill that appears in 85% of Frontend Developer job postings. Adding this could boost your profile strength by up to 15% and unlock senior-level opportunities."
    },
    
    roadmap: {
      currentRole: "Frontend Developer",
      nextTarget: "Senior Frontend Engineer",
      dreamRole: "Principal Frontend Architect",
      currentProgress: 72,
      skillsToNext: [
        { name: "Advanced React Patterns", difficulty: "medium" },
        { name: "Performance Optimization", difficulty: "hard" },
        { name: "Design Systems", difficulty: "easy" }
      ]
    },
    
    salaryBenchmark: {
      currentSalary: "₹12,00,000",
      targetRoleSalary: { min: "₹18,00,000", max: "₹28,00,000", median: "₹23,00,000" },
      location: "Bangalore",
      experience: "3-5 years",
      gap: "₹11,00,000",
      bridgeSkills: ["TypeScript", "Next.js", "Web Performance"]
    },
    
    hotSkills: [
      { name: "TypeScript", demandScore: 95, salaryBoost: "+₹3L", trend: "up", youHave: false },
      { name: "Next.js", demandScore: 92, salaryBoost: "+₹2.5L", trend: "up", youHave: true },
      { name: "React Query", demandScore: 88, salaryBoost: "+₹2L", trend: "up", youHave: false },
      { name: "Storybook", demandScore: 85, salaryBoost: "+₹1.5L", trend: "stable", youHave: true }
    ],
    
    weeklyWins: [
      { id: 1, icon: "send", title: "Application Sent", detail: "Flipkart • Senior Frontend Engineer", date: "Today" },
      { id: 2, icon: "bookmark", title: "Job Saved", detail: "Swiggy • Frontend Developer Role", date: "Yesterday" },
      { id: 3, icon: "eye", title: "Profile Viewed", detail: "3 recruiters viewed your profile", date: "2 days ago" },
      { id: 4, icon: "zap", title: "Skill Endorsed", detail: "React.js endorsed by 2 connections", date: "3 days ago" }
    ]
  },

  // Profile 1: Data Scientist
  dataScientist: {
    topPicks: [
      {
        id: 1,
        match: "97% MATCH",
        matchScore: 97,
        title: "Senior Data Scientist",
        company: "Jio Platforms",
        location: "Mumbai",
        salary: "₹30L - ₹45L",
        tags: ["Python", "Machine Learning", "Big Data"],
        matchReasons: ["97% skill match", "Massive scale data", "AI-first culture"],
        cardBg: "#E6F6D4",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 2,
        match: "94% MATCH",
        matchScore: 94,
        title: "Data Scientist",
        company: "Myntra",
        location: "Bangalore",
        salary: "₹25L - ₹38L",
        tags: ["Recommendation", "Python", "Spark"],
        matchReasons: ["94% skill match", "Fashion tech", "High salary band"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 3,
        match: "91% MATCH",
        matchScore: 91,
        title: "ML Engineer",
        company: "Ola Electric",
        location: "Bangalore",
        salary: "₹22L - ₹35L",
        tags: ["Computer Vision", "TensorFlow", "Edge AI"],
        matchReasons: ["91% skill match", "Core tech team", "Hardware + AI intersection"],
        cardBg: "#FEF08A",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 4,
        match: "88% MATCH",
        matchScore: 88,
        title: "Applied Scientist",
        company: "MakeMyTrip",
        location: "Gurgaon",
        salary: "₹24L - ₹38L",
        tags: ["NLP", "Pricing", "ML"],
        matchReasons: ["88% skill match", "Travel domain", "Applied research"],
        cardBg: "#E6F6D4",
        matchBg: "#FEF08A",
        matchColor: "#000000"
      },
      {
        id: 5,
        match: "85% MATCH",
        matchScore: 85,
        title: "Senior Data Analyst",
        company: "Paytm",
        location: "Noida",
        salary: "₹18L - ₹28L",
        tags: ["SQL", "Python", "Analytics"],
        matchReasons: ["85% skill match", "Fintech scale", "Growth path"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 6,
        match: "82% MATCH",
        matchScore: 82,
        title: "Data Science Lead",
        company: "Razorpay",
        location: "Bangalore",
        salary: "₹35L - ₹50L",
        tags: ["Leadership", "Fintech", "Risk Models"],
        matchReasons: ["82% skill match", "Leadership role", "High equity"],
        cardBg: "#FEF08A",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      }
    ],
    
    profilePower: {
      overallScore: 85,
      breakdown: [
        { label: "Profile Completeness", value: 65, color: "#1A4D2E" },
        { label: "Skill Diversity", value: 80, color: "#D8B4FE" },
        { label: "Market Alignment", value: 88, color: "#1A4D2E" },
        { label: "Experience Level", value: 70, color: "#D8B4FE" }
      ]
    },
    
    missingSkillTemplate: {
      title: "Missing Skill Alert",
      description: "You're missing {skillName} — a skill that appears in 78% of Data Science roles. Adding this could increase your profile power by 12% and open doors to senior positions."
    },
    
    roadmap: {
      currentRole: "Data Scientist",
      nextTarget: "Senior Data Scientist",
      dreamRole: "Lead ML Engineer",
      currentProgress: 58,
      skillsToNext: [
        { name: "Deep Learning", difficulty: "hard" },
        { name: "MLOps", difficulty: "medium" },
        { name: "Big Data Tools", difficulty: "medium" }
      ]
    },
    
    salaryBenchmark: {
      currentSalary: "₹15,00,000",
      targetRoleSalary: { min: "₹25L", max: "₹40L", median: "₹32L" },
      location: "Bangalore",
      experience: "2-4 years",
      gap: "₹17,00,000",
      bridgeSkills: ["TensorFlow", "PyTorch", "AWS SageMaker"]
    },
    
    hotSkills: [
      { name: "PyTorch", demandScore: 94, salaryBoost: "+₹4L", trend: "up", youHave: true },
      { name: "MLOps", demandScore: 91, salaryBoost: "+₹3.5L", trend: "up", youHave: false },
      { name: "LLM/RAG", demandScore: 96, salaryBoost: "+₹5L", trend: "up", youHave: false },
      { name: "Spark", demandScore: 88, salaryBoost: "+₹2.5L", trend: "stable", youHave: true }
    ],
    
    weeklyWins: [
      { id: 1, icon: "send", title: "Application Sent", detail: "Jio Platforms • Senior Data Scientist", date: "Today" },
      { id: 2, icon: "bookmark", title: "Job Saved", detail: "Myntra • Data Science Role", date: "Yesterday" },
      { id: 3, icon: "eye", title: "Profile Viewed", detail: "2 AI recruiters viewed your profile", date: "2 days ago" }
    ]
  },

  // Profile 2: DevOps Engineer
  devops: {
    topPicks: [
      {
        id: 1,
        match: "99% MATCH",
        matchScore: 99,
        title: "Senior DevOps Engineer",
        company: "Google India",
        location: "Hyderabad",
        salary: "₹35L - ₹55L",
        tags: ["Kubernetes", "Terraform", "GCP"],
        matchReasons: ["99% skill match", "Global scale", "Cutting-edge tech"],
        cardBg: "#E6F6D4",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 2,
        match: "96% MATCH",
        matchScore: 96,
        title: "DevOps Engineer",
        company: "Flipkart",
        location: "Bangalore",
        salary: "₹28L - ₹42L",
        tags: ["AWS", "Docker", "CI/CD"],
        matchReasons: ["96% skill match", "E-commerce scale", "Infrastructure focus"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 3,
        match: "93% MATCH",
        matchScore: 93,
        title: "Site Reliability Engineer",
        company: "PhonePe",
        location: "Bangalore",
        salary: "₹30L - ₹45L",
        tags: ["SRE", "AWS", "Observability"],
        matchReasons: ["93% skill match", "Fintech scale", "Reliability focus"],
        cardBg: "#FEF08A",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 4,
        match: "90% MATCH",
        matchScore: 90,
        title: "Cloud Engineer",
        company: "Walmart Global Tech",
        location: "Bangalore",
        salary: "₹25L - ₹38L",
        tags: ["Azure", "Kubernetes", "Infrastructure"],
        matchReasons: ["90% skill match", "Global enterprise", "Cloud-first"],
        cardBg: "#E6F6D4",
        matchBg: "#FEF08A",
        matchColor: "#000000"
      },
      {
        id: 5,
        match: "87% MATCH",
        matchScore: 87,
        title: "Platform Engineer",
        company: "Swiggy",
        location: "Bangalore",
        salary: "₹26L - ₹40L",
        tags: ["Platform", "Automation", "Scale"],
        matchReasons: ["87% skill match", "High throughput", "Platform team"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 6,
        match: "84% MATCH",
        matchScore: 84,
        title: "Infrastructure Engineer",
        company: "Razorpay",
        location: "Bangalore",
        salary: "₹24L - ₹36L",
        tags: ["Infrastructure", "Security", "Compliance"],
        matchReasons: ["84% skill match", "Fintech security", "Critical systems"],
        cardBg: "#FEF08A",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      }
    ],
    
    profilePower: {
      overallScore: 92,
      breakdown: [
        { label: "Profile Completeness", value: 94, color: "#1A4D2E" },
        { label: "Skill Diversity", value: 90, color: "#D8B4FE" },
        { label: "Market Alignment", value: 95, color: "#1A4D2E" },
        { label: "Experience Level", value: 88, color: "#D8B4FE" }
      ]
    },
    
    missingSkillTemplate: {
      title: "Missing Skill Alert",
      description: "You're missing {skillName} — essential for 82% of DevOps roles. Mastering this can boost your profile power by 14% and qualify you for senior cloud positions."
    },
    
    roadmap: {
      currentRole: "DevOps Engineer",
      nextTarget: "Senior DevOps Engineer",
      dreamRole: "Cloud Infrastructure Architect",
      currentProgress: 82,
      skillsToNext: [
        { name: "Advanced Kubernetes", difficulty: "hard" },
        { name: "Infrastructure as Code", difficulty: "medium" },
        { name: "Observability", difficulty: "medium" }
      ]
    },
    
    salaryBenchmark: {
      currentSalary: "₹14,00,000",
      targetRoleSalary: { min: "₹22L", max: "₹35L", median: "₹28L" },
      location: "Bangalore",
      experience: "4-6 years",
      gap: "₹14,00,000",
      bridgeSkills: ["Kubernetes", "Terraform", "AWS/GCP"]
    },
    
    hotSkills: [
      { name: "Kubernetes", demandScore: 96, salaryBoost: "+₹4L", trend: "up", youHave: true },
      { name: "Terraform", demandScore: 93, salaryBoost: "+₹3L", trend: "up", youHave: true },
      { name: "Observability", demandScore: 89, salaryBoost: "+₹2.5L", trend: "up", youHave: false },
      { name: "GitOps", demandScore: 87, salaryBoost: "+₹2L", trend: "up", youHave: true }
    ],
    
    weeklyWins: [
      { id: 1, icon: "send", title: "Application Sent", detail: "Google India • Senior DevOps Engineer", date: "Today" },
      { id: 2, icon: "bookmark", title: "Job Saved", detail: "Flipkart • DevOps Engineer", date: "Yesterday" },
      { id: 3, icon: "eye", title: "Profile Viewed", detail: "4 infrastructure recruiters viewed your profile", date: "2 days ago" },
      { id: 4, icon: "zap", title: "Skill Endorsed", detail: "Kubernetes endorsed by 3 colleagues", date: "3 days ago" }
    ]
  },

  // Profile 3: Product Manager
  productManager: {
    topPicks: [
      {
        id: 1,
        match: "96% MATCH",
        matchScore: 96,
        title: "Senior Product Manager",
        company: "CRED",
        location: "Bangalore",
        salary: "₹40L - ₹60L",
        tags: ["Fintech", "Strategy", "Leadership"],
        matchReasons: ["96% skill match", "Premium fintech", "High impact"],
        cardBg: "#E6F6D4",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 2,
        match: "93% MATCH",
        matchScore: 93,
        title: "Product Manager",
        company: "PhonePe",
        location: "Bangalore",
        salary: "₹35L - ₹50L",
        tags: ["Payments", "Growth", "UX"],
        matchReasons: ["93% skill match", "Scale", "User-centric"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 3,
        match: "90% MATCH",
        matchScore: 90,
        title: "Product Lead",
        company: "Swiggy",
        location: "Bangalore",
        salary: "₹38L - ₹55L",
        tags: ["Consumer", "Analytics", "Leadership"],
        matchReasons: ["90% skill match", "Consumer tech", "Data-driven"],
        cardBg: "#FEF08A",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 4,
        match: "87% MATCH",
        matchScore: 87,
        title: "Senior PM",
        company: "Zomato",
        location: "Gurgaon",
        salary: "₹32L - ₹48L",
        tags: ["Food Tech", "Operations", "Growth"],
        matchReasons: ["87% skill match", "Hyperlocal", "Scale"],
        cardBg: "#E6F6D4",
        matchBg: "#FEF08A",
        matchColor: "#000000"
      },
      {
        id: 5,
        match: "84% MATCH",
        matchScore: 84,
        title: "Product Manager",
        company: "Myntra",
        location: "Bangalore",
        salary: "₹30L - ₹45L",
        tags: ["E-commerce", "Fashion", "Personalization"],
        matchReasons: ["84% skill match", "Fashion tech", "Personalization"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 6,
        match: "81% MATCH",
        matchScore: 81,
        title: "Group Product Manager",
        company: "Razorpay",
        location: "Bangalore",
        salary: "₹45L - ₹65L",
        tags: ["Leadership", "B2B", "Fintech"],
        matchReasons: ["81% skill match", "Leadership role", "High equity"],
        cardBg: "#FEF08A",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      }
    ],
    
    profilePower: {
      overallScore: 78,
      breakdown: [
        { label: "Profile Completeness", value: 71, color: "#1A4D2E" },
        { label: "Skill Diversity", value: 75, color: "#D8B4FE" },
        { label: "Market Alignment", value: 82, color: "#1A4D2E" },
        { label: "Experience Level", value: 80, color: "#D8B4FE" }
      ]
    },
    
    missingSkillTemplate: {
      title: "Missing Skill Alert",
      description: "You're missing {skillName} — critical for 79% of Product Manager positions. Adding this can increase your profile power by 18% and unlock senior PM opportunities."
    },
    
    roadmap: {
      currentRole: "Product Manager",
      nextTarget: "Senior Product Manager",
      dreamRole: "VP of Product",
      currentProgress: 65,
      skillsToNext: [
        { name: "Product Strategy", difficulty: "medium" },
        { name: "Stakeholder Management", difficulty: "medium" },
        { name: "Data Analytics", difficulty: "easy" }
      ]
    },
    
    salaryBenchmark: {
      currentSalary: "₹18,00,000",
      targetRoleSalary: { min: "₹30L", max: "₹50L", median: "₹40L" },
      location: "Bangalore",
      experience: "3-5 years",
      gap: "₹22,00,000",
      bridgeSkills: ["SQL", "Product Analytics", "A/B Testing"]
    },
    
    hotSkills: [
      { name: "SQL", demandScore: 92, salaryBoost: "+₹3L", trend: "stable", youHave: true },
      { name: "Product Analytics", demandScore: 94, salaryBoost: "+₹4L", trend: "up", youHave: false },
      { name: "Growth Hacking", demandScore: 88, salaryBoost: "+₹2.5L", trend: "up", youHave: true },
      { name: "A/B Testing", demandScore: 90, salaryBoost: "+₹3L", trend: "stable", youHave: false }
    ],
    
    weeklyWins: [
      { id: 1, icon: "send", title: "Application Sent", detail: "CRED • Senior Product Manager", date: "Today" },
      { id: 2, icon: "bookmark", title: "Job Saved", detail: "PhonePe • Product Manager", date: "Yesterday" },
      { id: 3, icon: "eye", title: "Profile Viewed", detail: "2 product leaders viewed your profile", date: "2 days ago" }
    ]
  },

  // Profile 4: AI/ML Engineer
  aiMlEngineer: {
    topPicks: [
      {
        id: 1,
        match: "98% MATCH",
        matchScore: 98,
        title: "AI/ML Engineer",
        company: "Jio Platforms",
        location: "Mumbai",
        salary: "₹35L - ₹55L",
        tags: ["Deep Learning", "PyTorch", "NLP"],
        matchReasons: ["98% skill match", "Massive scale data", "AI-first culture"],
        cardBg: "#E6F6D4",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 2,
        match: "95% MATCH",
        matchScore: 95,
        title: "LLM Engineer",
        company: "Unacademy",
        location: "Bangalore",
        salary: "₹32L - ₹48L",
        tags: ["GenAI", "LLMs", "RAG"],
        matchReasons: ["95% skill match", "GenAI specialists needed", "EdTech impact"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 3,
        match: "92% MATCH",
        matchScore: 92,
        title: "ML Engineer",
        company: "Ola Electric",
        location: "Bangalore",
        salary: "₹28L - ₹42L",
        tags: ["Computer Vision", "TensorFlow", "Edge AI"],
        matchReasons: ["92% skill match", "Core tech team", "Hardware + AI intersection"],
        cardBg: "#FEF08A",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 4,
        match: "89% MATCH",
        matchScore: 89,
        title: "Senior Data Scientist",
        company: "Myntra",
        location: "Bangalore",
        salary: "₹35L - ₹50L",
        tags: ["Recommendation", "Python", "Spark"],
        matchReasons: ["89% skill match", "Fashion tech", "High salary band"],
        cardBg: "#E6F6D4",
        matchBg: "#FEF08A",
        matchColor: "#000000"
      },
      {
        id: 5,
        match: "86% MATCH",
        matchScore: 86,
        title: "Applied Scientist",
        company: "MakeMyTrip",
        location: "Gurgaon",
        salary: "₹30L - ₹45L",
        tags: ["NLP", "Pricing", "ML"],
        matchReasons: ["86% skill match", "Travel domain", "Applied research"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 6,
        match: "83% MATCH",
        matchScore: 83,
        title: "GenAI Developer",
        company: "Postman",
        location: "Bangalore",
        salary: "₹32L - ₹48L",
        tags: ["GenAI", "API", "Python"],
        matchReasons: ["83% skill match", "Global dev tools", "AI integration"],
        cardBg: "#FEF08A",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      }
    ],
    
    profilePower: {
      overallScore: 90,
      breakdown: [
        { label: "Profile Completeness", value: 88, color: "#1A4D2E" },
        { label: "Skill Diversity", value: 85, color: "#D8B4FE" },
        { label: "Market Alignment", value: 94, color: "#1A4D2E" },
        { label: "Experience Level", value: 82, color: "#D8B4FE" }
      ]
    },
    
    missingSkillTemplate: {
      title: "Missing Skill Alert",
      description: "You're missing {skillName} — appearing in 88% of AI/ML job postings. Mastering this can boost your profile power by 16% and unlock opportunities at top AI companies."
    },
    
    roadmap: {
      currentRole: "AI/ML Engineer",
      nextTarget: "Senior AI Engineer",
      dreamRole: "Principal AI Scientist",
      currentProgress: 78,
      skillsToNext: [
        { name: "RAG Architecture", difficulty: "hard" },
        { name: "MLOps", difficulty: "medium" },
        { name: "Model Optimization", difficulty: "hard" }
      ]
    },
    
    salaryBenchmark: {
      currentSalary: "₹20,00,000",
      targetRoleSalary: { min: "₹35L", max: "₹55L", median: "₹45L" },
      location: "Bangalore",
      experience: "3-5 years",
      gap: "₹25,00,000",
      bridgeSkills: ["LLMs", "RAG", "Vector Databases"]
    },
    
    hotSkills: [
      { name: "RAG", demandScore: 97, salaryBoost: "+₹5L", trend: "up", youHave: false },
      { name: "LLM Fine-tuning", demandScore: 95, salaryBoost: "+₹4.5L", trend: "up", youHave: true },
      { name: "Vector DBs", demandScore: 93, salaryBoost: "+₹4L", trend: "up", youHave: false },
      { name: "MLOps", demandScore: 91, salaryBoost: "+₹3.5L", trend: "up", youHave: true }
    ],
    
    weeklyWins: [
      { id: 1, icon: "send", title: "Application Sent", detail: "Jio Platforms • AI/ML Engineer", date: "Today" },
      { id: 2, icon: "bookmark", title: "Job Saved", detail: "Unacademy • LLM Engineer", date: "Yesterday" },
      { id: 3, icon: "eye", title: "Profile Viewed", detail: "5 AI recruiters viewed your profile", date: "2 days ago" },
      { id: 4, icon: "zap", title: "Skill Endorsed", detail: "Deep Learning endorsed by 4 peers", date: "3 days ago" }
    ]
  },

  // Profile 5: Cybersecurity Analyst
  cybersecurity: {
    topPicks: [
      {
        id: 1,
        match: "95% MATCH",
        matchScore: 95,
        title: "Security Analyst",
        company: "HDFC Bank",
        location: "Mumbai",
        salary: "₹18L - ₹28L",
        tags: ["SIEM", "SOC", "Threat Analysis"],
        matchReasons: ["95% skill match", "Banking security domain", "Stable role"],
        cardBg: "#E6F6D4",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 2,
        match: "92% MATCH",
        matchScore: 92,
        title: "InfoSec Engineer",
        company: "TCS",
        location: "Hyderabad",
        salary: "₹15L - ₹24L",
        tags: ["Networking", "Firewalls", "Compliance"],
        matchReasons: ["92% skill match", "Enterprise scale", "Good training"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 3,
        match: "89% MATCH",
        matchScore: 89,
        title: "Cybersecurity Consultant",
        company: "Deloitte India",
        location: "Bangalore",
        salary: "₹20L - ₹32L",
        tags: ["Risk Assessment", "ISO 27001", "Audit"],
        matchReasons: ["89% skill match", "Consulting exposure", "Multiple industries"],
        cardBg: "#FEF08A",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 4,
        match: "86% MATCH",
        matchScore: 86,
        title: "Cloud Security Engineer",
        company: "Infosys",
        location: "Pune",
        salary: "₹18L - ₹28L",
        tags: ["AWS Security", "IAM", "KMS"],
        matchReasons: ["86% skill match", "Cloud growth", "Enterprise clients"],
        cardBg: "#E6F6D4",
        matchBg: "#FEF08A",
        matchColor: "#000000"
      },
      {
        id: 5,
        match: "83% MATCH",
        matchScore: 83,
        title: "Penetration Tester",
        company: "Razorpay",
        location: "Bangalore",
        salary: "₹22L - ₹35L",
        tags: ["Pentesting", "Kali Linux", "Web Security"],
        matchReasons: ["83% skill match", "Fintech security", "Bug bounty culture"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 6,
        match: "80% MATCH",
        matchScore: 80,
        title: "Security Engineer",
        company: "PhonePe",
        location: "Bangalore",
        salary: "₹20L - ₹32L",
        tags: ["AppSec", "DevSecOps", "CI/CD"],
        matchReasons: ["80% skill match", "Fintech scale", "Modern stack"],
        cardBg: "#FEF08A",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      }
    ],
    
    profilePower: {
      overallScore: 72,
      breakdown: [
        { label: "Profile Completeness", value: 55, color: "#1A4D2E" },
        { label: "Skill Diversity", value: 70, color: "#D8B4FE" },
        { label: "Market Alignment", value: 78, color: "#1A4D2E" },
        { label: "Experience Level", value: 65, color: "#D8B4FE" }
      ]
    },
    
    missingSkillTemplate: {
      title: "Missing Skill Alert",
      description: "You're missing {skillName} — required for 75% of Cybersecurity roles. Adding this can boost your profile power by 20% and open doors to enterprise security teams."
    },
    
    roadmap: {
      currentRole: "Security Analyst",
      nextTarget: "Senior Security Engineer",
      dreamRole: "CISO",
      currentProgress: 45,
      skillsToNext: [
        { name: "Cloud Security", difficulty: "medium" },
        { name: "Security Certifications", difficulty: "easy" },
        { name: "Incident Response", difficulty: "hard" }
      ]
    },
    
    salaryBenchmark: {
      currentSalary: "₹12,00,000",
      targetRoleSalary: { min: "₹20L", max: "₹32L", median: "₹26L" },
      location: "Bangalore",
      experience: "2-4 years",
      gap: "₹14,00,000",
      bridgeSkills: ["AWS Security", "CEH/OSCP", "SIEM"]
    },
    
    hotSkills: [
      { name: "Cloud Security", demandScore: 94, salaryBoost: "+₹4L", trend: "up", youHave: false },
      { name: "DevSecOps", demandScore: 92, salaryBoost: "+₹3.5L", trend: "up", youHave: true },
      { name: "Zero Trust", demandScore: 89, salaryBoost: "+₹3L", trend: "up", youHave: false },
      { name: "Threat Hunting", demandScore: 87, salaryBoost: "+₹2.5L", trend: "stable", youHave: true }
    ],
    
    weeklyWins: [
      { id: 1, icon: "send", title: "Application Sent", detail: "HDFC Bank • Security Analyst", date: "Today" },
      { id: 2, icon: "bookmark", title: "Job Saved", detail: "TCS • InfoSec Engineer", date: "Yesterday" },
      { id: 3, icon: "eye", title: "Profile Viewed", detail: "2 security recruiters viewed your profile", date: "2 days ago" }
    ]
  },

  // Profile 6: UI/UX Designer
  uiUxDesigner: {
    topPicks: [
      {
        id: 1,
        match: "96% MATCH",
        matchScore: 96,
        title: "UI/UX Lead",
        company: "Zomato",
        location: "Gurgaon",
        salary: "₹25L - ₹38L",
        tags: ["Figma", "User Research", "Mobile"],
        matchReasons: ["96% skill match", "Consumer tech", "High design visibility"],
        cardBg: "#E6F6D4",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 2,
        match: "93% MATCH",
        matchScore: 93,
        title: "Product Designer",
        company: "Freshworks",
        location: "Chennai",
        salary: "₹20L - ₹30L",
        tags: ["B2B SaaS", "Design Systems", "Prototyping"],
        matchReasons: ["93% skill match", "Global SaaS", "Design system team"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 3,
        match: "90% MATCH",
        matchScore: 90,
        title: "Senior UX Designer",
        company: "CRED",
        location: "Bangalore",
        salary: "₹28L - ₹42L",
        tags: ["Fintech", "Micro-interactions", "Premium UX"],
        matchReasons: ["90% skill match", "Design-first company", "Elite team"],
        cardBg: "#FEF08A",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 4,
        match: "87% MATCH",
        matchScore: 87,
        title: "UX Designer",
        company: "Meesho",
        location: "Bangalore",
        salary: "₹18L - ₹28L",
        tags: ["B2C", "Accessibility", "Android"],
        matchReasons: ["87% skill match", "Social commerce", "Bharat users"],
        cardBg: "#E6F6D4",
        matchBg: "#FEF08A",
        matchColor: "#000000"
      },
      {
        id: 5,
        match: "84% MATCH",
        matchScore: 84,
        title: "Visual Designer",
        company: "Swiggy",
        location: "Bangalore",
        salary: "₹16L - ₹25L",
        tags: ["Branding", "Illustration", "Motion"],
        matchReasons: ["84% skill match", "Food tech", "Brand scale"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 6,
        match: "81% MATCH",
        matchScore: 81,
        title: "Design System Lead",
        company: "Razorpay",
        location: "Bangalore",
        salary: "₹24L - ₹36L",
        tags: ["Design Tokens", "Figma", "Documentation"],
        matchReasons: ["81% skill match", "Fintech design scale", "Leadership role"],
        cardBg: "#FEF08A",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      }
    ],
    
    profilePower: {
      overallScore: 82,
      breakdown: [
        { label: "Profile Completeness", value: 78, color: "#1A4D2E" },
        { label: "Skill Diversity", value: 80, color: "#D8B4FE" },
        { label: "Market Alignment", value: 85, color: "#1A4D2E" },
        { label: "Experience Level", value: 75, color: "#D8B4FE" }
      ]
    },
    
    missingSkillTemplate: {
      title: "Missing Skill Alert",
      description: "You're missing {skillName} — requested in 80% of UI/UX Designer job descriptions. Adding this can boost your profile power by 15% and qualify you for senior design roles."
    },
    
    roadmap: {
      currentRole: "UI/UX Designer",
      nextTarget: "Senior Product Designer",
      dreamRole: "Design Director",
      currentProgress: 68,
      skillsToNext: [
        { name: "Design Systems", difficulty: "medium" },
        { name: "User Research", difficulty: "medium" },
        { name: "Motion Design", difficulty: "easy" }
      ]
    },
    
    salaryBenchmark: {
      currentSalary: "₹10,00,000",
      targetRoleSalary: { min: "₹18L", max: "₹30L", median: "₹24L" },
      location: "Bangalore",
      experience: "3-5 years",
      gap: "₹14,00,000",
      bridgeSkills: ["Figma Advanced", "Design Systems", "User Research"]
    },
    
    hotSkills: [
      { name: "Figma Prototyping", demandScore: 93, salaryBoost: "+₹2.5L", trend: "up", youHave: true },
      { name: "Design Systems", demandScore: 91, salaryBoost: "+₹2L", trend: "up", youHave: false },
      { name: "Motion Design", demandScore: 87, salaryBoost: "+₹1.5L", trend: "up", youHave: true },
      { name: "User Research", demandScore: 89, salaryBoost: "+₹1.8L", trend: "stable", youHave: false }
    ],
    
    weeklyWins: [
      { id: 1, icon: "send", title: "Application Sent", detail: "Zomato • UI/UX Lead", date: "Today" },
      { id: 2, icon: "bookmark", title: "Job Saved", detail: "Freshworks • Product Designer", date: "Yesterday" },
      { id: 3, icon: "eye", title: "Profile Viewed", detail: "3 design recruiters viewed your portfolio", date: "2 days ago" },
      { id: 4, icon: "zap", title: "Portfolio Liked", detail: "Your portfolio received 12 likes", date: "3 days ago" }
    ]
  },

  // Profile 7: Backend Engineer
  backendEngineer: {
    topPicks: [
      {
        id: 1,
        match: "99% MATCH",
        matchScore: 99,
        title: "Staff Backend Engineer",
        company: "Flipkart",
        location: "Bangalore",
        salary: "₹40L - ₹60L",
        tags: ["Node.js", "PostgreSQL", "Microservices"],
        matchReasons: ["99% skill match", "E-commerce scale", "Staff level role"],
        cardBg: "#E6F6D4",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 2,
        match: "96% MATCH",
        matchScore: 96,
        title: "Backend Lead",
        company: "Swiggy",
        location: "Bangalore",
        salary: "₹32L - ₹48L",
        tags: ["Go", "Kafka", "Redis"],
        matchReasons: ["96% skill match", "High throughput systems", "Leadership"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 3,
        match: "93% MATCH",
        matchScore: 93,
        title: "Senior Backend Engineer",
        company: "PhonePe",
        location: "Bangalore",
        salary: "₹28L - ₹42L",
        tags: ["Java", "Spring", "MySQL"],
        matchReasons: ["93% skill match", "Fintech backend", "Payment systems", "High impact"],
        cardBg: "#FEF08A",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 4,
        match: "90% MATCH",
        matchScore: 90,
        title: "Platform Engineer",
        company: "Zerodha",
        location: "Bangalore",
        salary: "₹25L - ₹38L",
        tags: ["Python", "Django", "AWS"],
        matchReasons: ["90% skill match", "Trading platform", "Remote culture", "Tech-heavy"],
        cardBg: "#E6F6D4",
        matchBg: "#FEF08A",
        matchColor: "#000000"
      },
      {
        id: 5,
        match: "87% MATCH",
        matchScore: 87,
        title: "Backend Engineer",
        company: "CRED",
        location: "Bangalore",
        salary: "₹22L - ₹35L",
        tags: ["Node.js", "GraphQL", "MongoDB"],
        matchReasons: ["87% skill match", "Premium fintech", "Modern stack", "Design-driven"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 6,
        match: "84% MATCH",
        matchScore: 84,
        title: "Principal Engineer",
        company: "Groww",
        location: "Bangalore",
        salary: "₹45L - ₹65L",
        tags: ["Architecture", "Mentoring", "Tech Strategy"],
        matchReasons: ["84% skill match", "Principal level", "Fintech growth", "High equity"],
        cardBg: "#FEF08A",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      }
    ],
    
    profilePower: {
      overallScore: 94,
      breakdown: [
        { label: "Profile Completeness", value: 92, color: "#1A4D2E" },
        { label: "Skill Diversity", value: 90, color: "#D8B4FE" },
        { label: "Market Alignment", value: 95, color: "#1A4D2E" },
        { label: "Experience Level", value: 88, color: "#D8B4FE" }
      ]
    },
    
    missingSkillTemplate: {
      title: "Missing Skill Alert",
      description: "You're missing {skillName} — appearing in 86% of Backend Engineer job postings. Adding this can boost your profile power by 12% and qualify you for Staff Engineer positions."
    },
    
    roadmap: {
      currentRole: "Backend Engineer",
      nextTarget: "Staff Backend Engineer",
      dreamRole: "Principal Engineer",
      currentProgress: 85,
      skillsToNext: [
        { name: "System Design", difficulty: "hard" },
        { name: "Distributed Systems", difficulty: "hard" },
        { name: "Database Optimization", difficulty: "medium" }
      ]
    },
    
    salaryBenchmark: {
      currentSalary: "₹16,00,000",
      targetRoleSalary: { min: "₹28L", max: "₹45L", median: "₹36L" },
      location: "Bangalore",
      experience: "4-6 years",
      gap: "₹20,00,000",
      bridgeSkills: ["Go", "Kafka", "System Design"]
    },
    
    hotSkills: [
      { name: "Go", demandScore: 95, salaryBoost: "+₹4L", trend: "up", youHave: true },
      { name: "System Design", demandScore: 94, salaryBoost: "+₹3.5L", trend: "up", youHave: true },
      { name: "Kafka", demandScore: 92, salaryBoost: "+₹3L", trend: "up", youHave: true },
      { name: "Rust", demandScore: 88, salaryBoost: "+₹2.5L", trend: "up", youHave: false }
    ],
    
    weeklyWins: [
      { id: 1, icon: "send", title: "Application Sent", detail: "Flipkart • Staff Backend Engineer", date: "Today" },
      { id: 2, icon: "bookmark", title: "Job Saved", detail: "Swiggy • Backend Lead", date: "Yesterday" },
      { id: 3, icon: "eye", title: "Profile Viewed", detail: "6 backend recruiters viewed your profile", date: "2 days ago" },
      { id: 4, icon: "zap", title: "Skill Endorsed", detail: "Node.js endorsed by 5 peers", date: "3 days ago" }
    ]
  },

  // Profile 8: Full Stack Developer
  fullStack: {
    topPicks: [
      {
        id: 1,
        match: "95% MATCH",
        matchScore: 95,
        title: "Full Stack Developer",
        company: "Urban Company",
        location: "Bangalore",
        salary: "₹20L - ₹32L",
        tags: ["React", "Node.js", "MongoDB"],
        matchReasons: ["95% skill match", "Hyper-growth startup", "Full ownership"],
        cardBg: "#E6F6D4",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 2,
        match: "92% MATCH",
        matchScore: 92,
        title: "Full Stack Engineer",
        company: "Lendingkart",
        location: "Bangalore",
        salary: "₹18L - ₹28L",
        tags: ["Vue.js", "Python", "PostgreSQL"],
        matchReasons: ["92% skill match", "Fintech domain", "End-to-end work"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 3,
        match: "89% MATCH",
        matchScore: 89,
        title: "Software Engineer",
        company: "NoBroker",
        location: "Bangalore",
        salary: "₹17L - ₹26L",
        tags: ["React", "Java", "MySQL"],
        matchReasons: ["89% skill match", "PropTech growth", "Full stack role", "Good culture"],
        cardBg: "#FEF08A",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 4,
        match: "86% MATCH",
        matchScore: 86,
        title: "Full Stack Developer",
        company: "Paytm",
        location: "Noida",
        salary: "₹16L - ₹25L",
        tags: ["Angular", "Node.js", "Redis"],
        matchReasons: ["86% skill match", "Fintech scale", "Stable company", "Learning opportunities"],
        cardBg: "#E6F6D4",
        matchBg: "#FEF08A",
        matchColor: "#000000"
      },
      {
        id: 5,
        match: "83% MATCH",
        matchScore: 83,
        title: "Full Stack Engineer",
        company: "BYJU'S",
        location: "Bangalore",
        salary: "₹18L - ₹28L",
        tags: ["React", "Python", "AWS"],
        matchReasons: ["83% skill match", "EdTech impact", "Large user base", "Full stack exposure"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 6,
        match: "80% MATCH",
        matchScore: 80,
        title: "Senior Full Stack",
        company: "BigBasket",
        location: "Bangalore",
        salary: "₹22L - ₹34L",
        tags: ["React", "Go", "Microservices"],
        matchReasons: ["80% skill match", "Grocery tech", "Senior role", "Tech stack"],
        cardBg: "#FEF08A",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      }
    ],
    
    profilePower: {
      overallScore: 80,
      breakdown: [
        { label: "Profile Completeness", value: 67, color: "#1A4D2E" },
        { label: "Skill Diversity", value: 85, color: "#D8B4FE" },
        { label: "Market Alignment", value: 82, color: "#1A4D2E" },
        { label: "Experience Level", value: 75, color: "#D8B4FE" }
      ]
    },
    
    missingSkillTemplate: {
      title: "Missing Skill Alert",
      description: "You're missing {skillName} — appearing in 80% of Full Stack Developer roles. Adding this can boost your profile power by 14% and help you land senior full-stack positions."
    },
    
    roadmap: {
      currentRole: "Full Stack Developer",
      nextTarget: "Senior Full Stack Engineer",
      dreamRole: "Technical Architect",
      currentProgress: 60,
      skillsToNext: [
        { name: "Cloud Deployment", difficulty: "medium" },
        { name: "System Design", difficulty: "hard" },
        { name: "DevOps Basics", difficulty: "medium" }
      ]
    },
    
    salaryBenchmark: {
      currentSalary: "₹14,00,000",
      targetRoleSalary: { min: "₹22L", max: "₹35L", median: "₹28L" },
      location: "Bangalore",
      experience: "3-5 years",
      gap: "₹14,00,000",
      bridgeSkills: ["AWS", "Docker", "System Design"]
    },
    
    hotSkills: [
      { name: "Docker", demandScore: 91, salaryBoost: "+₹2.5L", trend: "up", youHave: false },
      { name: "AWS", demandScore: 93, salaryBoost: "+₹3L", trend: "up", youHave: true },
      { name: "TypeScript", demandScore: 89, salaryBoost: "+₹2L", trend: "up", youHave: true },
      { name: "GraphQL", demandScore: 87, salaryBoost: "+₹1.8L", trend: "stable", youHave: false }
    ],
    
    weeklyWins: [
      { id: 1, icon: "send", title: "Application Sent", detail: "Urban Company • Full Stack Developer", date: "Today" },
      { id: 2, icon: "bookmark", title: "Job Saved", detail: "Lendingkart • Full Stack Engineer", date: "Yesterday" },
      { id: 3, icon: "eye", title: "Profile Viewed", detail: "4 recruiters viewed your profile", date: "2 days ago" }
    ]
  },

  // Profile 9: Mobile Developer
  mobileDeveloper: {
    topPicks: [
      {
        id: 1,
        match: "97% MATCH",
        matchScore: 97,
        title: "Senior Mobile Engineer",
        company: "Swiggy",
        location: "Bangalore",
        salary: "₹28L - ₹42L",
        tags: ["React Native", "iOS", "Android"],
        matchReasons: ["97% skill match", "Consumer scale", "High impact"],
        cardBg: "#E6F6D4",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 2,
        match: "94% MATCH",
        matchScore: 94,
        title: "Mobile Developer",
        company: "Zomato",
        location: "Gurgaon",
        salary: "₹22L - ₹35L",
        tags: ["Flutter", "Dart", "Firebase"],
        matchReasons: ["94% skill match", "Food tech scale", "Flutter-first"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 3,
        match: "91% MATCH",
        matchScore: 91,
        title: "React Native Developer",
        company: "Flipkart",
        location: "Bangalore",
        salary: "₹24L - ₹38L",
        tags: ["React Native", "Redux", "TypeScript"],
        matchReasons: ["91% skill match", "E-commerce mobile", "Large user base", "Modern stack"],
        cardBg: "#FEF08A",
        matchBg: "#D8B4FE",
        matchColor: "#000000"
      },
      {
        id: 4,
        match: "88% MATCH",
        matchScore: 88,
        title: "Mobile Engineer",
        company: "PhonePe",
        location: "Bangalore",
        salary: "₹26L - ₹40L",
        tags: ["React Native", "Native Modules", "Payments"],
        matchReasons: ["88% skill match", "Fintech mobile", "Payment integration", "High compensation"],
        cardBg: "#E6F6D4",
        matchBg: "#FEF08A",
        matchColor: "#000000"
      },
      {
        id: 5,
        match: "85% MATCH",
        matchScore: 85,
        title: "iOS Developer",
        company: "CRED",
        location: "Bangalore",
        salary: "₹24L - ₹36L",
        tags: ["Swift", "UIKit", "Combine"],
        matchReasons: ["85% skill match", "Premium fintech", "iOS-first", "Design-led"],
        cardBg: "#D8B4FE",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      },
      {
        id: 6,
        match: "82% MATCH",
        matchScore: 82,
        title: "Mobile Lead",
        company: "Razorpay",
        location: "Bangalore",
        salary: "₹32L - ₹48L",
        tags: ["React Native", "Architecture", "Team Lead"],
        matchReasons: ["82% skill match", "Leadership role", "Fintech scale", "High equity"],
        cardBg: "#FEF08A",
        matchBg: "#E6F6D4",
        matchColor: "#000000"
      }
    ],
    
    profilePower: {
      overallScore: 86,
      breakdown: [
        { label: "Profile Completeness", value: 85, color: "#1A4D2E" },
        { label: "Skill Diversity", value: 82, color: "#D8B4FE" },
        { label: "Market Alignment", value: 88, color: "#1A4D2E" },
        { label: "Experience Level", value: 80, color: "#D8B4FE" }
      ]
    },
    
    missingSkillTemplate: {
      title: "Missing Skill Alert",
      description: "You're missing {skillName} — appearing in 83% of Mobile Developer job postings. Adding this can boost your profile power by 13% and unlock senior mobile positions."
    },
    
    roadmap: {
      currentRole: "Mobile Developer",
      nextTarget: "Senior Mobile Engineer",
      dreamRole: "Mobile Engineering Lead",
      currentProgress: 78,
      skillsToNext: [
        { name: "iOS Native", difficulty: "hard" },
        { name: "Android Native", difficulty: "hard" },
        { name: "Flutter", difficulty: "medium" }
      ]
    },
    
    salaryBenchmark: {
      currentSalary: "₹15,00,000",
      targetRoleSalary: { min: "₹25L", max: "₹40L", median: "₹32L" },
      location: "Bangalore",
      experience: "4-6 years",
      gap: "₹17,00,000",
      bridgeSkills: ["Swift", "Kotlin", "React Native Advanced"]
    },
    
    hotSkills: [
      { name: "Swift", demandScore: 93, salaryBoost: "+₹3L", trend: "up", youHave: true },
      { name: "Kotlin", demandScore: 92, salaryBoost: "+₹2.8L", trend: "up", youHave: true },
      { name: "Flutter", demandScore: 90, salaryBoost: "+₹2.5L", trend: "up", youHave: false },
      { name: "React Native", demandScore: 91, salaryBoost: "+₹2.6L", trend: "stable", youHave: true }
    ],
    
    weeklyWins: [
      { id: 1, icon: "send", title: "Application Sent", detail: "Swiggy • Senior Mobile Engineer", date: "Today" },
      { id: 2, icon: "bookmark", title: "Job Saved", detail: "Zomato • Mobile Developer", date: "Yesterday" },
      { id: 3, icon: "eye", title: "Profile Viewed", detail: "3 mobile recruiters viewed your profile", date: "2 days ago" },
      { id: 4, icon: "zap", title: "App Downloaded", detail: "Your portfolio app got 50 downloads", date: "3 days ago" }
    ]
  }
};

// Helper function to get profile by role
export function getDashboardProfile(role) {
  const normalizedRole = role?.toLowerCase().replace(/[^a-z]/g, '');
  
  const roleMap = {
    'frontenddeveloper': 'frontend',
    'frontend': 'frontend',
    'frontendengineer': 'frontend',
    'datascientist': 'dataScientist',
    'dataanalyst': 'dataScientist',
    'machinelearning': 'dataScientist',
    'devopsengineer': 'devops',
    'devops': 'devops',
    'sre': 'devops',
    'productmanager': 'productManager',
    'pm': 'productManager',
    'aimlengineer': 'aiMlEngineer',
    'aiengineer': 'aiMlEngineer',
    'machinelearningengineer': 'aiMlEngineer',
    'cybersecurity': 'cybersecurity',
    'securityanalyst': 'cybersecurity',
    'infosec': 'cybersecurity',
    'uiuxdesigner': 'uiUxDesigner',
    'uidesigner': 'uiUxDesigner',
    'uxdesigner': 'uiUxDesigner',
    'productdesigner': 'uiUxDesigner',
    'backendengineer': 'backendEngineer',
    'backenddeveloper': 'backendEngineer',
    'fullstackdeveloper': 'fullStack',
    'fullstackengineer': 'fullStack',
    'mobiledeveloper': 'mobileDeveloper',
    'androiddeveloper': 'mobileDeveloper',
    'iosdeveloper': 'mobileDeveloper',
    'reactnativedeveloper': 'mobileDeveloper'
  };
  
  const profileKey = roleMap[normalizedRole] || 'frontend';
  return dashboardProfiles[profileKey] || dashboardProfiles.frontend;
}

// Helper function to get time-based greeting
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

export default dashboardProfiles;
