// API Configuration
// Set VITE_API_MODE to 'mock' for mock data, 'real' for actual API calls
export const API_MODE = import.meta.env.VITE_API_MODE || 'mock';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export const isMockMode = () => API_MODE === 'mock';
export const isRealMode = () => API_MODE === 'real';
