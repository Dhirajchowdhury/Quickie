// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');

// const pool = require('./db');
// const authRoutes = require('./routes/auth');
// const configRoutes = require('./routes/config');
// const recordRoutes = require('./routes/records');

// const app = express();

// // Strip trailing slash from CLIENT_URL so origin matching is always exact
// const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');

// const allowedOrigins = [
//   'http://localhost:5173',
//   'http://localhost:4173', // vite preview
//   ...(clientUrl ? [clientUrl] : []),
// ];

// // app.use(cors({
// //   origin: (origin, callback) => {
// //     // Allow requests with no origin (curl, Postman, server-to-server)
// //     if (!origin) return callback(null, true);
// //     if (allowedOrigins.includes(origin)) return callback(null, true);
// //     console.warn(`[CORS] Blocked origin: ${origin}`);
// //     callback(new Error(`CORS: origin ${origin} not allowed`));
// //   },
// //   credentials: true,
// // }));

// app.use(cors({
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);

//     const allowedOrigins = [
//       'http://localhost:5173',
//       'http://localhost:4173',
//       process.env.CLIENT_URL,
//     ];

//     const isAllowed = allowedOrigins.some((allowed) =>
//       origin.startsWith(allowed)
//     );

//     if (isAllowed) {
//       return callback(null, true);
//     }

//     console.warn('[CORS BLOCKED]:', origin);

//     // TEMP: allow anyway to debug (remove later)
//     return callback(null, true);
//   },
//   credentials: true,
// }));

// app.use(express.json());

// // ── Health / smoke-test routes ─────────────────────────────────────────────
// app.get('/api/test', (req, res) => {
//   res.json({ message: 'Backend is working', timestamp: new Date().toISOString() });
// });

// app.get('/health', async (req, res) => {
//   try {
//     const result = await pool.query('SELECT NOW()');
//     res.json({ status: 'ok', dbTime: result.rows[0].now });
//   } catch (err) {
//     res.status(500).json({ status: 'error', error: 'DB not connected' });
//   }
// });

// // ── API routes ─────────────────────────────────────────────────────────────
// app.use('/api/auth', authRoutes);
// app.use('/api/config', configRoutes);
// app.use('/api', recordRoutes);

// // ── Global error handler ───────────────────────────────────────────────────
// app.use((err, req, res, next) => {
//   console.error('[Server Error]', err.message);
//   res.status(500).json({ error: 'Something went wrong' });
// });

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pool = require('./db');
const authRoutes = require('./routes/auth');
const configRoutes = require('./routes/config');
const recordRoutes = require('./routes/records');

const app = express();

// ✅ Clean CLIENT_URL (no trailing slash)
const clientUrl = (process.env.CLIENT_URL || '').replace(/\/$/, '');

// ✅ Allowed origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  clientUrl,
].filter(Boolean);

// ✅ CORS FIX (robust + safe)
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow Postman / server requests

    const isAllowed = allowedOrigins.some((allowed) =>
      origin.startsWith(allowed)
    );

    if (isAllowed) {
      return callback(null, true);
    }

    console.warn('[CORS BLOCKED]:', origin);
    return callback(new Error('Not allowed by CORS')); // ❗ block in production
  },
  credentials: true,
}));

// ✅ Middleware
app.use(express.json());

// ─────────────────────────────────────────────
// ✅ Health / Test routes (PUBLIC)
// ─────────────────────────────────────────────
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      dbTime: result.rows[0].now,
    });
  } catch (err) {
    console.error('[DB ERROR]:', err.message);
    res.status(500).json({
      status: 'error',
      error: 'DB not connected',
    });
  }
});

// ─────────────────────────────────────────────
// ✅ API routes
// ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);   // 🔓 must be PUBLIC
app.use('/api/config', configRoutes);
app.use('/api', recordRoutes);

// ─────────────────────────────────────────────
// ✅ Global error handler (improved)
// ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]:', err.stack);

  res.status(err.status || 500).json({
    error: err.message || 'Something went wrong',
  });
});

// ─────────────────────────────────────────────
// ✅ Start server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});