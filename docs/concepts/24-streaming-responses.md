# Concept 24: Streaming Responses (SSE)

## Overview
Large Language Models (LLMs) generate text token by token. Waiting for the complete generation before sending an HTTP response results in unacceptable perceived latency for users.

Hexa implements **Server-Sent Events (SSE)** to stream LLM responses back to the client in real-time, token by token.

## Why SSE over WebSockets?
While WebSockets support bidirectional real-time communication, SSE is a unidirectional (server-to-client) protocol built directly on standard HTTP. For LLM text streaming, SSE is the superior choice because:
1. It works over standard HTTP/1.1 and HTTP/2.
2. It handles proxy/firewall traversal better.
3. It has built-in browser reconnection logic.

## Implementation Details

### 1. Connection Initialization
We configure the Express response object to hold the connection open using specific headers.
```javascript
// server/src/ai/streaming.js
res.writeHead(200, {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  'Connection': 'keep-alive',
  'X-Accel-Buffering': 'no' // Prevents Nginx from buffering the stream
});
```

### 2. The SSE Protocol Format
SSE messages must follow a strict text format: `event: <type>\ndata: <json>\n\n`.
```javascript
const sendEvent = (event, data) => {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};
```

### 3. Backpressure & Disconnect Handling
If the user closes their browser tab mid-generation, the server must detect this and stop processing to save LLM costs and server resources.
```javascript
let isClientConnected = true;

req.on('close', () => {
  isClientConnected = false;
  // Cleanup resources...
});

// Inside generation loop:
if (!isClientConnected) break;
```

## The Stream Lifecycle
Our implementation emits specific lifecycle events that the frontend can listen to:
1. `start`: Indicates generation has begun.
2. `token`: Fired repeatedly for each new chunk of text.
3. `done`: Indicates completion and provides final token usage metrics.
4. `error`: Fired if the LLM API fails mid-stream.

## Verification / Demo
- API Endpoint: `POST /api/ai/stream`
- The endpoint will respond with an open HTTP connection, emitting `event: token` payloads sequentially until complete.
