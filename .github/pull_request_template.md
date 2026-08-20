# Hexa Pull Request Template

## 1. Problem Statement & Scope
<!-- Provide a clear description of the problem being solved or the feature being introduced, and the boundaries of this change. -->

## 2. Implementation Summary
<!-- Describe how you solved the problem, including design choices, architecture updates, and components created. -->

## 3. Files Changed & Relational Impact
<!-- List the specific files modified and describe any database schema migrations, PK/FK alterations, or indexing modifications. -->
- **Database Schema Changes:** [ ] Yes [ ] No (If yes, specify SQL schema / migration impact below)
- **Files Modified:**
  - `client/src/...`
  - `server/src/...`

## 4. Kalvium Concepts Covered
Check all that apply in this Pull Request:
- [ ] State management with `useState` (`TaskForm.jsx`)
- [ ] Relational schema design with PK/FK (`database/schema.sql`)
- [ ] SQL indexing for query performance (`database/schema.sql`)
- [ ] Client-side routing & auth context (`App.jsx`, `ProtectedRoute.jsx`)
- [ ] Async data fetching from API (`projectApi.js`, `taskApi.js`)
- [ ] JavaScript `async/await` (`Dashboard.jsx`)
- [ ] JavaScript closures (`TaskForm.jsx`)
- [ ] JavaScript hoisting (`TaskForm.jsx`)
- [ ] JavaScript Promises vs callbacks (`PromisesDemo.jsx`)
- [ ] JavaScript event loop (`EventLoopDemo.jsx`)
- [ ] Environment variables & secrets management (`env.js`)
- [ ] HTTP status codes (`server/src/routes/`)
- [ ] React component composition (`Layout.jsx`, `PageContainer.jsx`)

## 5. Verification & Testing Logs
### Automated Test Run
<!-- Paste output of 'npm test' or 'npm run test --prefix server' here -->
```bash
# Paste test command output:
```

### Build Status
<!-- Paste output of 'npm run build' or 'npm run build --prefix client' here -->
```bash
# Paste build output:
```

### Screenshots / Demo Evidence
<!-- Embed links or images showing the frontend modifications or verification of interactive features -->

## 6. Security Considerations & Secret Management
<!-- Discuss any sensitive parameters touched. Confirm that no secret tokens, private keys, or passwords have been committed. -->
- [ ] I have verified that zero environment secrets or `.env` files are tracked in this commit.
- [ ] No hardcoded passwords, tokens, or private keys exist in the codebase changes.

## 7. Regression & Reviewer Checklist
- [ ] **Working Tree Clean:** `git status` verifies no untracked workspace files.
- [ ] **Lint Verification:** Code contains no syntax errors or obvious lints.
- [ ] **Code composition:** JSX uses composition structures instead of repetitive raw markup.
- [ ] **Error Handling:** All promise chains catch failures, and async/await blocks use try/catch appropriately.