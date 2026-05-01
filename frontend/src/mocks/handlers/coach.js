// Coach mock handlers
export const coachHandlers = {
  getCoachSessions: async () => {
    return [
      { session_uuid: 'mock-1', title: 'Career Advice', last_active: new Date().toISOString() },
      { session_uuid: 'mock-2', title: 'Interview Prep', last_active: new Date(Date.now() - 86400000).toISOString() },
    ];
  },

  getCoachSession: async (sessionUuid) => {
    return {
      session_uuid: sessionUuid,
      title: 'Mock Session',
      messages: [
        { id: 1, role: 'user', content: 'Hello!' },
        { id: 2, role: 'assistant', content: 'Hi! How can I help with your career?' },
      ],
    };
  },

  sendCoachMessage: async (content, sessionId) => {
    return {
      response: 'This is a mock response from Lume.',
      session_id: sessionId || 'mock-new-session',
    };
  },

  deleteCoachSession: async (sessionUuid) => {
    return { success: true };
  },
};
