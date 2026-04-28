const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/:entity
router.post('/:entity', authMiddleware, async (req, res) => {
  const { entity } = req.params;
  const data = req.body;

  try {
    const id = uuidv4();
    const result = await db.query(
      'INSERT INTO records (id, entity, data, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, entity, JSON.stringify(data), req.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/:entity
router.get('/:entity', authMiddleware, async (req, res) => {
  const { entity } = req.params;

  try {
    const result = await db.query(
      'SELECT * FROM records WHERE entity = $1 AND user_id = $2 ORDER BY created_at DESC',
      [entity, req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/:entity/:id
router.put('/:entity/:id', authMiddleware, async (req, res) => {
  const { entity, id } = req.params;
  const data = req.body;

  try {
    const result = await db.query(
      'UPDATE records SET data = $1 WHERE id = $2 AND entity = $3 AND user_id = $4 RETURNING *',
      [JSON.stringify(data), id, entity, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/:entity/:id
router.delete('/:entity/:id', authMiddleware, async (req, res) => {
  const { entity, id } = req.params;

  try {
    const result = await db.query(
      'DELETE FROM records WHERE id = $1 AND entity = $2 AND user_id = $3 RETURNING id',
      [id, entity, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ deleted: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
