import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const authAPI = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  updatePassword: (password) => api.put('/auth/password', { password }),
};


export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  createUser: (userData) => api.post('/admin/users', userData),
  getUsers: (filters = {}) => api.get('/admin/users', { params: filters }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  createStore: (storeData) => api.post('/admin/stores', storeData),
  getStores: (filters = {}) => api.get('/admin/stores', { params: filters }),
};


export const storeAPI = {
  getStores: (filters = {}) => api.get('/stores', { params: filters }),
  submitRating: (storeId, rating) => api.post(`/stores/${storeId}/rating`, { value: rating }),
};


export const ownerAPI = {
  getDashboard: () => api.get('/owner/dashboard'),
};

export default api;
