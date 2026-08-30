# Concept 20: File Upload Handling

## Overview
Securely handling file uploads in a web application requires careful validation to prevent security vulnerabilities such as path traversal, arbitrary file execution, and Denial of Service (DoS) via oversized payloads.

Hexa implements file upload handling using `multer` with strict validation rules.

## Implementation Details

### 1. Storage Configuration & Safe Filenames
We never use the client-provided `originalname` directly for storage, as it may contain malicious path traversals (e.g., `../../../etc/passwd`).
```javascript
// server/src/middleware/fileUpload.js
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    // Generate unique, safe filename: <timestamp>-<random>.<ext>
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${timestamp}-${randomSuffix}${ext}`);
  }
});
```

### 2. File Type Validation (MIME Filtering)
We validate the `mimetype` against a strict allowlist. Relying solely on the file extension is insecure, as extensions can be easily spoofed.
```javascript
// server/src/middleware/fileUpload.js
const fileFilter = (req, file, cb) => {
  if (ALL_ALLOWED_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ValidationError(`Invalid file type: ${file.mimetype}`), false);
  }
};
```

### 3. Size Limits & DoS Prevention
We enforce a strict 5MB size limit at the middleware level. This prevents attackers from exhausting server memory or disk space with massive file uploads.
```javascript
// server/src/middleware/fileUpload.js
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5 MB limit
});
```

## Security Best Practices Demonstrated
1. **Never trust the user's filename**: Generate server-side identifiers.
2. **Validate MIME types**: Do not rely on file extensions.
3. **Set hard size limits**: Protect against resource exhaustion.
4. **Isolate upload directory**: Store files outside the web root or on cloud storage (S3) in production.

## Verification / Demo
- API Endpoint: `POST /api/uploads` — Single file upload
- API Endpoint: `POST /api/uploads/batch` — Batch file upload (max 5)
- Try uploading a `.exe` or a file >5MB to see the validation errors in action.
