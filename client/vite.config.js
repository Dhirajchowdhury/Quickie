import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // Dev proxy — only active during local development (npm run dev)
  // In production, API calls go to VITE_API_URL via api.js
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },

  build: {
    outDir: 'dist',       // Vercel reads this via vercel.json distDir
    emptyOutDir: true,
  },
});
