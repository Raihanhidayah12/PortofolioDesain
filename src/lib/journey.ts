import { pool } from '@/lib/postgres';
import type { TreasureStop, PhotoItem, OutputItem } from '@/types';

interface JourneyStopRow {
  id: string;
  code: string;
  number: number;
  route: number;
  year: string;
  period: string;
  event: string;
  role: string;
  role_tags: string[];
  summary: string;
  marker: string;
  coord: string;
  photos: PhotoItem[];
  outputs: OutputItem[];
}

export async function getJourneyStops(): Promise<TreasureStop[]> {
  try {
    const { rows } = await pool.query(
      `SELECT id, code, number, route, year, period, event, role, role_tags, summary, marker, coord, photos, outputs
         FROM journey_stops
        ORDER BY number ASC`
    );

    if (!rows) return [];

    return (rows as JourneyStopRow[]).map((row) => ({
      id: row.id,
      code: row.code,
      number: row.number,
      route: row.route,
      year: row.year,
      period: row.period,
      event: row.event,
      role: row.role,
      roleTags: Array.isArray(row.role_tags) ? row.role_tags : [],
      summary: row.summary,
      marker: row.marker,
      coord: row.coord,
      photos: Array.isArray(row.photos) ? row.photos : [],
      outputs: Array.isArray(row.outputs) ? row.outputs : [],
    }));
  } catch (error) {
    console.error('getJourneyStops query error:', error);
    return [];
  }
}

export async function saveJourneyStop(stop: Partial<TreasureStop> & { id: string }): Promise<TreasureStop | null> {
  try {
    const { rows } = await pool.query(
      `INSERT INTO journey_stops (
         id, code, number, route, year, period, event, role, role_tags, summary, marker, coord, photos, outputs
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
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
         outputs = EXCLUDED.outputs
       RETURNING *;`,
      [
        stop.id,
        stop.code || 'POS',
        stop.number ?? 1,
        stop.route ?? 1,
        stop.year || new Date().getFullYear().toString(),
        stop.period || '',
        stop.event || '',
        stop.role || '',
        JSON.stringify(stop.roleTags || []),
        stop.summary || '',
        stop.marker || 'P1',
        stop.coord || '50% 50%',
        JSON.stringify(stop.photos || []),
        JSON.stringify(stop.outputs || []),
      ]
    );

    if (rows && rows.length > 0) {
      const row = rows[0] as JourneyStopRow;
      return {
        id: row.id,
        code: row.code,
        number: row.number,
        route: row.route,
        year: row.year,
        period: row.period,
        event: row.event,
        role: row.role,
        roleTags: Array.isArray(row.role_tags) ? row.role_tags : [],
        summary: row.summary,
        marker: row.marker,
        coord: row.coord,
        photos: Array.isArray(row.photos) ? row.photos : [],
        outputs: Array.isArray(row.outputs) ? row.outputs : [],
      };
    }
    return null;
  } catch (error) {
    console.error('saveJourneyStop error:', error);
    throw error;
  }
}

export async function deleteJourneyStop(id: string): Promise<boolean> {
  try {
    const { rowCount } = await pool.query(`DELETE FROM journey_stops WHERE id = $1`, [id]);
    return (rowCount ?? 0) > 0;
  } catch (error) {
    console.error('deleteJourneyStop error:', error);
    throw error;
  }
}
