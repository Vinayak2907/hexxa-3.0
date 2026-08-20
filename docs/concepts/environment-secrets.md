# Environment Variables & Secrets Management in Hexa

## Exact Implementation Location
- **Centralized Configuration**: [`server/src/config/env.js`](file:///c:/Users/hardi/Hexa/server/src/config/env.js)
- **Environment Template**: [`.env.example`](file:///c:/Users/hardi/Hexa/.env.example)
- **Git Ignore**: [`.gitignore`](file:///c:/Users/hardi/Hexa/.gitignore)

## Architecture & Security Model

In Hexa, configuration variables (like server port or environment name) and secret keys (like database credentials or JWT signing keys) are never hardcoded into source files.

```
+------------------+         Git Ignored!         +-----------------------+
|   .env.example   | ---------------------------> |         .env          |
| (Safe Placeholders)|  Developer copies locally   | (Actual Local Secrets)|
+------------------+                              +-----------------------+
                                                              |
                                                              v
+-------------------------------------------------------------------------+
|                          server/src/config/env.js                       |
|  - Imports dotenv                                                       |
|  - Validates required production secrets                                |
|  - Prevents fallback default secrets in production                       |
|  - Exports validated config object                                      |
+-------------------------------------------------------------------------+
```

## Centralized Validation in `env.js`
```javascript
const isProduction = process.env.NODE_ENV === 'production';

// In production, ensure mandatory secrets are provided by the environment
if (isProduction) {
  const missingSecrets = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'].filter(key => !process.env[key]);
  if (missingSecrets.length > 0) {
    console.error(`FATAL: Missing production secrets: ${missingSecrets.join(', ')}`);
    process.exit(1); // Immediate application failure
  }
}

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || (isProduction ? undefined : 'dev-secret-key-change-in-prod'),
  // ...
};
```

## Viva Principles & Best Practices
1. **Config vs. Secrets**:
   - **Configuration**: Non-sensitive settings (e.g. `PORT=5000`, `CLIENT_URL=http://localhost:5173`).
   - **Secrets**: Confidential credentials (e.g. `JWT_SECRET`, database passwords, Stripe API keys).
2. **.env vs .env.example**:
   - `.env`: Contains real environment settings; listed in `.gitignore` so secrets are never pushed to GitHub repositories.
   - `.env.example`: Committed to git with safe placeholder values (`DATABASE_URL=postgresql://user:pass@localhost:5432/hexadb`) to instruct new developers on required environment variables.
3. **Fail-Fast Validation**: In production mode (`NODE_ENV=production`), missing secrets immediately abort process startup (`process.exit(1)`), preventing insecure fallback operation.
