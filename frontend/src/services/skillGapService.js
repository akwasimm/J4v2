// Skill Gap Service - abstracts skill gap analysis API calls
import { isMockMode } from './config.js';
import * as realApi from '../api/client.js';
import { skillGapHandlers } from '../mocks/handlers/index.js';

// Get available roles for skill gap analysis
export const getRoleTemplates = async () => {
  if (isMockMode()) {
    return skillGapHandlers.getRoleTemplates();
  }
  return realApi.getRoleTemplates();
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
