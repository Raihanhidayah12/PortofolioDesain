import { pool } from '@/lib/postgres';
import type { CreativeTool } from '@/types';

interface CreativeToolRow {
  id: string;
  abbr: string;
  name: string;
  category: string;
  usage: string;
  highlight: string;
  description: string;
  tilt: string;
  icon_url: string;
  order_num: number;
}

export async function getCreativeTools(): Promise<CreativeTool[]> {
  try {
    const { rows } = await pool.query(
      `SELECT id, abbr, name, category, usage, highlight, description, tilt, icon_url, order_num
         FROM creative_tools
        ORDER BY order_num ASC`
    );

    if (!rows) return [];

    return (rows as CreativeToolRow[]).map((row) => ({
      id: row.id,
      abbr: row.abbr,
      name: row.name,
      category: row.category,
      usage: row.usage,
      highlight: row.highlight,
      desc: row.description,
      tilt: row.tilt || '0deg',
      icon_url: row.icon_url || '',
      order_num: row.order_num || 0,
    }));
  } catch (error) {
    console.error('getCreativeTools query error:', error);
    return [];
  }
}

export async function saveCreativeTool(tool: Partial<CreativeTool> & { id: string }): Promise<CreativeTool | null> {
  try {
    const { rows } = await pool.query(
      `INSERT INTO creative_tools (id, abbr, name, category, usage, highlight, description, tilt, icon_url, order_num)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         abbr = EXCLUDED.abbr,
         name = EXCLUDED.name,
         category = EXCLUDED.category,
         usage = EXCLUDED.usage,
         highlight = EXCLUDED.highlight,
         description = EXCLUDED.description,
         tilt = EXCLUDED.tilt,
         icon_url = EXCLUDED.icon_url,
         order_num = EXCLUDED.order_num
       RETURNING *;`,
      [
        tool.id,
        tool.abbr || tool.id.slice(0, 2).toUpperCase(),
        tool.name || tool.id,
        tool.category || 'General',
        tool.usage || '100%',
        tool.highlight || '',
        tool.desc || '',
        tool.tilt || '0deg',
        tool.icon_url || '',
        tool.order_num ?? 0,
      ]
    );

    if (rows && rows.length > 0) {
      const row = rows[0] as CreativeToolRow;
      return {
        id: row.id,
        abbr: row.abbr,
        name: row.name,
        category: row.category,
        usage: row.usage,
        highlight: row.highlight,
        desc: row.description,
        tilt: row.tilt,
        icon_url: row.icon_url,
        order_num: row.order_num,
      };
    }
    return null;
  } catch (error) {
    console.error('saveCreativeTool error:', error);
    throw error;
  }
}

export async function deleteCreativeTool(id: string): Promise<boolean> {
  try {
    const { rowCount } = await pool.query(`DELETE FROM creative_tools WHERE id = $1`, [id]);
    return (rowCount ?? 0) > 0;
  } catch (error) {
    console.error('deleteCreativeTool error:', error);
    throw error;
  }
}
