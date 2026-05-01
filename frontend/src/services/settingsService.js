// Settings Service - abstracts settings API calls
import { isMockMode } from './config.js';
import * as realApi from '../api/client.js';
import { settingsHandlers } from '../mocks/handlers/index.js';

export const getSettings = async () => {
  if (isMockMode()) {
    return settingsHandlers.getSettings();
  }
  return realApi.getSettings();
};

export const updateSettings = async (settingsData) => {
  if (isMockMode()) {
    return settingsHandlers.updateSettings(settingsData);
  }
  return realApi.updateSettings(settingsData);
};

export const changePassword = async (oldPassword, newPassword) => {
  if (isMockMode()) {
    return settingsHandlers.changePassword(oldPassword, newPassword);
  }
  return realApi.changePassword(oldPassword, newPassword);
};

export const getConnectedAccounts = async () => {
  if (isMockMode()) {
    return settingsHandlers.getConnectedAccounts();
  }
  return realApi.getConnectedAccounts();
};

export const disconnectAccount = async (platform) => {
  if (isMockMode()) {
    return settingsHandlers.disconnectAccount(platform);
  }
  return realApi.disconnectAccount(platform);
};

export const exportData = async () => {
  if (isMockMode()) {
    return settingsHandlers.exportData();
  }
  return realApi.exportData();
};

export const deleteAccount = async (password) => {
  if (isMockMode()) {
    return settingsHandlers.deleteAccount(password);
  }
  return realApi.deleteAccount(password);
};
