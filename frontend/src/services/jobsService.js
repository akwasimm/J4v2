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
  return realApi.fetchJobById(jobId);
};

export const saveJob = async (jobId, matchScore = null) => {
  if (isMockMode()) {
    return jobsHandlers.saveJob(jobId);
  }
  // Backend expects POST /jobs/saved with body { job_id: ..., match_score: ... }
  return realApi.apiClient('/jobs/saved', {
    method: 'POST',
    body: JSON.stringify({ job_id: jobId, match_score: matchScore })
  });
};

export const unsaveJob = async (jobId) => {
  if (isMockMode()) {
    return jobsHandlers.unsaveJob(jobId);
  }
  // Backend expects DELETE /jobs/saved/{job_id}
  return realApi.apiClient(`/jobs/saved/${jobId}`, { method: 'DELETE' });
};

export const getSavedJobs = async () => {
  if (isMockMode()) {
    return jobsHandlers.getSavedJobs();
  }
  // Backend expects GET /jobs/saved/me
  return realApi.apiClient('/jobs/saved/me');
};

export const updateSavedJobNote = async (savedJobId, noteText) => {
  if (isMockMode()) {
    return jobsHandlers.updateSavedJobNote(savedJobId, noteText);
  }
  return realApi.updateSavedJobNote(savedJobId, noteText);
};

export const applyToJob = async (jobId, matchScoreAtApply = null) => {
  if (isMockMode()) {
    return jobsHandlers.applyToJob(jobId, matchScoreAtApply);
  }
  return realApi.applyToJob(jobId, matchScoreAtApply);
};

export const getMyApplications = async () => {
  if (isMockMode()) {
    return jobsHandlers.getMyApplications();
  }
  return realApi.getMyApplications();
};

export const updateApplication = async (applicationId, updateData) => {
  if (isMockMode()) {
    return jobsHandlers.updateApplication(applicationId, updateData);
  }
  return realApi.updateApplication(applicationId, updateData);
};

export const deleteApplication = async (applicationId) => {
  if (isMockMode()) {
    return jobsHandlers.deleteApplication(applicationId);
  }
  return realApi.deleteApplication(applicationId);
};
