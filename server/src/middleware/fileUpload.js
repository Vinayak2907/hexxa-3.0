// File Upload Handling Middleware
// Concept: File upload handling (Backend & System Design)
// Configures multer for disk-based file uploads with validation
// Supports file type filtering, size limits, and unique filename generation

import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { ValidationError } from '../utils/errors.js';

// Upload directory path
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Allowed MIME types for uploads
 * Organized by category for easy extension
 */
const ALLOWED_MIME_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  documents: ['application/pdf', 'text/plain', 'text/csv', 'application/json'],
  archives: ['application/zip', 'application/gzip']
};

// Flatten allowed types into a single set for fast lookup
const ALL_ALLOWED_TYPES = new Set(
  Object.values(ALLOWED_MIME_TYPES).flat()
);

/**
 * Maximum file size (5 MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Multer disk storage configuration
 * Generates unique filenames using crypto to prevent collisions and path traversal
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },

  filename: (req, file, cb) => {
    // Generate unique filename: <timestamp>-<random>.<ext>
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    const safeFilename = `${timestamp}-${randomSuffix}${ext}`;
    cb(null, safeFilename);
  }
});

/**
 * File filter — validates MIME type before accepting upload
 */
const fileFilter = (req, file, cb) => {
  if (ALL_ALLOWED_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError(
      `File type '${file.mimetype}' is not allowed. ` +
      `Allowed types: ${Array.from(ALL_ALLOWED_TYPES).join(', ')}`,
      [{ field: 'file', message: `Invalid file type: ${file.mimetype}` }]
    ), false);
  }
};

/**
 * Configured multer instance for single file uploads
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Single file per request
  }
});

/**
 * Configured multer instance for multiple file uploads (up to 5)
 */
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 5
  }
});

/**
 * Middleware for single file upload
 * Usage: router.post('/upload', uploadSingle('file'), handler)
 */
export function uploadSingle(fieldName = 'file') {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // Multer-specific errors
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ValidationError(
              `File exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)} MB`,
              [{ field: fieldName, message: 'File too large' }]
            ));
          }
          return next(new ValidationError(err.message));
        }
        return next(err);
      }

      // Attach file metadata to request for controller use
      if (req.file) {
        req.uploadedFile = {
          originalName: req.file.originalname,
          storedName: req.file.filename,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          url: `/api/uploads/${req.file.filename}`
        };
      }

      next();
    });
  };
}

/**
 * Middleware for multiple file uploads
 * Usage: router.post('/upload-batch', uploadMany('files', 5), handler)
 */
export function uploadMany(fieldName = 'files', maxCount = 5) {
  return (req, res, next) => {
    uploadMultiple.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return next(new ValidationError(`File exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)} MB`));
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return next(new ValidationError(`Maximum ${maxCount} files allowed per upload`));
          }
          return next(new ValidationError(err.message));
        }
        return next(err);
      }

      if (req.files && req.files.length > 0) {
        req.uploadedFiles = req.files.map(file => ({
          originalName: file.originalname,
          storedName: file.filename,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
          url: `/api/uploads/${file.filename}`
        }));
      }

      next();
    });
  };
}

export { UPLOAD_DIR, ALLOWED_MIME_TYPES, MAX_FILE_SIZE };
export default { uploadSingle, uploadMany, UPLOAD_DIR, ALLOWED_MIME_TYPES, MAX_FILE_SIZE };
