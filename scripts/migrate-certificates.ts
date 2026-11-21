import { pool } from '../src/lib/postgres';

async function main() {
  console.log('Ensuring certificates table in Neon DB...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS certificates (
      id VARCHAR(100) PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      event VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      issuer VARCHAR(255) NOT NULL DEFAULT '',
      year VARCHAR(50) NOT NULL DEFAULT '',
      category VARCHAR(100) NOT NULL DEFAULT 'Kepanitiaan',
      image_url TEXT NOT NULL DEFAULT '',
      credential_url TEXT DEFAULT '',
      description TEXT DEFAULT '',
      order_num INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('Table certificates created or already exists!');

  const { rows } = await pool.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'certificates'"
  );
  console.log('Columns:', rows);
  await pool.end();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
