// Hexa Server Entry Point
// Starts the Express server and establishes database connection

import app from './app.js';
import config from './config/env.js';
import pool from './db/pool.js';
import { connectRedis } from './utils/redis.js';
import { initializeWebSocketServer } from './websocket.js';
import { initCronJobs } from './jobs/cronJobs.js';

const startServer = async () => {
  try {
    // Test database connection
    console.log('Connecting to PostgreSQL...');
    const result = await pool.query('SELECT NOW()');
    console.log('✓ Database connected:', result.rows[0].now);

    // Initialize Redis connection
    console.log('Connecting to Redis...');
    await connectRedis();
    console.log('✓ Redis connected');

    // Initialize background cron jobs
    initCronJobs();

    // Start HTTP server
    const httpServer = app.listen(config.port, () => {
      console.log(`✓ Hexa server running on http://localhost:${config.port}`);
      console.log(`✓ Environment: ${config.nodeEnv}`);
      console.log(`✓ API available at http://localhost:${config.port}/api`);
    });

    // Initialize WebSocket server
    const wsPort = process.env.WS_PORT || 6001;
    const wss = initializeWebSocketServer(wsPort);
    console.log(` WebSocket server initialized on port ${wsPort}`);

    // Store references for graceful shutdown
    startServer.httpServer = httpServer;
    startServer.wss = wss;
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');

  // Close WebSocket server
  try {
    if (startServer.wss) {
      startServer.wss.close();
      console.log('������������ WebSocket server closed');
    }
  } catch (error) {
    console.error('Error closing WebSocket server:', error.message);
  }

  // Close Redis connection
  try {
    const { getRedisClient } = await import('./utils/redis.js');
    const redisClient = getRedisClient();
    await redisClient.quit();
  } catch (error) {
    console.error('Error closing Redis connection:', error.message);
  }

  // Close HTTP server
  try {
    if (startServer.httpServer) {
      startServer.httpServer.close();
      console.log('������ HTTP server closed');
    }
  } catch (error) {
    console.error('Error closing HTTP server:', error.message);
  }

  await pool.end();
  process.exit(0);
});

startServer();