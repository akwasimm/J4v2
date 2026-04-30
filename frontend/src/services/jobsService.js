// Jobs Service - abstracts jobs API calls
import { isMockMode } from './config.js';
import * as realApi from '../api/client.js';
import { jobsHandlers } from '../mocks/handlers/index.js';

export const fetchJobs = async (params = {}) => {
  if (isMockMode()) {
    return jobsHandlers.fetchJobs(params);
  }
  return realApi.fetchJobs(params);
};

export const fetchJobById = async (jobId) => {
  if (isMockMode()) {
    return jobsHandlers.fetchJobById(jobId);
  }
  // Assuming real API has this function or we construct it
  return realApi.apiClient ? realApi.apiClient(`/jobs/${jobId}`) : null;
};

export const saveJob = async (jobId) => {
  if (isMockMode()) {
    return jobsHandlers.saveJob(jobId);
  }
  return realApi.apiClient(`/jobs/${jobId}/save`, { method: 'POST' });
};

export const unsaveJob = async (jobId) => {
  if (isMockMode()) {
    return jobsHandlers.unsaveJob(jobId);
  }
  return realApi.apiClient(`/jobs/${jobId}/save`, { method: 'DELETE' });
};

export const getSavedJobs = async () => {
  if (isMockMode()) {
    return jobsHandlers.getSavedJobs();
  }
  return realApi.apiClient('/jobs/saved');
};
