import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pk_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(r => r, (error) => {
  if (error.response?.status === 401) { localStorage.clear(); window.location.href = '/login'; }
  return Promise.reject(error);
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
};

export const adminAPI = {
  dashboard: () => api.get('/admin/dashboard'),
  properties: (params) => api.get('/admin/properties', { params }),
  propertiesCount: (params) => api.get('/admin/properties/count', { params }),
  approveProperty: (id) => api.put(`/admin/properties/${id}/approve`),
  rejectProperty: (id, reason) => api.put(`/admin/properties/${id}/reject`, { reason }),
  deleteProperty: (id, reason) => api.delete(`/admin/properties/${id}`, { params: { reason } }),
  users: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/status`),
  toggleAdmin: (id) => api.put(`/admin/users/${id}/toggle-admin`),
  broadcast: (data) => api.post('/admin/notifications/broadcast', data),
  generateAI: (data) => api.post('/admin/notifications/generate', data),
};

export const propertyTypeAPI = {
  list: (params) => api.get('/property-types', { params: { ...params, include_inactive: true } }),
  create: (data) => api.post('/property-types', data),
  update: (id, data) => api.put(`/property-types/${id}`, data),
  delete: (id) => api.delete(`/property-types/${id}`),
};

export const amenityAPI = {
  list: (params) => api.get('/amenities', { params: { ...params, include_inactive: true } }),
  create: (data) => api.post('/amenities', data),
  update: (id, data) => api.put(`/amenities/${id}`, data),
  delete: (id) => api.delete(`/amenities/${id}`),
};

export default api;
