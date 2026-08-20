// WebSocket Server for Real-time Communication
// Handles real-time updates for tasks, projects, and notifications

import { WebSocketServer } from 'ws';
import { verifyToken } from './utils/jwt.js';
import config from './config/env.js';

// Store active websocket connections
const connections = new Map();

// Store user-specific connections for targeted messaging
const userConnections = new Map();

/**
 * Initialize WebSocket server
 * @param {number} port - Port to listen on
 * @returns {WebSocketServer} WebSocket server instance
 */
export function initializeWebSocketServer(port = 6001) {
  const wss = new WebSocketServer({ port });

  console.log(`������ WebSocket server listening on ws://localhost:${port}`);

  wss.on('connection', (ws, req) => {
    // Extract token from query parameters or headers
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token') ||
                  req.headers['sec-websocket-protocol'];

    let userId = null;

    // Authenticate user if token provided
    if (token) {
      try {
        const decoded = verifyToken(token);
        userId = decoded.userId;

        // Store connection with user ID
        connections.set(ws, { userId, connectedAt: new Date() });

        // Store user-specific connection for targeted messaging
        if (!userConnections.has(userId)) {
          userConnections.set(userId, new Set());
        }
        userConnections.get(userId).add(ws);

        console.log(`������ User ${userId} connected via WebSocket`);

        // Send welcome message
        ws.send(JSON.stringify({
          type: 'welcome',
          message: 'Connected to Hexa WebSocket server',
          userId,
          timestamp: new Date().toISOString()
        }));
      } catch (error) {
        console.warn('������ WebSocket connection failed authentication:', error.message);
        ws.close(4001, 'Unauthorized');
        return;
      }
    } else {
      // Anonymous connection
      connections.set(ws, { userId: null, connectedAt: new Date() });
      console.log('������ Anonymous WebSocket client connected');

      ws.send(JSON.stringify({
        type: 'welcome',
        message: 'Connected to Hexa WebSocket server (anonymous)',
        timestamp: new Date().toISOString()
      }));
    }

    // Handle incoming messages
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        handleWebSocketMessage(ws, userId, data);
      } catch (error) {
        console.error('������ Error parsing WebSocket message:', error.message);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid JSON format',
          timestamp: new Date().toISOString()
        }));
      }
    });

    // Handle connection close
    ws.on('close', (code, reason) => {
      console.log(`������ WebSocket disconnected: ${ws.readyState}, code: ${code}, reason: ${reason}`);

      // Clean up connections
      if (connections.has(ws)) {
        const connInfo = connections.get(ws);
        if (connInfo.userId !== null) {
          // Remove from user connections
          if (userConnections.has(connInfo.userId)) {
            userConnections.get(connInfo.userId).delete(ws);
            // Clean up empty sets
            if (userConnections.get(connInfo.userId).size === 0) {
              userConnections.delete(connInfo.userId);
            }
          }
        }
        connections.delete(ws);
      }
    });

    // Handle connection errors
    ws.on('error', (error) => {
      console.error('������ WebSocket error:', error.message);
    });
  });

  // Handle WebSocket server errors
  wss.on('error', (error) => {
    console.error('������ WebSocket server error:', error.message);
  });

  return wss;
}

/**
 * Handle incoming WebSocket messages
 * @param {WebSocket} ws - WebSocket connection
 * @param {string|null} userId - Authenticated user ID
 * @param {Object} data - Parsed message data
 */
function handleWebSocketMessage(ws, userId, data) {
  const { type } = data;

  switch (type) {
    case 'ping':
      // Respond to ping with pong
      ws.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString()
      }));
      break;

    case 'subscribe':
      // Handle subscription to specific channels/topics
      handleSubscription(ws, userId, data);
      break;

    case 'unsubscribe':
      // Handle unsubscription
      handleUnsubscription(ws, userId, data);
      break;

    default:
      ws.send(JSON.stringify({
        type: 'error',
        message: `Unknown message type: ${type}`,
        timestamp: new Date().toISOString()
      }));
  }
}

/**
 * Handle subscription to channels
 * @param {WebSocket} ws - WebSocket connection
 * @param {string|null} userId - Authenticated user ID
 * @param {Object} data - Message data
 */
function handleSubscription(ws, userId, data) {
  const { channel } = data;

  // Store subscription info on the connection
  if (!ws.subscriptions) {
    ws.subscriptions = new Set();
  }
  ws.subscriptions.add(channel);

  ws.send(JSON.stringify({
    type: 'subscribed',
    channel,
    timestamp: new Date().toISOString()
  }));

  console.log(`������ User ${userId || 'anonymous'} subscribed to channel: ${channel}`);
}

/**
 * Handle unsubscription from channels
 * @param {WebSocket} ws - WebSocket connection
 * @param {string|null} userId - Authenticated user ID
 * @param {Object} data - Message data
 */
function handleUnsubscription(ws, userId, data) {
  const { channel } = data;

  if (ws.subscriptions) {
    ws.subscriptions.delete(channel);

    ws.send(JSON.stringify({
      type: 'unsubscribed',
      channel,
      timestamp: new Date().toISOString()
    }));

    console.log(`������ User ${userId || 'anonymous'} unsubscribed from channel: ${channel}`);
  }
}

/**
 * Broadcast message to all connected clients
 * @param {Object} message - Message to broadcast
 */
export function broadcastToAll(message) {
  const messageStr = JSON.stringify({
    ...message,
    timestamp: new Date().toISOString()
  });

  connections.forEach((_, ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(messageStr);
    }
  });
}

/**
 * Broadcast message to all connections of a specific user
 * @param {string} userId - User ID
 * @param {Object} message - Message to broadcast
 */
export function broadcastToUser(userId, message) {
  if (!userConnections.has(userId)) {
    return;
  }

  const messageStr = JSON.stringify({
    ...message,
    timestamp: new Date().toISOString()
  });

  userConnections.get(userId).forEach((ws) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(messageStr);
    }
  });
}

/**
 * Broadcast message to subscribers of a specific channel
 * @param {string} channel - Channel name
 * @param {Object} message - Message to broadcast
 */
export function broadcastToChannel(channel, message) {
  const messageStr = JSON.stringify({
    ...message,
    timestamp: new Date().toISOString()
  });

  connections.forEach((connInfo, ws) => {
    if (ws.readyState === ws.OPEN &&
        ws.subscriptions &&
        ws.subscriptions.has(channel)) {
      ws.send(messageStr);
    }
  });
}

/**
 * Get WebSocket server statistics
 * @returns {Object} Statistics about connections
 */
export function getWebSocketStats() {
  return {
    totalConnections: connections.size,
    userConnections: Array.from(userConnections.entries()).map(([userId, conns]) => ({
      userId,
      connectionCount: conns.size
    })),
    anonymousConnections: Array.from(connections.entries())
      .filter(([_, connInfo]) => connInfo.userId === null)
      .length
  };
}

export default {
  initializeWebSocketServer,
  broadcastToAll,
  broadcastToUser,
  broadcastToChannel,
  getWebSocketStats
};