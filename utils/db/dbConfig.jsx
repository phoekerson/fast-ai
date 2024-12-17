// utils/db/dbConfig.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL environment variable');
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });