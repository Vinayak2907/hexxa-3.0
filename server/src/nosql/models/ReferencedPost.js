// MongoDB Referenced Relationship Schema Model (NoSQL Mongoose)
// Demonstrates Referencing Relationship Pattern (ObjectId references pointing to User model)

import mongoose from 'mongoose';

const referencedPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // REFERENCING RELATIONSHIP via ObjectId
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.ReferencedPost || mongoose.model('ReferencedPost', referencedPostSchema);
