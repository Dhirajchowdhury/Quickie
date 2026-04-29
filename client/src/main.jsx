import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import './index.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Fail loudly at startup — never pass an empty clientId to GoogleOAuthProvider
if (!GOOGLE_CLIENT_ID) {
  console.error(
    '[Quickie] ❌ VITE_GOOGLE_CLIENT_ID is not set.\n' +
    '  1. Open client/.env\n' +
    '  2. Add: VITE_GOOGLE_CLIENT_ID=<your-client-id>\n' +
    '  3. Restart the dev server (Vite does not hot-reload .env changes).'
  );
}

console.log('[Quickie] Google Client ID loaded:', GOOGLE_CLIENT_ID ? '✅ present' : '❌ MISSING');

ReactDOM.createRoot(document.getElementById('root')).render(
  // If clientId is missing we still render the app so email/password auth works.
  // The Google button will show a config-error message instead of attempting login.
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || 'MISSING'}>
    <App />
  </GoogleOAuthProvider>
);
