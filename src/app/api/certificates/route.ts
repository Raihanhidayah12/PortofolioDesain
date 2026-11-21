import { connection } from 'next/server';
import { getCertificates, saveCertificate, deleteCertificate } from '@/lib/certificates';

export async function GET() {
  await connection();
  try {
    const certificates = await getCertificates();
    return Response.json(
      { certificates, count: certificates.length },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('GET /api/certificates failed', error);
    return Response.json({ error: 'failed to load certificates' }, { status: 500 });
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
        { error: 'ID dan Judul Sertifikat wajib diisi' },
        { status: 400 }
      );
    }

    const saved = await saveCertificate(body);
    return Response.json({ success: true, certificate: saved });
  } catch (error) {
    console.error('POST /api/certificates failed', error);
    return Response.json(
      { error: 'Gagal menyimpan sertifikat: ' + String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  await connection();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return Response.json({ error: 'Parameter id wajib diisi' }, { status: 400 });
    }
    const deleted = await deleteCertificate(id);
    return Response.json({ success: true, deleted });
  } catch (error) {
    console.error('DELETE /api/certificates failed', error);
    return Response.json(
      { error: 'Gagal menghapus sertifikat: ' + String(error) },
      { status: 500 }
    );
  }
}
