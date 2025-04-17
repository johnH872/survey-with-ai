import apiClient from './api-client';

const ENDPOINTS = {
  GOOGLE_AUTH: '/auth/google/token',
  CURRENT_USER: '/auth/me',
} as const;

export const authApi = {
  googleAuth: async (token: string) => {
    return apiClient.post(ENDPOINTS.GOOGLE_AUTH, { credential: token });
  },
  
  getCurrentUser: async () => {
    return apiClient.get(ENDPOINTS.CURRENT_USER);
  },
}; 