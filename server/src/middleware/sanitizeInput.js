// Express Input Sanitization Middleware
// Uses sanitize-html package to strip malicious scripts and HTML tags from request payloads
import sanitizeHtml from 'sanitize-html';

export function sanitizeMiddleware(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeHtml(req.body[key], {
          allowedTags: [],
          allowedAttributes: {}
        });
      }
    }
  }
  next();
}

export default sanitizeMiddleware;
