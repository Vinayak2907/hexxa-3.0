# Concept 35: Prompt Engineering

## Overview
**Prompt Engineering** is the practice of designing inputs for Generative AI models to produce optimal, predictable, and accurate outputs. It is a critical layer in AI Application Engineering.

Hexa implements a `PromptTemplate` engine that demonstrates five standard prompt engineering patterns.

## Implementation Details

The `promptTemplates.js` module encapsulates variables (e.g., `{{task_name}}`) into structured system and user messages.

### 1. Zero-Shot Prompting
**Pattern**: Asking the model to perform a task without providing any examples.
**Use Case**: Simple tasks where the model's pre-training is sufficient.
```text
System: You are a summarization assistant.
User: Summarize this task: {{description}}
```

### 2. Few-Shot Prompting
**Pattern**: Providing a few examples of inputs and expected outputs within the prompt.
**Use Case**: When the output must follow a specific, non-standard format or tone.
```text
System: Analyze task priority.
User: Server is down -> Output: {"priority": "critical"}
User: Update README -> Output: {"priority": "low"}
User: {{current_task}} ->
```

### 3. Chain-of-Thought (CoT) Prompting
**Pattern**: Instructing the model to "think step by step" or output its reasoning process before providing the final answer.
**Use Case**: Complex reasoning, debugging, or math problems. CoT significantly reduces hallucinations by forcing the model to calculate intermediate steps.
```text
System: Analyze this bug report. Think step by step.
1. UNDERSTAND: Restate the problem
2. HYPOTHESIZE: List possible causes
3. SOLUTION: Recommend a fix
```

### 4. Role-Playing (Persona Adoption)
**Pattern**: Assigning the LLM a specific persona or expertise level.
**Use Case**: Domain-specific tasks like code review or legal analysis.
```text
System: You are a strict but fair senior code reviewer at a top tech company. You focus on security and performance...
```

### 5. Template Variable Substitution
The engine provides a clean API for controllers to inject dynamic application data into the templates securely.
```javascript
// server/src/ai/promptTemplates.js
const messages = promptTemplates.buildPrompt('bug-analyzer', {
  title: 'Login crash',
  description: 'App crashes when clicking login'
});
```

## Verification / Demo
- API Endpoint: `GET /api/ai/prompts` — View the library of configured templates and their patterns.
- API Endpoint: `POST /api/ai/prompts/task-prioritizer` — Execute a few-shot template and see how the LLM perfectly mimics the format provided in the examples.
