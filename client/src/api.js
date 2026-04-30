import axios from 'axios';

// VITE_API_URL must be set as an environment variable in Vercel dashboard.
// Value: your Render backend URL, e.g. https://quickie-server.onrender.com
// (No trailing slash)
//
// In local dev, leave VITE_API_URL unset — Vite's proxy rewrites /api → localhost:4000.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

console.log('[API] baseURL:', baseURL);

const api = axios.create({ baseURL });

// Attach JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log every error response — visible in browser DevTools → Console
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const method  = err.config?.method?.toUpperCase() ?? '?';
    const url     = err.config?.url ?? '?';
    const status  = err.response?.status ?? 'NO_RESPONSE';
    const data    = err.response?.data ?? err.message;

    console.error(`[API Error] ${method} ${url} → ${status}`, data);
    return Promise.reject(err);
  }
);

export default api;
