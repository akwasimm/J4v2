# Dashboard Data Structure Guide

All AI has been removed. The dashboard now loads data from the database only. Here's the data structure needed for each section.

---

## Static Data Files for Manual Population

For testing and manual data population, two static data files are available:

### 1. Sample Data File
**Location:** `frontend/src/mocks/data/dashboard-samples.json`

Contains 10 complete sample dashboard profiles for different job roles:
- Frontend Developer (Profile 1)
- Data Scientist (Profile 2)
- DevOps Engineer (Profile 3)
- Product Manager (Profile 4)
- AI/ML Engineer (Profile 5)
- Cybersecurity Engineer (Profile 6)
- UI/UX Designer (Profile 7)
- Backend Engineer (Profile 8)
- Full Stack Developer (Profile 9)
- Mobile Developer (Profile 10)

Each profile includes all dashboard sections with realistic data. Use these as reference examples when populating data for new users.

### 2. Template File
**Location:** `frontend/src/mocks/data/dashboard-template.json`

A user-agnostic template with placeholder values. Copy this structure and replace the placeholder values with user-specific data.

**Template Usage:**
1. Copy the template structure
2. Replace `first_name` and `full_name` with user's actual name
3. Adjust `profile_completion` (0-100)
4. Customize each section based on user's skills, experience, and job targets
5. Use the sample profiles as reference for realistic values

---

---

## API Endpoint

**GET** `/api/v1/dashboard/cached`

Returns dashboard data from `UserDashboardData` table.

---

## 1. Profile Completion Bar

**Location:** `dashboard.profile_completion` (integer 0-100)

```json
{
  "profile_completion": 75
}
```

**DB Column:** `users.profile_completion` or `user_dashboard_data.profile_completion`

---

## 2. Personalized Welcome Header

**Location:** `dashboard.stats`

```json
{
  "stats": {
    "first_name": "John",
    "full_name": "John Doe"
  }
}
```

**DB Columns:** `users.first_name`, `users.full_name`

---

## 3. Quick Actions (Top 3 Cards)

**Location:** `dashboard.recommended_actions`

```json
{
  "recommended_actions": [
    {
      "action": "Apply to 5 Software Engineer jobs",
      "reason": "75% match with your Python skills",
      "priority": "high",
      "estimated_impact": "+25% response rate"
    }
  ]
}
```

**DB Column:** `user_dashboard_data.recommended_actions` (JSON array)

---

## 4. Market Trends (Chart + 2 Cards)

**Location:** `dashboard.market_trends`

```json
{
  "market_trends": {
    "chart": {
      "title": "Top 5 Job Categories (Last 30 Days)",
      "labels": ["IT", "Finance", "Healthcare", "Education", "Marketing"],
      "values": [450, 320, 280, 150, 120]
    },
    "insight_cards": [
      {
        "title": "🚀 IT sector up 15%",
        "description": "Software engineering roles in your city increased significantly",
        "color": "#E6F6D4"
      },
      {
        "title": "💰 Average salary up 8%",
        "description": "Market rates rising for your skill level",
        "color": "#D8B4FE"
      }
    ]
  }
}
```

**DB Column:** `user_dashboard_data.market_trends` (JSON object)

---

## 5. Application Pipeline (Stats Row)

**Location:** `dashboard.application_pipeline`

```json
{
  "application_pipeline": {
    "pipeline": [
      {
        "stage": "Applied",
        "count": 12,
        "trend": "+3 this week"
      },
      {
        "stage": "Interview",
        "count": 3,
        "trend": "1 scheduled today"
      },
      {
        "stage": "Offer",
        "count": 1,
        "trend": "Expires in 2 days"
      }
    ],
    "weekly_applications": 5,
    "response_rate": "25%",
    "time_to_offer": "18 days"
  }
}
```

**DB Column:** `user_dashboard_data.application_pipeline` (JSON object)

---

## 6. Career Growth (Radar Chart)

**Location:** `dashboard.career_growth`

```json
{
  "career_growth": {
    "radar_chart": {
      "labels": ["Technical Skills", "Experience", "Education", "Soft Skills", "Leadership", "Communication"],
      "values": [85, 70, 60, 75, 50, 80]
    },
    "insights": [
      {
        "title": "Leadership Skills Gap",
        "description": "Add team lead experience to boost profile by 15%",
        "priority": "medium"
      }
    ],
    "upskill_recommendations": [
      {
        "skill": "Project Management",
        "reason": "90% of senior roles require this",
        "resources": ["Coursera PM Certificate", "Google PM Course"]
      }
    ]
  }
}
```

**DB Column:** `user_dashboard_data.career_growth` (JSON object)

---

## 7. Top Picks For You (6 Job Cards)

**Location:** `dashboard.top_picks`

```json
{
  "top_picks": [
    {
      "job_id": "12345",
      "title": "Senior Software Engineer",
      "company": "TechCorp India",
      "location": "Bangalore",
      "work_model": "hybrid",
      "match_score": 97,
      "salary_range": "₹20L - ₹35L",
      "tags": ["Python", "React", "AWS"],
      "match_reasons": [
        "97% skill match with your profile",
        "Fast-growing team with career growth",
        "Matches your salary expectations"
      ],
      "cardBg": "#E6F6D4",
      "matchBg": "#D8B4FE",
      "matchColor": "#000000"
    }
  ]
}
```

**DB Column:** `user_dashboard_data.top_picks` (JSON array)

**Card Colors Available:**
- `#E6F6D4` (Green)
- `#D8B4FE` (Purple)
- `#FEF08A` (Yellow)

---

## 8. Employer Insights (5 Company Cards)

**Location:** `dashboard.employer_insights`

```json
{
  "employer_insights": {
    "top_employers": [
      {
        "name": "Google",
        "job_count": 45,
        "match_score": 92,
        "trend": "+12%",
        "benefits": ["Free meals", "WFH 3 days/week", "Stock options"],
        "culture_tags": ["Innovation", "Growth"],
        "cardBg": "#E6F6D4",
        "avatarColor": "#F472B6"
      }
    ],
    "market_insights": [
      "Startups offer 20% higher equity",
      "Remote roles increased 40%"
    ]
  }
}
```

**DB Column:** `user_dashboard_data.employer_insights` (JSON object)

---

## 9. AI Recommendations Section (DISABLED)

This section is now disabled since AI has been removed.

---

## 10. Strategy Cards (3 Cards)

**Location:** `dashboard.strategy_cards`

```json
{
  "strategy_cards": [
    {
      "title": "Apply to emerging startups",
      "body": "Early-stage startups are actively hiring. Move fast!",
      "priority": "high"
    },
    {
      "title": "Focus on remote roles",
      "body": "40% of companies now offer remote options",
      "priority": "medium"
    },
    {
      "title": "Upskill in AI/ML",
      "body": "90% of senior roles now require AI familiarity",
      "priority": "medium"
    }
  ]
}
```

**DB Column:** `user_dashboard_data.strategy_cards` (JSON array)

---

## Complete Example: Full Dashboard Response

```json
{
  "stats": {
    "first_name": "John",
    "full_name": "John Doe"
  },
  "profile_completion": 85,
  "recommended_actions": [
    {
      "action": "Complete profile to unlock AI matches",
      "reason": "Only 15% to go",
      "priority": "high",
      "estimated_impact": "+40% recruiter views"
    },
    {
      "action": "Add portfolio projects",
      "reason": "Showcase your work",
      "priority": "medium",
      "estimated_impact": "+30% callback rate"
    },
    {
      "action": "Get skill endorsements",
      "reason": "Boost credibility",
      "priority": "low",
      "estimated_impact": "+10% trust score"
    }
  ],
  "market_trends": {
    "chart": {
      "title": "Top 5 Job Categories (Last 30 Days)",
      "labels": ["IT", "Finance", "Healthcare", "Education", "Marketing"],
      "values": [450, 320, 280, 150, 120]
    },
    "insight_cards": [
      {
        "title": "🚀 IT sector up 15%",
        "description": "Software engineering roles increasing",
        "color": "#E6F6D4"
      },
      {
        "title": "💰 Salaries up 8%",
        "description": "Market rates rising",
        "color": "#D8B4FE"
      }
    ]
  },
  "application_pipeline": {
    "pipeline": [
      { "stage": "Applied", "count": 12, "trend": "+3" },
      { "stage": "Interview", "count": 3, "trend": "1 today" },
      { "stage": "Offer", "count": 1, "trend": "2 days left" }
    ],
    "weekly_applications": 5,
    "response_rate": "25%",
    "time_to_offer": "18 days"
  },
  "career_growth": {
    "radar_chart": {
      "labels": ["Technical", "Experience", "Education", "Soft Skills", "Leadership", "Communication"],
      "values": [85, 70, 60, 75, 50, 80]
    },
    "insights": [
      {
        "title": "Leadership Gap",
        "description": "Add team lead experience",
        "priority": "medium"
      }
    ],
    "upskill_recommendations": [
      {
        "skill": "Project Management",
        "reason": "90% of senior roles require this",
        "resources": ["Coursera", "Google PM"]
      }
    ]
  },
  "top_picks": [
    {
      "job_id": "12345",
      "title": "Senior Software Engineer",
      "company": "TechCorp India",
      "location": "Bangalore",
      "work_model": "hybrid",
      "match_score": 97,
      "salary_range": "₹20L - ₹35L",
      "tags": ["Python", "React", "AWS"],
      "match_reasons": ["97% skill match", "Fast-growing team"],
      "cardBg": "#E6F6D4",
      "matchBg": "#D8B4FE",
      "matchColor": "#000000"
    }
  ],
  "employer_insights": {
    "top_employers": [
      {
        "name": "Google",
        "job_count": 45,
        "match_score": 92,
        "trend": "+12%",
        "benefits": ["Free meals", "WFH", "Stock"],
        "culture_tags": ["Innovation", "Growth"],
        "cardBg": "#E6F6D4",
        "avatarColor": "#F472B6"
      }
    ],
    "market_insights": ["Startups offer 20% higher equity"]
  },
  "strategy_cards": [
    {
      "title": "Apply to emerging startups",
      "body": "Early-stage startups are actively hiring",
      "priority": "high"
    }
  ]
}
```

---

## Database Table: `user_dashboard_data`

**Key columns to populate manually:**

| Column | Type | Data |
|--------|------|------|
| `user_id` | UUID | User identifier |
| `profile_completion` | Integer | 0-100 |
| `recommended_actions` | JSON | Array of action objects |
| `market_trends` | JSON | Chart + insight cards |
| `application_pipeline` | JSON | Pipeline stats |
| `career_growth` | JSON | Radar chart + insights |
| `top_picks` | JSON | Array of 6 job objects |
| `employer_insights` | JSON | Top employers + insights |
| `strategy_cards` | JSON | Array of 3 strategy cards |
| `generated_at` | Timestamp | Last update time |

---

## Manual Data Insert Example

```sql
INSERT INTO user_dashboard_data (
  user_id,
  profile_completion,
  top_picks,
  generated_at
) VALUES (
  'user-uuid-here',
  85,
  '[
    {
      "job_id": "12345",
      "title": "Senior Software Engineer",
      "company": "TechCorp India",
      "location": "Bangalore",
      "work_model": "hybrid",
      "match_score": 97,
      "salary_range": "₹20L - ₹35L",
      "tags": ["Python", "React", "AWS"],
      "match_reasons": ["97% skill match"],
      "cardBg": "#E6F6D4",
      "matchBg": "#D8B4FE",
      "matchColor": "#000000"
    }
  ]'::jsonb,
  NOW()
);
```
