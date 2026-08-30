# Concept 32: Custom Error Handling

## Overview
A robust API must return consistent, predictable error responses to the client, while simultaneously logging detailed stack traces for developers on the server.

Hexa implements a centralized Error Handling architecture utilizing custom Error classes and a dedicated Express error middleware.

## Implementation Details

### 1. Custom Error Classes (AppError)
We extend the native JavaScript `Error` class to create a base `AppError`. This allows us to attach HTTP status codes and application-specific error codes to our exceptions.

```javascript
// server/src/utils/errors.js
export class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Distinguishes from programming bugs
    Error.captureStackTrace(this, this.constructor);
  }
}
```

We then create specific subclasses for common scenarios:
- `ValidationError` (400)
- `AuthenticationError` (401)
- `AuthorizationError` (403)
- `NotFoundError` (404)
- `ConflictError` (409)
- `RateLimitError` (429)

### 2. Centralized Error Middleware
Instead of using `try/catch` with `res.status(500).send()` in every single route, controllers pass errors to the `next()` function. The Express error middleware catches them all in one place.

```javascript
// server/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  // 1. Log error for developers
  console.error(err);

  // 2. Format response for clients
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // 3. Handle unhandled exceptions securely
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      // Only leak stack traces in development mode!
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
```

## Security & Architectural Benefits
1. **No Information Leakage**: Stack traces containing file paths and database queries are never exposed in production.
2. **Predictable Client Parsing**: Frontend applications can always expect errors in the shape `{ error: { code, message } }`.
3. **DRY Code**: Controllers only handle the "happy path", drastically reducing boilerplate.

## Verification / Demo
- Most API endpoints will trigger this middleware if invalid data is provided.
- For example, accessing a protected route without a token triggers the `AuthenticationError` via the centralized handler.
