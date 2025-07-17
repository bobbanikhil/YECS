import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const apiService = {
  // User endpoints
  createUser: (userData) => api.post('/api/users', userData),

  // Business profile endpoints
  createBusinessProfile: (userId, businessData) =>
    api.post(`/api/users/${userId}/business-profile`, businessData),

  // Financial data endpoints
  createFinancialData: (userId, financialData) =>
    api.post(`/api/users/${userId}/financial-data`, financialData),

  // Score calculation endpoints
  calculateScore: (userId) =>
    api.post(`/api/users/${userId}/calculate-score`),

  getUserScores: (userId) =>
    api.get(`/api/users/${userId}/scores`),

  // Analytics endpoints
  getScoreDistribution: () =>
    api.get('/api/score-distribution'),

  analyzeBias: () =>
    api.post('/api/bias-analysis'),

  // Health check
  healthCheck: () =>
    api.get('/'),
};

export default api;