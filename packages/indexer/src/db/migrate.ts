import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Runs all pending migrations from the ./drizzle directory.
 * Call this once at app startup before any queries.
 */
export async function runMigrations() {
  const dbUrl = process.env.DATABASE_URL ?? 'file:local.db';
  const dbPath = dbUrl.replace('file:', '');
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  const migrationsFolder = path.join(__dirname, '..', '..', 'drizzle');
  migrate(db, { migrationsFolder });

  return db;
}
