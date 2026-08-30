// Concepts Page - Concept Demonstration Center
// Displays all mandatory concepts with links to demos
// Includes both required 13 concepts and additional bonus concepts

import { Link } from 'react-router-dom';
import PageContainer from '../components/PageContainer.jsx';
import './Concepts.css';

const concepts = [
  {
    id: 1,
    name: 'HTTP Status Codes',
    description: 'Correct use of HTTP status codes (200, 201, 204, 400, 404, 500)',
    implementation: 'server/src/routes/taskRoutes.js, server/src/controllers/taskController.js',
    demo: 'Create/update/delete tasks and inspect HTTP responses',
    file: 'docs/concepts/01-http-status-codes.md'
  },
  {
    id: 2,
    name: 'Environment Variables',
    description: 'Environment configuration with dotenv and .env.example',
    implementation: 'server/src/config/env.js, .env.example',
    demo: 'Check server startup configuration',
    file: 'docs/concepts/02-environment-secrets.md'
  },
  {
    id: 3,
    name: 'Git Workflow',
    description: 'Real Git workflow with branches and meaningful commits',
    implementation: '.git/, docs/concepts/03-git-workflow.md',
    demo: 'Check Git history and branch structure',
    file: 'docs/concepts/03-git-workflow.md'
  },
  {
    id: 4,
    name: 'Async API Fetching',
    description: 'Real async data fetching from Express backend using fetch API',
    implementation: 'client/src/api/taskApi.js, client/src/api/projectApi.js',
    demo: 'Open Tasks page and check Network tab',
    file: 'docs/concepts/04-async-data-fetching.md'
  },
  {
    id: 5,
    name: 'Client-Side Routing',
    description: 'React Router for SPA navigation without page reload',
    implementation: 'client/src/App.jsx',
    demo: 'Navigate between pages using Navbar',
    file: 'docs/concepts/05-client-routing.md'
  },
  {
    id: 6,
    name: 'Async/Await',
    description: 'Modern async/await syntax for handling Promises',
    implementation: 'client/src/api/*.js (all API functions)',
    demo: 'API calls use async/await throughout',
    file: 'docs/concepts/06-async-await.md'
  },
  {
    id: 7,
    name: 'Closures',
    description: 'JavaScript closures with captured variables',
    implementation: 'client/src/utils/createTaskFilter.js',
    demo: 'Filter tasks by status - filter function captures status',
    file: 'docs/concepts/07-closures.md'
  },
  {
    id: 8,
    name: 'Event Loop',
    description: 'JavaScript event loop with microtask and task queues',
    implementation: 'client/src/demos/eventLoopDemo.js',
    demo: <Link to="/concepts/event-loop">Event Loop Demo</Link>,
    file: 'docs/concepts/08-event-loop.md'
  },
  {
    id: 9,
    name: 'Hoisting',
    description: 'JavaScript hoisting with var, let, const, and function declarations',
    implementation: 'client/src/demos/hoistingDemo.js',
    demo: <Link to="/concepts/hoisting">Hoisting Demo</Link>,
    file: 'docs/concepts/09-hoisting.md'
  },
  {
    id: 10,
    name: 'Promises vs Callbacks',
    description: 'Comparison of callback, Promise, and async/await patterns',
    implementation: 'client/src/demos/promisesVsCallbacks.js',
    demo: <Link to="/concepts/promises">Promise vs Callback Demo</Link>,
    file: 'docs/concepts/10-promises-vs-callbacks.md'
  },
  {
    id: 11,
    name: 'React Component Composition',
    description: 'Reusable components with children prop',
    implementation: 'client/src/components/*.jsx',
    demo: 'Layout > PageContainer > TaskList > TaskCard',
    file: 'docs/concepts/11-react-composition.md'
  },
  {
    id: 12,
    name: 'useState',
    description: 'React state management with useState hook',
    implementation: 'client/src/pages/*.jsx',
    demo: 'Any page with interactive state (try filtering tasks)',
    file: 'docs/concepts/12-use-state.md'
  },
  {
    id: 13,
    name: 'PostgreSQL PK/FK',
    description: 'Relational schema with primary keys, foreign keys, and JOINs',
    implementation: 'database/schema.sql, server/src/repositories/*.js',
    demo: 'Tasks page shows joined data (project_name, created_by_name)',
    file: 'docs/concepts/13-postgres-pk-fk.md'
  }
];

// Additional bonus/demo concepts (beyond the required 13)
const bonusConcepts = [
  {
    id: 14,
    name: 'NoSQL Embedding vs Referencing',
    description: 'Relationship modeling in document databases',
    implementation: 'client/src/demos/nosqlConcepts.js',
    demo: <Link to="/concepts/nosql">NoSQL Concepts Demo</Link>,
    file: 'client/src/demos/nosqlConcepts.js'
  },
  {
    id: 15,
    name: 'WebSocket Real-time Communication',
    description: 'Bidirectional real-time communication between client and server',
    implementation: 'server/src/websocket.js',
    demo: 'WebSocket server running on port 6001',
    file: 'server/src/websocket.js'
  },
  {
    id: 16,
    name: 'Scheduled Jobs / Cron',
    description: 'Background task processing for maintenance and reports',
    implementation: 'server/src/worker.js',
    demo: <Link to="/worker-demo">Worker Demo</Link>,
    file: 'server/src/worker.js'
  },
  {
    id: 17,
    name: 'Payment Gateway Integration',
    description: 'Integration with payment providers like Stripe/PayPal',
    implementation: 'server/src/services/paymentService.js',
    demo: <Link to="/payment-demo">Payment Demo</Link>,
    file: 'server/src/services/paymentService.js'
  },
  {
    id: 18,
    name: 'Server-Side Rendering (SSR)',
    description: 'Rendering React components on the server for improved SEO and performance',
    implementation: 'server/src/ssr.js',
    demo: <Link to="/ssr-demo">SSR Demo</Link>,
    file: 'server/src/ssr.js'
  },
  {
    id: 19,
    name: 'Role-Based Authorization Checks (RBAC)',
    description: 'Cryptographically signed JWT role verification with user, manager, and admin hierarchies',
    implementation: 'server/src/middleware/roleMiddleware.js, server/src/routes/rbacRoutes.js',
    demo: 'API endpoints: GET /api/rbac/info, GET /api/rbac/demo-tokens, GET /api/rbac/admin-zone',
    file: 'docs/concepts/21-rbac.md'
  },
  {
    id: 20,
    name: 'Problem Modeling (Domain-Driven Design)',
    description: 'DDD Architecture: Value Objects (DateRange), Entities (TaskEntity), State Machines, and Invariants',
    implementation: 'server/src/services/problemModeling.js, server/src/routes/problemModelingRoutes.js',
    demo: 'API endpoints: GET /api/problem-modeling/overview, POST /api/problem-modeling/simulate-lifecycle',
    file: 'docs/concepts/34-problem-modeling.md'
  },
  {
    id: 21,
    name: 'AI Engineering & LLM Integration',
    description: '10 AI Concepts: Streaming (SSE), Structured Outputs, Function Calling, RAG, Eval Sets, Prompt Injection Defenses, Token Monitoring, and ReAct Agents',
    implementation: 'server/src/ai/*.js, server/src/routes/aiRoutes.js',
    demo: 'API endpoints under /api/ai/ (status, chat, prompts, structured, stream, tools, rag, evals, guard, usage, agent)',
    file: 'docs/concepts/24-streaming-responses.md'
  }
];

function Concepts() {
  return (
    <PageContainer
      title="Concept Center"
      subtitle="Explore all engineering concepts implemented in Hexa"
    >
      <div className="concepts-page">
        <p className="intro">
          This page demonstrates all engineering concepts implemented in the Hexa application.
          The first 13 are mandatory concepts for the viva examination, while additional
          concepts showcase advanced features and best practices.
        </p>

        <div className="concepts-section">
          <h2>Mandatory Concepts (1-13)</h2>
          <div className="concepts-grid">
            {concepts.map(concept => (
              <div key={concept.id} className="concept-card">
                <div className="concept-header">
                  <span className="concept-number">{concept.id}</span>
                  <h3>{concept.name}</h3>
                </div>
                <p className="concept-description">{concept.description}</p>
                <div className="concept-details">
                  <p><strong>Implementation:</strong> {concept.implementation}</p>
                  <p><strong>Demo:</strong> {concept.demo}</p>
                  <p><strong>File:</strong> {concept.file}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="concepts-section">
          <h2>Bonus/Advanced Concepts</h2>
          <p className="intro">
            These additional concepts demonstrate advanced features and architectural patterns
            that enhance the application beyond the basic requirements.
          </p>
          <div className="concepts-grid">
            {bonusConcepts.map(concept => (
              <div key={concept.id} className="concept-card">
                <div className="concept-header">
                  <span className="concept-number">{concept.id}</span>
                  <h3>{concept.name}</h3>
                </div>
                <p className="concept-description">{concept.description}</p>
                <div className="concept-details">
                  <p><strong>Implementation:</strong> {concept.implementation}</p>
                  <p><strong>Demo:</strong> {concept.demo}</p>
                  <p><strong>File:</strong> {concept.file}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default Concepts;