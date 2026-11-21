import { Pool } from 'pg';

// Neon best practice: route app query traffic through the POOLED connection string
// (the `-pooler` host, PgBouncer transaction mode). Migrations must use the
// DIRECT (unpooled) string instead — see scripts/migrate.cjs.
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Run `neon deploy` or add the pooled connection string to .env.local'
  );
}

// Singleton Pool. pg connects lazily (on first query), so merely importing this
// module never opens a database connection. The route handler is the only importer,
// so this code never reaches a client bundle.
export const pool = new Pool({ connectionString });
