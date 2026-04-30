// Mock handlers for insights endpoints
import { mockInsightsData } from '../data/insights.js';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const insightsHandlers = {
  fetchSalaryInsights: async (role, location = "") => {
    await delay(400);
    return {
      ...mockInsightsData.salary,
      role: role || mockInsightsData.salary.role,
      location: location || mockInsightsData.salary.location
    };
  },

  fetchSkillDemand: async (limit = 10) => {
    await delay();
    return {
      items: mockInsightsData.skills_demand.slice(0, limit),
      total: mockInsightsData.skills_demand.length
    };
  },

  fetchCompanies: async (limit = 20) => {
    await delay();
    return {
      items: mockInsightsData.companies.slice(0, limit),
      total: mockInsightsData.companies.length
    };
  }
};
