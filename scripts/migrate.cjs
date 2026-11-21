// One-off, idempotent schema + seed migration for the gallery_works table.
//
// Run with:  npm run migrate
// which expands to: node --env-file=.env.local scripts/migrate.cjs
//
// Migrations MUST use the DIRECT (unpooled) connection string
// (DATABASE_URL_UNPOOLED). Running migrations over the pooled string can fail
// with `prepared statement already exists` / SQLSTATE 25006 because PgBouncer
// runs in transaction mode. App query traffic (src/lib/postgres.ts) uses the
// pooled DATABASE_URL instead.
//
// The seed data below is copied verbatim from the `GALLERY_WORKS` array literal
// in src/data/portfolioData.ts (plain JS object syntax — the TS type
// annotation is dropped). Re-running this script is a no-op: CREATE TABLE IF
// NOT EXISTS + INSERT ... ON CONFLICT (id) DO NEVER duplicate data.

const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL_UNPOOLED;
if (!connectionString) {
  console.error(
    'DATABASE_URL_UNPOOLED is not set. Run with: node --env-file=.env.local scripts/migrate.cjs'
  );
  process.exit(1);
}

// Verbatim copy of the GALLERY_WORKS array literal from src/data/portfolioData.ts.
const works = [
  {
    id: 'w-01',
    title: 'PORTO FOLIO — Royal Sunburst Master',
    category: 'poster',
    categoryLabel: 'Event Poster',
    committee: 'INNOFAIR',
    spanClass: 'md:col-span-7',
    aspectClass: 'aspect-[16/10]',
    dim: '1920 × 1080 px',
    tools: ['Figma', 'Illustrator', 'Photoshop'],
    colors: ['#0038A8', '#021238', '#C6A355', '#6B0F1A', '#FFFFFF'],
    desc: 'Key visual utama dengan latar sinar radial biru royal, bingkai Art-Deco emas ganda, lencana marun vertikal, dan tipografi 3D bertumpuk.',
    art: 'cover-banner'
  },
  {
    id: 'w-02',
    title: 'INNOFAIR Exhibition — Editorial Feed 4:5',
    category: 'feed',
    categoryLabel: 'Social Media Feed',
    committee: 'INNOFAIR',
    spanClass: 'md:col-span-5',
    aspectClass: 'aspect-[4/4]',
    dim: '1080 × 1350 px',
    tools: ['Figma', 'Lightroom'],
    colors: ['#0038A8', '#FFFFFF', '#C6A355'],
    desc: 'Sistem microblog dan pengumuman pembicara dengan tata letak bersih, hirarki tipografi tegas, dan aksen garis emas.',
    art: 'feed-recap'
  },
  {
    id: 'w-03',
    title: 'National Tech Hackathon — Call For Participants',
    category: 'poster',
    categoryLabel: 'Event Poster',
    committee: 'HMPSTI',
    spanClass: 'md:col-span-4',
    aspectClass: 'aspect-[3/4]',
    dim: '1080 × 1920 px',
    tools: ['Illustrator', 'Photoshop'],
    colors: ['#6B0F1A', '#E2C275', '#021542'],
    desc: 'Poster vertikal pendaftaran kompetisi berskala nasional dengan kombinasi marun royal dan bingkai klasik modern.',
    art: 'poster-vertical'
  },
  {
    id: 'w-04',
    title: 'Auditorium Keynote & Stage Spotlight',
    category: 'photography',
    categoryLabel: 'Event Photography',
    committee: 'Creative Workshop',
    spanClass: 'md:col-span-8',
    aspectClass: 'aspect-[16/10]',
    dim: '6000 × 4000 px • 35mm f/2.0',
    tools: ['Adobe Lightroom'],
    colors: ['#021542', '#C6A355', '#F8FAFC'],
    desc: 'Dokumentasi panggung utama seminar nasional menangkap sorotan lampu panggung dan ekspresi pembicara.',
    art: 'photo-stage'
  },
  {
    id: 'w-05',
    title: 'All-Access Lanyard, ID Card & Brand Kit',
    category: 'uiux',
    categoryLabel: 'UI/UX & Brand',
    committee: 'INNOFAIR',
    spanClass: 'md:col-span-6',
    aspectClass: 'aspect-[16/10]',
    dim: '900 × 45 mm • CMYK & UI Kit',
    tools: ['Figma', 'Illustrator'],
    colors: ['#6B0F1A', '#C6A355', '#0038A8'],
    desc: 'Sistem identitas fisik kepanitiaan mencakup tali lanyard marun-emas, kartu akses divisi, dan panduan komponen visual.',
    art: 'lanyard-print'
  },
  {
    id: 'w-06',
    title: 'Golden Hour Campus Closing Series',
    category: 'photography',
    categoryLabel: 'Event Photography',
    committee: 'PKKMB Fakultas',
    spanClass: 'md:col-span-6',
    aspectClass: 'aspect-[16/10]',
    dim: '6000 × 4000 px • 50mm f/1.8',
    tools: ['Adobe Lightroom'],
    colors: ['#7C2D12', '#E2C275', '#FEF3C7'],
    desc: 'Rangkaian foto dokumenter penutupan acara luar ruang dengan profil warna hangat sinematik.',
    art: 'photo-sunset'
  }
];

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS gallery_works (
        id            TEXT PRIMARY KEY,
        title         TEXT NOT NULL,
        category      TEXT NOT NULL,
        category_label TEXT NOT NULL,
        committee     TEXT NOT NULL,
        span_class    TEXT NOT NULL,
        aspect_class  TEXT NOT NULL,
        dim           TEXT NOT NULL,
        tools         JSONB NOT NULL DEFAULT '[]',
        colors        JSONB NOT NULL DEFAULT '[]',
        description   TEXT NOT NULL,
        art           TEXT NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    const before = await client.query('SELECT count(*)::int AS n FROM gallery_works');
    console.log('gallery_works before seed:', before.rows[0].n);

    for (const w of works) {
      await client.query(
        `INSERT INTO gallery_works
           (id, title, category, category_label, committee, span_class, aspect_class,
            dim, tools, colors, description, art)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           category = EXCLUDED.category,
           category_label = EXCLUDED.category_label,
           committee = EXCLUDED.committee,
           span_class = EXCLUDED.span_class,
           aspect_class = EXCLUDED.aspect_class,
           dim = EXCLUDED.dim,
           tools = EXCLUDED.tools,
           colors = EXCLUDED.colors,
           description = EXCLUDED.description,
           art = EXCLUDED.art`,
        [
          w.id,
          w.title,
          w.category,
          w.categoryLabel,
          w.committee,
          w.spanClass,
          w.aspectClass,
          w.dim,
          JSON.stringify(w.tools),
          JSON.stringify(w.colors),
          w.desc,
          w.art
        ]
      );
    }

    const after = await client.query('SELECT count(*)::int AS n FROM gallery_works');
    console.log('gallery_works after seed:', after.rows[0].n);
    console.log('migration complete');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('migration failed:', err);
  process.exit(1);
});
