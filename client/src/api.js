import axios from 'axios';

// VITE_API_URL must be set in Vercel environment variables to your Render backend URL.
// Example: https://quickie-server.onrender.com
//
// In local dev, leave VITE_API_URL unset — Vite's dev proxy rewrites /api → localhost:4000.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

console.log('[API] baseURL:', baseURL);

const api = axios.create({ baseURL });

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log every response error so failures are visible in the browser console
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error(
      '[API Error]',
      err.config?.method?.toUpperCase(),
      err.config?.url,
      '→',
      err.response?.status,
      err.response?.data || err.message
    );
    return Promise.reject(err);
  }
);

export default api;
