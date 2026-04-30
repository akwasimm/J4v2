// Mock handlers for profile endpoints
import { mockProfileData } from '../data/profile.js';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for mutations
let profileStore = { ...mockProfileData };

export const profileHandlers = {
  getProfile: async () => {
    await delay();
    return { ...profileStore.profile };
  },

  updateProfile: async (profileData) => {
    await delay();
    profileStore.profile = { ...profileStore.profile, ...profileData };
    return { ...profileStore.profile };
  },

  updateCompleteProfile: async (profileData) => {
    await delay(500);
    profileStore.profile = { ...profileStore.profile, ...profileData, is_profile_complete: true };
    return { ...profileStore.profile };
  },

  uploadProfileImage: async (file) => {
    await delay(800);
    const mockUrl = URL.createObjectURL(file);
    profileStore.profile.avatar_url = mockUrl;
    return { avatar_url: mockUrl, success: true };
  },

  uploadResume: async (file) => {
    await delay(800);
    const mockUrl = URL.createObjectURL(file);
    profileStore.profile.resume_url = mockUrl;
    return { resume_url: mockUrl, filename: file.name, success: true };
  },

  getResumes: async () => {
    await delay();
    return { items: [...profileStore.resumes] };
  },

  deleteResume: async (resumeId) => {
    await delay();
    profileStore.resumes = profileStore.resumes.filter(r => r.id !== resumeId);
    return { success: true };
  },

  setDefaultResume: async (resumeId) => {
    await delay();
    profileStore.resumes = profileStore.resumes.map(r => ({
      ...r,
      is_default: r.id === resumeId
    }));
    return { success: true };
  },

  getSkills: async () => {
    await delay();
    return { items: [...profileStore.skills] };
  },

  addSkill: async (skillData) => {
    await delay();
    const newSkill = {
      id: `skill_${Date.now()}`,
      ...skillData
    };
    profileStore.skills.push(newSkill);
    return { ...newSkill };
  },

  updateSkill: async (skillId, skillData) => {
    await delay();
    const index = profileStore.skills.findIndex(s => s.id === skillId);
    if (index === -1) throw new Error("Skill not found");
    profileStore.skills[index] = { ...profileStore.skills[index], ...skillData };
    return { ...profileStore.skills[index] };
  },

  deleteSkill: async (skillId) => {
    await delay();
    profileStore.skills = profileStore.skills.filter(s => s.id !== skillId);
    return { success: true };
  },

  bulkUpdateSkills: async (skillsData) => {
    await delay(500);
    profileStore.skills = skillsData.map((skill, index) => ({
      id: skill.id || `skill_${Date.now()}_${index}`,
      ...skill
    }));
    return { items: [...profileStore.skills] };
  },

  getExperience: async () => {
    await delay();
    return { items: [...profileStore.experience] };
  },

  addExperience: async (experienceData) => {
    await delay();
    const newExp = {
      id: `exp_${Date.now()}`,
      ...experienceData
    };
    profileStore.experience.push(newExp);
    return { ...newExp };
  },

  updateExperience: async (expId, experienceData) => {
    await delay();
    const index = profileStore.experience.findIndex(e => e.id === expId);
    if (index === -1) throw new Error("Experience not found");
    profileStore.experience[index] = { ...profileStore.experience[index], ...experienceData };
    return { ...profileStore.experience[index] };
  },

  deleteExperience: async (expId) => {
    await delay();
    profileStore.experience = profileStore.experience.filter(e => e.id !== expId);
    return { success: true };
  },

  bulkUpdateExperience: async (experienceData) => {
    await delay(500);
    profileStore.experience = experienceData.map((exp, index) => ({
      id: exp.id || `exp_${Date.now()}_${index}`,
      ...exp
    }));
    return { items: [...profileStore.experience] };
  },

  getEducation: async () => {
    await delay();
    return { items: [...profileStore.education] };
  },

  addEducation: async (educationData) => {
    await delay();
    const newEdu = {
      id: `edu_${Date.now()}`,
      ...educationData
    };
    profileStore.education.push(newEdu);
    return { ...newEdu };
  },

  updateEducation: async (eduId, educationData) => {
    await delay();
    const index = profileStore.education.findIndex(e => e.id === eduId);
    if (index === -1) throw new Error("Education not found");
    profileStore.education[index] = { ...profileStore.education[index], ...educationData };
    return { ...profileStore.education[index] };
  },

  deleteEducation: async (eduId) => {
    await delay();
    profileStore.education = profileStore.education.filter(e => e.id !== eduId);
    return { success: true };
  },

  bulkUpdateEducation: async (educationData) => {
    await delay(500);
    profileStore.education = educationData.map((edu, index) => ({
      id: edu.id || `edu_${Date.now()}_${index}`,
      ...edu
    }));
    return { items: [...profileStore.education] };
  },

  getPreferences: async () => {
    await delay();
    return { ...profileStore.preferences };
  },

  updatePreferences: async (preferencesData) => {
    await delay();
    profileStore.preferences = { ...profileStore.preferences, ...preferencesData };
    return { ...profileStore.preferences };
  }
};
