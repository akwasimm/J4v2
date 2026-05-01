// Skill Gap Service - abstracts skill gap analysis API calls
import { isMockMode } from './config.js';
import * as realApi from '../api/client.js';
import { skillGapHandlers } from '../mocks/handlers/index.js';

export const getRoleTemplates = async (category = null) => {
  if (isMockMode()) {
    return skillGapHandlers.getRoleTemplates(category);
  }
  return realApi.getRoleTemplates(category);
};

export const getRoleTemplate = async (roleName) => {
  if (isMockMode()) {
    return skillGapHandlers.getRoleTemplate(roleName);
  }
  return realApi.getRoleTemplate(roleName);
};

export const getLearningPaths = async (skillName = null, difficultyLevel = null) => {
  if (isMockMode()) {
    return skillGapHandlers.getLearningPaths(skillName, difficultyLevel);
  }
  return realApi.getLearningPaths(skillName, difficultyLevel);
};

export const getLearningPath = async (skillName) => {
  if (isMockMode()) {
    return skillGapHandlers.getLearningPath(skillName);
  }
  return realApi.getLearningPath(skillName);
};

// AI Skill Gap Analysis
export const analyzeSkillGap = async (targetRole, force = false) => {
  if (isMockMode()) {
    return skillGapHandlers.analyzeSkillGap(targetRole);
  }
  return realApi.analyzeSkillGap(targetRole, force);
};

export const getSkillGapHistory = async () => {
  if (isMockMode()) {
    return skillGapHandlers.getSkillGapHistory();
  }
  return realApi.getSkillGapHistory();
};

// Resume Analysis
export const getResumeAnalysis = async (resumeId = null, force = false) => {
  if (isMockMode()) {
    return skillGapHandlers.getResumeAnalysis(resumeId);
  }
  return realApi.getResumeAnalysis(resumeId, force);
};

// AI Recommendations
export const getAIRecommendations = async (force = false) => {
  if (isMockMode()) {
    return skillGapHandlers.getAIRecommendations();
  }
  return realApi.getAIRecommendations(force);
};

// Job Match
export const getJobMatch = async (jobId, force = false) => {
  if (isMockMode()) {
    return skillGapHandlers.getJobMatch(jobId);
  }
  return realApi.getJobMatch(jobId, force);
};
