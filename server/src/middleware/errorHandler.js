// Error Handler Middleware
// Centralized error handling for the Hexa API

const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  console.error('Error occurred:', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Default error
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';

  // Determine if we should show stack trace
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