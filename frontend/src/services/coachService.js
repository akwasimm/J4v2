// Coach Service - abstracts coach/chat API calls
import { isMockMode } from './config.js';
import * as realApi from '../api/client.js';
import { coachHandlers } from '../mocks/handlers/index.js';

export const getCoachSessions = async () => {
  if (isMockMode()) {
    return coachHandlers.getCoachSessions();
  }
  return realApi.getCoachSessions();
};

export const getCoachSession = async (sessionUuid) => {
  if (isMockMode()) {
    return coachHandlers.getCoachSession(sessionUuid);
  }
  return realApi.getCoachSession(sessionUuid);
};

export const sendCoachMessage = async (content, sessionId = null) => {
  if (isMockMode()) {
    return coachHandlers.sendCoachMessage(content, sessionId);
  }
  return realApi.sendCoachMessage(content, sessionId);
};

export const deleteCoachSession = async (sessionUuid) => {
  if (isMockMode()) {
    return coachHandlers.deleteCoachSession(sessionUuid);
  }
  return realApi.deleteCoachSession(sessionUuid);
};
