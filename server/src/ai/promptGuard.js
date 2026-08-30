// Prompt Injection Awareness & Defenses
// Concept: Prompt injection awareness & defenses (AI App Eng)
// Detects and prevents prompt injection attacks in LLM inputs
// Implements: pattern detection, input sanitization, output verification, sandboxing

/**
 * Known prompt injection patterns
 * Categorized by attack type for detection and logging
 */
const INJECTION_PATTERNS = [
  // Direct instruction override attempts
  {
    pattern: /ignore\s+(all\s+)?(previous|above|prior|earlier)\s+(instructions|prompts|rules|commands)/i,
    category: 'instruction_override',
    severity: 'critical',
    description: 'Attempts to override system instructions'
  },
  {
    pattern: /forget\s+(everything|all|your)\s+(you|instructions|rules)/i,
    category: 'instruction_override',
    severity: 'critical',
    description: 'Attempts to erase system context'
  },
  {
    pattern: /disregard\s+(all|any|the|your)\s+(previous|above|system)/i,
    category: 'instruction_override',
    severity: 'critical',
    description: 'Attempts to disregard system prompt'
  },
  {
    pattern: /you\s+are\s+now\s+(?:a|an|the)\s+/i,
    category: 'role_hijacking',
    severity: 'high',
    description: 'Attempts to reassign the AI role'
  },
  {
    pattern: /pretend\s+(you\s+are|to\s+be|you're)/i,
    category: 'role_hijacking',
    severity: 'high',
    description: 'Attempts role-playing override'
  },
  // System prompt extraction
  {
    pattern: /(?:reveal|show|display|print|output|repeat)\s+(?:your|the|system)\s+(?:system\s+)?(?:prompt|instructions|rules)/i,
    category: 'prompt_extraction',
    severity: 'high',
    description: 'Attempts to extract system prompt'
  },
  {
    pattern: /what\s+(?:are|were)\s+your\s+(?:initial|original|system)\s+(?:instructions|prompt|rules)/i,
    category: 'prompt_extraction',
    severity: 'high',
    description: 'Attempts to reveal system prompt via questioning'
  },
  // Delimiter injection
  {
    pattern: /```\s*system/i,
    category: 'delimiter_injection',
    severity: 'medium',
    description: 'Attempts to inject system-level message via code block delimiter'
  },
  {
    pattern: /<\/?(?:system|instruction|rule|admin)>/i,
    category: 'delimiter_injection',
    severity: 'medium',
    description: 'Attempts to inject XML-style system tags'
  },
  // Jailbreak patterns
  {
    pattern: /(?:DAN|do\s+anything\s+now|developer\s+mode|god\s+mode)/i,
    category: 'jailbreak',
    severity: 'critical',
    description: 'Known jailbreak attempt (DAN/developer mode)'
  },
  {
    pattern: /(?:bypass|circumvent|override)\s+(?:your|the|any)\s+(?:safety|filter|restriction|guardrail)/i,
    category: 'jailbreak',
    severity: 'critical',
    description: 'Attempts to bypass safety measures'
  },
  // Encoding-based attacks
  {
    pattern: /(?:base64|rot13|hex|encode|decode)\s+(?:the|this|following)/i,
    category: 'encoding_attack',
    severity: 'medium',
    description: 'Potential encoding-based bypass attempt'
  }
];

/**
 * Scan input text for prompt injection patterns
 *
 * @param {string} text - User input to scan
 * @returns {{ safe: boolean, threats: Array, riskScore: number }}
 */
function detectInjection(text) {
  if (!text || typeof text !== 'string') {
    return { safe: true, threats: [], riskScore: 0 };
  }

  const threats = [];
  let riskScore = 0;

  const severityWeights = {
    critical: 1.0,
    high: 0.7,
    medium: 0.4,
    low: 0.2
  };

  for (const rule of INJECTION_PATTERNS) {
    if (rule.pattern.test(text)) {
      threats.push({
        category: rule.category,
        severity: rule.severity,
        description: rule.description,
        matched: text.match(rule.pattern)[0]
      });
      riskScore += severityWeights[rule.severity] || 0.5;
    }
  }

  // Normalize risk score to 0-1 range
  riskScore = Math.min(1.0, riskScore);

  return {
    safe: threats.length === 0,
    threats,
    riskScore: Math.round(riskScore * 100) / 100,
    riskLevel: riskScore >= 0.7 ? 'critical' : riskScore >= 0.4 ? 'high' : riskScore > 0 ? 'medium' : 'safe'
  };
}

/**
 * Sanitize user input before sending to LLM
 * Applies defense strategies without altering legitimate content
 *
 * @param {string} input - Raw user input
 * @returns {{ sanitized: string, modifications: string[] }}
 */
function sanitizePromptInput(input) {
  if (!input || typeof input !== 'string') {
    return { sanitized: '', modifications: [] };
  }

  let sanitized = input;
  const modifications = [];

  // 1. Remove potential system message delimiters
  const systemTagRegex = /<\/?(?:system|instruction|rule|admin|prompt)>/gi;
  if (systemTagRegex.test(sanitized)) {
    sanitized = sanitized.replace(systemTagRegex, '');
    modifications.push('Removed system message tags');
  }

  // 2. Escape markdown-style delimiters that could be used for injection
  const tripleBacktickSystem = /```\s*system/gi;
  if (tripleBacktickSystem.test(sanitized)) {
    sanitized = sanitized.replace(tripleBacktickSystem, '``` system');
    modifications.push('Escaped system code block delimiters');
  }

  // 3. Trim excessive whitespace (used to push system prompt out of context)
  const originalLength = sanitized.length;
  sanitized = sanitized.replace(/\n{4,}/g, '\n\n\n');
  if (sanitized.length < originalLength) {
    modifications.push('Collapsed excessive whitespace');
  }

  // 4. Limit input length (prevent context window stuffing)
  const MAX_INPUT_LENGTH = 4000;
  if (sanitized.length > MAX_INPUT_LENGTH) {
    sanitized = sanitized.substring(0, MAX_INPUT_LENGTH);
    modifications.push(`Truncated input from ${originalLength} to ${MAX_INPUT_LENGTH} characters`);
  }

  return { sanitized, modifications };
}

/**
 * Verify LLM output for signs of compromised behavior
 * Checks if the output indicates the system prompt was overridden
 *
 * @param {string} output - LLM response to verify
 * @param {Object} context - Expected behavior context
 * @returns {{ safe: boolean, warnings: string[] }}
 */
function verifyOutput(output, context = {}) {
  const warnings = [];

  if (!output || typeof output !== 'string') {
    return { safe: true, warnings: [] };
  }

  // Check for system prompt leakage
  if (context.systemPrompt) {
    const systemWords = context.systemPrompt.split(/\s+/).slice(0, 10).join(' ');
    if (output.includes(systemWords)) {
      warnings.push('Output may contain leaked system prompt content');
    }
  }

  // Check for unexpected role switches
  const rolePatterns = [
    /i\s+am\s+now\s+operating\s+as/i,
    /entering\s+(?:developer|god|admin|unrestricted)\s+mode/i,
    /(?:DAN|jailbreak)\s+mode\s+(?:activated|enabled)/i
  ];

  for (const pattern of rolePatterns) {
    if (pattern.test(output)) {
      warnings.push('Output suggests potential role override');
    }
  }

  // Check for execution of disallowed content
  const dangerousContent = [
    /(?:here\s+(?:is|are)\s+(?:my|the)\s+system\s+(?:prompt|instructions))/i,
    /(?:as\s+(?:DAN|an?\s+unrestricted\s+AI))/i
  ];

  for (const pattern of dangerousContent) {
    if (pattern.test(output)) {
      warnings.push('Output contains potentially compromised content');
    }
  }

  return {
    safe: warnings.length === 0,
    warnings
  };
}

/**
 * Full prompt guard pipeline — detect, sanitize, and prepare input for LLM
 *
 * @param {string} userInput - Raw user input
 * @param {Object} options - Guard options
 * @param {boolean} options.blockOnThreat - Block request if threats detected (default: true)
 * @returns {{ allowed: boolean, input: string, report: Object }}
 */
function guardPrompt(userInput, options = {}) {
  const { blockOnThreat = true } = options;

  // Step 1: Detect injection patterns
  const detection = detectInjection(userInput);

  // Step 2: Sanitize input
  const { sanitized, modifications } = sanitizePromptInput(userInput);

  // Step 3: Decide whether to allow
  const blocked = blockOnThreat && detection.riskLevel === 'critical';

  return {
    allowed: !blocked,
    input: blocked ? '' : sanitized,
    report: {
      originalLength: userInput.length,
      sanitizedLength: sanitized.length,
      threats: detection.threats,
      riskScore: detection.riskScore,
      riskLevel: detection.riskLevel,
      modifications,
      blocked,
      defenseStrategies: {
        inputValidation: 'Pattern-based threat detection on user input',
        inputSanitization: 'Remove/escape dangerous delimiters and tags',
        outputVerification: 'Post-generation check for compromised behavior',
        lengthLimiting: 'Prevent context window stuffing attacks',
        promptIsolation: 'System prompt separated with clear delimiters'
      }
    }
  };
}

export {
  INJECTION_PATTERNS,
  detectInjection,
  sanitizePromptInput,
  verifyOutput,
  guardPrompt
};

export default {
  detectInjection,
  sanitizePromptInput,
  verifyOutput,
  guardPrompt
};
