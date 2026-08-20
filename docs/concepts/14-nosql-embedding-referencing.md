# NoSQL Embedding vs Referencing

## Overview
In NoSQL databases like MongoDB, you have two primary ways to model relationships between data:

1. **EMBEDDING**: Store related data directly within a document
2. **REFERENCING**: Store references (IDs) to related documents in separate collections

## Embedding Example
In an embedded model, related data is stored within the same document. This approach is good for data that is always accessed together and represents one-to-few relationships.

### Benefits:
- Atomic reads - all related data retrieved in one query
- Better performance for frequently accessed together data
- Simpler querying for hierarchical data
- Reduces need for joins

### Trade-offs:
- Can lead to large documents if overused
- Data duplication if same embedded data appears in multiple places
- Updating embedded data requires updating all parent documents
- Document size limits (16MB in MongoDB)

### Use Cases:
- One-to-few relationships (comments on a blog post)
- Hierarchical data (categories with subcategories)
- Data that is always accessed together (user profile with preferences)
- Embedded documents that are small and infrequently updated

## Referencing Example
In a referencing model, related data is stored in separate documents with references. This approach is good for data that is large, frequently updated, or shared across multiple documents.

### Benefits:
- Normalized data structure reduces duplication
- Easier to maintain and update referenced data
- Supports many-to-many relationships naturally
- No document size limitations
- References can be shared across multiple documents

### Trade-offs:
- Requires multiple queries or joins to retrieve related data
- More complex querying for hierarchical data
- Potential for orphaned references if not managed properly
- May require application-level join logic

### Use Cases:
- One-to-many or many-to-many relationships (users and posts)
- Large sub-documents that grow indefinitely (activity logs)
- Shared reference data (categories, tags, reference lists)
- When related data is accessed independently

## Implementation in Hexa
Hexa demonstrates these concepts in `client/src/demos/nosqlConcepts.js` with practical examples showing:
- Blog post with embedded author and comments (embedding)
- Separate collections for users, posts, and comments (referencing)
- Aggregation pipelines for data processing