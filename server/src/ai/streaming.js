// Streaming Responses — Server-Sent Events (SSE)
// Concept: Streaming responses (AI App Eng)
// Implements token-by-token streaming of LLM responses via SSE
// Demonstrates backpressure handling, stream lifecycle, and client reconnection

import llmClient from './llmClient.js';

/**
 * Active stream connections tracker
 * Used for monitoring and graceful shutdown
 */
const activeStreams = new Set();

/**
 * Stream an LLM response token-by-token via Server-Sent Events (SSE)
 *
 * SSE Protocol:
 * - Each event is formatted as: "data: <json>\n\n"
 * - Special events: [START], [DONE], [ERROR]
 * - Client receives tokens incrementally for real-time display
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response (SSE stream)
 * @param {Array<{role: string, content: string}>} messages - Chat messages
 * @param {Object} options - Streaming options
 */
async function streamResponse(req, res, messages, options = {}) {
  const {
    chunkDelayMs = 50,  // Delay between chunks to simulate token-by-token streaming
    onComplete = null    // Optional callback when streaming completes
  } = options;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',           // Disable nginx buffering
    'Access-Control-Allow-Origin': '*'
  });

  // Track this stream
  const streamId = `stream-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  activeStreams.add(streamId);

  // Send SSE helper
  const sendEvent = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Handle client disconnect (backpressure / cleanup)
  let isClientConnected = true;
  req.on('close', () => {
    isClientConnected = false;
    activeStreams.delete(streamId);
    console.log(`SSE stream ${streamId} closed by client`);
  });

  try {
    // Send stream start event
    sendEvent('start', {
      streamId,
      model: llmClient.provider,
      timestamp: new Date().toISOString()
    });

    // Get the full response from LLM
    const response = await llmClient.chat(messages, { temperature: 0.7 });
    const fullContent = response.content;

    // Tokenize the response (split into word-level chunks for streaming)
    const tokens = tokenize(fullContent);
    let streamedContent = '';
    let tokenIndex = 0;

    // Stream tokens one by one
    for (const token of tokens) {
      // Check if client is still connected (backpressure handling)
      if (!isClientConnected) {
        console.log(`SSE stream ${streamId}: client disconnected, stopping`);
        break;
      }

      streamedContent += token;
      tokenIndex++;

      // Send token event
      sendEvent('token', {
        token,
        index: tokenIndex,
        totalTokens: tokens.length
      });

      // Simulate token generation delay
      if (chunkDelayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, chunkDelayMs));
      }
    }

    // Send completion event with usage stats
    if (isClientConnected) {
      sendEvent('done', {
        streamId,
        content: streamedContent,
        usage: response.usage,
        model: response.model,
        latencyMs: response.latencyMs,
        totalTokensStreamed: tokenIndex,
        timestamp: new Date().toISOString()
      });

      // Call completion callback if provided
      if (onComplete) {
        onComplete({ streamId, content: streamedContent, usage: response.usage });
      }
    }
  } catch (error) {
    // Send error event
    if (isClientConnected) {
      sendEvent('error', {
        streamId,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
    console.error(`SSE stream ${streamId} error:`, error.message);
  } finally {
    // Clean up
    activeStreams.delete(streamId);
    if (isClientConnected) {
      res.end();
    }
  }
}

/**
 * Tokenize text into word-level chunks
 * Preserves whitespace and punctuation for natural streaming appearance
 *
 * @param {string} text - Full text to tokenize
 * @returns {string[]} Array of tokens
 */
function tokenize(text) {
  // Split on word boundaries, preserving spaces and punctuation
  const tokens = [];
  const regex = /(\S+\s*)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    tokens.push(match[1]);
  }

  // If text ends with whitespace that wasn't captured
  if (tokens.length === 0 && text.length > 0) {
    tokens.push(text);
  }

  return tokens;
}

/**
 * Get active stream statistics
 */
function getStreamStats() {
  return {
    activeStreams: activeStreams.size,
    streamIds: Array.from(activeStreams)
  };
}

/**
 * Create SSE stream middleware
 * Usage: router.post('/stream', createStreamHandler(options))
 */
function createStreamHandler(options = {}) {
  return async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: { code: 'INVALID_INPUT', message: 'messages array is required' }
      });
    }

    await streamResponse(req, res, messages, options);
  };
}

export { streamResponse, tokenize, getStreamStats, createStreamHandler };
export default { streamResponse, tokenize, getStreamStats, createStreamHandler };
