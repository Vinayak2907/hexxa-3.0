// Token & Cost Monitoring
// Concept: Token & cost monitoring (AI App Eng)
// Tracks LLM usage, estimates costs, and enforces budget limits

import EventEmitter from 'events';

/**
 * Model pricing configuration (cost per 1k tokens in USD)
 * In production, these should be updated via API or config
 */
const MODEL_PRICING = {
  'gpt-4o': { prompt: 0.005, completion: 0.015 },
  'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 },
  'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
  'gemini-1.5-pro': { prompt: 0.0035, completion: 0.0105 },
  'gemini-1.5-flash': { prompt: 0.00035, completion: 0.00105 },
  'hexa-simulated-v1': { prompt: 0, completion: 0 } // Free
};

/**
 * Token Monitor Service
 * Tracks usage, calculates costs, and enforces budgets
 */
class TokenMonitor extends EventEmitter {
  constructor() {
    super();

    // In-memory usage store (use Redis in production)
    this.usageData = {
      totalTokens: 0,
      totalCost: 0,
      requestsCount: 0,
      byModel: {},
      byUser: {}
    };

    // Budgets
    this.budgets = {
      globalDaily: 10.0, // $10 per day default
      perUserDaily: 1.0  // $1 per user per day default
    };
  }

  /**
   * Track token usage for a single request
   *
   * @param {Object} data - Usage data
   * @param {number} data.promptTokens - Tokens used for prompt
   * @param {number} data.completionTokens - Tokens used for completion
   * @param {string} data.model - Model name
   * @param {string} data.userId - User ID making the request
   * @param {string} data.featureId - Feature identifier
   * @returns {Object} Tracking result with calculated cost
   */
  trackUsage({ promptTokens = 0, completionTokens = 0, model, userId = 'anonymous', featureId = 'general' }) {
    const totalTokens = promptTokens + completionTokens;

    // Calculate cost
    const cost = this.calculateCost(model, promptTokens, completionTokens);

    // Update global stats
    this.usageData.totalTokens += totalTokens;
    this.usageData.totalCost += cost;
    this.usageData.requestsCount++;

    // Update model stats
    if (!this.usageData.byModel[model]) {
      this.usageData.byModel[model] = { tokens: 0, cost: 0, requests: 0 };
    }
    this.usageData.byModel[model].tokens += totalTokens;
    this.usageData.byModel[model].cost += cost;
    this.usageData.byModel[model].requests++;

    // Update user stats
    if (!this.usageData.byUser[userId]) {
      this.usageData.byUser[userId] = { tokens: 0, cost: 0, requests: 0 };
    }
    this.usageData.byUser[userId].tokens += totalTokens;
    this.usageData.byUser[userId].cost += cost;
    this.usageData.byUser[userId].requests++;

    // Check budgets and emit events if exceeded
    this.checkBudgets(userId, cost);

    return {
      tokensUsed: totalTokens,
      estimatedCost: cost,
      budgetRemaining: this.budgets.perUserDaily - this.usageData.byUser[userId].cost
    };
  }

  /**
   * Calculate cost for a request based on model pricing
   */
  calculateCost(model, promptTokens, completionTokens) {
    // Find closest matching model pricing
    let pricing = MODEL_PRICING['gpt-4o-mini']; // Default fallback

    for (const [key, value] of Object.entries(MODEL_PRICING)) {
      if (model.toLowerCase().includes(key.toLowerCase())) {
        pricing = value;
        break;
      }
    }

    const promptCost = (promptTokens / 1000) * pricing.prompt;
    const completionCost = (completionTokens / 1000) * pricing.completion;

    return promptCost + completionCost;
  }

  /**
   * Check if usage exceeds configured budgets
   */
  checkBudgets(userId, requestCost) {
    // Global budget check
    if (this.usageData.totalCost > this.budgets.globalDaily) {
      this.emit('budget_exceeded', {
        type: 'global',
        limit: this.budgets.globalDaily,
        current: this.usageData.totalCost
      });
      console.warn(`[BUDGET ALERT] Global daily AI budget exceeded: $${this.usageData.totalCost.toFixed(4)}`);
    }

    // User budget check
    if (this.usageData.byUser[userId] && this.usageData.byUser[userId].cost > this.budgets.perUserDaily) {
      this.emit('budget_exceeded', {
        type: 'user',
        userId,
        limit: this.budgets.perUserDaily,
        current: this.usageData.byUser[userId].cost
      });
    }
  }

  /**
   * Check if a request is allowed based on current budget usage
   */
  checkPermission(userId) {
    const userCost = this.usageData.byUser[userId]?.cost || 0;
    const globalCost = this.usageData.totalCost;

    if (globalCost >= this.budgets.globalDaily) {
      return { allowed: false, reason: 'Global AI budget exhausted' };
    }

    if (userCost >= this.budgets.perUserDaily) {
      return { allowed: false, reason: 'User daily AI budget exhausted' };
    }

    return { allowed: true };
  }

  /**
   * Get detailed usage report
   */
  getReport() {
    return {
      summary: {
        totalTokens: this.usageData.totalTokens,
        totalCost: Number(this.usageData.totalCost.toFixed(6)),
        totalRequests: this.usageData.requestsCount
      },
      budgets: this.budgets,
      byModel: Object.entries(this.usageData.byModel).map(([model, data]) => ({
        model,
        tokens: data.tokens,
        cost: Number(data.cost.toFixed(6)),
        requests: data.requests
      })),
      topUsers: Object.entries(this.usageData.byUser)
        .sort(([, a], [, b]) => b.cost - a.cost)
        .slice(0, 5)
        .map(([user, data]) => ({
          userId: user,
          cost: Number(data.cost.toFixed(6))
        }))
    };
  }

  /**
   * Reset usage counters (e.g., daily reset via cron)
   */
  resetUsage() {
    this.usageData = {
      totalTokens: 0,
      totalCost: 0,
      requestsCount: 0,
      byModel: {},
      byUser: {}
    };
    this.emit('usage_reset', { timestamp: new Date() });
  }

  /**
   * Update budget limits
   */
  setBudgets(globalDaily, perUserDaily) {
    if (globalDaily !== undefined) this.budgets.globalDaily = globalDaily;
    if (perUserDaily !== undefined) this.budgets.perUserDaily = perUserDaily;
  }
}

// Singleton instance
const tokenMonitor = new TokenMonitor();

export { TokenMonitor, MODEL_PRICING };
export default tokenMonitor;
