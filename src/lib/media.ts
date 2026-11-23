import { pool } from './postgres';

export async function initMediaTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS uploaded_media (
      filename TEXT PRIMARY KEY,
      mime_type TEXT NOT NULL,
      data BYTEA NOT NULL,
      size INT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `);
}

export async function saveMedia(filename: string, mimeType: string, data: Buffer | Uint8Array): Promise<void> {
  await initMediaTable();
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  await pool.query(
    `INSERT INTO uploaded_media (filename, mime_type, data, size)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (filename) DO UPDATE SET
       mime_type = EXCLUDED.mime_type,
       data = EXCLUDED.data,
       size = EXCLUDED.size;`,
    [filename, mimeType, buffer, buffer.length]
  );
}

export async function getMedia(filename: string): Promise<{ mimeType: string; data: Buffer } | null> {
  await initMediaTable();
  const { rows } = await pool.query(
    `SELECT mime_type, data FROM uploaded_media WHERE filename = $1`,
    [filename]
  );
  if (!rows || rows.length === 0) return null;
  return {
    mimeType: rows[0].mime_type,
    data: rows[0].data,
  };
}
