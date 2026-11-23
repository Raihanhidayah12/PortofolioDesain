import { NextRequest, NextResponse } from 'next/server';
import { getMedia } from '@/lib/media';
import path from 'path';
import { readFile } from 'fs/promises';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params;
    if (!filename) {
      return new NextResponse('Filename missing', { status: 400 });
    }

    // 1. Try fetching from Neon Postgres
    const media = await getMedia(filename);
    if (media) {
      return new NextResponse(new Uint8Array(media.data), {
        headers: {
          'Content-Type': media.mimeType || 'image/jpeg',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // 2. Fallback to local public/uploads if exists on disk
    try {
      const localPath = path.join(process.cwd(), 'public', 'uploads', filename);
      const fileBuffer = await readFile(localPath);
      const ext = path.extname(filename).toLowerCase();
      let mimeType = 'application/octet-stream';
      if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';
      else if (ext === '.png') mimeType = 'image/png';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.svg') mimeType = 'image/svg+xml';
      else if (ext === '.pdf') mimeType = 'application/pdf';

      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch {
      // file not on disk either
    }

    return new NextResponse('File Not Found', { status: 404 });
  } catch (error) {
    console.error('Error serving upload:', error);
    return new NextResponse('Error serving file', { status: 500 });
  }
}
