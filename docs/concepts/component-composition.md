# React Component Composition in Hexa

## Exact Implementation Location
- **Layout Container**: [`client/src/components/Layout.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/Layout.jsx)
- **Page Container**: [`client/src/components/PageContainer.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/PageContainer.jsx)
- **Reusable Feedback Components**: [`client/src/components/EmptyState.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/EmptyState.jsx), [`client/src/components/LoadingState.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/LoadingState.jsx), [`client/src/components/ErrorState.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/ErrorState.jsx)
- **Presentation Cards**: [`client/src/components/TaskCard.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/TaskCard.jsx), [`client/src/components/StatusBadge.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/StatusBadge.jsx)

## Composition Design Pattern

Component composition in React allows building complex user interfaces by combining small, focused, single-responsibility components.

```
+-----------------------------------------------------------------+
|                             Layout                              |
|   +---------------------------------------------------------+   |
|   |                         Navbar                          |   |
|   +---------------------------------------------------------+   |
|   |                     PageContainer                       |   |
|   |   +-------------------------------------------------+   |   |
|   |   |                   <Outlet />                    |   |   |
|   |   |           (e.g., Tasks or Dashboard)            |   |   |
|   |   |   +-----------------------------------------+   |   |   |
|   |   |   |                TaskList                 |   |   |   |
|   |   |   |   +---------------------------------+   |   |   |   |
|   |   |   |   |            TaskCard             |   |   |   |   |
|   |   |   |   |   +-------------------------+   |   |   |   |   |
|   |   |   |   |   |       StatusBadge       |   |   |   |   |   |
|   |   |   |   |   +-------------------------+   |   |   |   |   |
|   |   |   |   +---------------------------------+   |   |   |   |
|   |   |   +-----------------------------------------+   |   |   |
|   |   +-------------------------------------------------+   |   |
|   +---------------------------------------------------------+   |
+-----------------------------------------------------------------+
```

## Key Composition Features in Hexa

### 1. `children` Prop Injection (`PageContainer.jsx`)
```javascript
function PageContainer({ title, subtitle, children }) {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </header>
      <main className="page-content">
        {children}
      </main>
    </div>
  );
}
```
**Benefit**: `PageContainer` handles standardized page margins, header typography, and accessibility tags, while the parent page controls whatever content or forms are injected into `{children}`.

### 2. Reusable Visual Feedback (`EmptyState.jsx`)
```javascript
// Used in Tasks.jsx when no filter matches:
<EmptyState title="No tasks" description="No tasks match the selected status filter" />

// Reused in Projects.jsx when user owns zero projects:
<EmptyState title="No projects found" description="Create your first project to get started" />
```

### 3. Parent vs Child Responsibility Separation
- **Parent Component (e.g. `Tasks.jsx`)**: Manages state, API fetching, filtering, and delete event handlers.
- **Child Component (e.g. `TaskCard.jsx`)**: Receives task props (`task`, `onDelete`) and manages pure presentation and styling.
