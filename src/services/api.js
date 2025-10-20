import axios from 'axios';

export const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://192.168.1.4:8000/api';

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers = [];

// Subscribe to token refresh completion
const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

// Notify all subscribers when token is refreshed
const onRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Custom fetch wrapper with automatic token refresh
export const fetchWithAuth = async (url, options = {}) => {
  // Add Authorization header if token exists
  const token = localStorage.getItem('access_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    let response = await fetch(url, config);

    // If we get a 401, try to refresh the token
    if (response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        // No refresh token, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        throw new Error('No refresh token available');
      }

      // If already refreshing, wait for it to complete
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            // Retry with new token
            config.headers.Authorization = `Bearer ${newToken}`;
            resolve(fetch(url, config));
          });
        });
      }

      isRefreshing = true;

      try {
        // Attempt to refresh the token
        const refreshResponse = await fetch(`${BASE_URL}/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await refreshResponse.json();
        const newAccessToken = data.access;

        // Save new token
        localStorage.setItem('access_token', newAccessToken);

        // Notify all waiting requests
        onRefreshed(newAccessToken);
        isRefreshing = false;

        // Retry original request with new token
        config.headers.Authorization = `Bearer ${newAccessToken}`;
        response = await fetch(url, config);
      } catch (refreshError) {
        isRefreshing = false;
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw refreshError;
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};


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
