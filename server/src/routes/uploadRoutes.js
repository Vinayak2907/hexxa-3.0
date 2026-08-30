// File Upload Routes
// Concept: File upload handling (Backend & System Design)
// Handles file upload and retrieval with authentication and RBAC

import express from 'express';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../utils/jwt.js';
import { uploadSingle, uploadMany, UPLOAD_DIR } from '../middleware/fileUpload.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { NotFoundError } from '../utils/errors.js';

const router = express.Router();

/**
 * POST /api/uploads
 * Upload a single file
 * Requires authentication
 * Demonstrates: file upload handling, RBAC (admin/manager can upload)
 */
router.post('/',
  authenticateToken,
  uploadSingle('file'),
  (req, res) => {
    if (!req.uploadedFile) {
      return res.status(400).json({
        error: { code: 'NO_FILE', message: 'No file provided in request' }
      });
    }

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        originalName: req.uploadedFile.originalName,
        storedName: req.uploadedFile.storedName,
        mimeType: req.uploadedFile.mimeType,
        size: req.uploadedFile.size,
        url: req.uploadedFile.url,
        uploadedAt: new Date().toISOString()
      }
    });
  }
);

/**
 * POST /api/uploads/batch
 * Upload multiple files (up to 5)
 * Requires authentication + admin/manager role
 * Demonstrates: batch file upload + RBAC
 */
router.post('/batch',
  authenticateToken,
  authorizeRoles('admin', 'manager'),
  uploadMany('files', 5),
  (req, res) => {
    if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
      return res.status(400).json({
        error: { code: 'NO_FILES', message: 'No files provided in request' }
      });
    }

    res.status(201).json({
      message: `${req.uploadedFiles.length} file(s) uploaded successfully`,
      files: req.uploadedFiles.map(file => ({
        originalName: file.originalName,
        storedName: file.storedName,
        mimeType: file.mimeType,
        size: file.size,
        url: file.url
      })),
      uploadedAt: new Date().toISOString()
    });
  }
);

/**
 * GET /api/uploads/:filename
 * Serve an uploaded file by its stored filename
 * Public access (no auth required for file retrieval)
 */
router.get('/:filename', (req, res, next) => {
  const { filename } = req.params;

  // Sanitize filename to prevent path traversal attacks
  const sanitizedFilename = path.basename(filename);
  const filePath = path.join(UPLOAD_DIR, sanitizedFilename);

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return next(new NotFoundError('File', sanitizedFilename));
  }

  // Send file with appropriate content type
  res.sendFile(filePath);
});

/**
 * DELETE /api/uploads/:filename
 * Delete an uploaded file
 * Requires authentication + admin role
 */
router.delete('/:filename',
  authenticateToken,
  authorizeRoles('admin'),
  (req, res, next) => {
    const { filename } = req.params;
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(UPLOAD_DIR, sanitizedFilename);

    if (!fs.existsSync(filePath)) {
      return next(new NotFoundError('File', sanitizedFilename));
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'File deleted successfully',
      filename: sanitizedFilename
    });
  }
);

export default router;
