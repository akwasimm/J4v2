// src/api/client.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1";

/**
 * Enhanced generic fetch wrapper.
 */
async function apiClient(endpoint, customConfig = {}) {
  const token = localStorage.getItem("auth_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const config = {
    method: "GET",
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = response.statusText;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          if (Array.isArray(errorJson.detail)) {
            // FastAPI validation error array
            errorMessage = errorJson.detail.map(err => err.msg).join(", ");
          } else {
            errorMessage = errorJson.detail;
          }
        }
      } catch (e) { }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

function persistProfileAssets(data = {}) {
  if (data.avatar_url) localStorage.setItem("user_avatar_url", data.avatar_url);
  if (data.resume_url) localStorage.setItem("user_resume_url", data.resume_url);
}

// ─── API Methods ─────────────────────────────────────────────────────────────

export async function fetchJobs(params = {}) {
  const query = new URLSearchParams();
  if (params.q) query.append("q", params.q);
  if (params.location) query.append("location", params.location);
  if (params.work_model) query.append("work_model", params.work_model);
  // NOTE: use !== undefined (not truthy check) — min_exp=0 is valid and means "Fresher only"
  if (params.min_exp !== undefined && params.min_exp !== null) query.append("min_exp", params.min_exp);
  if (params.page) query.append("page", params.page);
  if (params.page_size) query.append("page_size", params.page_size);

  return apiClient(`/jobs/search?${query.toString()}`);
}

export async function fetchJobById(jobId) {
  return apiClient(`/jobs/${jobId}`);
}

export async function applyToJob(jobId, matchScoreAtApply = null) {
  const body = { job_id: jobId };
  if (matchScoreAtApply !== null) {
    body.match_score_at_apply = matchScoreAtApply;
  }
  return apiClient("/jobs/applications", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateApplication(applicationId, updateData) {
  return apiClient(`/jobs/applications/${applicationId}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
}

export async function deleteApplication(applicationId) {
  return apiClient(`/jobs/applications/${applicationId}`, {
    method: "DELETE",
  });
}

export async function getMyApplications() {
  return apiClient("/jobs/applications/me");
}

export async function updateSavedJobNote(savedJobId, noteText) {
  return apiClient(`/jobs/saved/${savedJobId}/note`, {
    method: "PUT",
    body: JSON.stringify({ note_text: noteText }),
  });
}

// Note: fetchSalaryInsights, fetchSkillDemand, fetchCompanies are consolidated
// into getMarketInsights which uses the AI endpoint /ai/market-insights
// These are kept for backward compatibility but delegate to the unified endpoint
export async function fetchSalaryInsights(role, location = "") {
  const data = await getMarketInsights(role, location);
  // Return salary data from the unified market insights response
  return data?.data?.salary || data?.salary || null;
}

export async function fetchSkillDemand(limit = 10) {
  const data = await getMarketInsights();
  // Return skills data from the unified market insights response (limited)
  const skills = data?.data?.skills_in_demand || data?.skills_in_demand || [];
  return skills.slice(0, limit);
}

export async function fetchCompanies(limit = 20) {
  const data = await getMarketInsights();
  // Return companies data from the unified market insights response (limited)
  const companies = data?.data?.top_hiring_companies || data?.top_hiring_companies || [];
  return companies.slice(0, limit);
}

// ─── Authentication ──────────────────────────────────────────────────────────

export async function login(email, password) {
  const data = await apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  // Backend returns: { user: {...}, tokens: { access_token, refresh_token, ... } }
  if (data.tokens?.access_token) {
    localStorage.setItem("auth_token", data.tokens.access_token);
    localStorage.setItem("refresh_token", data.tokens.refresh_token);
    if (data.user?.first_name) localStorage.setItem("user_first_name", data.user.first_name);
    localStorage.setItem("is_new_user", data.user?.is_new_user ? "true" : "false");
  }
  try {
    const me = await apiClient("/auth/me");
    persistProfileAssets(me);
  } catch (e) { }
  return data;
}

export async function register(email, password, fullName, agreedToTerms = true) {
  // Backend expects: { email, password, full_name, agreed_to_terms }
  const data = await apiClient("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, full_name: fullName, agreed_to_terms: agreedToTerms }),
  });
  // Backend returns: { user: {...}, tokens: { access_token, refresh_token, ... } }
  if (data.tokens?.access_token) {
    localStorage.setItem("auth_token", data.tokens.access_token);
    localStorage.setItem("refresh_token", data.tokens.refresh_token);
    if (data.user?.first_name) localStorage.setItem("user_first_name", data.user.first_name);
    localStorage.setItem("is_new_user", data.user?.is_new_user ? "true" : "false");
  }
  try {
    const me = await apiClient("/auth/me");
    persistProfileAssets(me);
  } catch (e) { }
  return data;
}

export async function fetchMe() {
  const data = await apiClient("/auth/me");
  persistProfileAssets(data);
  return data;
}

export async function refreshToken() {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }
  const data = await apiClient("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (data.access_token) {
    localStorage.setItem("auth_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
  }
  return data;
}

function getAuthHeaders() {
  const token = localStorage.getItem("auth_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function uploadProfileImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to upload profile image";
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage = errorJson.detail;
        }
      } catch (e) { }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    persistProfileAssets(data);
    return data;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", file.name);

  try {
    const response = await fetch(`${API_BASE_URL}/profile/resume`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to upload resume";
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.detail) {
          errorMessage = errorJson.detail;
        }
      } catch (e) { }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    persistProfileAssets(data);
    return data;
  } catch (error) {
    console.error("Error uploading resume:", error);
    throw error;
  }
}

export async function getProfile() {
  try {
    const data = await apiClient("/profile/me");
    persistProfileAssets(data);
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    throw error;
  }
}

export async function updateProfile(profileData) {
  try {
    const data = await apiClient("/profile/me", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    persistProfileAssets(data);
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
}

export async function updateCompleteProfile(profileData) {
  try {
    const data = await apiClient("/profile/complete", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
    persistProfileAssets(data);
    return data;
  } catch (error) {
    console.error("Error updating complete profile:", error);
    throw error;
  }
}

export async function getSkills() {
  try {
    const data = await apiClient("/profile/skills");
    return data;
  } catch (error) {
    console.error("Error fetching skills:", error);
    throw error;
  }
}

export async function addSkill(skillData) {
  try {
    const data = await apiClient("/profile/skills", {
      method: "POST",
      body: JSON.stringify(skillData),
    });
    return data;
  } catch (error) {
    console.error("Error adding skill:", error);
    throw error;
  }
}

export async function updateSkill(skillId, skillData) {
  try {
    const data = await apiClient(`/profile/skills/${skillId}`, {
      method: "PUT",
      body: JSON.stringify(skillData),
    });
    return data;
  } catch (error) {
    console.error("Error updating skill:", error);
    throw error;
  }
}

export async function deleteSkill(skillId) {
  try {
    const data = await apiClient(`/profile/skills/${skillId}`, {
      method: "DELETE",
    });
    return data;
  } catch (error) {
    console.error("Error deleting skill:", error);
    throw error;
  }
}

export async function getExperience() {
  try {
    const data = await apiClient("/profile/experience");
    return data;
  } catch (error) {
    console.error("Error fetching experience:", error);
    throw error;
  }
}

export async function addExperience(experienceData) {
  try {
    const data = await apiClient("/profile/experience", {
      method: "POST",
      body: JSON.stringify(experienceData),
    });
    return data;
  } catch (error) {
    console.error("Error adding experience:", error);
    throw error;
  }
}

export async function updateExperience(experienceId, experienceData) {
  try {
    const data = await apiClient(`/profile/experience/${experienceId}`, {
      method: "PUT",
      body: JSON.stringify(experienceData),
    });
    return data;
  } catch (error) {
    console.error("Error updating experience:", error);
    throw error;
  }
}

export async function deleteExperience(experienceId) {
  try {
    const data = await apiClient(`/profile/experience/${experienceId}`, {
      method: "DELETE",
    });
    return data;
  } catch (error) {
    console.error("Error deleting experience:", error);
    throw error;
  }
}

// Education API functions
export async function getEducation() {
  try {
    const data = await apiClient("/profile/education");
    return data;
  } catch (error) {
    console.error("Error fetching education:", error);
    throw error;
  }
}

export async function addEducation(educationData) {
  try {
    const data = await apiClient("/profile/education", {
      method: "POST",
      body: JSON.stringify(educationData),
    });
    return data;
  } catch (error) {
    console.error("Error adding education:", error);
    throw error;
  }
}

export async function updateEducation(educationId, educationData) {
  try {
    const data = await apiClient(`/profile/education/${educationId}`, {
      method: "PUT",
      body: JSON.stringify(educationData),
    });
    return data;
  } catch (error) {
    console.error("Error updating education:", error);
    throw error;
  }
}

export async function deleteEducation(educationId) {
  try {
    const data = await apiClient(`/profile/education/${educationId}`, {
      method: "DELETE",
    });
    return data;
  } catch (error) {
    console.error("Error deleting education:", error);
    throw error;
  }
}

// Resume API functions
export async function getResumes() {
  try {
    const data = await apiClient("/profile/resumes");
    return data;
  } catch (error) {
    console.error("Error fetching resumes:", error);
    throw error;
  }
}

export async function deleteResume(resumeId) {
  try {
    const data = await apiClient(`/profile/resumes/${resumeId}`, {
      method: "DELETE",
    });
    return data;
  } catch (error) {
    console.error("Error deleting resume:", error);
    throw error;
  }
}

export async function setDefaultResume(resumeId) {
  try {
    const data = await apiClient(`/profile/resumes/${resumeId}/set-default`, {
      method: "PUT",
    });
    return data;
  } catch (error) {
    console.error("Error setting default resume:", error);
    throw error;
  }
}

// Preferences API functions
export async function getPreferences() {
  try {
    const data = await apiClient("/profile/preferences");
    return data;
  } catch (error) {
    console.error("Error fetching preferences:", error);
    throw error;
  }
}

export async function updatePreferences(preferencesData) {
  try {
    const data = await apiClient("/profile/preferences", {
      method: "PUT",
      body: JSON.stringify(preferencesData),
    });
    return data;
  } catch (error) {
    console.error("Error updating preferences:", error);
    throw error;
  }
}

// Bulk update API functions
// Note: skillsData should be { skills: [...] }
export async function bulkUpdateSkills(skillsData) {
  try {
    const data = await apiClient("/profile/skills/bulk", {
      method: "PUT",
      body: JSON.stringify(skillsData),
    });
    return data;
  } catch (error) {
    console.error("Error bulk updating skills:", error);
    throw error;
  }
}

// Note: experienceData should be { experience: [...] }
export async function bulkUpdateExperience(experienceData) {
  try {
    const data = await apiClient("/profile/experience/bulk", {
      method: "PUT",
      body: JSON.stringify(experienceData),
    });
    return data;
  } catch (error) {
    console.error("Error bulk updating experience:", error);
    throw error;
  }
}

// Note: educationData should be { education: [...] }
export async function bulkUpdateEducation(educationData) {
  try {
    const data = await apiClient("/profile/education/bulk", {
      method: "PUT",
      body: JSON.stringify(educationData),
    });
    return data;
  } catch (error) {
    console.error("Error bulk updating education:", error);
    throw error;
  }
}

// ─── Settings API functions ─────────────────────────────────────────────────────

export async function getSettings() {
  try {
    const data = await apiClient("/settings");
    return data;
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
}

export async function updateSettings(settingsData) {
  try {
    const data = await apiClient("/settings", {
      method: "PUT",
      body: JSON.stringify(settingsData),
    });
    return data;
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
}

export async function changePassword(currentPassword, newPassword) {
  try {
    const data = await apiClient("/settings/password", {
      method: "PUT",
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    return data;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
}

export async function getConnectedAccounts() {
  try {
    const data = await apiClient("/settings/connected-accounts");
    return data;
  } catch (error) {
    console.error("Error fetching connected accounts:", error);
    throw error;
  }
}

export async function disconnectAccount(platform) {
  try {
    const data = await apiClient(`/settings/connected-accounts/${platform}`, {
      method: "DELETE",
    });
    return data;
  } catch (error) {
    console.error("Error disconnecting account:", error);
    throw error;
  }
}

export async function exportData() {
  try {
    const data = await apiClient("/settings/export-data", {
      method: "POST",
    });
    return data;
  } catch (error) {
    console.error("Error exporting data:", error);
    throw error;
  }
}

export async function deleteAccount(password) {
  try {
    const data = await apiClient("/settings/account", {
      method: "DELETE",
      body: JSON.stringify({ password }),
    });
    return data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
}

// ─── Skill Gap Data ─────────────────────────────────────────────────────────────

export async function getRoleTemplates() {
  // Uses /ai/skill-gap/roles which returns { roles: [...] }
  return apiClient("/ai/skill-gap/roles");
}

// ─── AI Endpoints ────────────────────────────────────────────────────────────

export async function getJobMatch(jobId, force = false) {
  return apiClient(`/ai/match/${jobId}?force=${force}`);
}

export async function analyzeSkillGap(targetRole, force = false) {
  return apiClient(`/ai/skill-gap?force=${force}`, {
    method: "POST",
    body: JSON.stringify({ target_role: targetRole }),
  });
}

export async function getSkillGapHistory() {
  return apiClient("/ai/skill-gap/history");
}

export async function getResumeAnalysis(resumeId = null, force = false) {
  const query = resumeId ? `?resume_id=${resumeId}&force=${force}` : `?force=${force}`;
  return apiClient(`/ai/resume-analysis${query}`);
}

export async function getAIRecommendations(force = false) {
  return apiClient(`/ai/recommendations?force=${force}`);
}

export async function getMarketInsights(role = null, location = null, force = false) {
  const params = new URLSearchParams();
  if (role) params.append("role", role);
  if (location) params.append("location", location);
  params.append("force", force);
  return apiClient(`/ai/market-insights?${params.toString()}`);
}

// ─── Coach Endpoints ───────────────────────────────────────────────────────────

export async function getCoachSessions() {
  return apiClient("/coach/sessions");
}

export async function getCoachSession(sessionUuid) {
  return apiClient(`/coach/sessions/${sessionUuid}`);
}

export async function sendCoachMessage(content, sessionId = null) {
  return apiClient("/coach/chat", {
    method: "POST",
    body: JSON.stringify({ content, session_id: sessionId }),
  });
}

export async function deleteCoachSession(sessionUuid) {
  return apiClient(`/coach/sessions/${sessionUuid}`, {
    method: "DELETE",
  });
}

// ─── Opportunities Endpoints ─────────────────────────────────────────────────────

export async function getOpportunities(category = null) {
  const query = category ? `?category=${category}` : "";
  return apiClient(`/opportunities${query}`);
}

export async function refreshOpportunities(category = null) {
  const query = category ? `?category=${category}` : "";
  return apiClient(`/opportunities/refresh${query}`, {
    method: "POST",
  });
}

export async function getOpportunitiesStatus() {
  return apiClient("/opportunities/status");
}
