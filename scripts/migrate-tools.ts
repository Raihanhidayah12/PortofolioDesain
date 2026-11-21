import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { CREATIVE_TOOLS } from '../src/data/portfolioData';

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

const defaultIcons: Record<string, string> = {
  figma: '/icons/figma.svg',
  lightroom: '/icons/lightroom.svg',
  illustrator: '/icons/illustrator.svg',
  photoshop: '/icons/photoshop.svg',
  capcut: '/icons/capcut.svg',
  camera: '/icons/camera.svg'
};

const pool = new Pool({ connectionString });

async function run() {
  const client = await pool.connect();
  try {
    console.log('Creating table creative_tools in Neon...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS creative_tools (
        id VARCHAR(50) PRIMARY KEY,
        abbr VARCHAR(20) NOT NULL,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(100) NOT NULL,
        usage VARCHAR(50) NOT NULL,
        highlight VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        tilt VARCHAR(20) NOT NULL DEFAULT '0deg',
        icon_url TEXT NOT NULL DEFAULT '',
        order_num INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const countBefore = await client.query('SELECT count(*)::int AS n FROM creative_tools');
    console.log('creative_tools before seed:', countBefore.rows[0].n);

    let idx = 1;
    for (const tool of CREATIVE_TOOLS) {
      const iconUrl = defaultIcons[tool.id] || '';
      await client.query(`
        INSERT INTO creative_tools (
          id, abbr, name, category, usage, highlight, description, tilt, icon_url, order_num
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
          abbr = EXCLUDED.abbr,
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          usage = EXCLUDED.usage,
          highlight = EXCLUDED.highlight,
          description = EXCLUDED.description,
          tilt = EXCLUDED.tilt,
          icon_url = CASE 
            WHEN creative_tools.icon_url IS NOT NULL AND creative_tools.icon_url <> '' THEN creative_tools.icon_url 
            ELSE EXCLUDED.icon_url 
          END,
          order_num = EXCLUDED.order_num;
      `, [
        tool.id,
        tool.abbr,
        tool.name,
        tool.category,
        tool.usage,
        tool.highlight,
        tool.desc,
        tool.tilt,
        iconUrl,
        idx++
      ]);
    }

    const countAfter = await client.query('SELECT count(*)::int AS n FROM creative_tools');
    console.log('creative_tools after seed:', countAfter.rows[0].n);
    console.log('Creative tools migration completed successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
