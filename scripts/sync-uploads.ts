import fs from 'fs';
import path from 'path';
import { pool } from '../src/lib/postgres';

async function syncAll() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS uploaded_media (
      filename TEXT PRIMARY KEY,
      mime_type TEXT NOT NULL,
      data BYTEA NOT NULL,
      size INT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
  console.log('Table uploaded_media verified in Neon Postgres.');

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const files = fs.readdirSync(uploadDir);
  for (const f of files) {
    const filePath = path.join(uploadDir, f);
    if (!fs.statSync(filePath).isFile()) continue;
    const buf = fs.readFileSync(filePath);
    const ext = path.extname(f).toLowerCase();
    let mime = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') mime = 'image/jpeg';
    else if (ext === '.png') mime = 'image/png';
    else if (ext === '.webp') mime = 'image/webp';
    else if (ext === '.svg') mime = 'image/svg+xml';
    else if (ext === '.pdf') mime = 'application/pdf';

    await pool.query(
      `INSERT INTO uploaded_media (filename, mime_type, data, size)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (filename) DO UPDATE SET
         mime_type = EXCLUDED.mime_type,
         data = EXCLUDED.data,
         size = EXCLUDED.size;`,
      [f, mime, buf, buf.length]
    );
    console.log('Synced to Neon DB:', f, 'size:', buf.length);
  }
  console.log('All public/uploads successfully stored in Neon Postgres!');
  process.exit(0);
}

syncAll().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
