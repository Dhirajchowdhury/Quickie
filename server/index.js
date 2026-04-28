// require('dotenv').config();
// const express = require('express');
// const cors = require('cors');

// const authRoutes = require('./routes/auth');
// const configRoutes = require('./routes/config');
// const recordRoutes = require('./routes/records');

// const app = express();

// app.use(cors());
// app.use(express.json());

// app.use('/api/auth', authRoutes);
// app.use('/api/config', configRoutes);
// app.use('/api', recordRoutes);

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const pool = require('./db'); // 👈 IMPORTANT (connect DB)

const authRoutes = require('./routes/auth');
const configRoutes = require('./routes/config');
const recordRoutes = require('./routes/records');

const app = express();

app.use(cors());
app.use(express.json());

/* 🔍 Health check route */
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'Server running',
      dbTime: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({ error: 'DB not connected' });
  }
});

/* 🚀 Routes */
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api', recordRoutes);

/* ❌ Global error handler */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});