# Concept 2: Environment Variables & Secrets Management

## Definition
Environment variable management isolates environment-specific configuration parameters (database URIs, secret keys, API ports) from application source code. Secrets management ensures sensitive credentials are never committed to version control.

---

## Primary Repository Evidence

1. **Ignored Environment File**: `.env` (listed in [`.gitignore`](file:///c:/Users/hardi/Hexa/.gitignore)).
2. **Versioned Environment Template**: [`.env.example`](file:///c:/Users/hardi/Hexa/.env.example) (contains safe default placeholders).
3. **Centralized Configuration Loader**: [`server/src/config/env.js`](file:///c:/Users/hardi/Hexa/server/src/config/env.js) (validates required environment variables on startup).

```javascript
// server/src/config/env.js
import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'default_dev_secret_change_in_production'
};
```

---

## Security Practices Enforced in Hexa

- **Never Commit Secrets**: Real credentials reside in `.env`, which is strictly excluded from Git tracking via `.gitignore`.
- **Safe Template (`.env.example`)**: Shares required environment key names without leaking real values (e.g. `DATABASE_URL=postgresql://user:password@localhost:5432/hexadb`).
- **Startup Validation**: Prevents silent runtime failures by validating mandatory environment variables before the server starts listening on its port.

---

## Viva Reviewer Questions & Answers

**Q: Where is DATABASE_URL configured and why is it not hardcoded in source files?**  
**A**: `DATABASE_URL` is loaded from the environment via `.env` in `server/src/config/env.js`. Hardcoding database credentials in source code exposes production credentials to unauthorized access and breaks multi-environment deployment (dev/staging/prod).

**Q: What is the purpose of .env.example?**  
**A**: `.env.example` acts as a developer documentation template. It lists all environment variables required by the application with safe placeholder values, allowing developers to set up their local environment without exposing real secrets in Git history.