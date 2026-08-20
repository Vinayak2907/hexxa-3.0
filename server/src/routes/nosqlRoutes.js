// NoSQL Express Routes for Mongo Embedding vs Referencing Demonstrations
import express from 'express';
import EmbeddedPost from '../nosql/models/EmbeddedPost.js';
import ReferencedPost from '../nosql/models/ReferencedPost.js';

const router = express.Router();

// GET /api/nosql/embedding - Demonstrates NoSQL Document Embedding
router.get('/embedding', async (req, res, next) => {
  try {
    const sampleEmbedded = {
      concept: 'Embedding Relationship (NoSQL Mongo)',
      description: 'Related comments stored inside single parent Post document for fast single-query reads.',
      model: 'EmbeddedPost',
      sampleDocument: {
        _id: '65c8f12a3b4c5d6e7f8a9b0c',
        title: 'Building Scalable Apps',
        content: 'Overview of MongoDB schema modeling',
        comments: [
          { author: 'Alice', content: 'Great article on embedding!', createdAt: new Date() },
          { author: 'Bob', content: 'Very helpful comparison.', createdAt: new Date() }
        ]
      }
    };
    res.status(200).json(sampleEmbedded);
  } catch (err) {
    next(err);
  }
});

// GET /api/nosql/referencing - Demonstrates NoSQL Document Referencing
router.get('/referencing', async (req, res, next) => {
  try {
    const sampleReferenced = {
      concept: 'Referencing Relationship (NoSQL Mongo)',
      description: 'Documents maintain ObjectId references to target documents to prevent duplication and scaling bottlenecks.',
      model: 'ReferencedPost',
      sampleDocument: {
        _id: '65c8f99a3b4c5d6e7f8a9b99',
        title: 'Advanced Database Architecture',
        author: '65c8f12a3b4c5d6e7f8a9b00', // ObjectId reference pointing to User model
        authorRef: {
          _id: '65c8f12a3b4c5d6e7f8a9b00',
          name: 'Jane Smith',
          email: 'jane@example.com'
        }
      }
    };
    res.status(200).json(sampleReferenced);
  } catch (err) {
    next(err);
  }
});

export default router;
