// Mock handlers for job endpoints
import { mockJobsData } from '../data/jobs.js';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const jobsHandlers = {
  fetchJobs: async (params = {}) => {
    await delay();
    let jobs = [...mockJobsData.jobs];

    // Apply search filter
    if (params.q) {
      const query = params.q.toLowerCase();
      jobs = jobs.filter(job =>
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query)
      );
    }

    // Apply location filter
    if (params.location) {
      const loc = params.location.toLowerCase();
      jobs = jobs.filter(job =>
        job.location.toLowerCase().includes(loc)
      );
    }

    // Apply work model filter
    if (params.work_model) {
      jobs = jobs.filter(job => job.work_model === params.work_model);
    }

    // Apply experience filter
    if (params.min_exp !== undefined && params.min_exp !== null) {
      // Simple mock: filter by salary as proxy for experience
      const minSalary = 80000 + (params.min_exp * 10000);
      jobs = jobs.filter(job => job.salary_min >= minSalary);
    }

    // Pagination
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      items: jobs.slice(start, end),
      total: jobs.length,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(jobs.length / pageSize)
    };
  },

  fetchJobById: async (jobId) => {
    await delay(200);
    const job = mockJobsData.jobs.find(j => j.id === jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    return { ...job };
  },

  saveJob: async (jobId) => {
    await delay(200);
    return { success: true, job_id: jobId, saved: true };
  },

  unsaveJob: async (jobId) => {
    await delay(200);
    return { success: true, job_id: jobId, saved: false };
  },

  getSavedJobs: async () => {
    await delay();
    return {
      items: mockJobsData.jobs.slice(0, 2),
      total: 2
    };
  }
};
