// Mock data for authentication
export const mockAuthData = {
  login: {
    accessToken: "mock_token_12345",
    token_type: "bearer",
    first_name: "Demo",
    last_name: "User",
    email: "demo@jobfor.io"
  },
  register: {
    accessToken: "mock_token_67890",
    token_type: "bearer",
    first_name: "New",
    last_name: "User",
    email: "new@jobfor.io",
    is_new_user: true
  },
  me: {
    id: "user_001",
    email: "demo@jobfor.io",
    first_name: "Demo",
    last_name: "User",
    avatar_url: null,
    resume_url: null,
    role: "job_seeker",
    is_active: true,
    created_at: "2024-01-15T08:30:00Z"
  }
};
