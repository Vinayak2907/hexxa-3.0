# Concept 26: RAG — Embeddings & Vector Retrieval

## Overview
Retrieval-Augmented Generation (RAG) solves the two biggest limitations of LLMs: hallucinations and lack of access to private/recent data.

RAG works by converting your private data into mathematical vectors (embeddings), storing them in a database, and then searching for the most relevant data to append to the user's prompt *before* sending it to the LLM.

Hexa implements a complete, self-contained RAG pipeline with an in-memory vector store.

## The RAG Pipeline Implementation

### 1. Document Chunking
LLMs have context window limits, and embedding models work best on short paragraphs. We split large documents into small, overlapping chunks.
```javascript
// server/src/ai/rag.js
function chunkDocument(text, { chunkSize = 500, overlap = 100 }) {
  // Splits text into ~500 char chunks with 100 chars of overlap
  // to ensure context isn't lost at the boundaries.
}
```

### 2. Embeddings Generation
Text is converted into high-dimensional vectors. (Hexa uses a deterministic pseudo-embedding algorithm for demonstration without API keys, but in production this would call OpenAI's `text-embedding-ada-002`).

### 3. Vector Storage
Chunks and their embeddings are stored in our `VectorStore`. In production, this would be Pinecone, Weaviate, or pgvector.

### 4. Vector Retrieval (Cosine Similarity)
When a user asks a question, we embed their query and calculate the geometric angle between the query vector and all document vectors.
```javascript
// Cosine similarity formula: (A · B) / (|A| × |B|)
function cosineSimilarity(a, b) {
  // Returns score from -1.0 (opposite) to 1.0 (identical)
}
```

### 5. Augmented Generation
We retrieve the top-K most similar chunks, inject them into the system prompt, and ask the LLM to answer the question *only* using the provided context.

```javascript
const contextText = retrievedDocs.map(doc => doc.text).join('\n\n');
const messages = [
  { role: 'system', content: 'Answer ONLY using the provided context.' },
  { role: 'user', content: `Context: ${contextText}\n\nQuestion: ${query}` }
];
```

## Verification / Demo
- API Endpoint: `POST /api/ai/rag/query`
- Send `{"query": "How does authentication work in Hexa?"}`. The response will include the LLM's answer along with a `sources` array showing which specific chunks of the knowledge base were retrieved and their similarity scores.
