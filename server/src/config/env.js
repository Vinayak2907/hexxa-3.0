// Environment Configuration Module
// This module centralizes environment variable management for the Hexa application

import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = ['DATABASE_URL', 'PORT', 'JWT_SECRET', 'JWT_REFRESH_SECRET'];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV !== 'test') {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please copy .env.example to .env and configure the values');
  process.exit(1);
}

const isProduction = process.env.NODE_ENV === 'production';

// In production, ensure secrets are strictly provided from process environment
if (isProduction) {
  const missingSecrets = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DATABASE_URL'].filter(key => !process.env[key]);
  if (missingSecrets.length > 0) {
    console.error(`FATAL: Missing production secrets: ${missingSecrets.join(', ')}`);
    process.exit(1);
  }
}

const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Redis Configuration
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT Configuration (Secrets managed via environment variables)
  jwtSecret: process.env.JWT_SECRET || (isProduction ? undefined : 'dev-secret-key-change-in-prod'),
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || (isProduction ? undefined : 'dev-refresh-secret-key-change-in-prod'),

  // Database pool configuration
  database: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  }
};

export default config;