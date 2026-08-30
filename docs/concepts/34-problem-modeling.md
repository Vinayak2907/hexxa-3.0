# Concept 34: Problem Modeling (Domain-Driven Design)

## Overview
In complex applications, putting all business logic inside Express controllers or database models leads to unmaintainable "spaghetti code."

**Domain-Driven Design (DDD)** is an architectural pattern that models software based on the real-world business domain. It encapsulates business rules within pure JavaScript objects, completely decoupled from the database or the HTTP framework.

Hexa demonstrates DDD principles in the `ProblemModeling` service.

## Core DDD Concepts Implemented

### 1. Value Objects
Value Objects are immutable objects defined by their attributes, not their identity. They encapsulate validation logic for a specific concept.
```javascript
// server/src/services/problemModeling.js
class DateRange {
  constructor(startDate, endDate) {
    // Validation logic (startDate must be before endDate)
  }
  isOverdue() { ... }
}
```
*Why*: Instead of passing primitive strings around and validating them everywhere, we pass a guaranteed-valid `DateRange` object.

### 2. Entities (Aggregate Roots)
Entities are objects defined by a unique ID that change state over time. They encapsulate data and the behaviors allowed on that data.
```javascript
class TaskEntity {
  constructor(data) {
    this.id = data.id;
    this.state = data.state;
    // Embeds the Value Object
    this.timeframe = new DateRange(data.startDate, data.dueDate);
  }
}
```

### 3. State Machines & Invariants
An Entity protects its invariants (business rules). External code cannot arbitrarily change `task.state = 'completed'`. They must call a method that enforces a state machine.
```javascript
const TASK_TRANSITIONS = {
  todo: ['in_progress', 'archived'],
  in_progress: ['review', 'todo'],
  // ...
};

transitionTo(newState) {
  if (!TASK_TRANSITIONS[this.state].includes(newState)) {
    throw new ConflictError('Invalid state transition');
  }
  this.state = newState;
}
```

### 4. Domain Events
When an Entity changes state, it generates a Domain Event. This allows other parts of the system (like email notifications) to react to changes without tightly coupling the code.
```javascript
this.events.push({
  type: 'TASK_STATE_CHANGED',
  oldState,
  newState,
  timestamp: new Date()
});
```

## Verification / Demo
- Review the `server/src/services/problemModeling.js` file to see the pure JavaScript implementation of these patterns, isolated from Express and MongoDB/Postgres.
