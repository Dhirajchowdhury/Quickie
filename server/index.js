require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pool = require('./db');
const authRoutes   = require('./routes/auth');
const configRoutes = require('./routes/config');
const recordRoutes = require('./routes/records');

const app = express();

// ── CORS ───────────────────────────────────────────────────────────────────
// Strip trailing slash so matching is always exact
const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  clientUrl,
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    // No origin = curl / Postman / server-to-server — always allow
    if (!origin) return callback(null, true);

    if (allowedOrigins.some((o) => origin.startsWith(o))) {
      return callback(null, true);
    }

    console.warn('[CORS] Blocked:', origin, '| Allowed:', allowedOrigins);
    callback(new Error(`CORS: origin "${origin}" not allowed`));
  },
  credentials: true,
}));

// ── Core middleware ────────────────────────────────────────────────────────
app.use(express.json());

// ── Smoke-test / health routes (no auth required) ─────────────────────────
app.get('/api/test', (_req, res) => {
  res.json({
    message: 'Backend is working ✅',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv:         process.env.NODE_ENV || 'development',
      clientUrl:       clientUrl || '(not set)',
      googleClientId:  process.env.GOOGLE_CLIENT_ID ? '✅ set' : '❌ MISSING',
      googleSecret:    process.env.GOOGLE_CLIENT_SECRET ? '✅ set' : '❌ MISSING',
      jwtSecret:       process.env.JWT_SECRET ? '✅ set' : '❌ MISSING',
      databaseUrl:     process.env.DATABASE_URL ? '✅ set' : '❌ MISSING',
    },
  });
});

app.get('/health', async (_req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', dbTime: result.rows[0].now });
  } catch (err) {
    console.error('[DB] Health check failed:', err.message);
    res.status(500).json({ status: 'error', error: 'DB not connected' });
  }
});

// ── API routes ─────────────────────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/config', configRoutes);
app.use('/api',        recordRoutes);

// ── Global error handler ───────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Something went wrong' });
});

// ── Start ──────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT} | CLIENT_URL: ${clientUrl || '(not set)'}`));
