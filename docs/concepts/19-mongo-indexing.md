# Concept 19: Database Indexing for Query Performance (MongoDB)

## Overview
MongoDB indexing is critical for query performance as collections grow. Without indexes, MongoDB must perform a *collection scan* (examining every document) to find matching documents. Indexes use B-tree data structures to efficiently locate data without scanning the whole collection.

This concept demonstrates 7 different MongoDB indexing strategies implemented in Hexa's `IndexedTask` model.

## Core Implementations in Hexa

### 1. Single-Field Indexes
Used for exact matches and simple sorting on a single field.
```javascript
// server/src/nosql/models/IndexedTask.js
indexedTaskSchema.index({ status: 1 });
indexedTaskSchema.index({ priority: 1 });
```
**Why**: Optimizes the most common queries like finding all "todo" tasks.

### 2. Compound Indexes (The ESR Rule)
Used when queries filter on multiple fields simultaneously.
```javascript
// server/src/nosql/models/IndexedTask.js
indexedTaskSchema.index({ projectId: 1, status: 1 });
```
**Why**: Avoids *index intersection*. By including both fields in one index, MongoDB finds matching documents in a single B-tree traversal.
**Best Practice (ESR Rule)**: Order fields by Equality, then Sort, then Range.

### 3. Text Indexes
Used for full-text search with relevance scoring.
```javascript
// server/src/nosql/models/IndexedTask.js
indexedTaskSchema.index(
  { title: 'text', description: 'text' },
  { weights: { title: 10, description: 5 }, name: 'task_text_search' }
);
```
**Why**: Regular expressions (`$regex`) cannot effectively use standard B-tree indexes for full-text search. Text indexes tokenize content and enable the `$text` operator.

### 4. TTL (Time-To-Live) Indexes
Used for automatic data expiry/cleanup.
```javascript
// server/src/nosql/models/IndexedTask.js
indexedTaskSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
```
**Why**: Offloads cleanup tasks to a background MongoDB thread, eliminating the need for application-level cron jobs.

### 5. Sparse Indexes
Used to index only documents containing the specified field.
```javascript
// server/src/nosql/models/IndexedTask.js
indexedTaskSchema.index({ completedAt: 1 }, { sparse: true });
```
**Why**: Saves disk space and memory since many tasks won't have a `completedAt` timestamp until they are finished.

## Verification / Demo
- API Endpoint: `GET /api/nosql/indexes` — View the live index configurations
- API Endpoint: `GET /api/nosql/indexes/performance` — View simulated `explain()` plan comparisons showing the performance difference (COLLSCAN vs IXSCAN)
