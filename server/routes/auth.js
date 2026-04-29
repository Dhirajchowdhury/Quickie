const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');
const db = require('../db');

const router = express.Router();

/** Issue a signed JWT for a given user id */
function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// ── POST /api/auth/signup ──────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await db.query(
      'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
      [id, email, hash]
    );
    res.json({ token: signToken(id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    const result = await db.query(
      'SELECT id, password_hash FROM users WHERE email = $1', [email]
    );
    if (!result.rows.length)
      return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ token: signToken(user.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/google ──────────────────────────────────────────────────
// Receives { code } — the authorization code from useGoogleLogin popup flow.
// Exchanges it for tokens, verifies the ID token, then finds or creates user.
router.post('/google', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is required' });
  }

  // Build a fresh client per request — avoids credential bleed between requests
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage' // required redirect_uri for the popup / auth-code flow
  );

  // Step 1: exchange authorization code for tokens
  let tokens;
  try {
    const response = await client.getToken(code);
    tokens = response.tokens;
  } catch (err) {
    console.error('[Google Auth] Token exchange failed:', err.message);
    return res.status(400).json({ error: 'Failed to exchange Google authorization code' });
  }

  // Step 2: verify the ID token and extract user info
  let email, name;
  try {
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    email = payload.email;
    name  = payload.name || email.split('@')[0]; // fallback if name not provided
  } catch (err) {
    console.error('[Google Auth] ID token verification failed:', err.message);
    return res.status(401).json({ error: 'Google token verification failed' });
  }

  if (!email) {
    return res.status(400).json({ error: 'No email returned from Google' });
  }

  // Step 3: find or create user
  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);

    let userId;
    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
    } else {
      userId = uuidv4();
      await db.query(
        'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
        [userId, email, ''] // empty hash — Google users have no password
      );
    }

    console.log(`[Google Auth] ✅ Login success for ${email}`);
    res.json({ token: signToken(userId), user: { email, name } });
  } catch (err) {
    console.error('[Google Auth] DB error:', err.message);
    res.status(500).json({ error: 'Server error during Google sign-in' });
  }
});

module.exports = router;
