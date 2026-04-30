// Mock handlers for settings endpoints
import { mockSettingsData } from '../data/settings.js';

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

let settingsStore = { ...mockSettingsData };

export const settingsHandlers = {
  getSettings: async () => {
    await delay();
    return { ...settingsStore.settings };
  },

  updateSettings: async (settingsData) => {
    await delay();
    settingsStore.settings = { ...settingsStore.settings, ...settingsData };
    return { ...settingsStore.settings };
  },

  changePassword: async (oldPassword, newPassword) => {
    await delay(400);
    if (!oldPassword || !newPassword) {
      throw new Error("Both passwords are required");
    }
    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    return { success: true, message: "Password changed successfully" };
  },

  getConnectedAccounts: async () => {
    await delay();
    return { items: [...settingsStore.connected_accounts] };
  },

  disconnectAccount: async (platform) => {
    await delay();
    const account = settingsStore.connected_accounts.find(a => a.platform === platform);
    if (account) {
      account.connected = false;
      account.email = null;
      account.connected_at = null;
    }
    return { success: true };
  },

  exportData: async () => {
    await delay(600);
    return {
      success: true,
      download_url: "#",
      message: "Your data export is ready for download"
    };
  },

  deleteAccount: async () => {
    await delay(800);
    return { success: true, message: "Account scheduled for deletion" };
  }
};
