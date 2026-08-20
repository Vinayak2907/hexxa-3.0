// JWT Utility Functions
// Handles JWT token creation, verification, and related operations

import jwt from 'jsonwebtoken';
import config from '../config/env.js';

/**
 * Generate JWT token for user
 * @param {Object} user - User object (should contain id, email, etc.)
 * @param {string} expiresIn - Expiration time (default: '24h')
 * @returns {string} Signed JWT token
 */
export function generateToken(user, expiresIn = '24h') {
  const payload = {
    userId: user.id,
    email: user.email,
    // Add any other user data you want to include in the token
  };

  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    throw new Error(`Invalid token: ${error.message}`);
  }
}

/**
 * Generate refresh token (longer-lived token for getting new access tokens)
 * @param {Object} user - User object
 * @returns {string} Signed refresh token
 */
export function generateRefreshToken(user) {
  const payload = {
    userId: user.id,
    tokenVersion: user.tokenVersion || 1 // For token invalidation on password change
  };

  return jwt.sign(payload, config.jwtRefreshSecret, { expiresIn: '7d' });
}

/**
 * Verify refresh token
 * @param {string} token - Refresh token to verify
 * @returns {Object} Decoded token payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.jwtRefreshSecret);
  } catch (error) {
    throw new Error(`Invalid refresh token: ${error.message}`);
  }
}

/**
 * Middleware to verify JWT token in Authorization header
 * Expected format: Authorization: Bearer <token>
 * @returns {Express Middleware Function}
 */
export function authenticateToken() {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      const error = new Error('Access token required');
      error.statusCode = 401;
      error.code = 'TOKEN_REQUIRED';
      return next(error);
    }

    try {
      const decoded = verifyToken(token);
      // Attach user info to request for use in controllers
      req.user = {
        id: decoded.userId,
        email: decoded.email
      };
      next();
    } catch (error) {
      const authError = new Error('Invalid or expired token');
      authError.statusCode = 401;
      authError.code = 'INVALID_TOKEN';
      next(authError);
    }
  };
}

/**
 * Middleware to verify refresh token
 * @returns {Express Middleware Function}
 */
export function verifyRefreshTokenMiddleware() {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      const error = new Error('Refresh token required');
      error.statusCode = 401;
      error.code = 'REFRESH_TOKEN_REQUIRED';
      return next(error);
    }

    try {
      const decoded = verifyRefreshToken(token);
      req.user = {
        id: decoded.userId,
        tokenVersion: decoded.tokenVersion
      };
      next();
    } catch (error) {
      const authError = new Error('Invalid or expired refresh token');
      authError.statusCode = 401;
      authError.code = 'INVALID_REFRESH_TOKEN';
      next(authError);
    }
  };
}