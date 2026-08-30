// LLM Eval Sets — Evaluation Framework
// Concept: LLM eval sets (AI App Eng)
// Implements evaluation datasets, test runners, and accuracy metrics
// Used to measure LLM output quality against expected results

import llmClient from './llmClient.js';

/**
 * Evaluation metrics calculator
 */
const metrics = {
  /**
   * Exact match — checks if output exactly matches expected
   */
  exactMatch(output, expected) {
    return output.trim().toLowerCase() === expected.trim().toLowerCase() ? 1.0 : 0.0;
  },

  /**
   * Contains match — checks if output contains the expected string
   */
  containsMatch(output, expected) {
    return output.toLowerCase().includes(expected.toLowerCase()) ? 1.0 : 0.0;
  },

  /**
   * Keyword coverage — what fraction of expected keywords appear in output
   */
  keywordCoverage(output, expectedKeywords) {
    if (!Array.isArray(expectedKeywords) || expectedKeywords.length === 0) return 0;
    const outputLower = output.toLowerCase();
    const matches = expectedKeywords.filter(kw => outputLower.includes(kw.toLowerCase()));
    return matches.length / expectedKeywords.length;
  },

  /**
   * JSON validity — checks if output is valid JSON
   */
  jsonValidity(output) {
    try {
      JSON.parse(output);
      return 1.0;
    } catch {
      // Try extracting JSON from markdown code blocks
      const match = output.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (match) {
        try {
          JSON.parse(match[1]);
          return 1.0;
        } catch {
          return 0.0;
        }
      }
      return 0.0;
    }
  },

  /**
   * Length compliance — checks if output length is within expected bounds
   */
  lengthCompliance(output, minWords = 0, maxWords = Infinity) {
    const wordCount = output.split(/\s+/).length;
    if (wordCount >= minWords && wordCount <= maxWords) return 1.0;
    if (wordCount < minWords) return wordCount / minWords;
    return maxWords / wordCount;
  }
};

// ================================================================
// EVAL DATASETS
// ================================================================

/**
 * Evaluation datasets — each contains test cases with inputs, expected outputs,
 * and evaluation criteria
 */
const evalDatasets = {
  /**
   * Task prioritization evaluation
   * Tests the LLM's ability to correctly prioritize tasks
   */
  taskPrioritization: {
    name: 'Task Prioritization',
    description: 'Evaluate LLM ability to assign correct priority levels to tasks',
    systemPrompt: 'You are a task prioritization engine. Respond with ONLY the priority level: critical, high, medium, or low.',
    testCases: [
      {
        id: 'tp-001',
        input: 'Production server is down, all users affected',
        expectedOutput: 'critical',
        evaluator: 'exactMatch',
        tags: ['production', 'outage']
      },
      {
        id: 'tp-002',
        input: 'Update the README with new API endpoints',
        expectedOutput: 'low',
        evaluator: 'exactMatch',
        tags: ['documentation']
      },
      {
        id: 'tp-003',
        input: 'SQL injection vulnerability found in login form',
        expectedOutput: 'critical',
        evaluator: 'exactMatch',
        tags: ['security']
      },
      {
        id: 'tp-004',
        input: 'Add dark mode toggle to settings page',
        expectedOutput: 'low',
        evaluator: 'exactMatch',
        tags: ['feature', 'ui']
      },
      {
        id: 'tp-005',
        input: 'Customer payment processing failing intermittently',
        expectedOutput: 'high',
        evaluator: 'containsMatch',
        tags: ['payments', 'bug']
      }
    ]
  },

  /**
   * Structured output evaluation
   * Tests the LLM's ability to produce valid JSON in the correct format
   */
  structuredOutput: {
    name: 'Structured JSON Output',
    description: 'Evaluate LLM ability to produce valid, schema-compliant JSON',
    systemPrompt:
      'You are a data extraction engine. Respond with ONLY valid JSON matching this format: ' +
      '{"category": string, "urgency": number (1-5), "keywords": string[]}',
    testCases: [
      {
        id: 'so-001',
        input: 'The deployment pipeline is broken and needs immediate attention',
        expectedKeywords: ['category', 'urgency', 'keywords'],
        evaluator: 'jsonValidity',
        tags: ['json', 'schema']
      },
      {
        id: 'so-002',
        input: 'Please review the documentation updates for next sprint',
        expectedKeywords: ['category', 'urgency', 'keywords'],
        evaluator: 'jsonValidity',
        tags: ['json', 'schema']
      },
      {
        id: 'so-003',
        input: 'Security audit revealed three medium-severity vulnerabilities',
        expectedKeywords: ['category', 'urgency', 'keywords'],
        evaluator: 'jsonValidity',
        tags: ['json', 'schema']
      }
    ]
  },

  /**
   * Summarization quality evaluation
   * Tests the LLM's ability to produce concise, accurate summaries
   */
  summarization: {
    name: 'Task Summarization',
    description: 'Evaluate LLM ability to produce accurate, concise task summaries',
    systemPrompt: 'Summarize the given task description in exactly 1-2 sentences. Be concise and actionable.',
    testCases: [
      {
        id: 'sum-001',
        input: 'We need to implement a caching layer using Redis for the task and project API endpoints to reduce database load. The cache should have configurable TTL values and automatic invalidation when data changes.',
        expectedKeywords: ['cache', 'redis', 'ttl'],
        evaluator: 'keywordCoverage',
        lengthConstraint: { minWords: 10, maxWords: 50 },
        tags: ['summarization']
      },
      {
        id: 'sum-002',
        input: 'The authentication system needs to be upgraded to support refresh tokens stored in HTTP-only cookies, with automatic token rotation and rate limiting on the refresh endpoint to prevent abuse.',
        expectedKeywords: ['authentication', 'refresh', 'token', 'cookie'],
        evaluator: 'keywordCoverage',
        lengthConstraint: { minWords: 10, maxWords: 50 },
        tags: ['summarization']
      }
    ]
  }
};

// ================================================================
// EVAL RUNNER
// ================================================================

/**
 * Run an evaluation dataset against the LLM
 *
 * @param {string} datasetName - Name of the eval dataset
 * @param {Object} options - Evaluation options
 * @returns {Object} Evaluation results with per-test scores and aggregate metrics
 */
async function runEval(datasetName, options = {}) {
  const dataset = evalDatasets[datasetName];

  if (!dataset) {
    throw new Error(`Unknown eval dataset: ${datasetName}. Available: ${Object.keys(evalDatasets).join(', ')}`);
  }

  const results = [];
  let totalScore = 0;
  const startTime = Date.now();

  for (const testCase of dataset.testCases) {
    const messages = [
      { role: 'system', content: dataset.systemPrompt },
      { role: 'user', content: testCase.input }
    ];

    const response = await llmClient.chat(messages, { temperature: 0.1 }); // Low temp for eval consistency
    const output = response.content;

    // Evaluate based on the specified evaluator
    let score = 0;
    let evaluationDetails = {};

    switch (testCase.evaluator) {
      case 'exactMatch':
        score = metrics.exactMatch(output, testCase.expectedOutput);
        evaluationDetails = {
          method: 'exactMatch',
          expected: testCase.expectedOutput,
          got: output.trim().toLowerCase()
        };
        break;

      case 'containsMatch':
        score = metrics.containsMatch(output, testCase.expectedOutput);
        evaluationDetails = {
          method: 'containsMatch',
          expected: testCase.expectedOutput,
          found: output.toLowerCase().includes(testCase.expectedOutput.toLowerCase())
        };
        break;

      case 'jsonValidity':
        score = metrics.jsonValidity(output);
        evaluationDetails = {
          method: 'jsonValidity',
          valid: score === 1.0
        };
        break;

      case 'keywordCoverage':
        score = metrics.keywordCoverage(output, testCase.expectedKeywords);
        evaluationDetails = {
          method: 'keywordCoverage',
          expectedKeywords: testCase.expectedKeywords,
          coverage: score
        };

        // Apply length compliance penalty if constraint exists
        if (testCase.lengthConstraint) {
          const lengthScore = metrics.lengthCompliance(
            output,
            testCase.lengthConstraint.minWords,
            testCase.lengthConstraint.maxWords
          );
          score = (score + lengthScore) / 2;
          evaluationDetails.lengthScore = lengthScore;
        }
        break;
    }

    totalScore += score;
    results.push({
      id: testCase.id,
      input: testCase.input,
      output: output.substring(0, 200),
      score: Math.round(score * 1000) / 1000,
      passed: score >= 0.7,
      evaluation: evaluationDetails,
      tags: testCase.tags,
      usage: response.usage
    });
  }

  const totalTests = dataset.testCases.length;
  const passedTests = results.filter(r => r.passed).length;
  const averageScore = totalScore / totalTests;

  return {
    dataset: dataset.name,
    description: dataset.description,
    summary: {
      totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      averageScore: Math.round(averageScore * 1000) / 1000,
      passRate: `${Math.round((passedTests / totalTests) * 100)}%`,
      executionTimeMs: Date.now() - startTime
    },
    results,
    model: llmClient.provider
  };
}

/**
 * Get available eval datasets
 */
function getAvailableDatasets() {
  return Object.entries(evalDatasets).map(([key, dataset]) => ({
    name: key,
    displayName: dataset.name,
    description: dataset.description,
    testCaseCount: dataset.testCases.length,
    tags: [...new Set(dataset.testCases.flatMap(tc => tc.tags))]
  }));
}

export { metrics, evalDatasets, runEval, getAvailableDatasets };
export default { metrics, evalDatasets, runEval, getAvailableDatasets };
