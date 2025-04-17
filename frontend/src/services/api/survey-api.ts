import apiClient from './api-client';

const ENDPOINTS = {
  SURVEYS: '/surveys',
} as const;

export const surveyApi = {
  getAll: async () => {
    return apiClient.get(ENDPOINTS.SURVEYS);
  },
  
  getById: async (id: string) => {
    return apiClient.get(`${ENDPOINTS.SURVEYS}/${id}`);
  },
  
  create: async (data: any) => {
    return apiClient.post(ENDPOINTS.SURVEYS, data);
  },
  
  update: async (id: string, data: any) => {
    return apiClient.patch(`${ENDPOINTS.SURVEYS}/${id}`, data);
  },
  
  delete: async (id: string) => {
    return apiClient.delete(`${ENDPOINTS.SURVEYS}/${id}`);
  },

  getReport: async (id: string) => {
    return apiClient.get(`${ENDPOINTS.SURVEYS}/${id}/report`);
  },

  getAnalyticsReport: async (surveyIds: string[]) => {
    return apiClient.get(`${ENDPOINTS.SURVEYS}/analytics/report`, {
      params: {
        surveyIds: surveyIds.join(',')
      }
    });
  }
}; 