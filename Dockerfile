# Multi-stage Docker build for Hexa application

# === STAGE 1: Build ===
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci && \
    cd client && npm ci && \
    cd server && npm ci

# Copy source code
COPY . .

# Prisma generate (if using Prisma)
RUN cd server && npx prisma generate

# Build client
RUN cd client && npm run build

# === STAGE 2: Production ===
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/client/node_modules ./client/node_modules
COPY --from=builder /app/server/node_modules ./server/node_modules
COPY --from=builder /app/client/dist ./client/dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/client/package*.json ./client/
COPY --from=builder /app/server/package*.json ./server/

# Expose ports
EXPOSE 5000 5173

# Set environment variables
ENV NODE_ENV=production

# Start both servers (in practice, you'd use separate containers or a process manager)
# For simplicity, we'll start the backend and serve the frontend static files
CMD ["node", "server/src/server.js"]