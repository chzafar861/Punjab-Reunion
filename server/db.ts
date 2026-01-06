import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Prefer SUPABASE_DATABASE_URL for Supabase deployment, fallback to DATABASE_URL for local/Replit
const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("No database URL configured. Set SUPABASE_DATABASE_URL or DATABASE_URL.");
}

export const pool = new Pool({ 
  connectionString: databaseUrl || "postgresql://localhost:5432/placeholder",
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
});

pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

export const db = drizzle(pool, { schema });
