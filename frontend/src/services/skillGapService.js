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
