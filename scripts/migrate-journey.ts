import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { TREASURE_STOPS } from '../src/data/portfolioData';

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

async function run() {
  const client = await pool.connect();
  try {
    console.log('Creating table journey_stops in Neon...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS journey_stops (
        id VARCHAR(50) PRIMARY KEY,
        code VARCHAR(50) NOT NULL,
        number INTEGER NOT NULL,
        route INTEGER NOT NULL,
        year VARCHAR(20) NOT NULL,
        period VARCHAR(100) NOT NULL,
        event VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        role_tags JSONB NOT NULL DEFAULT '[]',
        summary TEXT NOT NULL,
        marker VARCHAR(20) NOT NULL,
        coord VARCHAR(50) NOT NULL,
        photos JSONB NOT NULL DEFAULT '[]',
        outputs JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const countBefore = await client.query('SELECT count(*)::int AS n FROM journey_stops');
    console.log('journey_stops before seed:', countBefore.rows[0].n);

    for (const stop of TREASURE_STOPS) {
      await client.query(`
        INSERT INTO journey_stops (
          id, code, number, route, year, period, event, role, role_tags, summary, marker, coord, photos, outputs
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT (id) DO UPDATE SET
          code = EXCLUDED.code,
          number = EXCLUDED.number,
          route = EXCLUDED.route,
          year = EXCLUDED.year,
          period = EXCLUDED.period,
          event = EXCLUDED.event,
          role = EXCLUDED.role,
          role_tags = EXCLUDED.role_tags,
          summary = EXCLUDED.summary,
          marker = EXCLUDED.marker,
          coord = EXCLUDED.coord,
          photos = EXCLUDED.photos,
          outputs = EXCLUDED.outputs;
      `, [
        stop.id,
        stop.code,
        stop.number,
        stop.route,
        stop.year,
        stop.period,
        stop.event,
        stop.role,
        JSON.stringify(stop.roleTags),
        stop.summary,
        stop.marker,
        stop.coord,
        JSON.stringify(stop.photos),
        JSON.stringify(stop.outputs)
      ]);
    }

    const countAfter = await client.query('SELECT count(*)::int AS n FROM journey_stops');
    console.log('journey_stops after seed:', countAfter.rows[0].n);
    console.log('Migration completed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
