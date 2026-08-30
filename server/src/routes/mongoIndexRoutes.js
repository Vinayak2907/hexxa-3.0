// MongoDB Indexing Routes
// Concept: Indexing for query performance (Mongo)
// Demonstrates MongoDB index types, explain plans, and performance comparison

import express from 'express';

const router = express.Router();

/**
 * GET /api/nosql/indexes
 * Returns comprehensive index metadata and explain plan demonstrations
 * Demonstrates all MongoDB index types used in the IndexedTask model
 */
router.get('/', (req, res) => {
  // Index definitions matching the IndexedTask model
  const indexes = [
    {
      name: 'status_1',
      type: 'Single-field',
      key: { status: 1 },
      purpose: 'Optimizes filtering tasks by status',
      query: "db.indexedtasks.find({ status: 'todo' })",
      benefit: 'Avoids full collection scan (COLLSCAN → IXSCAN)'
    },
    {
      name: 'priority_1',
      type: 'Single-field',
      key: { priority: 1 },
      purpose: 'Optimizes filtering tasks by priority level',
      query: "db.indexedtasks.find({ priority: 'critical' })",
      benefit: 'Direct B-tree lookup instead of scanning all documents'
    },
    {
      name: 'projectId_1_status_1',
      type: 'Compound',
      key: { projectId: 1, status: 1 },
      purpose: 'Optimizes filtered queries by project AND status',
      query: "db.indexedtasks.find({ projectId: ObjectId(...), status: 'todo' })",
      benefit: 'Single index covers both filter conditions (index intersection avoided)',
      designNote: 'Follows ESR rule: Equality (projectId) → Sort → Range (status)'
    },
    {
      name: 'assignedTo_1_status_1_dueDate_1',
      type: 'Compound',
      key: { assignedTo: 1, status: 1, dueDate: 1 },
      purpose: 'Optimizes user task queries with sorting',
      query: "db.indexedtasks.find({ assignedTo: ..., status: 'todo' }).sort({ dueDate: 1 })",
      benefit: 'Covered query — no need to fetch documents for sorting'
    },
    {
      name: 'task_text_search',
      type: 'Text',
      key: { title: 'text', description: 'text' },
      weights: { title: 10, description: 5 },
      purpose: 'Enables full-text search across task titles and descriptions',
      query: "db.indexedtasks.find({ $text: { $search: 'deployment bug' } })",
      benefit: 'Tokenized text search with relevance scoring (textScore)'
    },
    {
      name: 'expiresAt_1_ttl',
      type: 'TTL (Time-To-Live)',
      key: { expiresAt: 1 },
      options: { expireAfterSeconds: 0 },
      purpose: 'Automatic document deletion after expiry timestamp',
      benefit: 'MongoDB background thread removes expired docs automatically'
    },
    {
      name: 'completedAt_1_sparse',
      type: 'Sparse',
      key: { completedAt: 1 },
      options: { sparse: true },
      purpose: 'Index only documents where completedAt exists',
      benefit: 'Smaller index size — skips documents without completedAt field'
    }
  ];

  res.status(200).json({
    concept: 'MongoDB Indexing for Query Performance',
    model: 'IndexedTask',
    file: 'server/src/nosql/models/IndexedTask.js',
    totalIndexes: indexes.length,
    indexes,
    indexingStrategies: {
      'Single-field': 'One field indexed — fastest for single-condition queries',
      'Compound': 'Multiple fields in one index — covers multi-condition queries',
      'Text': 'Tokenized full-text search with relevance scoring',
      'TTL': 'Auto-delete documents after a time threshold',
      'Sparse': 'Only index documents that have the indexed field'
    }
  });
});

/**
 * GET /api/nosql/indexes/performance
 * Simulated query performance comparison: with index vs without index
 * Demonstrates how explain() output differs for indexed vs unindexed queries
 */
router.get('/performance', (req, res) => {
  // Simulated explain() output for indexed vs unindexed queries
  const comparison = {
    collectionSize: {
      totalDocuments: 100000,
      avgDocumentSize: '512 bytes',
      totalSize: '~48 MB'
    },
    queries: [
      {
        description: 'Find all tasks with status "todo" for a specific project',
        query: "db.indexedtasks.find({ projectId: ObjectId('...'), status: 'todo' })",

        withoutIndex: {
          stage: 'COLLSCAN',
          documentsExamined: 100000,
          keysExamined: 0,
          executionTimeMs: 145,
          explanation: 'Full collection scan — examines every document'
        },

        withIndex: {
          stage: 'IXSCAN',
          indexUsed: 'projectId_1_status_1',
          documentsExamined: 42,
          keysExamined: 42,
          executionTimeMs: 2,
          explanation: 'Compound index scan — directly locates matching documents'
        },

        speedup: '72.5x faster',
        documentsReduction: '99.96% fewer documents examined'
      },
      {
        description: 'Full-text search for "deployment bug"',
        query: "db.indexedtasks.find({ $text: { $search: 'deployment bug' } })",

        withoutIndex: {
          stage: 'ERROR',
          error: '$text queries require a text index',
          explanation: 'Text search is impossible without a text index'
        },

        withIndex: {
          stage: 'TEXT_MATCH',
          indexUsed: 'task_text_search',
          documentsExamined: 15,
          keysExamined: 23,
          executionTimeMs: 5,
          explanation: 'Text index tokenizes and matches search terms with relevance scoring'
        },

        speedup: 'N/A (impossible without index)',
        documentsReduction: '99.98% fewer documents examined'
      },
      {
        description: 'Get user pending tasks sorted by due date',
        query: "db.indexedtasks.find({ assignedTo: ..., status: { $in: ['todo','in_progress'] } }).sort({ dueDate: 1 })",

        withoutIndex: {
          stage: 'COLLSCAN + SORT_IN_MEMORY',
          documentsExamined: 100000,
          memoryUsageMB: 12.5,
          executionTimeMs: 320,
          explanation: 'Full scan + in-memory sort (may exceed 100MB sort limit)'
        },

        withIndex: {
          stage: 'IXSCAN (covered)',
          indexUsed: 'assignedTo_1_status_1_dueDate_1',
          documentsExamined: 28,
          memoryUsageMB: 0.01,
          executionTimeMs: 1,
          explanation: 'Compound index provides pre-sorted results — no in-memory sort needed'
        },

        speedup: '320x faster',
        documentsReduction: '99.97% fewer documents examined'
      }
    ],
    bestPractices: [
      'Create indexes for your most frequent query patterns',
      'Use compound indexes that follow the ESR rule (Equality → Sort → Range)',
      'Use explain() to verify indexes are being used',
      'Monitor index size — too many indexes slow down writes',
      'Use sparse indexes for optional fields to save space',
      'Limit text indexes to necessary fields — they are expensive'
    ]
  };

  res.status(200).json(comparison);
});

export default router;
