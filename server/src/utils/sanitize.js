// Sanitization Utility Functions
// Helps prevent XSS, SQL injection, and other injection attacks

/**
 * Sanitize string input to prevent XSS attacks
 * Escapes HTML special characters
 * @param {string} str - Input string to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeHtml(str) {
  if (typeof str !== 'string') {
    return str;
  }

  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Sanitize object by recursively sanitizing all string properties
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
export function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHtml(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitize SQL-like input to help prevent SQL injection
 * Note: The primary defense against SQL injection is using parameterized queries
 * This function provides an additional layer of defense
 * @param {string} str - Input string to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeSql(str) {
  if (typeof str !== 'string') {
    return str;
  }

  // Remove or escape SQL-like patterns that could be dangerous
  // This is a basic implementation - in practice, rely on parameterized queries
  return str
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/'/g, "''")    // Escape single quotes (SQL style)
    .replace(/"/g, '\\"')   // Escape double quotes
    .replace(/\0/g, '\\0')  // Escape null characters
    .replace(/\n/g, '\\n')  // Escape newlines
    .replace(/\r/g, '\\r')  // Escape carriage returns
    .replace(/\t/g, '\\t'); // Escape tabs
}

/**
 * Validate and sanitize user input for common fields
 * @param {Object} data - Input data to validate and sanitize
 * @param {Object} schema - Validation schema defining field rules
 * @returns {Object} Sanitized and validated data
 * @throws {Error} If validation fails
 */
export function validateAndSanitize(data, schema = {}) {
  const sanitized = {};

  // Process each field in the schema
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Handle required fields
    if (rules.required && (value === undefined || value === null || value === '')) {
      throw new Error(`${field} is required`);
    }

    // Skip processing if value is undefined and not required
    if (value === undefined && !rules.required) {
      continue;
    }

    // Type validation
    if (rules.type && typeof value !== rules.type) {
      throw new Error(`${field} must be of type ${rules.type}`);
    }

    // String specific validations
    if (typeof value === 'string') {
      // Length validation
      if (rules.minLength && value.length < rules.minLength) {
        throw new Error(`${field} must be at least ${rules.minLength} characters long`);
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        throw new Error(`${field} must be at most ${rules.maxLength} characters long`);
      }

      // Pattern validation (regex)
      if (rules.pattern && !new RegExp(rules.pattern).test(value)) {
        throw new Error(`${field} must match pattern ${rules.pattern}`);
      }

      // Sanitize the string
      sanitized[field] = sanitizeHtml(value);

      // Additional SQL sanitization for fields that might be used in queries
      if (rules.sqlSanitize) {
        sanitized[field] = sanitizeSql(sanitized[field]);
      }
    } else {
      // For non-string types, just copy the value
      sanitized[field] = value;
    }

    // Handle custom validation functions
    if (rules.validate && typeof rules.validate === 'function') {
      const validationResult = rules.validate(value);
      if (validationResult !== true) {
        throw new Error(validationResult || `${field} validation failed`);
      }
    }
  }

  // Copy over any fields not in the schema (optional - can be restricted)
  if (!schema.restrictUnknown) {
    for (const [key, value] of Object.entries(data)) {
      if (!schema.hasOwnProperty(key)) {
        sanitized[key] = typeof value === 'string' ? sanitizeHtml(value) : value;
      }
    }
  }

  return sanitized;
}

export default {
  sanitizeHtml,
  sanitizeObject,
  sanitizeSql,
  validateAndSanitize
};