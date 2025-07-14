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
  max: 1, // Limit connections for serverless
  idleTimeoutMillis: 0, // Disable idle timeout
  connectionTimeoutMillis: 0, // Disable connection timeout
  maxUses: Infinity, // Allow unlimited uses per connection
  allowExitOnIdle: false, // Don't exit when idle
  maxLifetimeSeconds: 0, // Disable connection lifetime limit
});

// Handle pool errors gracefully
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

// Handle connection errors
pool.on('connect', () => {
  console.log('Database connected successfully');
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