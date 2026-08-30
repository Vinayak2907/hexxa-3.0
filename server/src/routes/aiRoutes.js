// AI / LLM Express Routes
// Exposes endpoints for all AI App Engineering concepts

import express from 'express';
import llmClient from '../ai/llmClient.js';
import promptTemplates from '../ai/promptTemplates.js';
import structuredOutput from '../ai/structuredOutput.js';
import streaming from '../ai/streaming.js';
import functionCalling from '../ai/functionCalling.js';
import rag from '../ai/rag.js';
import evalSets from '../ai/evalSets.js';
import promptGuard from '../ai/promptGuard.js';
import tokenMonitor from '../ai/tokenMonitor.js';
import Agent from '../ai/agent.js';

const router = express.Router();

/**
 * AI Integration Middleware
 * Tracks tokens and enforces budgets for all AI routes
 */
function aiUsageMiddleware(req, res, next) {
  const userId = req.user?.id || 'anonymous';
  const permission = tokenMonitor.checkPermission(userId);

  if (!permission.allowed) {
    return res.status(429).json({
      error: { code: 'BUDGET_EXHAUSTED', message: permission.reason }
    });
  }

  // Hook into response finish to log tracked usage if any was recorded
  const originalJson = res.json;
  res.json = function (body) {
    if (body && body.usage && body.model) {
      tokenMonitor.trackUsage({
        promptTokens: body.usage.promptTokens,
        completionTokens: body.usage.completionTokens,
        model: body.model,
        userId,
        featureId: req.path
      });
    }
    return originalJson.call(this, body);
  };

  next();
}

router.use(aiUsageMiddleware);

/**
 * GET /api/ai/status
 * Get AI system status and configuration
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'online',
    provider: llmClient.provider,
    isSimulated: llmClient.provider === 'simulated',
    features: [
      'streaming', 'structured_outputs', 'function_calling',
      'rag', 'evals', 'prompt_guard', 'token_monitoring', 'agent'
    ]
  });
});

/**
 * POST /api/ai/chat
 * Concept: LLM API integration
 * Basic chat completion
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { messages, options } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array required' });
    }
    const response = await llmClient.chat(messages, options || {});
    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai/prompts
 * Concept: Prompt engineering
 * List available templates
 */
router.get('/prompts', (req, res) => {
  res.json({ templates: promptTemplates.getAllTemplates() });
});

/**
 * POST /api/ai/prompts/:name
 * Execute a specific prompt template
 */
router.post('/prompts/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    const { variables } = req.body;

    const template = promptTemplates.getTemplate(name);
    if (!template) {
      return res.status(404).json({ error: `Template '${name}' not found` });
    }

    const messages = template.buildMessages(variables || {});
    const response = await llmClient.chat(messages);
    res.json({ template: name, messages, response });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai/structured/schemas
 * List available schemas
 */
router.get('/structured/schemas', (req, res) => {
  res.json({ schemas: structuredOutput.getAvailableSchemas() });
});

/**
 * POST /api/ai/structured/:schema
 * Concept: Structured outputs
 * Get guaranteed JSON output conforming to a schema
 */
router.post('/structured/:schema', async (req, res, next) => {
  try {
    const { schema } = req.params;
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const result = await structuredOutput.getStructuredOutput(schema, prompt);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/stream
 * Concept: Streaming responses
 * SSE streaming endpoint
 */
router.post('/stream', streaming.createStreamHandler({
  chunkDelayMs: 50,
  onComplete: (stats) => {
    // Record usage asynchronously after stream completes
    if (stats.usage) {
      tokenMonitor.trackUsage({
        promptTokens: stats.usage.promptTokens || 0,
        completionTokens: stats.usage.completionTokens || 0,
        model: stats.model || llmClient.provider,
        featureId: '/api/ai/stream'
      });
    }
  }
}));

/**
 * GET /api/ai/tools
 * List available tools
 */
router.get('/tools', (req, res) => {
  res.json({ tools: functionCalling.getToolDefinitions() });
});

/**
 * POST /api/ai/tools/loop
 * Concept: Function calling / tool use
 * Run the tool-use loop
 */
router.post('/tools/loop', async (req, res, next) => {
  try {
    const { prompt, maxIterations } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });

    const result = await functionCalling.runToolLoop(prompt, { maxIterations });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/rag/query
 * Concept: RAG — embeddings & vector retrieval
 */
router.post('/rag/query', async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    const result = await rag.ragQuery(query);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai/evals
 * List eval datasets
 */
router.get('/evals', (req, res) => {
  res.json({ datasets: evalSets.getAvailableDatasets() });
});

/**
 * POST /api/ai/evals/:dataset
 * Concept: LLM eval sets
 * Run an evaluation dataset
 */
router.post('/evals/:dataset', async (req, res, next) => {
  try {
    const { dataset } = req.params;
    const result = await evalSets.runEval(dataset);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai/guard
 * Concept: Prompt injection awareness & defenses
 */
router.post('/guard', (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  const result = promptGuard.guardPrompt(prompt);
  res.json(result);
});

/**
 * GET /api/ai/usage
 * Concept: Token & cost monitoring
 */
router.get('/usage', (req, res) => {
  res.json(tokenMonitor.getReport());
});

/**
 * POST /api/ai/agent
 * Concept: Multi-step agent
 */
router.post('/agent', async (req, res, next) => {
  try {
    const { task, maxSteps } = req.body;
    if (!task) return res.status(400).json({ error: 'task is required' });

    const agent = new Agent({ maxSteps: maxSteps || 5 });
    const result = await agent.run(task, req.user?.id || 'anonymous');

    // Manually track usage since the agent makes multiple calls
    if (result.metrics?.tokensUsed) {
      tokenMonitor.trackUsage({
        promptTokens: result.metrics.tokensUsed.prompt,
        completionTokens: result.metrics.tokensUsed.completion,
        model: llmClient.provider,
        featureId: '/api/ai/agent'
      });
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
