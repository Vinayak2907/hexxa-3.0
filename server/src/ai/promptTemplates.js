// Prompt Engineering Templates
// Concept: Prompt engineering (AI App Eng)
// Demonstrates systematic prompt construction patterns:
// zero-shot, few-shot, chain-of-thought, role-playing, and template composition

/**
 * Prompt template class — encapsulates a reusable prompt pattern
 */
class PromptTemplate {
  /**
   * @param {string} name - Template identifier
   * @param {string} pattern - Prompt pattern (e.g., 'zero-shot', 'few-shot', 'chain-of-thought')
   * @param {string} systemPrompt - System/instruction prompt
   * @param {Array} fewShotExamples - Optional few-shot examples [{input, output}]
   * @param {string} userTemplate - User message template with {{variable}} placeholders
   */
  constructor({ name, pattern, systemPrompt, fewShotExamples = [], userTemplate }) {
    this.name = name;
    this.pattern = pattern;
    this.systemPrompt = systemPrompt;
    this.fewShotExamples = fewShotExamples;
    this.userTemplate = userTemplate;
  }

  /**
   * Build chat messages array from template and variables
   * @param {Object} variables - Key-value pairs to substitute into the template
   * @returns {Array<{role: string, content: string}>} Messages array for LLM API
   */
  buildMessages(variables = {}) {
    const messages = [];

    // System prompt (sets the LLM's behavior and constraints)
    if (this.systemPrompt) {
      messages.push({
        role: 'system',
        content: this.systemPrompt
      });
    }

    // Few-shot examples (teaches the LLM the expected format)
    for (const example of this.fewShotExamples) {
      messages.push({ role: 'user', content: example.input });
      messages.push({ role: 'assistant', content: example.output });
    }

    // User message with variable substitution
    let userMessage = this.userTemplate;
    for (const [key, value] of Object.entries(variables)) {
      userMessage = userMessage.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    messages.push({ role: 'user', content: userMessage });

    return messages;
  }

  /**
   * Serialize template for API response
   */
  toJSON() {
    return {
      name: this.name,
      pattern: this.pattern,
      systemPrompt: this.systemPrompt,
      fewShotExamples: this.fewShotExamples,
      userTemplate: this.userTemplate,
      requiredVariables: this._extractVariables()
    };
  }

  /**
   * Extract {{variable}} placeholders from the user template
   */
  _extractVariables() {
    const matches = this.userTemplate.match(/{{(\w+)}}/g) || [];
    return matches.map(m => m.replace(/[{}]/g, ''));
  }
}

// ================================================================
// PROMPT TEMPLATE LIBRARY
// ================================================================

const promptTemplates = {
  /**
   * Zero-shot: No examples — relies on the LLM's pre-training knowledge
   * Best for: Simple, well-defined tasks
   */
  taskSummary: new PromptTemplate({
    name: 'task-summary',
    pattern: 'zero-shot',
    systemPrompt:
      'You are a project management assistant for the Hexa platform. ' +
      'Provide concise, actionable summaries. Always respond in 2-3 sentences.',
    fewShotExamples: [],
    userTemplate: 'Summarize this task and suggest next steps: Title: "{{title}}", Description: "{{description}}", Status: {{status}}'
  }),

  /**
   * Few-shot: Provides examples to guide format and style
   * Best for: Tasks requiring specific output format
   */
  taskPrioritizer: new PromptTemplate({
    name: 'task-prioritizer',
    pattern: 'few-shot',
    systemPrompt:
      'You are an expert task prioritization engine. ' +
      'Analyze tasks and assign priority levels: critical, high, medium, or low. ' +
      'Respond in JSON format with fields: priority, reasoning, suggestedDeadline.',
    fewShotExamples: [
      {
        input: 'Task: "Fix production login bug" - Users cannot log in since 2 hours ago',
        output: '{"priority": "critical", "reasoning": "Production outage affecting all users. Login is a core functionality.", "suggestedDeadline": "Within 2 hours"}'
      },
      {
        input: 'Task: "Update documentation typos" - Fix spelling errors in README',
        output: '{"priority": "low", "reasoning": "Documentation typos do not affect functionality. Can be batched with other doc updates.", "suggestedDeadline": "End of sprint"}'
      },
      {
        input: 'Task: "Add rate limiting to API" - Prevent API abuse',
        output: '{"priority": "high", "reasoning": "Security improvement that protects against abuse. Should be implemented before next release.", "suggestedDeadline": "Within 1 week"}'
      }
    ],
    userTemplate: 'Task: "{{title}}" - {{description}}'
  }),

  /**
   * Chain-of-thought: Forces step-by-step reasoning
   * Best for: Complex analysis requiring logical deduction
   */
  bugAnalyzer: new PromptTemplate({
    name: 'bug-analyzer',
    pattern: 'chain-of-thought',
    systemPrompt:
      'You are a senior software engineer debugging issues in the Hexa application. ' +
      'Think step by step before providing your answer. ' +
      'Structure your response as:\n' +
      '1. UNDERSTAND: Restate the problem\n' +
      '2. HYPOTHESIZE: List possible causes\n' +
      '3. INVESTIGATE: Suggest debugging steps\n' +
      '4. SOLUTION: Recommend the fix\n' +
      '5. PREVENT: Suggest how to prevent recurrence',
    fewShotExamples: [],
    userTemplate:
      'Bug report:\nTitle: {{title}}\nDescription: {{description}}\nSteps to reproduce: {{steps}}\nExpected: {{expected}}\nActual: {{actual}}\n\nAnalyze this bug step by step.'
  }),

  /**
   * Role-playing: Assigns the LLM a specific persona
   * Best for: Domain-specific expertise
   */
  codeReviewer: new PromptTemplate({
    name: 'code-reviewer',
    pattern: 'role-playing',
    systemPrompt:
      'You are a strict but fair senior code reviewer at a top tech company. ' +
      'You focus on: security vulnerabilities, performance issues, code clarity, ' +
      'and adherence to best practices. ' +
      'Rate code on a scale of 1-10 and provide specific, actionable feedback. ' +
      'Always mention at least one positive aspect.',
    fewShotExamples: [],
    userTemplate: 'Review this code:\n\n```{{language}}\n{{code}}\n```\n\nContext: {{context}}'
  }),

  /**
   * Structured extraction: Forces specific output schema
   * Best for: Extracting structured data from unstructured text
   */
  entityExtractor: new PromptTemplate({
    name: 'entity-extractor',
    pattern: 'structured-extraction',
    systemPrompt:
      'You are a data extraction engine. Extract structured information from the given text. ' +
      'Always respond with valid JSON matching this schema:\n' +
      '{\n' +
      '  "entities": [{ "name": string, "type": string, "confidence": number }],\n' +
      '  "relationships": [{ "from": string, "to": string, "type": string }],\n' +
      '  "summary": string\n' +
      '}',
    fewShotExamples: [
      {
        input: 'John assigned the login bug to Sarah. It needs to be fixed before the v2.0 release next Friday.',
        output: '{"entities": [{"name": "John", "type": "person", "confidence": 0.95}, {"name": "Sarah", "type": "person", "confidence": 0.95}, {"name": "login bug", "type": "task", "confidence": 0.9}, {"name": "v2.0", "type": "release", "confidence": 0.85}], "relationships": [{"from": "John", "to": "login bug", "type": "assigned"}, {"from": "login bug", "to": "Sarah", "type": "assigned_to"}, {"from": "login bug", "to": "v2.0", "type": "blocks"}], "summary": "John assigned login bug to Sarah, blocking v2.0 release next Friday"}'
      }
    ],
    userTemplate: 'Extract entities and relationships from this text:\n\n{{text}}'
  })
};

/**
 * Get all available prompt templates
 */
export function getAllTemplates() {
  return Object.values(promptTemplates).map(t => t.toJSON());
}

/**
 * Get a specific template by name
 */
export function getTemplate(name) {
  return promptTemplates[name] || null;
}

/**
 * Build messages from a named template with variables
 */
export function buildPrompt(templateName, variables = {}) {
  const template = promptTemplates[templateName];
  if (!template) {
    throw new Error(`Unknown prompt template: ${templateName}`);
  }
  return template.buildMessages(variables);
}

export { PromptTemplate, promptTemplates };
export default { getAllTemplates, getTemplate, buildPrompt, promptTemplates, PromptTemplate };
