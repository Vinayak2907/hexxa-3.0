# Concept 11: React Component Composition & Reusability

## Definition
Component composition is a core React architectural pattern where complex UI views are built by assembling smaller, focused, and self-contained components together. Instead of building monolithic pages or using inheritance, components accept props and children to customize their presentation and behavior.

---

## Hexa Component Hierarchy Architecture

```text
App (Router Container)
 └── Layout (Global Navigation & Shell)
      └── Page (e.g. Tasks, Projects, Dashboard)
           ├── TaskList (Collection Container)
           │    └── TaskCard (Item Presenter)
           └── EmptyState (Reusable Fallback Presenter)
```

---

## Primary Repository Evidence: Reusable `EmptyState`

**File**: [`client/src/components/EmptyState.jsx`](file:///c:/Users/hardi/Hexa/client/src/components/EmptyState.jsx)

```jsx
function EmptyState({ message = 'No data available', icon = '📋' }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <p className="empty-message">{message}</p>
    </div>
  );
}
```

### Parent Component Reuse Examples

1. **Tasks Page Usage** ([`client/src/pages/Tasks.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Tasks.jsx)):
```jsx
<EmptyState 
  message="No tasks found for this status filter" 
  icon="📝" 
/>
```

2. **Projects Page Usage** ([`client/src/pages/Projects.jsx`](file:///c:/Users/hardi/Hexa/client/src/pages/Projects.jsx)):
```jsx
<EmptyState 
  message="No active projects available" 
  icon="📁" 
/>
```

---

## Benefits of Component Composition in Hexa

1. **DRY (Don't Repeat Yourself)**: Markup, container CSS styles, and accessibility attributes for empty feedback states reside strictly inside `EmptyState.jsx`.
2. **Prop Configuration**: Parents control message strings and icons dynamically without duplicating HTML layout code.
3. **Decoupled Responsibilities**: `TaskList` focuses purely on mapping arrays, while `TaskCard` presents individual task details, and `EmptyState` renders fallback UI.

---

## Viva Reviewer Questions & Answers

**Q: Show me how EmptyState is reusable across Hexa.**  
**A**: `EmptyState.jsx` takes configurable props (`message` and `icon`). `Tasks.jsx` renders it with a task icon (`📝`), while `Projects.jsx` reuses it with a project folder icon (`📁`).

**Q: Why use component composition instead of building large monolithic page components?**  
**A**: Composition splits complex UI into modular, testable components (`App` → `Layout` → `Page` → `TaskList` → `TaskCard`). It prevents duplicate code and keeps component concerns clean.