import { neon } from '@neondatabase/serverless';

// Initialize the SQL query helper with Neon Serverless Postgres
const databaseUrl = process.env.DATABASE_URL || '';

export const sql = databaseUrl ? neon(databaseUrl) : null;

export async function initDatabase() {
  if (!sql) return { success: false, message: 'DATABASE_URL is not defined' };
  try {
    // Create the contacts/inquiries table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS inquiries (
        id SERIAL PRIMARY KEY,
        role VARCHAR(100) NOT NULL,
        sender_email VARCHAR(255),
        message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    return { success: true };
  } catch (error) {
    console.error('Failed to initialize Neon database schema:', error);
    return { success: false, error };
  }
}
