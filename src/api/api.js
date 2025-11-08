import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://hisabkitab-backend-tjik.onrender.com/api';

console.log('API Base URL:', BASE_URL);

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 unauthorized responses
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

//
// 🧩 AUTH API (Users)
//
export const authAPI = {
  signup: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  updateParentalContact: async (contactData) => {
    const response = await api.put('/users/parental-contact', contactData);
    return response.data;
  },
};

//
// 💸 EXPENSE API
//
export const expenseAPI = {
  getExpenses: async (filters = {}) => {
    const response = await api.get('/api/expenses', { params: filters });
    return response.data;
  },

  addExpense: async (expenseData) => {
    const response = await api.post('/api/expenses/add-expense', expenseData);
    return response.data;
  },

  getInsights: async () => {
    const response = await api.get('/api/expenses/insights');
    return response.data;
  },
};

//
// 🔁 RECURRING EXPENSE API
//
export const recurringExpenseAPI = {
  getAll: async () => {
    const response = await api.get('/api/recurring-expenses');
    return response.data;
  },

  addRecurring: async (data) => {
    const response = await api.post('/api/recurring-expenses', data);
    return response.data;
  },
};

//
// 🧾 OCR API
//
export const ocrAPI = {
  uploadBill: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/api/ocr/process', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

//
// 💬 CHAT API
//
export const chatAPI = {
  sendMessage: async (message) => {
    const response = await api.post('/api/chat', { message });
    return response.data;
  },
};

export default api;

//
// 🏷️ CATEGORY API
//
export const categoryAPI = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  create: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  addCategory: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  update: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

//
// 💰 TRANSACTION API
//
export const transactionAPI = {
  getAll: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },

  getTransactions: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },

  create: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  addTransaction: async (transactionData) => {
    const response = await api.post('/transactions', transactionData);
    return response.data;
  },

  update: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  updateTransaction: async (id, transactionData) => {
    const response = await api.put(`/transactions/${id}`, transactionData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },
};
