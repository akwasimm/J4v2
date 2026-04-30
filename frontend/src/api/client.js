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

export async function fetchSalaryInsights(role, location = "") {
  const query = new URLSearchParams();
  query.append("role", role);
  if (location) query.append("location", location);

  return apiClient(`/insights/salary?${query.toString()}`);
}

export async function fetchSkillDemand(limit = 10) {
  return apiClient(`/insights/skills/demand?limit=${limit}`);
}

export async function fetchCompanies(limit = 20) {
  return apiClient(`/insights/companies?limit=${limit}`);
}

// ─── Authentication ──────────────────────────────────────────────────────────

export async function login(email, password) {
  const data = await apiClient("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data.accessToken) {
    localStorage.setItem("auth_token", data.accessToken);
    if (data.first_name) localStorage.setItem("user_first_name", data.first_name);
    localStorage.setItem("is_new_user", "false");
  }
  try {
    const me = await apiClient("/auth/me");
    persistProfileAssets(me);
  } catch (e) { }
  return data;
}

export async function register(email, password, firstName, lastName) {
  const data = await apiClient("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, firstName, lastName }),
  });
  if (data.accessToken) {
    localStorage.setItem("auth_token", data.accessToken);
    if (data.first_name) localStorage.setItem("user_first_name", data.first_name);
    localStorage.setItem("is_new_user", "true");
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
export async function bulkUpdateSkills(skillsData) {
  try {
    const data = await apiClient("/profile/skills/bulk", {
      method: "PUT",
      body: JSON.stringify({ skills: skillsData }),
    });
    return data;
  } catch (error) {
    console.error("Error bulk updating skills:", error);
    throw error;
  }
}

export async function bulkUpdateExperience(experienceData) {
  try {
    const data = await apiClient("/profile/experience/bulk", {
      method: "PUT",
      body: JSON.stringify({ experience: experienceData }),
    });
    return data;
  } catch (error) {
    console.error("Error bulk updating experience:", error);
    throw error;
  }
}

export async function bulkUpdateEducation(educationData) {
  try {
    const data = await apiClient("/profile/education/bulk", {
      method: "PUT",
      body: JSON.stringify({ education: educationData }),
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

export async function changePassword(oldPassword, newPassword) {
  try {
    const data = await apiClient("/settings/password", {
      method: "PUT",
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
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

export async function deleteAccount() {
  try {
    const data = await apiClient("/settings/account", {
      method: "DELETE",
    });
    return data;
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
}

// ─── Skill Gap Data ─────────────────────────────────────────────────────────────

export async function getRoleTemplates(category = null) {
  try {
    const url = category 
      ? `/skill-gap/roles?category=${encodeURIComponent(category)}`
      : "/skill-gap/roles";
    const data = await apiClient(url);
    return data;
  } catch (error) {
    console.error("Error fetching role templates:", error);
    throw error;
  }
}

export async function getRoleTemplate(roleName) {
  try {
    const data = await apiClient(`/skill-gap/roles/${encodeURIComponent(roleName)}`);
    return data;
  } catch (error) {
    console.error("Error fetching role template:", error);
    throw error;
  }
}

export async function getLearningPaths(skillName = null, difficultyLevel = null) {
  try {
    const params = new URLSearchParams();
    if (skillName) params.append("skill_name", skillName);
    if (difficultyLevel) params.append("difficulty_level", difficultyLevel);
    
    const url = `/skill-gap/learning-paths${params.toString() ? `?${params.toString()}` : ""}`;
    const data = await apiClient(url);
    return data;
  } catch (error) {
    console.error("Error fetching learning paths:", error);
    throw error;
  }
}

export async function getLearningPath(skillName) {
  try {
    const data = await apiClient(`/skill-gap/learning-paths/${encodeURIComponent(skillName)}`);
    return data;
  } catch (error) {
    console.error("Error fetching learning path:", error);
    throw error;
  }
}
