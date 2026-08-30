// Function Calling / Tool Use
// Concept: Function calling / tool use (AI App Eng)
// Implements a tool registry, JSON schema tool definitions, and the tool-use execution loop
// Demonstrates how LLMs invoke external functions via structured tool calls

import llmClient from './llmClient.js';

/**
 * Tool Registry — stores available tools with their schemas and handlers
 * Each tool has:
 * - name: unique identifier
 * - description: what the tool does (sent to LLM)
 * - parameters: JSON schema for the tool's input parameters
 * - handler: async function that executes the tool
 */
const toolRegistry = new Map();

/**
 * Register a tool in the registry
 *
 * @param {Object} toolDef - Tool definition
 * @param {string} toolDef.name - Tool name
 * @param {string} toolDef.description - Tool description for LLM
 * @param {Object} toolDef.parameters - JSON schema for parameters
 * @param {Function} toolDef.handler - Async function to execute
 */
function registerTool({ name, description, parameters, handler }) {
  toolRegistry.set(name, { name, description, parameters, handler });
}

// ================================================================
// BUILT-IN TOOLS — Demonstrate various tool types
// ================================================================

registerTool({
  name: 'get_current_time',
  description: 'Get the current date and time in ISO format',
  parameters: {
    type: 'object',
    properties: {
      timezone: {
        type: 'string',
        description: 'IANA timezone name (e.g., "America/New_York")',
        default: 'UTC'
      }
    },
    required: []
  },
  handler: async ({ timezone = 'UTC' }) => {
    const now = new Date();
    return {
      iso: now.toISOString(),
      timezone,
      formatted: now.toLocaleString('en-US', { timeZone: timezone }),
      unix: Math.floor(now.getTime() / 1000)
    };
  }
});

registerTool({
  name: 'calculate',
  description: 'Perform a mathematical calculation. Supports basic arithmetic operations.',
  parameters: {
    type: 'object',
    properties: {
      expression: {
        type: 'string',
        description: 'Mathematical expression to evaluate (e.g., "2 + 3 * 4")'
      }
    },
    required: ['expression']
  },
  handler: async ({ expression }) => {
    // Safe math evaluation (no eval)
    const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
    try {
      const result = Function(`"use strict"; return (${sanitized})`)();
      return { expression: sanitized, result, type: typeof result };
    } catch (error) {
      return { expression: sanitized, error: 'Invalid mathematical expression' };
    }
  }
});

registerTool({
  name: 'search_tasks',
  description: 'Search for tasks in the Hexa project management system by keyword or status',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query for task title or description'
      },
      status: {
        type: 'string',
        description: 'Filter by task status',
        enum: ['todo', 'in_progress', 'completed']
      },
      limit: {
        type: 'number',
        description: 'Maximum number of results',
        default: 5
      }
    },
    required: ['query']
  },
  handler: async ({ query, status, limit = 5 }) => {
    // Simulated task search results
    const mockTasks = [
      { id: 1, title: 'Implement user authentication', status: 'completed', project: 'Hexa Core' },
      { id: 2, title: 'Design database schema', status: 'completed', project: 'Hexa Core' },
      { id: 3, title: 'Add rate limiting middleware', status: 'in_progress', project: 'Hexa Security' },
      { id: 4, title: 'Create task dashboard UI', status: 'todo', project: 'Hexa Frontend' },
      { id: 5, title: 'Write API documentation', status: 'todo', project: 'Hexa Docs' },
      { id: 6, title: 'Set up CI/CD pipeline', status: 'in_progress', project: 'Hexa DevOps' }
    ];

    let results = mockTasks.filter(task =>
      task.title.toLowerCase().includes(query.toLowerCase())
    );

    if (status) {
      results = results.filter(t => t.status === status);
    }

    return { query, status: status || 'all', results: results.slice(0, limit), total: results.length };
  }
});

registerTool({
  name: 'create_task',
  description: 'Create a new task in the Hexa project management system',
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string', description: 'Task title' },
      description: { type: 'string', description: 'Task description' },
      status: { type: 'string', enum: ['todo', 'in_progress', 'completed'], default: 'todo' },
      projectId: { type: 'number', description: 'Project ID to assign task to' }
    },
    required: ['title', 'projectId']
  },
  handler: async ({ title, description = '', status = 'todo', projectId }) => {
    // Simulated task creation
    return {
      id: Math.floor(Math.random() * 1000) + 100,
      title,
      description,
      status,
      projectId,
      createdAt: new Date().toISOString(),
      message: 'Task created successfully'
    };
  }
});

// ================================================================
// TOOL EXECUTION ENGINE
// ================================================================

/**
 * Get tool definitions in OpenAI function calling format
 * These are sent to the LLM to inform it of available tools
 */
function getToolDefinitions() {
  return Array.from(toolRegistry.values()).map(tool => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters
    }
  }));
}

/**
 * Execute a tool call by name with given arguments
 *
 * @param {string} toolName - Name of the tool to execute
 * @param {Object} args - Tool arguments
 * @returns {Object} Tool execution result
 */
async function executeTool(toolName, args = {}) {
  const tool = toolRegistry.get(toolName);

  if (!tool) {
    return {
      error: `Unknown tool: ${toolName}`,
      availableTools: Array.from(toolRegistry.keys())
    };
  }

  try {
    const startTime = Date.now();
    const result = await tool.handler(args);
    const executionTimeMs = Date.now() - startTime;

    return {
      tool: toolName,
      args,
      result,
      executionTimeMs,
      success: true
    };
  } catch (error) {
    return {
      tool: toolName,
      args,
      error: error.message,
      success: false
    };
  }
}

/**
 * Run the tool-use loop:
 * 1. Send user message + tool definitions to LLM
 * 2. LLM decides which tool(s) to call
 * 3. Execute the tool(s) and return results to LLM
 * 4. LLM generates final response incorporating tool results
 *
 * @param {string} userMessage - User's input
 * @param {Object} options - Options
 * @param {number} options.maxIterations - Max tool-call rounds (default: 3)
 * @returns {Object} Final response with tool execution trace
 */
async function runToolLoop(userMessage, options = {}) {
  const { maxIterations = 3 } = options;
  const toolDefs = getToolDefinitions();
  const trace = []; // Records all steps for observability

  // System prompt that instructs the LLM to use tools
  const systemPrompt =
    `You are a helpful assistant with access to tools. When you need to perform an action ` +
    `or look up information, use the available tools by responding with a JSON tool call.\n\n` +
    `Available tools:\n${toolDefs.map(t =>
      `- ${t.function.name}: ${t.function.description}\n  Parameters: ${JSON.stringify(t.function.parameters)}`
    ).join('\n')}\n\n` +
    `To call a tool, respond with ONLY this JSON format:\n` +
    `{"tool_call": {"name": "<tool_name>", "arguments": {<args>}}}\n\n` +
    `After receiving tool results, provide a natural language response to the user.\n` +
    `If no tool is needed, respond directly to the user.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userMessage }
  ];

  let finalResponse = null;

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Call LLM
    const llmResponse = await llmClient.chat(messages, { temperature: 0.3 });
    const responseText = llmResponse.content;

    trace.push({
      step: iteration + 1,
      type: 'llm_response',
      content: responseText,
      usage: llmResponse.usage
    });

    // Check if LLM wants to call a tool
    let toolCall = null;
    try {
      const parsed = JSON.parse(responseText);
      if (parsed.tool_call) {
        toolCall = parsed.tool_call;
      }
    } catch {
      // Not a JSON response — LLM is giving a direct answer
      // Also check if JSON is embedded in text
      const jsonMatch = responseText.match(/\{"tool_call":\s*\{.*\}\}/s);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          toolCall = parsed.tool_call;
        } catch {
          // Not a tool call
        }
      }
    }

    if (toolCall) {
      // Execute the tool
      const toolResult = await executeTool(toolCall.name, toolCall.arguments || {});

      trace.push({
        step: iteration + 1,
        type: 'tool_execution',
        tool: toolCall.name,
        args: toolCall.arguments,
        result: toolResult
      });

      // Feed tool result back to LLM
      messages.push({ role: 'assistant', content: responseText });
      messages.push({
        role: 'user',
        content: `Tool "${toolCall.name}" returned:\n${JSON.stringify(toolResult.result || toolResult.error, null, 2)}\n\nProvide a natural language response to the user based on this result.`
      });
    } else {
      // LLM gave a direct response — done
      finalResponse = responseText;
      break;
    }
  }

  // If we exhausted iterations without a final response
  if (!finalResponse) {
    finalResponse = 'I was unable to complete the request within the allowed tool-call iterations.';
  }

  return {
    response: finalResponse,
    trace,
    toolsAvailable: Array.from(toolRegistry.keys()),
    iterations: trace.filter(t => t.type === 'llm_response').length,
    toolCallsMade: trace.filter(t => t.type === 'tool_execution').length
  };
}

export {
  registerTool,
  getToolDefinitions,
  executeTool,
  runToolLoop,
  toolRegistry
};

export default {
  registerTool,
  getToolDefinitions,
  executeTool,
  runToolLoop,
  toolRegistry
};
