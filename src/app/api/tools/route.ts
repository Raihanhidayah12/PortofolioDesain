import { connection } from 'next/server';
import { getCreativeTools, saveCreativeTool, deleteCreativeTool } from '@/lib/tools';

export async function GET() {
  await connection();
  try {
    const tools = await getCreativeTools();
    return Response.json(
      { tools, count: tools.length },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/tools failed', error);
    return Response.json({ error: 'failed to load creative tools' }, { status: 500 });
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
    if (!body || !body.id || !body.name) {
      return Response.json(
        { error: 'ID dan Nama Tool wajib diisi' },
        { status: 400 }
      );
    }

    const saved = await saveCreativeTool(body);
    return Response.json({ success: true, tool: saved });
  } catch (error) {
    console.error('POST /api/tools failed', error);
    return Response.json(
      { error: 'Gagal menyimpan data tool: ' + String(error) },
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
      return Response.json({ error: 'ID tool wajib disertakan' }, { status: 400 });
    }

    const deleted = await deleteCreativeTool(id);
    return Response.json({ success: true, deleted, id });
  } catch (error) {
    console.error('DELETE /api/tools failed', error);
    return Response.json(
      { error: 'Gagal menghapus tool: ' + String(error) },
      { status: 500 }
    );
  }
}
