// Rate Limiting Middleware
// Concept: Rate limiting (Auth & Security)
// Implements a sliding-window rate limiter using in-memory storage
// Protects API endpoints from abuse and brute-force attacks

import { RateLimitError } from '../utils/errors.js';

/**
 * In-memory store for rate limit tracking
 * In production, use Redis for distributed rate limiting
 * Structure: Map<key, { count, resetTime }>
 */
const rateLimitStore = new Map();

// Cleanup expired entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Rate limiting middleware factory
 * Uses fixed-window algorithm for simplicity and low memory footprint
 *
 * @param {Object} options - Rate limit configuration
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param {number} options.maxRequests - Maximum requests per window (default: 100)
 * @param {string} options.keyPrefix - Prefix for rate limit keys (default: 'rl')
 * @param {Function} options.keyGenerator - Custom key generator (default: uses IP)
 * @param {string} options.message - Custom error message
 * @returns {Function} Express middleware
 *
 * Usage:
 *   app.use('/api/auth', rateLimiter({ windowMs: 60000, maxRequests: 10 }));
 *   app.use('/api', rateLimiter({ windowMs: 60000, maxRequests: 100 }));
 */
export function rateLimiter(options = {}) {
  const {
    windowMs = 60 * 1000,       // 1 minute default window
    maxRequests = 100,            // 100 requests per window
    keyPrefix = 'rl',
    keyGenerator = null,
    message = null
  } = options;

  return (req, res, next) => {
    // Generate rate limit key (default: by IP address)
    const key = keyGenerator
      ? `${keyPrefix}:${keyGenerator(req)}`
      : `${keyPrefix}:${req.ip || req.connection.remoteAddress}`;

    const now = Date.now();

    // Get or create entry for this key
    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // Window expired or first request — start new window
      entry = {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now
      };
      rateLimitStore.set(key, entry);
    } else {
      // Within existing window — increment count
      entry.count++;
    }

    // Calculate remaining requests and time until reset
    const remaining = Math.max(0, maxRequests - entry.count);
    const retryAfterSeconds = Math.ceil((entry.resetTime - now) / 1000);

    // Set rate limit headers (standard draft headers)
    res.set({
      'X-RateLimit-Limit': String(maxRequests),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(Math.ceil(entry.resetTime / 1000)),
      'X-RateLimit-Policy': `${maxRequests};w=${Math.ceil(windowMs / 1000)}`
    });

    // Check if rate limit exceeded
    if (entry.count > maxRequests) {
      res.set('Retry-After', String(retryAfterSeconds));

      console.warn(
        `Rate limit exceeded: key=${key}, count=${entry.count}, ` +
        `limit=${maxRequests}, retryAfter=${retryAfterSeconds}s`
      );

      const error = new RateLimitError(retryAfterSeconds);
      if (message) error.message = message;
      return next(error);
    }

    next();
  };
}

/**
 * Strict rate limiter for authentication endpoints
 * Lower limits to prevent brute-force attacks
 */
export const authRateLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,  // 15-minute window
  maxRequests: 15,             // 15 attempts per 15 minutes
  keyPrefix: 'rl:auth',
  message: 'Too many authentication attempts. Please try again in 15 minutes.'
});

/**
 * General API rate limiter
 * Higher limits for normal API usage
 */
export const apiRateLimiter = rateLimiter({
  windowMs: 60 * 1000,  // 1-minute window
  maxRequests: 100,       // 100 requests per minute
  keyPrefix: 'rl:api'
});

export default { rateLimiter, authRateLimiter, apiRateLimiter };
