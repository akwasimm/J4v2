// Mock data for settings - matches backend schema
export const mockSettingsData = {
  settings: {
    id: "mock-settings-id",
    user_id: "mock-user-id",
    theme: "light",
    language: "English (US)",
    two_factor_enabled: false,
    email_digest_frequency: "daily",
    job_alerts_enabled: true,
    application_alerts_enabled: true,
    message_alerts_enabled: true,
    updated_at: new Date().toISOString()
  },
  connected_accounts: [
    { id: "mock-linkedin", user_id: "mock-user-id", platform: "linkedin", connected: true, connected_at: "2024-01-15T08:30:00Z", username: "demo_user" },
    { id: "mock-github", user_id: "mock-user-id", platform: "github", connected: true, connected_at: "2024-01-16T14:00:00Z", username: "demodev" },
    { id: "mock-leetcode", user_id: "mock-user-id", platform: "leetcode", connected: false, connected_at: null, username: null }
  ]
};
