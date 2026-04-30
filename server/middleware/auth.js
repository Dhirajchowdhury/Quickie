const jwt = require('jsonwebtoken');

/**
 * Auth middleware — verifies JWT and attaches userId to the request.
 *
 * Sets req.userId (string UUID) on success.
 * Rejects with 401 if token is missing, invalid, or contains no userId claim.
 */
module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // Guard: token must contain a userId claim — never trust a token without one
  if (!decoded.userId) {
    return res.status(401).json({ error: 'Token is missing userId claim' });
  }

  req.userId = decoded.userId;
  next();
};
