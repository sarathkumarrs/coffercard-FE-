import axios from 'axios';

export const BASE_URL = 'http://192.168.1.4:8000/api';


export const ENDPOINTS = {
  // ... existing endpoints
  PRIZES: '/prizes/',
  CAMPAIGN_PUBLIC: '/public/campaign/' // New endpoint for public access
};

export const apiService = {
  // ... existing methods
  
  // Prize APIs
  getPrizes: async (campaignId) => {
      try {
          const response = await fetch(`${BASE_URL}${ENDPOINTS.PRIZES}?campaign=${campaignId}`, {
              headers: getHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch prizes');
          return await response.json();
      } catch (error) {
          throw error;
      }
  },

  createPrize: async (prizeData) => {
      try {
          const response = await fetch(`${BASE_URL}${ENDPOINTS.PRIZES}`, {
              method: 'POST',
              headers: getHeaders(),
              body: JSON.stringify(prizeData)
          });
          if (!response.ok) throw new Error('Failed to create prize');
          return await response.json();
      } catch (error) {
          throw error;
      }
  }
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${BASE_URL}/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
