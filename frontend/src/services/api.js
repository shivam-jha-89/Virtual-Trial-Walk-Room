import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vtwr_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vtwr_token');
    }
    return Promise.reject(error.response?.data || error);
  }
);

// --- Auth ---
export const registerUser = (payload) => api.post('/auth/register', payload);
export const loginUser = (payload) => api.post('/auth/login', payload);

// --- User ---
export const getMyProfile = () => api.get('/users/me');
export const updateMeasurements = (payload) =>
  api.put('/users/me/measurements', payload);
export const updateAvatarConfig = (payload) => api.put('/users/me/avatar', payload);
export const toggleSavedLook = (garmentId) =>
  api.post(`/users/me/saved-looks/${garmentId}`);

// --- Garments ---
export const getGarments = (params) => api.get('/garments', { params });
export const getGarmentById = (id) => api.get(`/garments/${id}`);

export default api;
