import axios from 'axios';

const BASE_URL = 'https://hisabkitab-backend-tjik.onrender.com';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// AUTH API
export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/api/auth/signup', userData);
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
  
  getUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  }
};

// CATEGORY API
export const categoryAPI = {
  getCategories: async () => {
    const response = await api.get('/api/categories');
    return response.data;
  },
  
  addCategory: async (categoryData) => {
    const response = await api.post('/api/categories', categoryData);
    return response.data;
  },
  
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/api/categories/${id}`, categoryData);
    return response.data;
  },
  
  deleteCategory: async (id) => {
    const response = await api.delete(`/api/categories/${id}`);
    return response.data;
  }
};

// TRANSACTION API
export const transactionAPI = {
  getTransactions: async () => {
    const response = await api.get('/api/transactions');
    return response.data;
  },
  
  addTransaction: async (transactionData) => {
    const response = await api.post('/api/transactions', transactionData);
    return response.data;
  },
  
  updateTransaction: async (id, transactionData) => {
    const response = await api.put(`/api/transactions/${id}`, transactionData);
    return response.data;
  },
  
  deleteTransaction: async (id) => {
    const response = await api.delete(`/api/transactions/${id}`);
    return response.data;
  }
};

// SETTINGS API
export const settingsAPI = {
  getSettings: async (userId) => {
    const response = await api.get(`/api/users/${userId}/settings`);
    return response.data;
  },
  
  updateSettings: async (userId, settings) => {
    const response = await api.put(`/api/users/${userId}/settings`, settings);
    return response.data;
  }
};

export default api;