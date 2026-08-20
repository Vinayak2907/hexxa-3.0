# Kalvium Master Viva Evidence & Implementation Guide — Hexa

This guide provides exact file references, components, functions, data flow, design reasoning, trade-offs, edge cases, and runtime demonstration instructions for every mandatory Kalvium Viva concept in **Hexa**.

---

## 1. JavaScript Closures

- **Exact File**: [`client/src/components/TaskForm.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/TaskForm.jsx#L52-L68)
- **Exact Component**: `TaskForm({ initialData = {}, onSubmit, submitLabel })`
- **Function**: `createFieldChangeHandler(field)`
- **Concept Breakdown**:
  - **Captured Variable:** `field` (passed into outer function `createFieldChangeHandler`).
  - **Lexical Scope:** The inner event handler function returned by `createFieldChangeHandler` retains reference access to `field` from its parent lexical scope even after `createFieldChangeHandler` finishes execution.
  - **State Safety:** Uses React functional state update `setFormData(prev => ({ ...prev, [field]: value }))` to avoid stale state issues.
- **Viva Q&A**:
  - *Q: Why is createFieldChangeHandler a closure?*
    - A: Because the returned inner event handler function "closes over" the `field` parameter from its lexical scope, remembering which input field it updates.
  - *Q: What problem do closures solve in react forms?*
    - A: It serves as a field handler factory. Instead of writing separate handler functions for each input (title, description, status, project), we generate them dynamically on render, reducing code duplication.

---

## 2. JavaScript Hoisting

- **Exact File**: [`client/src/components/TaskForm.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/TaskForm.jsx#L125-L135)
- **Exact Component**: `TaskForm({ initialData = {}, onSubmit, submitLabel })`
- **Hoisted Element**: `getSubmitButtonLabel(initialData, submitLabel)`
- **Concept Breakdown**:
  - **Declaration Hoisting:** The helper function `getSubmitButtonLabel` is defined at the bottom of the file using a function declaration. However, it is invoked inside `TaskForm` above its definition line.
  - **Temporal Dead Zone (TDZ):** In contrast, local variables like `formData` are declared with `let`/`const`. Attempting to access `formData` before its declaration would throw a `ReferenceError` because block-scoped variables reside in the TDZ until initialized.
- **Viva Q&A**:
  - *Q: What would happen if getSubmitButtonLabel were a const variable assignment?*
    - A: It would throw a `ReferenceError` during compilation/execution. Constant/let variables are hoisted but reside in the Temporal Dead Zone (TDZ) and cannot be accessed before initialization, unlike function declarations which are fully hoisted with their bodies.

---

## 3. JavaScript Promises vs Callbacks

- **Exact API File**: [`client/src/api/taskApi.js`](file:///c:/Users/hardi/Hexa/client/src/api/taskApi.js#L17-L38)
- **Exact Demo File**: [`client/src/pages/PromisesDemo.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/PromisesDemo.jsx#L20-L40)
- **Functions**: `getTasksPromise()` (Promise Chaining) and `getTasks()` (Async/Await)
- **Concept Breakdown**:
  - **API Layer**: `getTasksPromise()` demonstrates returning the `fetch()` Promise and using `.then()` for response parsing and validation, with a centralized `.catch()` block.
  - **UI Layer**: `PromisesDemo.jsx` provides buttons to trigger both fetching tasks via Promise chains and fetching tasks via Async/Await, demonstrating real backend integration.
  - **Trade-offs**:
    - *Callbacks:* Original async pattern, suffers from callback hell (nested flow) and scattered error-handling.
    - *Promises:* Chainable via `.then().catch()`, provides centralized error handling.
    - *Async/Await:* Syntactic sugar over Promises. Offers synchronous-like readability and uses standard `try/catch` blocks.
- **Viva Q&A**:
  - *Q: How do you handle errors in Promise chains vs Async/Await?*
    - A: In Promise chains, errors are propagated and caught by a terminating `.catch()` block. In async/await, errors are caught locally or bubble up through standard `try/catch` blocks.

---

## 4. JavaScript Async/Await

- **Exact File**: [`client/src/pages/TaskDetails.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/TaskDetails.jsx#L20-L45)
- **Feature**: Task and Project Details Loading
- **Implementation**:
  ```javascript
  const taskData = await getTask(id); // Sequential Await 1
  setTask(taskData);
  if (taskData.project_id || taskData.projectId) {
    const projId = taskData.project_id || taskData.projectId;
    const projectData = await getProject(projId); // Sequential Await 2 (dependent on Await 1)
    setProjectOwner(projectData.owner_name);
  }
  ```
- **Sequential vs Concurrent (`Promise.all`)**:
  - **Sequential:** One fetch relies on another's output. We must fetch the task first to retrieve the `project_id` before fetching the project details.
  - **Concurrent (`Promise.all`):** In [`Dashboard.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Dashboard.jsx), tasks and projects are independent and loaded concurrently: `await Promise.all([getTasks(), getProjects()])`.
- **Viva Q&A**:
  - *Q: When would you use Promise.all over sequential awaits?*
    - A: When the asynchronous operations are independent of one another. Performing them in parallel reduces overall page load latency compared to waiting for each sequentially.

---

## 5. Git Workflow

- **Documentation**: [`docs/concepts/git-workflow.md`](file:///c:/Users/hardi/Hexa/docs/concepts/git-workflow.md)
- **Template File**: [`.github/pull_request_template.md`](file:///c:/Users/hardi/Hexa/.github/pull_request_template.md)
- **Concept Breakdown**:
  - **Stable Branch Model:** `main` represents production-ready code. Direct commits are restricted.
  - **Feature Branches:** Developed in branches named `feature/<concept>` (e.g. `feature/kalvium-closures-viva`).
  - **Rebase Strategy:** Feature branches are rebased onto `main` to resolve divergence cleanly.
  - **Commit Guidelines:** Atomic, conventional commit messages are enforced (`feat:`, `fix:`, `docs:`, `test:`).
- **Verification Commands**:
  - `git status` - Verify clean working tree.
  - `git diff` - Check changes against previous commits.
  - `git log --oneline --graph -n 10` - View clean branching history graphs.
