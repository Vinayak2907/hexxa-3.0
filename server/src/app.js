// Express Application Setup
// Main application configuration for the Hexa API

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import nosqlRoutes from './routes/nosqlRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';
import mongoIndexRoutes from './routes/mongoIndexRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import rbacRoutes from './routes/rbacRoutes.js';
import problemModelingRoutes from './routes/problemModelingRoutes.js';
import sanitizeMiddleware from './middleware/sanitizeInput.js';
import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';
import { ssrMiddleware } from './ssr.js';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"] // Allow WebSocket connections
    }
  }
}));

// Middleware
app.use(cors({
  origin: config.clientUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(sanitizeMiddleware); // Input sanitization middleware for XSS prevention

// SSR middleware (for demonstration - in practice, you'd configure which routes to SSR)
app.use(ssrMiddleware());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/nosql', nosqlRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/auth/oauth', oauthRoutes);
app.use('/api/nosql/indexes', mongoIndexRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/rbac', rbacRoutes);
app.use('/api/problem-modeling', problemModelingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Example SSR endpoint (for demonstration)
app.get('/ssr-demo', async (req, res) => {
  try {
    // In a real implementation, you would render a React component here
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hexa SSR Demo</title>
          <meta name="description" content="Server-side rendering demonstration">
        </head>
        <body>
          <div id="root">
            <h1>Server-Side Rendering Demo</h1>
            <p>This page demonstrates server-side rendering capabilities.</p>
            <p>Current time: ${new Date().toLocaleString()}</p>
          </div>
          <script>
            // In a real SSR implementation, you would hydrate the client-side app here
            console.log('SSR demo page loaded');
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('SSR demo error:', error.message);
    res.status(500).send('SSR rendering failed');
  }
});

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;