# Hexa Engineering Git Workflow & Branching Strategy

Hexa enforces a disciplined branching and commit strategy. This strategy prevents regressions, ensures production stability, tracks code changes cleanly, and guarantees that the `main` branch remains deployable at all times.

---

## 1. Branch Naming & Roles

- **Production Branch (`main`)**: 
  - Represents stable, deployable production-grade code.
  - No direct commits are permitted on the `main` branch.
- **Feature Branches (`feature/<concept-or-issue>`)**:
  - Used for implementing new tasks or architectural concepts.
  - Example: `feature/kalvium-closures-viva`
- **Bug-fix Branches (`bugfix/<issue-name>`)**:
  - Used to resolve active bugs or functional regressions.
  - Example: `bugfix/task-status-validation`

---

## 2. Local Setup & Feature Branch Lifecycle

To implement a new feature, developer executes the following workflow:

### A. Sync Local Repository with Remote main
Always pull latest changes to resolve divergence early:
```bash
git checkout main
git pull origin main
```

### B. Create and Switch to a Feature Branch
```bash
git checkout -b feature/kalvium-closures-viva
```

### C. Verify Branch Divergence & Status
Check tracked/untracked changes:
```bash
git status
```

---

## 3. Atomic Conventional Commits

Commits must be granular and atomic, targeting a single change at a time. This allows simple rollbacks and clear debugging via `git bisect`.
We follow conventional commit prefix formats:

- `feat(client): implement field handler closure in TaskForm`
- `fix(api): catch network rejections in getTasksPromise`
- `test(server): verify auth token validation endpoint`
- `docs(viva): complete concept coverage matrix and questions`

Verify commit graph and history:
```bash
git log --oneline --graph -n 5
```

---

## 4. Rebase and Resolving Divergence

If `main` advances while you are working on your feature branch, you must sync your branch:
```bash
# Fetch latest remote changes
git fetch origin

# Rebase feature branch on top of main
git rebase origin/main
```
If merge conflicts occur, resolve them in files, and then:
```bash
git add <conflict-resolved-file>
git rebase --continue
```
*Note: Rebasing rewrites history cleanly, avoiding cluttered merge commits.*

---

## 5. Pull Request & Code Review Lifecycle

1. **Push Feature Branch to Remote:**
   ```bash
   git push origin feature/kalvium-closures-viva
   ```
2. **Open a Pull Request (PR):**
   - Automatically utilizes the template at [`.github/pull_request_template.md`](file:///c:/Users/hardi/Hexa/.github/pull_request_template.md).
   - Document problem statements, scopes, tests run, and concepts covered.
3. **Run Pre-Merge Verifications:**
   - Execute test suites: `npm test`
   - Run compilation checks: `npm run build`
4. **Peer Review Checklist:**
   - Check lexical scope variable captures in closures.
   - Verify function declarations vs TDZ let/const variables in hoisting.
   - Ensure proper try/catch and error bubbles in async/await handlers.
5. **Merge to Main:**
   - Use the "Squash and Merge" strategy to keep the `main` branch commit logs concise.
