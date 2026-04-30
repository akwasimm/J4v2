// Mock handlers for skill gap analysis endpoints
import { mockSkillGapData } from '../data/skillGap.js';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const skillGapHandlers = {
  getRoleTemplates: async (category = null) => {
    await delay();
    let templates = [...mockSkillGapData.role_templates];
    if (category) {
      templates = templates.filter(t => t.category.toLowerCase() === category.toLowerCase());
    }
    return { items: templates };
  },

  getRoleTemplate: async (roleName) => {
    await delay(200);
    const template = mockSkillGapData.role_templates.find(
      t => t.name.toLowerCase() === roleName.toLowerCase()
    );
    if (!template) {
      throw new Error("Role template not found");
    }
    return { ...template };
  },

  getLearningPaths: async (skillName = null, difficultyLevel = null) => {
    await delay();
    let paths = [...mockSkillGapData.learning_paths];
    if (skillName) {
      paths = paths.filter(p => p.skill_name.toLowerCase() === skillName.toLowerCase());
    }
    if (difficultyLevel) {
      paths = paths.filter(p => p.difficulty_level === difficultyLevel);
    }
    return { items: paths };
  },

  getLearningPath: async (skillName) => {
    await delay(200);
    const path = mockSkillGapData.learning_paths.find(
      p => p.skill_name.toLowerCase() === skillName.toLowerCase()
    );
    if (!path) {
      throw new Error("Learning path not found");
    }
    return { ...path };
  }
};
