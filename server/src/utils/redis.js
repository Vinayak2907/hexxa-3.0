// Redis Utility Functions
// Provides caching layer for improved performance

import { createClient } from 'redis';
import config from '../config/env.js';

// Create Redis client
let redisClient = null;

export async function connectRedis() {
  try {
    redisClient = createClient({
      url: config.redisUrl || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      console.error('Redis Client Error', err);
    });

    await redisClient.connect();
    console.log('��✓ Connected to Redis');
    return redisClient;
  } catch (error) {
    console.error('Failed to connect to Redis:', error.message);
    throw error;
  }
}

export function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

/**
 * Cache data with TTL (time to live)
 * @param {string} key - Cache key
 * @param {any} value - Value to cache (will be JSON.stringify'd)
 * @param {number} ttlSeconds - Time to live in seconds (default: 300 = 5 min)
 * @returns {Promise<boolean>} Success status
 */
export async function cacheSet(key, value, ttlSeconds = 300) {
  try {
    const client = getRedisClient();
    const serializedValue = JSON.stringify(value);
    await client.set(key, serializedValue, {
      EX: ttlSeconds
    });
    return true;
  } catch (error) {
    console.error('Failed to set cache:', error.message);
    return false;
  }
}

/**
 * Get cached data
 * @param {string} key - Cache key
 * @returns {Promise<any|null>} Cached value or null if not found/error
 */
export async function cacheGet(key) {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    if (value === null) {
      return null;
    }
    return JSON.parse(value);
  } catch (error) {
    console.error('Failed to get cache:', error.message);
    return null;
  }
}

/**
 * Delete cached data
 * @param {string} key - Cache key
 * @returns {Promise<boolean>} Success status
 */
export async function cacheDel(key) {
  try {
    const client = getRedisClient();
    await client.del(key);
    return true;
  } catch (error) {
    console.error('Failed to delete cache:', error.message);
    return false;
  }
}

/**
 * Increment a counter (useful for rate limiting)
 * @param {string} key - Counter key
 * @param {number} incrementBy - Amount to increment (default: 1)
 * @param {number} ttlSeconds - Time to live in seconds (default: 60)
 * @returns {Promise<number>} New counter value
 */
export async function cacheIncrement(key, incrementBy = 1, ttlSeconds = 60) {
  try {
    const client = getRedisClient();
    const newValue = await client.incrBy(key, incrementBy);

    // Set TTL if this is a new key
    if (newValue === incrementBy) {
      await client.expire(key, ttlSeconds);
    }

    return newValue;
  } catch (error) {
    console.error('Failed to increment cache:', error.message);
    throw error;
  }
}

/**
 * Get cache TTL (time to live)
 * @param {string} key - Cache key
 * @returns {Promise<number>} TTL in seconds (-1 if no expiry, -2 if key doesn't exist)
 */
export async function cacheTtl(key) {
  try {
    const client = getRedisClient();
    return await client.ttl(key);
  } catch (error) {
    console.error('Failed to get cache TTL:', error.message);
    return -2;
  }
}

/**
 * Flush all cache (USE WITH CAUTION - mainly for development/testing)
 * @returns {Promise<boolean>} Success status
 */
export async function cacheFlush() {
  try {
    const client = getRedisClient();
    await client.flushAll();
    return true;
  } catch (error) {
    console.error('Failed to flush cache:', error.message);
    return false;
  }
}

export default {
  connectRedis,
  getRedisClient,
  cacheSet,
  cacheGet,
  cacheDel,
  cacheIncrement,
  cacheTtl,
  cacheFlush
};