// Profile Service - abstracts profile API calls
import { isMockMode } from './config.js';
import * as realApi from '../api/client.js';
import { profileHandlers } from '../mocks/handlers/index.js';

// Helper to prepend backend URL for file paths
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || "http://localhost:8000";
export const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${BACKEND_URL}${path}`;
};

// Basic profile
export const getProfile = async () => {
  if (isMockMode()) {
    return profileHandlers.getProfile();
  }
  return realApi.getProfile();
};

// Alias for getProfile (used by EditProfile.jsx)
export const getFullProfile = getProfile;

export const updateProfile = async (profileData) => {
  if (isMockMode()) {
    return profileHandlers.updateProfile(profileData);
  }
  return realApi.updateProfile(profileData);
};

export const updateCompleteProfile = async (profileData) => {
  if (isMockMode()) {
    return profileHandlers.updateCompleteProfile(profileData);
  }
  return realApi.updateCompleteProfile(profileData);
};

// File uploads
export const uploadProfileImage = async (file) => {
  if (isMockMode()) {
    return profileHandlers.uploadProfileImage(file);
  }
  return realApi.uploadProfileImage(file);
};

// Alias for uploadProfileImage (used by EditProfile.jsx)
export const uploadAvatar = uploadProfileImage;

export const uploadResume = async (file) => {
  if (isMockMode()) {
    return profileHandlers.uploadResume(file);
  }
  return realApi.uploadResume(file);
};

// Resumes
export const getResumes = async () => {
  if (isMockMode()) {
    return profileHandlers.getResumes();
  }
  return realApi.getResumes();
};

export const deleteResume = async (resumeId) => {
  if (isMockMode()) {
    return profileHandlers.deleteResume(resumeId);
  }
  return realApi.deleteResume(resumeId);
};

export const setDefaultResume = async (resumeId) => {
  if (isMockMode()) {
    return profileHandlers.setDefaultResume(resumeId);
  }
  return realApi.setDefaultResume(resumeId);
};

// Skills
export const getSkills = async () => {
  if (isMockMode()) {
    return profileHandlers.getSkills();
  }
  return realApi.getSkills();
};

export const addSkill = async (skillData) => {
  if (isMockMode()) {
    return profileHandlers.addSkill(skillData);
  }
  return realApi.addSkill(skillData);
};

export const updateSkill = async (skillId, skillData) => {
  if (isMockMode()) {
    return profileHandlers.updateSkill(skillId, skillData);
  }
  return realApi.updateSkill(skillId, skillData);
};

export const deleteSkill = async (skillId) => {
  if (isMockMode()) {
    return profileHandlers.deleteSkill(skillId);
  }
  return realApi.deleteSkill(skillId);
};

export const bulkUpdateSkills = async (skillsData) => {
  if (isMockMode()) {
    return profileHandlers.bulkUpdateSkills(skillsData);
  }
  return realApi.bulkUpdateSkills(skillsData);
};

// Experience
export const getExperience = async () => {
  if (isMockMode()) {
    return profileHandlers.getExperience();
  }
  return realApi.getExperience();
};

export const addExperience = async (experienceData) => {
  if (isMockMode()) {
    return profileHandlers.addExperience(experienceData);
  }
  return realApi.addExperience(experienceData);
};

export const updateExperience = async (expId, experienceData) => {
  if (isMockMode()) {
    return profileHandlers.updateExperience(expId, experienceData);
  }
  return realApi.updateExperience(expId, experienceData);
};

export const deleteExperience = async (expId) => {
  if (isMockMode()) {
    return profileHandlers.deleteExperience(expId);
  }
  return realApi.deleteExperience(expId);
};

export const bulkUpdateExperience = async (experienceData) => {
  if (isMockMode()) {
    return profileHandlers.bulkUpdateExperience(experienceData);
  }
  return realApi.bulkUpdateExperience(experienceData);
};

// Education
export const getEducation = async () => {
  if (isMockMode()) {
    return profileHandlers.getEducation();
  }
  return realApi.getEducation();
};

export const addEducation = async (educationData) => {
  if (isMockMode()) {
    return profileHandlers.addEducation(educationData);
  }
  return realApi.addEducation(educationData);
};

export const updateEducation = async (eduId, educationData) => {
  if (isMockMode()) {
    return profileHandlers.updateEducation(eduId, educationData);
  }
  return realApi.updateEducation(eduId, educationData);
};

export const deleteEducation = async (eduId) => {
  if (isMockMode()) {
    return profileHandlers.deleteEducation(eduId);
  }
  return realApi.deleteEducation(eduId);
};

export const bulkUpdateEducation = async (educationData) => {
  if (isMockMode()) {
    return profileHandlers.bulkUpdateEducation(educationData);
  }
  return realApi.bulkUpdateEducation(educationData);
};

// Preferences
export const getPreferences = async () => {
  if (isMockMode()) {
    return profileHandlers.getPreferences();
  }
  return realApi.getPreferences();
};

export const updatePreferences = async (preferencesData) => {
  if (isMockMode()) {
    return profileHandlers.updatePreferences(preferencesData);
  }
  return realApi.updatePreferences(preferencesData);
};
