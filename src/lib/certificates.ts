import { pool } from '@/lib/postgres';
import type { CertificateItem } from '@/types';

interface CertificateRow {
  id: string;
  title: string;
  event: string;
  role: string;
  issuer: string;
  year: string;
  category: string;
  image_url: string;
  credential_url: string;
  description: string;
  order_num: number;
}

let tableInitialized = false;

async function ensureCertificatesTable() {
  if (tableInitialized) return;
  try {
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
    tableInitialized = true;
  } catch (error) {
    console.error('Failed to ensure certificates table:', error);
  }
}

export async function getCertificates(): Promise<CertificateItem[]> {
  try {
    await ensureCertificatesTable();
    const { rows } = await pool.query(
      `SELECT id, title, event, role, issuer, year, category, image_url, credential_url, description, order_num
         FROM certificates
        ORDER BY order_num ASC, created_at DESC`
    );

    if (!rows) return [];

    return (rows as CertificateRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      event: row.event,
      role: row.role,
      issuer: row.issuer || '',
      year: row.year || '',
      category: row.category || 'Kepanitiaan',
      imageUrl: row.image_url || '',
      credentialUrl: row.credential_url || '',
      desc: row.description || '',
      orderNum: row.order_num || 0,
    }));
  } catch (error) {
    console.error('getCertificates query error:', error);
    return [];
  }
}

export async function saveCertificate(cert: Partial<CertificateItem> & { id: string }): Promise<CertificateItem | null> {
  try {
    await ensureCertificatesTable();
    const { rows } = await pool.query(
      `INSERT INTO certificates (
         id, title, event, role, issuer, year, category, image_url, credential_url, description, order_num
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         event = EXCLUDED.event,
         role = EXCLUDED.role,
         issuer = EXCLUDED.issuer,
         year = EXCLUDED.year,
         category = EXCLUDED.category,
         image_url = EXCLUDED.image_url,
         credential_url = EXCLUDED.credential_url,
         description = EXCLUDED.description,
         order_num = EXCLUDED.order_num
       RETURNING *;`,
      [
        cert.id,
        cert.title || '',
        cert.event || '',
        cert.role || '',
        cert.issuer || '',
        cert.year || '',
        cert.category || 'Kepanitiaan',
        cert.imageUrl || '',
        cert.credentialUrl || '',
        cert.desc || '',
        cert.orderNum ?? 0,
      ]
    );

    const saved = rows[0] as CertificateRow;
    return {
      id: saved.id,
      title: saved.title,
      event: saved.event,
      role: saved.role,
      issuer: saved.issuer,
      year: saved.year,
      category: saved.category,
      imageUrl: saved.image_url,
      credentialUrl: saved.credential_url,
      desc: saved.description,
      orderNum: saved.order_num,
    };
  } catch (error) {
    console.error('saveCertificate query error:', error);
    throw error;
  }
}

export async function deleteCertificate(id: string): Promise<boolean> {
  try {
    await ensureCertificatesTable();
    const { rowCount } = await pool.query(`DELETE FROM certificates WHERE id = $1`, [id]);
    return (rowCount ?? 0) > 0;
  } catch (error) {
    console.error('deleteCertificate query error:', error);
    throw error;
  }
}
