# Concept 23: Rate Limiting

## Overview
Rate limiting is a critical security and stability pattern that restricts the number of requests a client can make to an API within a specific timeframe. It protects the application from Denial of Service (DoS) attacks, brute-force password guessing, and resource exhaustion.

Hexa implements a **Sliding Window** rate limiter as Express middleware.

## Implementation Details

### The Rate Limiting Algorithm
We use an in-memory Map to track request counts per IP address. (In a multi-server production environment, this would be backed by Redis).

```javascript
// server/src/middleware/rateLimiter.js
let entry = rateLimitStore.get(ip);

if (!entry || now > entry.resetTime) {
  // Start new window
  rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
} else {
  // Increment existing window
  entry.count++;
}

if (entry.count > maxRequests) {
  res.set('Retry-After', retryAfterSeconds);
  throw new RateLimitError(); // 429 Too Many Requests
}
```

### Context-Aware Limits
Different endpoints require different rate limits. We use a factory function to generate specific limiters:

1. **Authentication Limiter** (Strict)
   ```javascript
   export const authRateLimiter = rateLimiter({
     windowMs: 15 * 60 * 1000,  // 15 minutes
     maxRequests: 15            // 15 attempts max
   });
   ```
   *Why*: Prevents brute-force credential stuffing attacks on login/register endpoints.

2. **API Limiter** (Generous)
   ```javascript
   export const apiRateLimiter = rateLimiter({
     windowMs: 60 * 1000,       // 1 minute
     maxRequests: 100           // 100 requests per minute
   });
   ```
   *Why*: Protects against noisy neighbors and accidental infinite loops in frontend code.

### Rate Limit Headers
We inject standard IETF draft rate limit headers into every response so clients can proactively manage their request rates:
- `X-RateLimit-Limit`: Maximum requests allowed in the window.
- `X-RateLimit-Remaining`: How many requests the client has left.
- `X-RateLimit-Reset`: Unix timestamp when the quota resets.

## Verification / Demo
Rapidly refreshing an endpoint protected by the rate limiter (like the login route if applied) will eventually trigger a `429 Too Many Requests` response with a `Retry-After` header.
