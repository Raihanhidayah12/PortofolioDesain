import { connection } from 'next/server';
import { getJourneyStops, saveJourneyStop, deleteJourneyStop } from '@/lib/journey';

export async function GET() {
  await connection();
  try {
    const stops = await getJourneyStops();
    return Response.json(
      { stops, count: stops.length },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/journey failed', error);
    return Response.json({ error: 'failed to load journey stops' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await connection();
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Body JSON tidak valid' }, { status: 400 });
    }
    if (!body || !body.id || !body.event) {
      return Response.json(
        { error: 'ID dan Nama Event Pos wajib diisi' },
        { status: 400 }
      );
    }

    const saved = await saveJourneyStop(body);
    return Response.json({ success: true, stop: saved });
  } catch (error) {
    console.error('POST /api/journey failed', error);
    return Response.json(
      { error: 'Gagal menyimpan pos ekspedisi: ' + String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await request.json();
        id = body?.id;
      } catch {
        // no body
      }
    }

    if (!id) {
      return Response.json({ error: 'ID pos wajib disertakan' }, { status: 400 });
    }

    const deleted = await deleteJourneyStop(id);
    return Response.json({ success: true, deleted, id });
  } catch (error) {
    console.error('DELETE /api/journey failed', error);
    return Response.json(
      { error: 'Gagal menghapus pos: ' + String(error) },
      { status: 500 }
    );
  }
}
