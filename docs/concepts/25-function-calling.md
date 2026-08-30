# Concept 25: Function Calling / Tool Use

## Overview
Function calling (or Tool Use) allows an LLM to interact with external systems. Instead of just returning text, the LLM can decide to output a structured JSON command requesting the execution of a specific function.

Hexa implements a complete Tool Execution Engine, allowing the LLM to search for tasks, perform calculations, or get the current time.

## The Tool Use Loop Architecture

Tool use requires a multi-step execution loop:

1. **Definition**: The server provides the LLM with a list of available tools, including their JSON schema parameter definitions.
2. **Decision**: The LLM analyzes the user prompt and decides if a tool is needed. If yes, it outputs a tool call JSON object.
3. **Execution**: The server intercepts the tool call, executes the requested Node.js function, and captures the result.
4. **Resolution**: The server sends the tool result *back* to the LLM.
5. **Synthesis**: The LLM reads the result and generates a final natural language answer for the user.

## Implementation Details

### 1. Tool Registry & Schema Definition
Tools are registered with explicit JSON schemas so the LLM understands exactly what arguments are required.
```javascript
// server/src/ai/functionCalling.js
registerTool({
  name: 'search_tasks',
  description: 'Search for tasks in the system by keyword',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' }
    },
    required: ['query']
  },
  handler: async ({ query }) => {
    // Database search logic...
  }
});
```

### 2. The Execution Loop
The engine manages the back-and-forth conversation between the LLM and the local environment.
```javascript
// 1. LLM decides to call a tool
const llmResponse = await llmClient.chat(messages);
const toolCall = parseToolCall(llmResponse.content);

if (toolCall) {
  // 2. Execute local function
  const result = await executeTool(toolCall.name, toolCall.arguments);

  // 3. Feed result back to LLM
  messages.push({ role: 'assistant', content: JSON.stringify(toolCall) });
  messages.push({ role: 'user', content: `Tool result: ${JSON.stringify(result)}` });

  // 4. Get final answer
  const finalAnswer = await llmClient.chat(messages);
}
```

## Verification / Demo
- API Endpoint: `POST /api/ai/tools/loop`
- Pass `{"prompt": "Search for tasks related to authentication"}`. The response will include a `trace` array showing the LLM outputting a JSON tool call for `search_tasks`, the server executing it, and the LLM summarizing the results.
