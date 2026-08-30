// LLM API Client — Unified LLM Integration Layer
// Concept: LLM API integration (AI App Eng)
// Provides a provider-agnostic interface for LLM communication
// Supports OpenAI, Gemini, and simulated fallback for assessment

/**
 * LLM Provider Configuration
 * Reads API keys from environment variables
 */
const LLM_CONFIG = {
  provider: process.env.LLM_PROVIDER || 'simulated', // 'openai', 'gemini', 'simulated'
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    baseUrl: 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: 1024,
    temperature: 0.7
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    maxTokens: 1024,
    temperature: 0.7
  }
};

/**
 * Simulated LLM responses for assessment demonstration
 * Provides realistic responses without requiring API keys
 */
const SIMULATED_RESPONSES = {
  default: 'Based on my analysis, here is a structured response to your query. The Hexa platform uses a layered architecture with Express.js backend, React frontend, PostgreSQL for relational data, and MongoDB for document storage. Each component follows separation of concerns principles.',
  task: 'I recommend breaking this task into smaller subtasks: 1) Define the requirements, 2) Design the data model, 3) Implement the backend API, 4) Build the frontend interface, 5) Write tests. Each subtask should be independently verifiable.',
  code: '```javascript\n// Example implementation pattern\nasync function processRequest(data) {\n  const validated = validateInput(data);\n  const result = await businessLogic(validated);\n  return formatResponse(result);\n}\n```',
  analysis: 'After analyzing the data, I identified 3 key patterns: 1) Most tasks are created during business hours (9 AM - 5 PM), 2) Task completion rates are highest on Tuesdays, 3) Projects with more than 5 tasks have 40% lower completion rates. Recommendation: Break large projects into smaller milestones.'
};

/**
 * LLM Client class — unified interface for LLM interactions
 */
class LLMClient {
  constructor(config = LLM_CONFIG) {
    this.config = config;
    this.provider = config.provider;
    this.requestCount = 0;
    this.totalTokensUsed = 0;
  }

  /**
   * Send a chat completion request to the configured LLM provider
   *
   * @param {Array<{role: string, content: string}>} messages - Chat messages
   * @param {Object} options - Override options (model, temperature, maxTokens)
   * @returns {Object} Response with content, usage stats, and provider info
   */
  async chat(messages, options = {}) {
    const startTime = Date.now();
    this.requestCount++;

    try {
      let response;

      switch (this.provider) {
        case 'openai':
          response = await this._callOpenAI(messages, options);
          break;
        case 'gemini':
          response = await this._callGemini(messages, options);
          break;
        case 'simulated':
        default:
          response = await this._simulateResponse(messages, options);
          break;
      }

      const latencyMs = Date.now() - startTime;

      // Track usage
      this.totalTokensUsed += response.usage.totalTokens;

      return {
        content: response.content,
        model: response.model,
        provider: this.provider,
        usage: response.usage,
        latencyMs,
        requestId: `req-${this.requestCount}-${Date.now()}`
      };
    } catch (error) {
      throw new Error(`LLM API error (${this.provider}): ${error.message}`);
    }
  }

  /**
   * OpenAI API call implementation
   */
  async _callOpenAI(messages, options = {}) {
    const config = this.config.openai;

    if (!config.apiKey) {
      console.warn('OpenAI API key not configured, falling back to simulation');
      return this._simulateResponse(messages, options);
    }

    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: options.model || config.model,
        messages,
        max_tokens: options.maxTokens || config.maxTokens,
        temperature: options.temperature ?? config.temperature
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();

    return {
      content: data.choices[0].message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      }
    };
  }

  /**
   * Google Gemini API call implementation
   */
  async _callGemini(messages, options = {}) {
    const config = this.config.gemini;

    if (!config.apiKey) {
      console.warn('Gemini API key not configured, falling back to simulation');
      return this._simulateResponse(messages, options);
    }

    // Convert chat format to Gemini format
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    const model = options.model || config.model;
    const url = `${config.baseUrl}/models/${model}:generateContent?key=${config.apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: options.maxTokens || config.maxTokens,
          temperature: options.temperature ?? config.temperature
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();

    return {
      content: data.candidates[0].content.parts[0].text,
      model,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0
      }
    };
  }

  /**
   * Simulated response — provides realistic output without API keys
   * Estimates token counts based on word count (~0.75 tokens per word)
   */
  async _simulateResponse(messages, options = {}) {
    // Simulate network latency (50-200ms)
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 150));

    const lastMessage = messages[messages.length - 1]?.content || '';
    const lowerMsg = lastMessage.toLowerCase();

    // Select contextual simulated response
    let content;
    if (lowerMsg.includes('task') || lowerMsg.includes('todo')) {
      content = SIMULATED_RESPONSES.task;
    } else if (lowerMsg.includes('code') || lowerMsg.includes('implement')) {
      content = SIMULATED_RESPONSES.code;
    } else if (lowerMsg.includes('analyze') || lowerMsg.includes('data')) {
      content = SIMULATED_RESPONSES.analysis;
    } else {
      content = SIMULATED_RESPONSES.default;
    }

    // Estimate token usage
    const promptTokens = Math.ceil(messages.reduce((sum, m) => sum + m.content.split(/\s+/).length, 0) * 1.3);
    const completionTokens = Math.ceil(content.split(/\s+/).length * 1.3);

    return {
      content,
      model: 'hexa-simulated-v1',
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens
      }
    };
  }

  /**
   * Get client statistics
   */
  getStats() {
    return {
      provider: this.provider,
      totalRequests: this.requestCount,
      totalTokensUsed: this.totalTokensUsed,
      configured: this.provider !== 'simulated'
    };
  }
}

// Singleton instance
const llmClient = new LLMClient();

export { LLMClient, LLM_CONFIG };
export default llmClient;
