const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const parseConfig = require('../lib/parseConfig');

const router = express.Router();

// POST /api/config — upload and save a config
router.post('/', authMiddleware, async (req, res) => {
  try {
    const parsed = parseConfig(req.body);
    // Persist config so the user can reload it later
    await db.query(
      `INSERT INTO configs (user_id, config)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET config = EXCLUDED.config`,
      [req.userId, JSON.stringify(parsed)]
    );
    res.json({ ok: true, config: parsed });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/config — retrieve saved config
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT config FROM configs WHERE user_id = $1', [req.userId]);
    if (result.rows.length === 0) return res.json({ config: null });
    res.json({ config: result.rows[0].config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
