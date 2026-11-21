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
}

// Reads the gallery works straight from Postgres on every request.
export async function getGalleryWorks(): Promise<GalleryWork[]> {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, category, category_label, committee, span_class,
              aspect_class, dim, tools, colors, description, art
         FROM gallery_works
        ORDER BY id ASC`
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
    }));
  } catch (error) {
    console.error('getGalleryWorks failed:', error);
    return [];
  }
}

export async function saveGalleryWork(work: Partial<GalleryWork> & { id: string }): Promise<GalleryWork | null> {
  try {
    const { rows } = await pool.query(
      `INSERT INTO gallery_works (
         id, title, category, category_label, committee, span_class, aspect_class, dim, tools, colors, description, art
       )
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
         art = EXCLUDED.art
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
