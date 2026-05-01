/**
 * Feature flags for JobFor
 * true = page is active and connected to real backend
 * false = page shows placeholder (code preserved, not deleted)
 *
 * To reactivate a page: change its flag to true
 */
export const FEATURES = {
  // Auth pages - always active
  login: true,
  register: true,
  onboarding: true,
  uploadResume: true,

  // Profile - active
  profile: true,

  // To be activated one by one
  jobDiscovery: false,
  jobDetail: false,
  aiRecommendations: true,
  skillGap: true,
  resumeAnalyzer: false,
  careerCoach: true,
  appliedJobs: false,
  savedJobs: false,
  marketInsights: false,
  opportunities: false,
  settings: true,
  dashboard: false,
}
