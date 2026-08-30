// Structured Output Enforcement
// Concept: Structured outputs (AI App Eng)
// Enforces JSON schema compliance on LLM responses
// Implements validation, retry logic, and schema-based parsing

import llmClient from './llmClient.js';

/**
 * JSON Schema definitions for structured LLM outputs
 * Each schema defines the expected response format for a specific use case
 */
const OUTPUT_SCHEMAS = {
  taskAnalysis: {
    name: 'TaskAnalysis',
    description: 'Structured analysis of a task with priority and recommendations',
    schema: {
      type: 'object',
      required: ['priority', 'complexity', 'estimatedHours', 'recommendations'],
      properties: {
        priority: {
          type: 'string',
          enum: ['critical', 'high', 'medium', 'low']
        },
        complexity: {
          type: 'string',
          enum: ['trivial', 'simple', 'moderate', 'complex', 'very_complex']
        },
        estimatedHours: {
          type: 'number',
          minimum: 0.5,
          maximum: 200
        },
        recommendations: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
          maxItems: 5
        },
        risks: {
          type: 'array',
          items: { type: 'string' }
        },
        dependencies: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  },

  sentimentAnalysis: {
    name: 'SentimentAnalysis',
    description: 'Sentiment classification of text',
    schema: {
      type: 'object',
      required: ['sentiment', 'confidence', 'aspects'],
      properties: {
        sentiment: {
          type: 'string',
          enum: ['positive', 'negative', 'neutral', 'mixed']
        },
        confidence: {
          type: 'number',
          minimum: 0,
          maximum: 1
        },
        aspects: {
          type: 'array',
          items: {
            type: 'object',
            required: ['aspect', 'sentiment'],
            properties: {
              aspect: { type: 'string' },
              sentiment: { type: 'string', enum: ['positive', 'negative', 'neutral'] },
              keywords: { type: 'array', items: { type: 'string' } }
            }
          }
        }
      }
    }
  },

  codeReview: {
    name: 'CodeReview',
    description: 'Structured code review feedback',
    schema: {
      type: 'object',
      required: ['score', 'issues', 'strengths'],
      properties: {
        score: {
          type: 'number',
          minimum: 1,
          maximum: 10
        },
        issues: {
          type: 'array',
          items: {
            type: 'object',
            required: ['severity', 'description'],
            properties: {
              severity: { type: 'string', enum: ['critical', 'major', 'minor', 'suggestion'] },
              description: { type: 'string' },
              line: { type: 'number' },
              fix: { type: 'string' }
            }
          }
        },
        strengths: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1
        },
        summary: { type: 'string' }
      }
    }
  }
};

/**
 * Validate a parsed object against a JSON schema
 * Lightweight validation without external dependencies
 *
 * @param {Object} data - The data to validate
 * @param {Object} schema - The JSON schema to validate against
 * @returns {{ valid: boolean, errors: string[] }}
 */
function validateSchema(data, schema) {
  const errors = [];

  function validate(obj, sch, path = '') {
    if (sch.type === 'object') {
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        errors.push(`${path}: expected object, got ${typeof obj}`);
        return;
      }

      // Check required fields
      if (sch.required) {
        for (const field of sch.required) {
          if (!(field in obj)) {
            errors.push(`${path}.${field}: required field missing`);
          }
        }
      }

      // Validate each property
      if (sch.properties) {
        for (const [key, propSchema] of Object.entries(sch.properties)) {
          if (key in obj) {
            validate(obj[key], propSchema, `${path}.${key}`);
          }
        }
      }
    } else if (sch.type === 'array') {
      if (!Array.isArray(obj)) {
        errors.push(`${path}: expected array, got ${typeof obj}`);
        return;
      }
      if (sch.minItems && obj.length < sch.minItems) {
        errors.push(`${path}: minimum ${sch.minItems} items required, got ${obj.length}`);
      }
      if (sch.maxItems && obj.length > sch.maxItems) {
        errors.push(`${path}: maximum ${sch.maxItems} items allowed, got ${obj.length}`);
      }
      if (sch.items) {
        obj.forEach((item, i) => validate(item, sch.items, `${path}[${i}]`));
      }
    } else if (sch.type === 'string') {
      if (typeof obj !== 'string') {
        errors.push(`${path}: expected string, got ${typeof obj}`);
      } else if (sch.enum && !sch.enum.includes(obj)) {
        errors.push(`${path}: must be one of [${sch.enum.join(', ')}], got "${obj}"`);
      }
    } else if (sch.type === 'number') {
      if (typeof obj !== 'number') {
        errors.push(`${path}: expected number, got ${typeof obj}`);
      } else {
        if (sch.minimum !== undefined && obj < sch.minimum) {
          errors.push(`${path}: must be >= ${sch.minimum}, got ${obj}`);
        }
        if (sch.maximum !== undefined && obj > sch.maximum) {
          errors.push(`${path}: must be <= ${sch.maximum}, got ${obj}`);
        }
      }
    }
  }

  validate(data, schema, '$');
  return { valid: errors.length === 0, errors };
}

/**
 * Extract JSON from LLM response text
 * Handles cases where LLM wraps JSON in markdown code blocks
 */
function extractJSON(text) {
  // Try direct parse first
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting from markdown code block
    const jsonMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }

    // Try finding JSON object in text
    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    throw new Error('No valid JSON found in response');
  }
}

/**
 * Request structured output from the LLM with schema enforcement
 *
 * @param {string} schemaName - Name of the output schema to use
 * @param {string} userPrompt - The user's input/question
 * @param {Object} options - Additional options
 * @param {number} options.maxRetries - Max retry attempts for schema compliance (default: 2)
 * @returns {Object} Validated, structured response
 */
async function getStructuredOutput(schemaName, userPrompt, options = {}) {
  const { maxRetries = 2 } = options;
  const schemaConfig = OUTPUT_SCHEMAS[schemaName];

  if (!schemaConfig) {
    throw new Error(`Unknown output schema: ${schemaName}. Available: ${Object.keys(OUTPUT_SCHEMAS).join(', ')}`);
  }

  const systemPrompt =
    `You are a structured data extraction engine. ` +
    `You MUST respond with valid JSON matching this exact schema:\n\n` +
    `${JSON.stringify(schemaConfig.schema, null, 2)}\n\n` +
    `RULES:\n` +
    `- Respond with ONLY the JSON object, no additional text\n` +
    `- All required fields must be present\n` +
    `- Enum fields must use exact allowed values\n` +
    `- Arrays must meet min/max items constraints`;

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    // On retry, include the validation errors as feedback
    if (attempt > 0 && lastError) {
      messages.push({
        role: 'user', content: userPrompt
      });
      messages.push({
        role: 'assistant',
        content: lastError.rawResponse || '{}'
      });
      messages.push({
        role: 'user',
        content: `Your previous response had validation errors:\n${lastError.errors.join('\n')}\n\nPlease fix these issues and respond with corrected JSON.`
      });
    } else {
      messages.push({ role: 'user', content: userPrompt });
    }

    const response = await llmClient.chat(messages, {
      temperature: 0.3 // Lower temperature for more deterministic structured output
    });

    try {
      const parsed = extractJSON(response.content);
      const validation = validateSchema(parsed, schemaConfig.schema);

      if (validation.valid) {
        return {
          data: parsed,
          schema: schemaName,
          valid: true,
          attempts: attempt + 1,
          usage: response.usage,
          model: response.model
        };
      }

      // Schema validation failed — retry
      lastError = {
        errors: validation.errors,
        rawResponse: response.content
      };
    } catch (parseError) {
      lastError = {
        errors: [`JSON parse error: ${parseError.message}`],
        rawResponse: response.content
      };
    }
  }

  // All retries exhausted — return with errors
  return {
    data: null,
    schema: schemaName,
    valid: false,
    attempts: maxRetries + 1,
    errors: lastError?.errors || ['Unknown error'],
    rawResponse: lastError?.rawResponse
  };
}

/**
 * Get all available output schemas
 */
function getAvailableSchemas() {
  return Object.entries(OUTPUT_SCHEMAS).map(([key, config]) => ({
    name: key,
    displayName: config.name,
    description: config.description,
    requiredFields: config.schema.required || [],
    schema: config.schema
  }));
}

export { OUTPUT_SCHEMAS, validateSchema, extractJSON, getStructuredOutput, getAvailableSchemas };
export default { OUTPUT_SCHEMAS, validateSchema, extractJSON, getStructuredOutput, getAvailableSchemas };
