# Concept 30: Multi-Step Agent (ReAct)

## Overview
A traditional LLM call is stateless: prompt in, text out.
An **Agent** is an LLM wrapper that runs in a loop, allowing the AI to break down complex problems, formulate plans, execute tools, observe the results, and adjust its approach dynamically until the goal is met.

Hexa implements the **ReAct (Reasoning and Acting)** framework, one of the most effective agent architectures.

## The ReAct Loop

The agent forces the LLM to think before it acts, following a strict structured cycle:

1. **THOUGHT**: The LLM analyzes the current state and decides what to do next.
2. **ACTION**: The LLM outputs a JSON command to execute a specific tool.
3. **OBSERVATION**: The Node.js environment executes the tool and injects the result back into the prompt context.
4. **Repeat**: The cycle repeats until the LLM decides it has enough information to output a `final_answer`.

## Implementation Details

```javascript
// server/src/ai/agent.js
async run(userTask) {
  while (stepCount < maxSteps) {
    // 1. Get LLM response
    const response = await llmClient.chat(messages);
    const parsed = JSON.parse(response.content);

    // 2. Check for final answer
    if (parsed.final_answer) {
      return parsed.final_answer;
    }

    // 3. Execute Tool
    if (parsed.tool_call) {
      const result = await executeTool(parsed.tool_call.name, parsed.tool_call.arguments);

      // 4. Append observation to context for next loop
      messages.push({
        role: 'user',
        content: `Observation: ${JSON.stringify(result)}`
      });
    }
  }
}
```

## Agentic Capabilities Demonstrated

1. **Autonomous Tool Selection**: The agent decides *which* tool to use, when, and with what arguments.
2. **State Management**: The conversation history accumulates Observations, providing memory across the steps.
3. **Loop Control**: A hard `maxSteps` limit prevents infinite loops and runaway API costs.
4. **Self-Correction**: If a tool fails (e.g., invalid arguments), the error becomes the observation, and the agent's next THOUGHT will be to try again with corrected arguments.

## Verification / Demo
- API Endpoint: `POST /api/ai/agent`
- Pass `{"task": "Search for tasks related to authentication, then calculate how many days until the end of the year."}`. The response `trace` will show the agent making multiple distinct tool calls in sequence before providing the final synthesized answer.
