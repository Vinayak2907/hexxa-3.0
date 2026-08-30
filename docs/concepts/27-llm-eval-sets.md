# Concept 27: LLM Evaluation Sets

## Overview
Unlike traditional deterministic software, LLMs produce probabilistic outputs. You cannot test an LLM application with a simple unit test assertion like `expect(output).toEqual("true")`.

**Eval Sets** are specialized testing frameworks designed to measure the accuracy, consistency, and safety of LLM outputs across a dataset of known inputs.

Hexa implements an Eval Runner that evaluates LLM performance on specific capabilities.

## Implementation Details

### 1. Evaluation Datasets
An eval set consists of a system prompt and a series of test cases. Each test case defines an input, an expected output (or constraint), and the evaluation method to use.
```javascript
// server/src/ai/evalSets.js
taskPrioritization: {
  testCases: [
    {
      id: 'tp-001',
      input: 'Production server is down',
      expectedOutput: 'critical',
      evaluator: 'exactMatch'
    }
  ]
}
```

### 2. Evaluation Metrics (Heuristics)
Because LLM output varies, we use different scoring heuristics:

- **Exact Match**: Output must exactly match expected string (e.g., classification tasks).
- **Contains Match**: Output must contain a specific substring.
- **Keyword Coverage**: Measures what percentage of expected concepts appear in the output.
- **JSON Validity**: Checks if the output parses as valid JSON.
- **Length Compliance**: Penalizes output that is too short or too long.

```javascript
  keywordCoverage(output, expectedKeywords) {
    const matches = expectedKeywords.filter(kw => output.includes(kw));
    return matches.length / expectedKeywords.length; // Returns 0.0 to 1.0
  }
```

### 3. The Eval Runner
The runner executes all test cases against the LLM, scores them, and generates an aggregate report. We set `temperature: 0.1` during evals to ensure maximum consistency.

## Why this is critical for AI Engineering
If you update your system prompt, change models (e.g., GPT-4o to Claude 3.5), or adjust generation temperature, you must run your eval sets to ensure the changes didn't degrade the system's performance on core tasks.

## Verification / Demo
- API Endpoint: `GET /api/ai/evals` — View available evaluation datasets.
- API Endpoint: `POST /api/ai/evals/taskPrioritization` — Run the evaluation and view the resulting scorecard containing pass rates, execution times, and individual test scores.
