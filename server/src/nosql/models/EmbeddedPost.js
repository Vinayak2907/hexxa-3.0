// MongoDB Embedded Relationship Schema Model (NoSQL Mongoose)
// Demonstrates Embedding Relationship Pattern (Comments embedded directly inside Post document)

import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const embeddedPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'General' },
  comments: [commentSchema], // EMBEDDED RELATIONSHIP
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.EmbeddedPost || mongoose.model('EmbeddedPost', embeddedPostSchema);
