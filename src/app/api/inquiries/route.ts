import { NextResponse } from 'next/server';
import { sql, initDatabase } from '@/lib/db';

export async function POST(request: Request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Format JSON request tidak valid' },
        { status: 400 }
      );
    }

    const { role, message, senderEmail } = body || {};

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return NextResponse.json(
        { error: 'Pesan tidak boleh kosong' },
        { status: 400 }
      );
    }

    if (!sql) {
      return NextResponse.json(
        { error: 'Koneksi database Neon belum dikonfigurasi' },
        { status: 500 }
      );
    }

    // Ensure table exists
    await initDatabase();

    const cleanRole = role || 'General';
    const cleanEmail = senderEmail && senderEmail.trim() ? senderEmail.trim() : 'anonymous@visitor.com';
    const cleanMessage = message.trim();

    // Simpan ke database
    const result = await sql`
      INSERT INTO inquiries (role, sender_email, message)
      VALUES (${cleanRole}, ${cleanEmail}, ${cleanMessage})
      RETURNING id, created_at;
    `;

    return NextResponse.json({
      success: true,
      message: 'Pesan berhasil disimpan ke database Neon!',
      data: result[0],
    });
  } catch (error) {
    console.error('Error in /api/inquiries:', error);
    return NextResponse.json(
      { error: 'Gagal memproses pesan: ' + String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json({ connected: false, error: 'DATABASE_URL is not set' });
    }
    await initDatabase();
    const { searchParams } = new URL(request.url);
    if (searchParams.get('countOnly') === 'true') {
      const result = await sql`SELECT count(*) FROM inquiries;`;
      return NextResponse.json({ connected: true, count: result[0].count });
    }
    const rows = await sql`
      SELECT id, role, sender_email, message, created_at 
        FROM inquiries 
       ORDER BY created_at DESC;
    `;
    return NextResponse.json({
      connected: true,
      inquiries: rows,
      count: rows.length,
    });
  } catch (error) {
    return NextResponse.json({ connected: false, error: String(error) });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!sql) {
      return NextResponse.json({ connected: false, error: 'DATABASE_URL is not set' }, { status: 500 });
    }
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
      return NextResponse.json({ error: 'ID pesan wajib disertakan' }, { status: 400 });
    }
    await sql`DELETE FROM inquiries WHERE id = ${Number(id)};`;
    return NextResponse.json({ success: true, id });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
