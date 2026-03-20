import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: add token and debugging logs
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Debugging: log token presence and request URL
    console.log(`[API Request] URL: ${config.url}`);
    console.log(`[Token Presence]: ${token ? '✅ Token present' : '❌ Token missing'}`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: handle token expiration and debugging
api.interceptors.response.use(
  (response) => {
    // Debugging: log successful response
    console.log(`[API Response] Success for ${response.config.url}:`, response.data);
    return response;
  },
  (error) => {
    const { response } = error;
    
    // Debugging: log API errors
    console.error(`[API Response Error] URL: ${error.config?.url}:`, response?.data || error.message);
    
    // If 401 (Unauthorized) or token expired, redirect to login
    if (response && response.status === 401) {
      console.warn('Unauthorized! Redirecting to login page.');
      
      // Clean up sensitive data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Force redirect if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
