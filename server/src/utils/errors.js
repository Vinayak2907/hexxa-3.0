// Custom Error Class Hierarchy for Hexa
// Provides structured, typed errors for consistent API error responses
// Concept: Server-side error handling

/**
 * Base application error class
 * All custom errors extend this for consistent error structure
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Distinguishes operational vs programmer errors
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Serialize error for JSON response
   */
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
      }
    };
  }
}

/**
 * Validation error — 400 Bad Request
 * Used when request data fails validation rules
 */
export class ValidationError extends AppError {
  constructor(message = 'Validation failed', fields = []) {
    super(message, 400, 'VALIDATION_ERROR');
    this.fields = fields; // Array of { field, message } for per-field errors
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        fields: this.fields,
        ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
      }
    };
  }
}

/**
 * NotFoundError — 404 Not Found
 * Used when a requested resource does not exist
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id = null) {
    const message = id ? `${resource} with ID '${id}' not found` : `${resource} not found`;
    super(message, 404, 'NOT_FOUND');
    this.resource = resource;
  }
}

/**
 * AuthenticationError — 401 Unauthorized
 * Used when authentication credentials are missing or invalid
 */
export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

/**
 * AuthorizationError — 403 Forbidden
 * Used when an authenticated user lacks permission for the action
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

/**
 * ConflictError — 409 Conflict
 * Used when the request conflicts with current state (e.g., duplicate email)
 */
export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * RateLimitError — 429 Too Many Requests
 * Used when the client exceeds the allowed request rate
 */
export class RateLimitError extends AppError {
  constructor(retryAfterSeconds = 60) {
    super('Too many requests. Please try again later.', 429, 'RATE_LIMIT_EXCEEDED');
    this.retryAfter = retryAfterSeconds;
  }
}

/**
 * ExternalServiceError — 502 Bad Gateway
 * Used when an external API call fails (e.g., LLM API, OAuth provider)
 */
export class ExternalServiceError extends AppError {
  constructor(serviceName = 'External service', originalError = null) {
    super(`${serviceName} is currently unavailable`, 502, 'EXTERNAL_SERVICE_ERROR');
    this.serviceName = serviceName;
    this.originalError = originalError;
  }
}

/**
 * Async error wrapper — catches errors in async route handlers
 * Eliminates the need for try/catch in every controller method
 * Usage: router.get('/path', asyncHandler(myController.method))
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Error classification utility
 * Determines if an error is operational (expected) or a programmer bug
 */
export function isOperationalError(error) {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

export default {
  AppError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  RateLimitError,
  ExternalServiceError,
  asyncHandler,
  isOperationalError
};
