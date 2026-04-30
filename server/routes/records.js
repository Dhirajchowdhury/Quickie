const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const validateRecord = require('../lib/validateRecord');
const { normalizeName } = require('../lib/resolveEntities');

const router = express.Router();

/**
 * Pull field definitions from the user's saved config for validation.
 * Uses normalizeName so "Users" matches entity named "users".
 */
async function getFields(userId, entity) {
  const result = await db.query('SELECT config FROM configs WHERE user_id = $1', [userId]);
  if (!result.rows.length) return null;

  const entities = result.rows[0].config?.entities ?? [];
  const key = normalizeName(entity);
  const ent = entities.find((e) => normalizeName(e.name) === key);
  return ent ? ent.fields : null;
}

/**
 * Check record ownership without exposing whether the record exists at all.
 * Returns: 'ok' | 'not_found' | 'forbidden'
 */
async function checkOwnership(id, entity, userId) {
  const result = await db.query(
    'SELECT user_id FROM records WHERE id = $1 AND entity = $2',
    [id, entity]
  );
  if (!result.rows.length) return 'not_found';
  if (result.rows[0].user_id !== userId) return 'forbidden';
  return 'ok';
}

// ── POST /api/:entity — create ─────────────────────────────────────────────
// userId comes from the verified JWT — never from req.body
router.post('/:entity', authMiddleware, async (req, res) => {
  const { entity } = req.params;
  const data = req.body;

  try {
    const fields = await getFields(req.userId, entity);
    if (!fields) return res.status(400).json({ error: `Unknown entity "${entity}"` });

    const errors = validateRecord(fields, data);
    if (errors.length) return res.status(422).json({ errors });

    const id = uuidv4();
    const result = await db.query(
      `INSERT INTO records (id, entity, data, user_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, entity, JSON.stringify(data), req.userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/:entity — list (scoped to user + entity) ─────────────────────
router.get('/:entity', authMiddleware, async (req, res) => {
  const { entity } = req.params;
  const { search } = req.query;

  try {
    let query, params;

    if (search) {
      query = `SELECT * FROM records
               WHERE entity = $1 AND user_id = $2 AND data::text ILIKE $3
               ORDER BY created_at DESC`;
      params = [entity, req.userId, `%${search}%`];
    } else {
      query = `SELECT * FROM records
               WHERE entity = $1 AND user_id = $2
               ORDER BY created_at DESC`;
      params = [entity, req.userId];
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/:entity/:id — update (ownership enforced) ────────────────────
router.put('/:entity/:id', authMiddleware, async (req, res) => {
  const { entity, id } = req.params;
  const data = req.body;

  try {
    // Ownership check before touching data
    const ownership = await checkOwnership(id, entity, req.userId);
    if (ownership === 'not_found') return res.status(404).json({ error: 'Record not found' });
    if (ownership === 'forbidden')  return res.status(403).json({ error: 'Access denied' });

    const fields = await getFields(req.userId, entity);
    if (!fields) return res.status(400).json({ error: `Unknown entity "${entity}"` });

    const errors = validateRecord(fields, data);
    if (errors.length) return res.status(422).json({ errors });

    const result = await db.query(
      `UPDATE records SET data = $1
       WHERE id = $2 AND entity = $3 AND user_id = $4
       RETURNING *`,
      [JSON.stringify(data), id, entity, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── DELETE /api/:entity/:id — delete (ownership enforced) ─────────────────
router.delete('/:entity/:id', authMiddleware, async (req, res) => {
  const { entity, id } = req.params;

  try {
    // Ownership check before deleting
    const ownership = await checkOwnership(id, entity, req.userId);
    if (ownership === 'not_found') return res.status(404).json({ error: 'Record not found' });
    if (ownership === 'forbidden')  return res.status(403).json({ error: 'Access denied' });

    const result = await db.query(
      `DELETE FROM records
       WHERE id = $1 AND entity = $2 AND user_id = $3
       RETURNING id`,
      [id, entity, req.userId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Record not found' });
    res.json({ deleted: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
