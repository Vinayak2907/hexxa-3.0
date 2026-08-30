# Concept 31: Structured Outputs

## Overview
By default, LLMs output unstructured natural language (Markdown). However, when integrating LLMs into software pipelines, the application needs deterministic, machine-readable data (usually JSON).

**Structured Output** is the process of forcing an LLM to generate responses that strictly conform to a predefined JSON schema.

Hexa implements a robust Structured Output engine with schema definitions, validation, and auto-retry logic.

## Implementation Details

### 1. JSON Schema Definition
We define strict JSON schemas for different tasks (e.g., Task Analysis, Sentiment Analysis, Code Review).
```javascript
// server/src/ai/structuredOutput.js
const taskAnalysisSchema = {
  type: 'object',
  required: ['priority', 'complexity', 'estimatedHours'],
  properties: {
    priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
    complexity: { type: 'string', enum: ['trivial', 'simple', 'moderate', 'complex'] },
    estimatedHours: { type: 'number', minimum: 0.5, maximum: 200 }
  }
};
```

### 2. Prompting for Structure
The system prompt explicitly instructs the LLM to output *only* JSON matching the schema, with no conversational filler. We also lower the `temperature` to 0.3 to make the LLM more deterministic.

### 3. Extraction & Validation
Since LLMs often wrap JSON in markdown blocks (````json ... ````), our extraction logic strips these out. We then validate the parsed object against the schema.

### 4. Auto-Correction (Retry Loop)
If the LLM generates invalid JSON or violates the schema (e.g., missing a required field or hallucinating an enum value), the engine automatically sends the error back to the LLM and asks it to fix its mistake.

```javascript
// The retry feedback loop
if (!validation.valid) {
  messages.push({
    role: 'user',
    content: `Your previous response had validation errors:\n${validation.errors.join('\n')}\nPlease fix these issues and respond with corrected JSON.`
  });
  // Retry API call...
}
```

## Verification / Demo
- API Endpoint: `POST /api/ai/structured/taskAnalysis`
- Pass `{"prompt": "Analyze this task: Fix the production database outage"}`. The response will be a perfectly formatted JSON object with the exact fields required by the `taskAnalysis` schema, guaranteed to have valid enum values and numeric ranges.
