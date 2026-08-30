// Problem Modeling Service
// Concept: Problem modeling (Backend & System Design)
// Demonstrates Domain-Driven Design (DDD) patterns for complex business logic
// Includes: Entities, Value Objects, Aggregates, and State Machines

import { ValidationError, ConflictError } from '../utils/errors.js';

// ================================================================
// VALUE OBJECTS
// Immutable objects defined by their attributes rather than identity
// ================================================================

class DateRange {
  constructor(startDate, endDate) {
    this.startDate = new Date(startDate);
    this.endDate = endDate ? new Date(endDate) : null;

    if (isNaN(this.startDate.getTime())) {
      throw new ValidationError('Invalid start date');
    }

    if (this.endDate) {
      if (isNaN(this.endDate.getTime())) {
        throw new ValidationError('Invalid end date');
      }
      if (this.startDate > this.endDate) {
        throw new ValidationError('Start date must be before end date');
      }
    }
  }

  getDurationDays() {
    if (!this.endDate) return null;
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue() {
    if (!this.endDate) return false;
    return new Date() > this.endDate;
  }
}

// ================================================================
// STATE MACHINE
// Explicit state transitions and validation rules
// ================================================================

const TASK_STATES = {
  BACKLOG: 'backlog',
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  ARCHIVED: 'archived'
};

const TASK_TRANSITIONS = {
  [TASK_STATES.BACKLOG]: [TASK_STATES.TODO, TASK_STATES.ARCHIVED],
  [TASK_STATES.TODO]: [TASK_STATES.IN_PROGRESS, TASK_STATES.BACKLOG, TASK_STATES.ARCHIVED],
  [TASK_STATES.IN_PROGRESS]: [TASK_STATES.REVIEW, TASK_STATES.TODO, TASK_STATES.ARCHIVED],
  [TASK_STATES.REVIEW]: [TASK_STATES.COMPLETED, TASK_STATES.IN_PROGRESS],
  [TASK_STATES.COMPLETED]: [TASK_STATES.ARCHIVED, TASK_STATES.IN_PROGRESS],
  [TASK_STATES.ARCHIVED]: [TASK_STATES.BACKLOG] // Restore
};

// ================================================================
// ENTITIES & AGGREGATE ROOTS
// Objects defined by identity that encapsulate state and behavior
// ================================================================

class TaskEntity {
  constructor({ id, title, description, state, assigneeId, startDate, dueDate }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.state = state || TASK_STATES.TODO;
    this.assigneeId = assigneeId;

    // Value Object embedding
    if (startDate) {
      this.timeframe = new DateRange(startDate, dueDate);
    }

    this.events = []; // Domain events collected during operations
  }

  /**
   * State machine transition logic
   */
  transitionTo(newState, actorId) {
    if (!Object.values(TASK_STATES).includes(newState)) {
      throw new ValidationError(`Invalid state: ${newState}`);
    }

    const allowedTransitions = TASK_TRANSITIONS[this.state];
    if (!allowedTransitions.includes(newState)) {
      throw new ConflictError(
        `Cannot transition task from '${this.state}' to '${newState}'. Allowed: ${allowedTransitions.join(', ')}`
      );
    }

    // Business Rules
    if (newState === TASK_STATES.IN_PROGRESS && !this.assigneeId) {
      throw new ConflictError('Cannot start a task without an assignee');
    }

    if (newState === TASK_STATES.COMPLETED && this.timeframe) {
      if (!this.timeframe.endDate) {
        // Automatically set end date on completion if missing
        this.timeframe = new DateRange(this.timeframe.startDate, new Date());
      }
    }

    const oldState = this.state;
    this.state = newState;

    // Record domain event
    this.events.push({
      type: 'TASK_STATE_CHANGED',
      taskId: this.id,
      oldState,
      newState,
      actorId,
      timestamp: new Date()
    });
  }

  assignTo(userId, actorId) {
    if (this.state === TASK_STATES.COMPLETED || this.state === TASK_STATES.ARCHIVED) {
      throw new ConflictError('Cannot assign a closed task');
    }

    this.assigneeId = userId;

    this.events.push({
      type: 'TASK_ASSIGNED',
      taskId: this.id,
      assigneeId: userId,
      actorId,
      timestamp: new Date()
    });
  }

  getMetrics() {
    return {
      isOverdue: this.timeframe ? this.timeframe.isOverdue() : false,
      durationDays: this.timeframe ? this.timeframe.getDurationDays() : null,
      canBeStarted: this.state === TASK_STATES.TODO && !!this.assigneeId
    };
  }
}

// ================================================================
// DOMAIN SERVICE
// Operations that don't naturally fit on a single entity
// ================================================================

class TaskDomainService {
  /**
   * Demonstrates a complex domain operation involving multiple entities
   */
  startSprint(tasks, sprintId, actorId) {
    const startedTasks = [];
    const errors = [];

    for (const task of tasks) {
      try {
        if (!task.assigneeId) {
          throw new ConflictError('Unassigned task');
        }
        task.transitionTo(TASK_STATES.IN_PROGRESS, actorId);
        startedTasks.push(task);
      } catch (err) {
        errors.push({ taskId: task.id, reason: err.message });
      }
    }

    return {
      success: errors.length === 0,
      sprintId,
      tasksStarted: startedTasks.length,
      tasksFailed: errors.length,
      errors
    };
  }
}

/**
 * Service API for controllers
 */
export default {
  TASK_STATES,
  DateRange,
  TaskEntity,
  TaskDomainService,

  // Demo method for the API endpoint
  getDemonstration() {
    const task = new TaskEntity({
      id: 'task-123',
      title: 'Implement Domain Models',
      startDate: new Date(),
      dueDate: new Date(Date.now() + 86400000 * 3) // +3 days
    });

    return {
      concept: 'Problem Modeling (Domain-Driven Design)',
      patterns: {
        valueObject: 'DateRange encapsulates date logic validation',
        entity: 'TaskEntity has identity and state',
        stateMachine: 'TASK_TRANSITIONS enforces valid flow',
        domainEvents: 'State changes record business events'
      },
      taskState: {
        id: task.id,
        state: task.state,
        metrics: task.getMetrics()
      },
      validTransitions: TASK_TRANSITIONS[task.state]
    };
  }
};
