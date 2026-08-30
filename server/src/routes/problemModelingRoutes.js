// Problem Modeling Demonstration Routes
// Concept: Problem modeling (Backend & System Design)
// Exposes live interactive endpoints for Domain-Driven Design (DDD) patterns:
// Value Objects, Entities, State Machines, Invariant Protection, and Domain Events

import express from 'express';
import problemModeling from '../services/problemModeling.js';

const { TaskEntity, DateRange, TASK_STATES, TaskDomainService } = problemModeling;

const router = express.Router();

/**
 * GET /api/problem-modeling/overview
 * Provides architectural overview of the DDD problem modeling implementation
 */
router.get('/overview', (req, res) => {
  res.json(problemModeling.getDemonstration());
});

/**
 * POST /api/problem-modeling/simulate-lifecycle
 * Simulates a full entity state machine lifecycle with business rule validation
 */
router.post('/simulate-lifecycle', (req, res) => {
  const { title = 'Refactor Auth Subsystem', assigneeId = 42, assignBeforeStart = true } = req.body;

  const logs = [];

  try {
    // 1. Create Entity with Value Object
    const startDate = new Date();
    const dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
    const task = new TaskEntity({
      id: 'task-ddd-001',
      title,
      description: 'Domain-Driven Design demonstration entity',
      startDate,
      dueDate
    });

    logs.push({
      step: 1,
      action: 'Entity Initialized',
      state: task.state,
      timeframe: {
        durationDays: task.timeframe.getDurationDays(),
        isOverdue: task.timeframe.isOverdue()
      }
    });

    // 2. Assign User (if requested)
    if (assignBeforeStart) {
      task.assignTo(assigneeId, 1); // Assigned to user 42 by actor 1
      logs.push({
        step: 2,
        action: 'Task Assigned',
        assigneeId: task.assigneeId,
        state: task.state
      });
    }

    // 3. State Transition: TODO -> IN_PROGRESS
    task.transitionTo(TASK_STATES.IN_PROGRESS, 1);
    logs.push({
      step: 3,
      action: 'State Transitioned to IN_PROGRESS',
      state: task.state
    });

    // 4. State Transition: IN_PROGRESS -> REVIEW
    task.transitionTo(TASK_STATES.REVIEW, 1);
    logs.push({
      step: 4,
      action: 'State Transitioned to REVIEW',
      state: task.state
    });

    // 5. State Transition: REVIEW -> COMPLETED
    task.transitionTo(TASK_STATES.COMPLETED, 1);
    logs.push({
      step: 5,
      action: 'State Transitioned to COMPLETED',
      state: task.state
    });

    res.json({
      success: true,
      message: 'Full Domain Lifecycle Simulation completed successfully without invariant violations',
      lifecycleLogs: logs,
      emittedDomainEvents: task.events,
      finalMetrics: task.getMetrics()
    });
  } catch (error) {
    res.status(error.statusCode || 400).json({
      success: false,
      message: `Business Rule / Invariant Violation: ${error.message}`,
      code: error.code || 'DOMAIN_RULE_VIOLATION',
      logs
    });
  }
});

/**
 * POST /api/problem-modeling/validate-date-range
 * Demonstrates Value Object self-validation and immutability
 */
router.post('/validate-date-range', (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;
    const range = new DateRange(startDate, endDate);

    res.json({
      valid: true,
      startDate: range.startDate,
      endDate: range.endDate,
      durationDays: range.getDurationDays(),
      isOverdue: range.isOverdue()
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/problem-modeling/sprint-operation
 * Demonstrates Domain Service coordinating multiple entities
 */
router.post('/sprint-operation', (req, res) => {
  const service = new TaskDomainService();

  const task1 = new TaskEntity({ id: 1, title: 'Database optimization', assigneeId: 10 });
  const task2 = new TaskEntity({ id: 2, title: 'Frontend dark mode', assigneeId: 20 });
  const task3 = new TaskEntity({ id: 3, title: 'Unassigned task without assignee' }); // Should fail business rule

  const result = service.startSprint([task1, task2, task3], 'sprint-42', 99);

  res.json({
    concept: 'Domain Service (Cross-Entity Orchestration)',
    result
  });
});

export default router;
