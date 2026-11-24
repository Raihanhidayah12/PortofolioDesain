import { pool } from '@/lib/postgres';
import type { GalleryWork } from '@/types';

// snake_case row as returned by Postgres (pg auto-parses JSONB into JS values).
interface GalleryWorkRow {
  id: string;
  title: string;
  category: string;
  category_label: string;
  committee: string;
  span_class: string;
  aspect_class: string;
  dim: string;
  tools: string[];
  colors: string[];
  description: string;
  art: string;
  year?: string;
}

let galleryTableChecked = false;
async function ensureGalleryTable() {
  if (galleryTableChecked) return;
  try {
    await pool.query(`
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
        year          VARCHAR(20) DEFAULT '',
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      ALTER TABLE gallery_works ADD COLUMN IF NOT EXISTS year VARCHAR(20) DEFAULT '';
    `);
    galleryTableChecked = true;
  } catch (err) {
    console.error('ensureGalleryTable error:', err);
  }
}

// Reads the gallery works straight from Postgres on every request, sorted newest year first.
export async function getGalleryWorks(): Promise<GalleryWork[]> {
  try {
    await ensureGalleryTable();
    const { rows } = await pool.query(
      `SELECT id, title, category, category_label, committee, span_class,
              aspect_class, dim, tools, colors, description, art,
              COALESCE(year, '') AS year
         FROM gallery_works
        ORDER BY COALESCE(NULLIF(year, ''), TO_CHAR(created_at, 'YYYY')) DESC, created_at DESC`
    );
    if (!rows) return [];
    return (rows as GalleryWorkRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      categoryLabel: row.category_label,
      committee: row.committee,
      spanClass: row.span_class,
      aspectClass: row.aspect_class,
      dim: row.dim,
      tools: Array.isArray(row.tools) ? row.tools : [],
      colors: Array.isArray(row.colors) ? row.colors : [],
      desc: row.description,
      art: row.art,
      year: row.year || '',
    }));
  } catch (error) {
    console.error('getGalleryWorks failed:', error);
    return [];
  }
}

export async function saveGalleryWork(work: Partial<GalleryWork> & { id: string }): Promise<GalleryWork | null> {
  try {
    await ensureGalleryTable();
    const { rows } = await pool.query(
      `INSERT INTO gallery_works (
         id, title, category, category_label, committee, span_class, aspect_class, dim, tools, colors, description, art, year
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
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
         art = EXCLUDED.art,
         year = EXCLUDED.year
       RETURNING *;`,
      [
        work.id,
        work.title || 'Untitled Work',
        work.category || 'poster',
        work.categoryLabel || 'Design Output',
        work.committee || 'DDM Portfolio',
        work.spanClass || 'md:col-span-6',
        work.aspectClass || 'aspect-[16/10]',
        work.dim || '1920 × 1080 px',
        JSON.stringify(work.tools || []),
        JSON.stringify(work.colors || []),
        work.desc || '',
        work.art || 'cover-banner',
        work.year || '',
      ]
    );

    if (rows && rows.length > 0) {
      const row = rows[0] as GalleryWorkRow;
      return {
        id: row.id,
        title: row.title,
        category: row.category,
        categoryLabel: row.category_label,
        committee: row.committee,
        spanClass: row.span_class,
        aspectClass: row.aspect_class,
        dim: row.dim,
        tools: Array.isArray(row.tools) ? row.tools : [],
        colors: Array.isArray(row.colors) ? row.colors : [],
        desc: row.description,
        art: row.art,
        year: row.year || '',
      };
    }
    return null;
  } catch (error) {
    console.error('saveGalleryWork error:', error);
    throw error;
  }
}

export async function deleteGalleryWork(id: string): Promise<boolean> {
  try {
    const { rowCount } = await pool.query(`DELETE FROM gallery_works WHERE id = $1`, [id]);
    return (rowCount ?? 0) > 0;
  } catch (error) {
    console.error('deleteGalleryWork error:', error);
    throw error;
  }
}
