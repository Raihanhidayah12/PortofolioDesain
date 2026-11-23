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

    // 1. Check Neon Postgres
    const media = await getMedia(filename);
    if (media) {
      return new NextResponse(new Uint8Array(media.data), {
        headers: {
          'Content-Type': media.mimeType || 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // 2. Check local disk
    try {
      const localPath = path.join(process.cwd(), 'public', 'icons', filename);
      const fileBuffer = await readFile(localPath);
      const ext = path.extname(filename).toLowerCase();
      let mimeType = 'image/png';
      if (ext === '.svg') mimeType = 'image/svg+xml';
      else if (ext === '.webp') mimeType = 'image/webp';
      else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';

      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch {
      // not on disk
    }

    return new NextResponse('Icon Not Found', { status: 404 });
  } catch (error) {
    console.error('Error serving icon:', error);
    return new NextResponse('Error serving icon', { status: 500 });
  }
}
