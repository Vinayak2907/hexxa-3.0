# WebSocket Real-time Communication

## Overview
WebSocket provides bidirectional, full-duplex communication channels over a single TCP connection. It enables real-time data transfer between client and server with minimal latency.

## Benefits
- Real-time bidirectional communication
- Lower latency compared to HTTP polling
- Reduced bandwidth usage (no HTTP headers for each message)
- Persistent connection eliminates connection overhead
- Supports binary data transmission

## Implementation in Hexa
Hexa implements a WebSocket server in `server/src/websocket.js` that provides:

### Features:
- Authentication middleware for secure connections
- Channel-based messaging (subscribe/unsubscribe to topics)
- Broadcasting messages to all clients or specific channels
- Error handling and connection management
- Heartbeat/ping-pong mechanism for connection health

### Usage:
1. Client establishes WebSocket connection to `ws://localhost:6001`
2. Client sends authentication token upon connection
3. Client can subscribe to specific channels (e.g., "task-updates", "project-changes")
4. Server broadcasts relevant events to subscribed clients
5. Clients receive real-time updates without polling

## Real-world Applications
- Live chat applications
- Real-time collaboration tools
- Stock trading platforms
- Live sports updates
- Multiplayer games
- Dashboard with live metrics