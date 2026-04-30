// Mock data for settings
export const mockSettingsData = {
  settings: {
    theme: "system",
    language: "en",
    timezone: "America/Los_Angeles",
    date_format: "MM/DD/YYYY",
    email_notifications: true,
    push_notifications: false,
    marketing_emails: false,
    profile_visibility: "public",
    show_salary_expectations: false
  },
  connected_accounts: [
    { platform: "google", connected: true, email: "demo@jobfor.io", connected_at: "2024-01-15T08:30:00Z" },
    { platform: "linkedin", connected: false, email: null, connected_at: null },
    { platform: "github", connected: true, email: "demouser@github.com", connected_at: "2024-01-16T14:00:00Z" }
  ]
};
