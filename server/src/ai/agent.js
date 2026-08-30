// Multi-step ReAct Agent
// Concept: Multi-step agent (AI App Eng)
// Implements the ReAct (Reasoning and Acting) loop pattern
// Agent autonomously decides which tools to call in sequence to solve a problem

import llmClient from './llmClient.js';
import { getToolDefinitions, executeTool } from './functionCalling.js';
import { guardPrompt, verifyOutput } from './promptGuard.js';

/**
 * ReAct Agent Class
 * Implements a Reasoning -> Acting -> Observation loop
 */
class Agent {
  constructor(options = {}) {
    this.name = options.name || 'Hexa Assistant';
    this.maxSteps = options.maxSteps || 5;
    this.temperature = options.temperature || 0.2; // Low temperature for consistent reasoning
    this.tools = getToolDefinitions();
    this.systemPrompt = options.systemPrompt || this._getDefaultSystemPrompt();
  }

  /**
   * Define the base behavior and rules for the agent
   */
  _getDefaultSystemPrompt() {
    return `You are ${this.name}, an autonomous AI assistant for the Hexa project management platform.
You have access to tools that you can use to interact with the system.

Use the ReAct (Reasoning and Acting) framework to solve problems:
1. THOUGHT: Think step-by-step about what you need to do next.
2. ACTION: Call a tool (or return final answer).
3. OBSERVATION: (You will receive the tool output).
Repeat this cycle until you have enough information to provide a final answer.

To use a tool, output JSON in this exact format:
{"thought": "Your reasoning here...", "tool_call": {"name": "tool_name", "arguments": {"arg1": "val1"}}}

To provide a final answer, output JSON in this exact format:
{"thought": "I now have enough information...", "final_answer": "Your complete answer to the user"}

Available tools:
${this.tools.map(t => `- ${t.function.name}: ${t.function.description}\n  Parameters: ${JSON.stringify(t.function.parameters)}`).join('\n\n')}

Remember: Always respond with ONLY the JSON object. Do not add markdown blocks or extra text.`;
  }

  /**
   * Run the agent on a user task
   *
   * @param {string} userTask - The task for the agent to complete
   * @param {string} userId - User ID for tracking/auth
   * @returns {Object} Agent execution result including final answer and step trace
   */
  async run(userTask, userId = 'anonymous') {
    const startTime = Date.now();
    const trace = [];
    let stepCount = 0;
    let finalAnswer = null;
    let tokensUsed = { prompt: 0, completion: 0 };

    // 1. Guard against prompt injection
    const guardResult = guardPrompt(userTask);
    if (!guardResult.allowed) {
      return {
        success: false,
        finalAnswer: "I cannot process this request due to security restrictions.",
        trace: [{ type: 'guard_blocked', reason: 'High risk prompt detected' }],
        metrics: { steps: 0, executionTimeMs: 0 }
      };
    }

    const messages = [
      { role: 'system', content: this.systemPrompt },
      { role: 'user', content: guardResult.input }
    ];

    trace.push({
      step: 0,
      type: 'task_received',
      content: guardResult.input
    });

    // 2. Start the ReAct Loop
    while (stepCount < this.maxSteps && finalAnswer === null) {
      stepCount++;
      console.log(`Agent Step ${stepCount}/${this.maxSteps}...`);

      try {
        // Step A: Reasoning & Action Selection (LLM Call)
        const response = await llmClient.chat(messages, {
          temperature: this.temperature
        });

        tokensUsed.prompt += response.usage.promptTokens;
        tokensUsed.completion += response.usage.completionTokens;

        let parsedResponse;
        try {
          // Parse LLM JSON response
          let content = response.content.trim();
          // Remove markdown code blocks if LLM accidentally added them
          if (content.startsWith('```json')) content = content.substring(7);
          else if (content.startsWith('```')) content = content.substring(3);
          if (content.endsWith('```')) content = content.substring(0, content.length - 3);

          parsedResponse = JSON.parse(content.trim());
        } catch (e) {
          // LLM failed to output valid JSON — add error to context and retry
          trace.push({ step: stepCount, type: 'error', message: 'Failed to parse LLM response as JSON' });
          messages.push({ role: 'assistant', content: response.content });
          messages.push({
            role: 'user',
            content: 'Error: You must respond with valid JSON matching the specified format.'
          });
          continue;
        }

        // Record thought process
        if (parsedResponse.thought) {
          trace.push({
            step: stepCount,
            type: 'thought',
            content: parsedResponse.thought
          });
        }

        // Step B: Final Answer check
        if (parsedResponse.final_answer) {
          finalAnswer = parsedResponse.final_answer;
          trace.push({
            step: stepCount,
            type: 'final_answer',
            content: finalAnswer
          });
          break;
        }

        // Step C: Execute Tool
        if (parsedResponse.tool_call) {
          const { name, arguments: args } = parsedResponse.tool_call;

          trace.push({
            step: stepCount,
            type: 'tool_call',
            tool: name,
            args
          });

          // Execute
          const toolResult = await executeTool(name, args || {});

          // Record Observation
          trace.push({
            step: stepCount,
            type: 'observation',
            result: toolResult.result || toolResult.error
          });

          // Update context with Assistant action and Tool observation
          messages.push({ role: 'assistant', content: JSON.stringify(parsedResponse) });
          messages.push({
            role: 'user',
            content: `Observation from tool ${name}: ${JSON.stringify(toolResult.result || toolResult.error)}`
          });
        } else {
          // Neither final_answer nor tool_call provided
          messages.push({ role: 'assistant', content: JSON.stringify(parsedResponse) });
          messages.push({ role: 'user', content: 'Error: You must provide either "tool_call" or "final_answer".' });
        }

      } catch (error) {
        console.error(`Agent error on step ${stepCount}:`, error.message);
        trace.push({ step: stepCount, type: 'error', message: error.message });
        break;
      }
    }

    // Handle loop exhaustion
    if (finalAnswer === null) {
      finalAnswer = "I reached my maximum number of steps without arriving at a final answer.";
      trace.push({ type: 'termination', reason: 'max_steps_reached' });
    }

    // 3. Output Verification (Guard)
    const verification = verifyOutput(finalAnswer);
    if (!verification.safe) {
      finalAnswer = "I generated a response, but it was blocked by output safety filters.";
      trace.push({ type: 'guard_blocked', reason: 'Unsafe output generated' });
    }

    return {
      success: finalAnswer !== null && verification.safe,
      finalAnswer,
      trace,
      metrics: {
        steps: stepCount,
        maxSteps: this.maxSteps,
        executionTimeMs: Date.now() - startTime,
        tokensUsed
      }
    };
  }
}

export { Agent };
export default Agent;
