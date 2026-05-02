/**
 * Dashboard Role Mapping Utility
 * Maps user's target role to appropriate dashboard profile data
 */

// Import all dashboard profile data
import profile1Frontend from "../mocks/data/dashboard-samples.json";

// Profile index mapping (0-based)
const PROFILE_INDEX = {
  FRONTEND: 0,        // Profile 1: Frontend Developer
  DATA_SCIENCE: 1,    // Profile 2: Data Scientist/ML
  DEVOPS: 2,          // Profile 3: DevOps Engineer
  PRODUCT_MANAGER: 3, // Profile 4: Product Manager
  // Note: Profile 5 is missing in original data (index 4)
  CYBERSECURITY: 5,   // Profile 6: Cybersecurity (index 5)
  UX_DESIGNER: 6,     // Profile 7: UI/UX Designer
  BACKEND: 7,         // Profile 8: Backend Engineer
  FULL_STACK: 8,      // Profile 9: Full Stack Developer
  MOBILE: 9,          // Profile 10: Mobile Developer
};

// Role to Profile mapping based on user's specification
const ROLE_TO_PROFILE_MAP = {
  // Frontend & UI
  "Frontend Developer": PROFILE_INDEX.FRONTEND,
  "UI/UX Engineer": PROFILE_INDEX.FRONTEND,
  
  // Data & ML roles
  "Data Scientist": PROFILE_INDEX.DATA_SCIENCE,
  "Data Engineer": PROFILE_INDEX.DATA_SCIENCE,
  "Data Analyst": PROFILE_INDEX.DATA_SCIENCE,
  "Machine Learning Engineer": PROFILE_INDEX.DATA_SCIENCE,
  "AI Engineer": PROFILE_INDEX.DATA_SCIENCE,
  "NLP Engineer": PROFILE_INDEX.DATA_SCIENCE,
  "Computer Vision Engineer": PROFILE_INDEX.DATA_SCIENCE,
  
  // DevOps & Infrastructure
  "DevOps Engineer": PROFILE_INDEX.DEVOPS,
  "Site Reliability Engineer": PROFILE_INDEX.DEVOPS,
  "Cloud Engineer": PROFILE_INDEX.DEVOPS,
  "Platform Engineer": PROFILE_INDEX.DEVOPS,
  
  // Product Management
  "Product Manager": PROFILE_INDEX.PRODUCT_MANAGER,
  "Technical Product Manager": PROFILE_INDEX.PRODUCT_MANAGER,
  
  // Cybersecurity
  "Cybersecurity Engineer": PROFILE_INDEX.CYBERSECURITY,
  "Security Analyst": PROFILE_INDEX.CYBERSECURITY,
  "Network Engineer": PROFILE_INDEX.CYBERSECURITY,
  "Systems Engineer": PROFILE_INDEX.CYBERSECURITY,
  
  // Design
  "UX Designer": PROFILE_INDEX.UX_DESIGNER,
  
  // Backend
  "Backend Developer": PROFILE_INDEX.BACKEND,
  
  // Full Stack
  "Full Stack Developer": PROFILE_INDEX.FULL_STACK,
  
  // Mobile
  "Mobile Developer": PROFILE_INDEX.MOBILE,
};

// Default profile for unmapped roles (Software Engineer, Senior Software Engineer, etc.)
const DEFAULT_PROFILE_INDEX = PROFILE_INDEX.FRONTEND; // Profile 1: Software Developer

/**
 * Get dashboard profile data based on target role
 * @param {string} targetRole - User's selected target role
 * @returns {Object} Dashboard profile data
 */
export function getDashboardProfileByRole(targetRole) {
  // If no target role, return default (Software Developer profile)
  if (!targetRole) {
    return {
      profileData: profile1Frontend[DEFAULT_PROFILE_INDEX],
      roleName: "Software Developer",
      profileIndex: DEFAULT_PROFILE_INDEX
    };
  }
  
  // Get profile index from mapping
  const profileIndex = ROLE_TO_PROFILE_MAP[targetRole];
  
  // If role not found in mapping, use default
  if (profileIndex === undefined) {
    return {
      profileData: profile1Frontend[DEFAULT_PROFILE_INDEX],
      roleName: "Software Developer",
      profileIndex: DEFAULT_PROFILE_INDEX
    };
  }
  
  // Return mapped profile
  return {
    profileData: profile1Frontend[profileIndex],
    roleName: targetRole,
    profileIndex: profileIndex
  };
}

/**
 * Get all available target roles for SkillGapPage
 * @returns {Array} List of available target roles
 */
export function getAvailableTargetRoles() {
  return Object.keys(ROLE_TO_PROFILE_MAP);
}

/**
 * Check if a role has a dedicated dashboard profile
 * @param {string} targetRole - Role to check
 * @returns {boolean} True if role has dedicated profile
 */
export function hasDedicatedDashboardProfile(targetRole) {
  if (!targetRole) return false;
  return ROLE_TO_PROFILE_MAP[targetRole] !== undefined;
}

/**
 * Get role display name (formatted)
 * @param {string} targetRole - Raw role name
 * @returns {string} Formatted role name
 */
export function getRoleDisplayName(targetRole) {
  if (!targetRole) return "Software Developer";
  return targetRole;
}
