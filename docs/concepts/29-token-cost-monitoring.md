# Concept 29: Token & Cost Monitoring

## Overview
Unlike traditional APIs billed per request, LLM APIs are billed per *token* (fragments of words). A single request might cost $0.0001 or $0.50 depending on the length of the context and the model used. Without strict monitoring, a runaway script or malicious user can easily incur massive bills.

Hexa implements a centralized `TokenMonitor` service to track usage, estimate costs, and enforce hard budgets.

## Implementation Details

### 1. Usage Tracking & Cost Calculation
Every time the LLM client makes a request, it reports the `promptTokens` and `completionTokens` back to the central monitor. The monitor calculates the cost using a model pricing matrix.
```javascript
// server/src/ai/tokenMonitor.js
const MODEL_PRICING = {
  'gpt-4o': { prompt: 0.005, completion: 0.015 }, // Per 1k tokens
  'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006 }
};
```

### 2. Multi-dimensional Aggregation
The monitor slices usage data by different dimensions to identify cost centers:
- **Global**: Total application cost
- **By Model**: Are we spending too much on GPT-4o when GPT-4o-mini would suffice?
- **By User**: Which specific users are consuming the most resources?

### 3. Budget Enforcement (Middleware)
We apply `aiUsageMiddleware` to all AI routes. *Before* processing a request, it checks if the user or the global system has exceeded their daily budget limits.
```javascript
// server/src/routes/aiRoutes.js
function aiUsageMiddleware(req, res, next) {
  const permission = tokenMonitor.checkPermission(req.user.id);
  if (!permission.allowed) {
    return res.status(429).json({ error: 'AI budget exhausted' });
  }
  next();
}
```

### 4. Alerting Events
The monitor extends Node.js `EventEmitter` to broadcast `budget_exceeded` events, which could be hooked up to email/Slack notifications in a production environment.

## Verification / Demo
- API Endpoint: `GET /api/ai/usage`
- Make a few requests to `/api/ai/chat`, then check the usage endpoint. You will see token counts increasing and cost estimations dynamically calculated based on the simulated model usage.
