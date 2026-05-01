// Insights Service - abstracts insights API calls
import { isMockMode } from './config.js';
import * as realApi from '../api/client.js';
import { insightsHandlers } from '../mocks/handlers/index.js';

export const fetchSalaryInsights = async (role, location = '') => {
  if (isMockMode()) {
    return insightsHandlers.fetchSalaryInsights(role, location);
  }
  return realApi.fetchSalaryInsights(role, location);
};

export const fetchSkillDemand = async (limit = 10) => {
  if (isMockMode()) {
    return insightsHandlers.fetchSkillDemand(limit);
  }
  return realApi.fetchSkillDemand(limit);
};

export const fetchCompanies = async (limit = 20) => {
  if (isMockMode()) {
    return insightsHandlers.fetchCompanies(limit);
  }
  return realApi.fetchCompanies(limit);
};

// Unified market insights from AI endpoint
export const getMarketInsights = async (role = null, location = null, force = false) => {
  if (isMockMode()) {
    return insightsHandlers.getMarketInsights(role, location);
  }
  return realApi.getMarketInsights(role, location, force);
};

// NEW: Database-powered market insights (reads from pre-populated market_data table)
export const fetchMarketInsightsDB = async (role, location, showInr = false) => {
  if (isMockMode()) {
    // Fallback to mock data in mock mode
    return insightsHandlers.getMarketInsights(role, location);
  }
  // Use the new database endpoint (fast, no AI API calls)
  return realApi.apiClient(`/market/market-insights-db?role=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}&show_inr=${showInr}`);
};

// Get supported currencies
export const fetchSupportedCurrencies = async () => {
  return realApi.apiClient('/ai/market-insights/currencies');
};
