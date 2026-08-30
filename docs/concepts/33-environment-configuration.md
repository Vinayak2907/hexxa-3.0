# Concept 33: Environment Configuration Management

## Overview
A Twelve-Factor App stores configuration in the environment, not in the code. This ensures the application can be safely deployed across different environments (Development, Staging, Production) without code changes, and prevents sensitive credentials from being committed to version control.

Hexa utilizes `dotenv` for configuration management with best practices for validation and security.

## Implementation Details

### 1. The `.env` File (Ignored in Git)
All environment-specific variables and secrets are stored in a `.env` file at the root of the project. This file is explicitly added to `.gitignore`.

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
JWT_SECRET=super_secret_key_123
OPENAI_API_KEY=sk-...
```

### 2. The `.env.example` Template (Committed to Git)
To help other developers set up the project, we provide a `.env.example` file. It contains all the required keys, but with dummy or blank values.

```env
# .env.example
NODE_ENV=development
PORT=5000
DB_HOST=localhost
JWT_SECRET=your_jwt_secret_here
OPENAI_API_KEY=
```

### 3. Early Validation (Fail Fast)
One of the most common causes of production crashes is a missing environment variable. Hexa implements a "fail fast" strategy: we validate the presence of critical variables during server startup, before accepting any traffic.

```javascript
// Example Fail-Fast check in server.js or app.js
const REQUIRED_ENVS = ['JWT_SECRET', 'DB_HOST'];

REQUIRED_ENVS.forEach(env => {
  if (!process.env[env]) {
    console.error(`FATAL ERROR: Environment variable ${env} is missing.`);
    process.exit(1); // Crash immediately
  }
});
```

## Security Best Practices
- **Separation of Secrets**: Code and configuration are strictly separated.
- **Environment Parity**: Staging and Production run the exact same code, only the environment variables change.
- **No Hardcoded Fallbacks for Secrets**: While `PORT = process.env.PORT || 5000` is acceptable, we never fallback a secret like `JWT_SECRET = process.env.JWT_SECRET || 'default_insecure_secret'`.

## Verification / Demo
- View the `.env.example` file in the repository root to see the configuration schema required to run the Hexa platform.
