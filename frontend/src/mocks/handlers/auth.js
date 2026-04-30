// Mock handlers for authentication endpoints
import { mockAuthData } from '../data/auth.js';
import { mockProfileData } from '../data/profile.js';

// Simulate network delay
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

export const authHandlers = {
  login: async (email, password) => {
    await delay();
    // Simulate validation
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    if (password.length < 6) {
      throw new Error("Invalid credentials");
    }
    return { ...mockAuthData.login };
  },

  register: async (email, password, firstName, lastName) => {
    await delay();
    if (!email || !password || !firstName || !lastName) {
      throw new Error("All fields are required");
    }
    return { ...mockAuthData.register, first_name: firstName, last_name: lastName, email };
  },

  fetchMe: async () => {
    await delay(200);
    return { ...mockAuthData.me };
  },

  logout: async () => {
    await delay(100);
    return { success: true };
  }
};
