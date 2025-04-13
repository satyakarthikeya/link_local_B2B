import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Business registration function
const businessRegister = async (userData) => {
  try {
    const response = await api.post('/auth/business/register', userData);
    return response.data;
  } catch (error) {
    throw {
      message: error.response?.data?.message || 'Registration failed',
      status: error.response?.status,
      data: error.response?.data
    };
  }
};

// Correctly attach the function to the api object
api.businessRegister = businessRegister;

// Export the function directly for standalone use
export { businessRegister };

// Export the api object as default with attached methods
export default api;