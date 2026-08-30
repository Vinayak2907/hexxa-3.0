// MongoDB Indexed Task Model
// Concept: Indexing for query performance (Mongo)
// Demonstrates Mongoose schema with strategic indexes for query optimization
// Includes compound indexes, text indexes, and TTL indexes

import mongoose from 'mongoose';

const { Schema } = mongoose;

/**
 * IndexedTask Schema — optimized for common query patterns
 * Demonstrates various MongoDB indexing strategies:
 * 1. Single-field index (status, priority)
 * 2. Compound index (projectId + status) for filtered queries
 * 3. Text index (title + description) for full-text search
 * 4. TTL index (expiresAt) for automatic document expiry
 */
const indexedTaskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'completed', 'archived'],
    default: 'todo',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  expiresAt: {
    type: Date    // TTL index: documents auto-deleted after this date
  }
}, {
  timestamps: true  // Adds createdAt and updatedAt
});

// ================================================================
// INDEX DEFINITIONS — Strategic indexes for common query patterns
// ================================================================

/**
 * Index 1: Single-field index on 'status'
 * Optimizes: db.indexedtasks.find({ status: 'todo' })
 * Query pattern: Filter tasks by status (most common query)
 */
indexedTaskSchema.index({ status: 1 });

/**
 * Index 2: Single-field index on 'priority'
 * Optimizes: db.indexedtasks.find({ priority: 'critical' })
 * Query pattern: Filter tasks by priority level
 */
indexedTaskSchema.index({ priority: 1 });

/**
 * Index 3: Compound index on 'projectId' + 'status'
 * Optimizes: db.indexedtasks.find({ projectId: ObjectId(...), status: 'todo' })
 * Query pattern: Get all tasks for a project filtered by status
 * Uses the "ESR" rule: Equality → Sort → Range
 */
indexedTaskSchema.index({ projectId: 1, status: 1 });

/**
 * Index 4: Compound index on 'assignedTo' + 'status' + 'dueDate'
 * Optimizes: db.indexedtasks.find({ assignedTo: ..., status: 'todo' }).sort({ dueDate: 1 })
 * Query pattern: Get a user's pending tasks sorted by due date
 */
indexedTaskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });

/**
 * Index 5: Text index for full-text search
 * Optimizes: db.indexedtasks.find({ $text: { $search: "search query" } })
 * Query pattern: Search tasks by title and description content
 * Note: Only one text index per collection in MongoDB
 */
indexedTaskSchema.index(
  { title: 'text', description: 'text' },
  { weights: { title: 10, description: 5 }, name: 'task_text_search' }
);

/**
 * Index 6: TTL index for automatic document cleanup
 * Documents are automatically deleted after 'expiresAt' timestamp
 * Query pattern: Auto-cleanup of archived/expired tasks
 */
indexedTaskSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

/**
 * Index 7: Sparse index on 'completedAt'
 * Only indexes documents where completedAt exists
 * Saves space since many tasks won't have completedAt set
 */
indexedTaskSchema.index({ completedAt: 1 }, { sparse: true });

// ================================================================
// STATIC METHODS — Demonstrate index-optimized queries
// ================================================================

/**
 * Find tasks by project and status (uses compound index #3)
 */
indexedTaskSchema.statics.findByProjectAndStatus = function(projectId, status) {
  return this.find({ projectId, status })
    .sort({ createdAt: -1 })
    .lean();
};

/**
 * Full-text search across tasks (uses text index #5)
 */
indexedTaskSchema.statics.searchTasks = function(searchQuery) {
  return this.find(
    { $text: { $search: searchQuery } },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .lean();
};

/**
 * Get user's tasks sorted by due date (uses compound index #4)
 */
indexedTaskSchema.statics.findUserPendingTasks = function(userId) {
  return this.find({
    assignedTo: userId,
    status: { $in: ['todo', 'in_progress'] }
  })
    .sort({ dueDate: 1 })
    .lean();
};

/**
 * Get index information for the collection
 * Used by the API to demonstrate index metadata
 */
indexedTaskSchema.statics.getIndexInfo = async function() {
  try {
    const indexes = await this.collection.indexes();
    return indexes;
  } catch {
    // Return schema-defined indexes if collection doesn't exist yet
    return indexedTaskSchema.indexes().map(([fields, options]) => ({
      key: fields,
      ...options
    }));
  }
};

const IndexedTask = mongoose.models.IndexedTask || mongoose.model('IndexedTask', indexedTaskSchema);

export default IndexedTask;
