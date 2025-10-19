import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status and token validity
  useEffect(() => {
    // Check auth status when component mounts
    const loadUser = () => {
        setLoading(true);  // Set loading true when checking
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const userData = JSON.parse(localStorage.getItem('user'));
                setUser(userData);
            } catch (error) {
                console.error('Error parsing user data:', error);
                localStorage.removeItem('access_token');
                localStorage.removeItem('user');
                setUser(null);
            }
        }
        setLoading(false);  // Set loading false after check completes
    };

    loadUser();
}, []);

  // Add axios interceptor for handling 401 errors
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Try to refresh token
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await axios.post(`${BASE_URL}/token/refresh/`, {
                refresh: refreshToken
              });
              
              localStorage.setItem('access_token', response.data.access);
              // Retry the original request
              const config = error.config;
              config.headers['Authorization'] = `Bearer ${response.data.access}`;
              return axios(config);
            } catch (refreshError) {
              // If refresh fails, logout
              handleLogout();
              return Promise.reject(refreshError);
            }
          } else {
            handleLogout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (credentials) => {
    try {
      const response = await axios.post(`${BASE_URL}/token/`, credentials);
      const { access, refresh, user: userData } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    // Use window.location instead of navigate since this is in a context provider
    window.location.href = '/login';
  };

  // Expose handleLogout as logout to components
  const logout = () => {
    handleLogout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};