// Mock handlers for skill gap analysis endpoints
import { mockSkillGapData } from '../data/skillGap.js';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const skillGapHandlers = {
  // Returns { roles: [...] } to match backend format
  getRoleTemplates: async () => {
    await delay();
    // Return role names only to match backend /ai/skill-gap/roles format
    const roleNames = mockSkillGapData.role_templates.map(t => t.name);
    return { roles: roleNames };
  },

  // Mock AI skill gap analysis
  analyzeSkillGap: async (targetRole) => {
    await delay(800);
    return {
      user_id: "mock-user-id",
      target_role: targetRole,
      readiness_score: 72,
      readiness_label: "Almost Ready",
      matched_skills: ["JavaScript", "React", "HTML", "CSS"],
      missing_skills: ["TypeScript", "Node.js", "Docker"],
      skills_to_improve: ["React"],
      gap_summary: "You have solid frontend skills but need to improve on backend technologies for this role.",
      personalized_learning_path: [
        {
          step: 1,
          skill: "TypeScript",
          action: "Complete TypeScript fundamentals course and convert a small JS project",
          resources: ["TypeScript Handbook", "Udemy TypeScript Course"],
          estimated_weeks: 2
        },
        {
          step: 2,
          skill: "Node.js",
          action: "Build a REST API with Express and connect to a database",
          resources: ["Node.js Docs", "Express.js Guide"],
          estimated_weeks: 3
        },
        {
          step: 3,
          skill: "Docker",
          action: "Containerize your applications and learn docker-compose",
          resources: ["Docker Getting Started", "Docker Docs"],
          estimated_weeks: 2
        }
      ],
      analyzed_at: new Date().toISOString()
    };
  }
};
