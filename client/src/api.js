import axios from 'axios';

// In production (Vercel), set VITE_API_URL to your backend URL, e.g.:
//   https://quickie-server.onrender.com
// In development, leave it unset — Vite's dev proxy handles /api → localhost:4000
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const api = axios.create({ baseURL });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
