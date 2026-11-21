import { connection } from 'next/server';
import { getGalleryWorks, saveGalleryWork, deleteGalleryWork } from '@/lib/gallery';

export async function GET() {
  await connection();
  try {
    const works = await getGalleryWorks();
    return Response.json(
      { works, count: works.length },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/gallery failed', error);
    return Response.json({ error: 'failed to load gallery works' }, { status: 500 });
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
    if (!body || !body.id || !body.title) {
      return Response.json(
        { error: 'ID dan Judul Karya wajib diisi' },
        { status: 400 }
      );
    }

    const saved = await saveGalleryWork(body);
    return Response.json({ success: true, work: saved });
  } catch (error) {
    console.error('POST /api/gallery failed', error);
    return Response.json(
      { error: 'Gagal menyimpan karya galeri: ' + String(error) },
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
      return Response.json({ error: 'ID karya wajib disertakan' }, { status: 400 });
    }

    const deleted = await deleteGalleryWork(id);
    return Response.json({ success: true, deleted, id });
  } catch (error) {
    console.error('DELETE /api/gallery failed', error);
    return Response.json(
      { error: 'Gagal menghapus karya: ' + String(error) },
      { status: 500 }
    );
  }
}
