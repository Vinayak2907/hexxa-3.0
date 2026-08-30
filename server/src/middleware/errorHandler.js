// Error Handler Middleware
// Centralized error handling for the Hexa API
// Concept: Server-side error handling

import { AppError } from './utils/errors.js';

const errorHandler = (err, req, res, next) => {
  // Log error for debugging (include stack in dev)
  console.error('Error occurred:', {
    message: err.message,
    code: err.code || 'UNKNOWN_ERROR',
    statusCode: err.statusCode || 500,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Handle custom AppError instances
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle known third-party errors (e.g., JWT)
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Invalid token' }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: { code: 'TOKEN_EXPIRED', message: 'Token has expired' }
    });
  }

  // Handle default / unhandled errors
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Send structured error response
  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: message,
      ...(isDevelopment && { stack: err.stack })
    }
  });
};

export default errorHandler;