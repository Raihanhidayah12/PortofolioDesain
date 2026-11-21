import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// Load .env.local
const envFile = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envFile)) {
  const envConfig = fs.readFileSync(envFile, 'utf8').split('\n');
  for (const line of envConfig) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('No DATABASE_URL found!');
  process.exit(1);
}

const pool = new Pool({ connectionString });

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function run() {
  const client = await pool.connect();
  try {
    console.log('Creating table admin_users in Neon...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name VARCHAR(100) NOT NULL DEFAULT 'Admin',
        role VARCHAR(50) NOT NULL DEFAULT 'superadmin',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const adminEmail = (process.env.ADMIN_EMAIL || 'g3muhraihan.hidayah@gmail.com').toLowerCase().trim();
    const adminPassword = (process.env.ADMIN_PASSWORD || 'hanstudio2026').trim();
    const hashedPassword = hashPassword(adminPassword);

    console.log(`Ensuring admin user (${adminEmail}) exists in Neon...`);
    await client.query(
      `INSERT INTO admin_users (email, password_hash, name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         updated_at = NOW();`,
      [adminEmail, hashedPassword, 'Muh Raihan Hidayah (Han)', 'superadmin']
    );

    const { rows } = await client.query('SELECT id, email, name, role, created_at FROM admin_users');
    console.log('Current admin_users in Neon:', rows);
  } catch (err) {
    console.error('Failed to migrate admin_users:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
