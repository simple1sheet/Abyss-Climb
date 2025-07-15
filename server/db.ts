import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for serverless environments
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with proper error handling and connection limits
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 5, // Increase pool size for better stability
  idleTimeoutMillis: 30000, // 30 seconds idle timeout
  connectionTimeoutMillis: 10000, // 10 seconds connection timeout
  maxUses: 7500, // Limit uses per connection to prevent stale connections
  allowExitOnIdle: true, // Allow graceful shutdown
  maxLifetimeSeconds: 3600, // 1 hour max connection lifetime
});

// Handle pool errors gracefully with reconnection
pool.on('error', (err) => {
  console.error('Database pool error:', err);
  
  // Log specific error types for debugging
  if (err.code === '57P01') {
    console.log('Database connection terminated by administrator - will reconnect automatically');
  }
});

// Handle connection events
pool.on('connect', (client) => {
  console.log('Database connected successfully');
  
  // Set connection timeout to prevent hanging connections
  client.query('SET statement_timeout = 30000');
});

pool.on('remove', () => {
  console.log('Database connection removed from pool');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Closing database pool...');
  await pool.end();
});

process.on('SIGINT', async () => {
  console.log('Closing database pool...');
  await pool.end();
});

export const db = drizzle({ client: pool, schema });