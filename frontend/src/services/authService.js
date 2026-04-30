// Auth Service - abstracts authentication API calls
import { isMockMode } from './config.js';
import * as realApi from '../api/client.js';
import { authHandlers } from '../mocks/handlers/index.js';

export const login = async (email, password) => {
  if (isMockMode()) {
    return authHandlers.login(email, password);
  }
  return realApi.login(email, password);
};

export const register = async (email, password, firstName, lastName) => {
  if (isMockMode()) {
    return authHandlers.register(email, password, firstName, lastName);
  }
  return realApi.register(email, password, firstName, lastName);
};

export const fetchMe = async () => {
  if (isMockMode()) {
    return authHandlers.fetchMe();
  }
  return realApi.fetchMe();
};

export const logout = async () => {
  if (isMockMode()) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_first_name');
    localStorage.removeItem('user_avatar_url');
    localStorage.removeItem('user_resume_url');
    return authHandlers.logout();
  }
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_first_name');
  localStorage.removeItem('user_avatar_url');
  localStorage.removeItem('user_resume_url');
  return { success: true };
};
