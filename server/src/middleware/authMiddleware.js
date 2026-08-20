// JWT Authentication & Verification Middleware
// Verifies Bearer JWT tokens in Authorization headers to protect backend API routes
import jwt from 'jsonwebtoken';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract Bearer token

  if (!token) {
    const error = new Error('Access token required');
    error.statusCode = 401;
    error.code = 'UNAUTHORIZED';
    return res.status(401).json({ error: error.message, code: error.code });
  }

  const secret = process.env.JWT_SECRET || 'default_jwt_secret_key_change_in_production';

  jwt.verify(token, secret, (err, user) => {
    if (err) {
      const error = new Error('Invalid or expired access token');
      error.statusCode = 401;
      error.code = 'INVALID_TOKEN';
      return res.status(401).json({ error: error.message, code: error.code });
    }

    req.user = user;
    next();
  });
}

export default authenticateToken;
