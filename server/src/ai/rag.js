// RAG — Retrieval-Augmented Generation
// Concept: RAG — embeddings & vector retrieval (AI App Eng)
// Implements: document chunking, embedding generation, in-memory vector store,
// cosine similarity search, and context-augmented LLM generation

import llmClient from './llmClient.js';

// ================================================================
// VECTOR MATH UTILITIES
// ================================================================

/**
 * Compute cosine similarity between two vectors
 * cos(A, B) = (A · B) / (|A| × |B|)
 *
 * @param {number[]} a - Vector A
 * @param {number[]} b - Vector B
 * @returns {number} Cosine similarity (-1 to 1)
 */
function cosineSimilarity(a, b) {
  if (a.length !== b.length) throw new Error('Vectors must have same dimensions');

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Generate a simulated embedding vector for text
 * In production, use OpenAI text-embedding-ada-002 or similar
 * This generates deterministic pseudo-embeddings based on text features
 *
 * @param {string} text - Input text
 * @param {number} dimensions - Embedding dimensions (default: 128)
 * @returns {number[]} Embedding vector
 */
function generateEmbedding(text, dimensions = 128) {
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/);
  const embedding = new Array(dimensions).fill(0);

  // Generate pseudo-embedding based on character and word features
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const charCode = word.charCodeAt(j);
      const dimIndex = (charCode * (i + 1) + j * 31) % dimensions;
      embedding[dimIndex] += 1.0 / (words.length + 1);
    }
  }

  // Normalize to unit vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimensions; i++) {
      embedding[i] /= magnitude;
    }
  }

  return embedding;
}

// ================================================================
// DOCUMENT CHUNKING
// ================================================================

/**
 * Split a document into overlapping chunks for embedding
 *
 * @param {string} text - Full document text
 * @param {Object} options - Chunking options
 * @param {number} options.chunkSize - Max characters per chunk (default: 500)
 * @param {number} options.overlap - Character overlap between chunks (default: 100)
 * @returns {Array<{text: string, startChar: number, endChar: number, index: number}>}
 */
function chunkDocument(text, options = {}) {
  const { chunkSize = 500, overlap = 100 } = options;
  const chunks = [];

  // Split on paragraph boundaries first
  const paragraphs = text.split(/\n\n+/);
  let currentChunk = '';
  let chunkStart = 0;
  let charPos = 0;

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
      // Store current chunk
      chunks.push({
        text: currentChunk.trim(),
        startChar: chunkStart,
        endChar: charPos,
        index: chunks.length
      });

      // Start new chunk with overlap from previous
      const overlapText = currentChunk.slice(-overlap);
      currentChunk = overlapText + '\n\n' + paragraph;
      chunkStart = charPos - overlap;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }

    charPos += paragraph.length + 2; // +2 for \n\n
  }

  // Don't forget the last chunk
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      startChar: chunkStart,
      endChar: charPos,
      index: chunks.length
    });
  }

  return chunks;
}

// ================================================================
// IN-MEMORY VECTOR STORE
// ================================================================

/**
 * VectorStore — in-memory vector database for RAG
 * In production, use Pinecone, Weaviate, pgvector, or ChromaDB
 */
class VectorStore {
  constructor() {
    this.documents = []; // Array of { id, text, embedding, metadata }
    this.embeddingDimensions = 128;
  }

  /**
   * Add a document to the vector store
   * Chunks the document, generates embeddings, and indexes them
   *
   * @param {string} id - Document identifier
   * @param {string} text - Document text
   * @param {Object} metadata - Additional metadata (source, title, etc.)
   */
  addDocument(id, text, metadata = {}) {
    const chunks = chunkDocument(text);

    for (const chunk of chunks) {
      const embedding = generateEmbedding(chunk.text, this.embeddingDimensions);

      this.documents.push({
        id: `${id}_chunk_${chunk.index}`,
        documentId: id,
        text: chunk.text,
        embedding,
        metadata: {
          ...metadata,
          chunkIndex: chunk.index,
          totalChunks: chunks.length,
          startChar: chunk.startChar,
          endChar: chunk.endChar
        }
      });
    }

    console.log(`RAG: Indexed document "${id}" — ${chunks.length} chunks`);
  }

  /**
   * Search for similar documents using cosine similarity
   *
   * @param {string} query - Search query
   * @param {number} topK - Number of results to return (default: 3)
   * @param {number} minSimilarity - Minimum similarity threshold (default: 0.1)
   * @returns {Array<{text: string, similarity: number, metadata: Object}>}
   */
  search(query, topK = 3, minSimilarity = 0.1) {
    const queryEmbedding = generateEmbedding(query, this.embeddingDimensions);

    // Calculate similarity scores for all documents
    const scored = this.documents.map(doc => ({
      text: doc.text,
      documentId: doc.documentId,
      similarity: cosineSimilarity(queryEmbedding, doc.embedding),
      metadata: doc.metadata
    }));

    // Sort by similarity (descending) and filter by threshold
    return scored
      .filter(doc => doc.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);
  }

  /**
   * Get store statistics
   */
  getStats() {
    const uniqueDocs = new Set(this.documents.map(d => d.documentId));
    return {
      totalChunks: this.documents.length,
      uniqueDocuments: uniqueDocs.size,
      embeddingDimensions: this.embeddingDimensions
    };
  }

  /**
   * Clear all documents
   */
  clear() {
    this.documents = [];
  }
}

// ================================================================
// RAG PIPELINE
// ================================================================

// Singleton vector store instance
const vectorStore = new VectorStore();

// Pre-populate with Hexa project knowledge base
const HEXA_KNOWLEDGE_BASE = [
  {
    id: 'hexa-architecture',
    title: 'Hexa Architecture Overview',
    content: `Hexa is a full-stack task and project management platform built for engineering learning. The backend uses Express.js with PostgreSQL for relational data and MongoDB for document storage. Redis handles caching and session management. The frontend is built with React and Vite, using React Router for client-side routing and Context API for state management. The application follows a layered architecture: routes → controllers → services → repositories → database. WebSocket support enables real-time updates for task changes and notifications.`
  },
  {
    id: 'hexa-auth',
    title: 'Hexa Authentication System',
    content: `Authentication in Hexa uses JWT (JSON Web Tokens) with access and refresh token pairs. Access tokens are short-lived (15 minutes) and sent in Authorization headers. Refresh tokens are long-lived (7 days) and stored in HTTP-only cookies. The system includes role-based access control (RBAC) with roles: admin, manager, and user. Rate limiting protects authentication endpoints from brute-force attacks. OAuth 2.0 integration supports third-party login via Google, following the authorization code flow with PKCE and CSRF state tokens.`
  },
  {
    id: 'hexa-database',
    title: 'Hexa Database Design',
    content: `Hexa uses PostgreSQL with a normalized relational schema. Core tables: users (with role column for RBAC), projects (owned by users via owner_id FK), and tasks (belonging to projects via project_id FK, created by users via created_by FK). Indexes optimize common queries: idx_users_email for login lookups, idx_tasks_project_id for project task listings, idx_tasks_status for status filtering. MongoDB stores denormalized documents using both embedding (comments inside posts) and referencing (posts referencing users by ObjectId) patterns.`
  },
  {
    id: 'hexa-ai',
    title: 'Hexa AI Integration',
    content: `Hexa integrates AI capabilities through a unified LLM client that supports OpenAI, Gemini, and simulated providers. Features include: streaming responses via Server-Sent Events (SSE) for real-time token delivery, structured output enforcement with JSON schema validation and retry logic, function calling with a tool registry pattern, RAG (Retrieval-Augmented Generation) using an in-memory vector store with cosine similarity search, prompt injection defenses, and a multi-step ReAct agent. Token usage is monitored for cost tracking and budget alerting.`
  },
  {
    id: 'hexa-security',
    title: 'Hexa Security Practices',
    content: `Security in Hexa follows defense-in-depth principles. Input sanitization prevents XSS attacks on all API inputs. Rate limiting protects against DDoS and brute-force attacks with configurable windows per endpoint. Helmet.js sets secure HTTP headers including Content Security Policy. CORS is configured to allow only the known client origin. File uploads are validated for MIME type, size, and stored with randomized filenames to prevent path traversal. Environment variables store secrets with fail-fast validation on startup. Prompt injection defenses detect and block malicious LLM inputs.`
  }
];

// Index the knowledge base
for (const doc of HEXA_KNOWLEDGE_BASE) {
  vectorStore.addDocument(doc.id, doc.content, { title: doc.title, source: 'hexa-docs' });
}

/**
 * RAG Query Pipeline
 * 1. Retrieve relevant context from vector store
 * 2. Augment the user's prompt with retrieved context
 * 3. Generate response using LLM with grounded context
 *
 * @param {string} query - User's question
 * @param {Object} options - Pipeline options
 * @returns {Object} RAG response with sources
 */
async function ragQuery(query, options = {}) {
  const { topK = 3, minSimilarity = 0.1 } = options;

  // Step 1: RETRIEVE — find relevant context
  const retrievedDocs = vectorStore.search(query, topK, minSimilarity);

  // Step 2: AUGMENT — build context-enriched prompt
  const contextText = retrievedDocs
    .map((doc, i) => `[Source ${i + 1}: ${doc.metadata.title || doc.documentId}]\n${doc.text}`)
    .join('\n\n---\n\n');

  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful assistant for the Hexa platform. ' +
        'Answer questions using ONLY the provided context. ' +
        'If the context does not contain the answer, say "I don\'t have enough information to answer that." ' +
        'Always cite your sources by referencing [Source N].'
    },
    {
      role: 'user',
      content: `Context:\n${contextText}\n\n---\n\nQuestion: ${query}`
    }
  ];

  // Step 3: GENERATE — LLM response grounded in retrieved context
  const response = await llmClient.chat(messages, { temperature: 0.3 });

  return {
    answer: response.content,
    sources: retrievedDocs.map(doc => ({
      documentId: doc.documentId,
      title: doc.metadata.title,
      similarity: Math.round(doc.similarity * 1000) / 1000,
      excerpt: doc.text.substring(0, 200) + '...'
    })),
    pipeline: {
      query,
      documentsRetrieved: retrievedDocs.length,
      topSimilarity: retrievedDocs[0]?.similarity || 0,
      model: response.model,
      usage: response.usage
    }
  };
}

/**
 * Add a custom document to the RAG knowledge base
 */
function addToKnowledgeBase(id, title, content) {
  vectorStore.addDocument(id, content, { title, source: 'user-added' });
}

export {
  cosineSimilarity,
  generateEmbedding,
  chunkDocument,
  VectorStore,
  vectorStore,
  ragQuery,
  addToKnowledgeBase
};

export default { ragQuery, addToKnowledgeBase, vectorStore, cosineSimilarity, generateEmbedding, chunkDocument };
