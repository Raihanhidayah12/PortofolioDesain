import { Pool, QueryResult, QueryResultRow } from 'pg';

// Neon best practice: route app query traffic through the POOLED connection string
// (the `-pooler` host, PgBouncer transaction mode). Migrations must use the
// DIRECT (unpooled) string instead — see scripts/migrate.cjs.
const connectionString = process.env.DATABASE_URL;

const rawPool = new Pool(connectionString ? { connectionString } : {});

// Safe singleton pool that doesn't throw during static build evaluation
export const pool = {
  query: async <T extends QueryResultRow = any>(...args: Parameters<Pool['query']>): Promise<QueryResult<T>> => {
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL is not set in environment variables.');
      return { rows: [], command: '', rowCount: 0, oid: 0, fields: [] };
    }
    return (rawPool.query as any)(...args);
  },
  end: () => rawPool.end(),
} as unknown as Pool;
