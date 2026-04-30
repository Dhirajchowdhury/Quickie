const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
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

  console.log('[Signup] Attempt:', email);

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const id   = uuidv4();
    await db.query(
      'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
      [id, email, hash]
    );

    console.log('[Signup] ✅ Created user:', email);
    res.json({ token: signToken(id) });
  } catch (err) {
    console.error('[Signup] ❌ Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/login ───────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log('[Login] Attempt:', email);

  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  try {
    const result = await db.query(
      'SELECT id, password_hash FROM users WHERE email = $1', [email]
    );

    if (!result.rows.length) {
      console.warn('[Login] ❌ User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user  = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      console.warn('[Login] ❌ Wrong password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('[Login] ✅ Success:', email);
    res.json({ token: signToken(user.id) });
  } catch (err) {
    console.error('[Login] ❌ Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/auth/google ──────────────────────────────────────────────────
// Frontend sends { code } — the authorization code from useGoogleLogin popup.
// Backend exchanges it for tokens, verifies the ID token, finds/creates user.
router.post('/google', async (req, res) => {
  const { code } = req.body;

  console.log('[Google Auth] Received code:', code ? '✅ present' : '❌ missing');

  if (!code)
    return res.status(400).json({ error: 'Authorization code is required' });

  // Validate required env vars before attempting anything
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('[Google Auth] ❌ GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set in env');
    return res.status(500).json({ error: 'Google auth is not configured on the server' });
  }

  // Fresh client per request — redirect_uri must be "postmessage" for popup flow
  const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'postmessage'
  );

  // Step 1 — exchange authorization code for tokens
  let tokens;
  try {
    const response = await client.getToken(code);
    tokens = response.tokens;
    console.log('[Google Auth] Token exchange ✅');
  } catch (err) {
    console.error('[Google Auth] Token exchange ❌:', err.message);
    return res.status(400).json({ error: 'Failed to exchange Google authorization code' });
  }

  // Step 2 — verify ID token and extract user info
  let email, name;
  try {
    const ticket  = await client.verifyIdToken({
      idToken:  tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    email = payload.email;
    name  = payload.name || email.split('@')[0];
    console.log('[Google Auth] Token verified ✅ for:', email);
  } catch (err) {
    console.error('[Google Auth] Token verification ❌:', err.message);
    return res.status(401).json({ error: 'Google token verification failed' });
  }

  if (!email)
    return res.status(400).json({ error: 'No email returned from Google' });

  // Step 3 — find or create user
  try {
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);

    let userId;
    if (existing.rows.length > 0) {
      userId = existing.rows[0].id;
      console.log('[Google Auth] Existing user found:', email);
    } else {
      userId = uuidv4();
      await db.query(
        'INSERT INTO users (id, email, password_hash) VALUES ($1, $2, $3)',
        [userId, email, ''] // no password — Google-only account
      );
      console.log('[Google Auth] New user created:', email);
    }

    console.log('[Google Auth] ✅ Login success:', email);
    res.json({ token: signToken(userId), user: { email, name } });
  } catch (err) {
    console.error('[Google Auth] DB error ❌:', err.message);
    res.status(500).json({ error: 'Server error during Google sign-in' });
  }
});

module.exports = router;
