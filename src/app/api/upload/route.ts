import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'Tidak ada file yang diunggah' },
        { status: 400 }
      );
    }

    // Validate mime type (Images & PDF for certificates)
    const validTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/svg+xml',
      'image/webp',
      'image/gif',
      'application/pdf',
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(png|jpe?g|svg|webp|gif|pdf)$/i)) {
      return NextResponse.json(
        { error: 'Hanya file gambar (PNG, JPG, SVG, WebP, GIF) atau dokumen (PDF) yang diperbolehkan' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize file name
    const originalName = file.name || 'image.png';
    const ext = path.extname(originalName).toLowerCase() || '.png';
    const baseName = path
      .basename(originalName, ext)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-');
    
    const uniqueFileName = `${Date.now()}-${baseName}${ext}`;

    const targetDir = path.join(process.cwd(), 'public', folder === 'icons' ? 'icons' : 'uploads');
    await mkdir(targetDir, { recursive: true });

    const filePath = path.join(targetDir, uniqueFileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/${folder === 'icons' ? 'icons' : 'uploads'}/${uniqueFileName}`;

    let thumbnailUrl: string | undefined = undefined;
    if (ext === '.pdf') {
      try {
        const { createCanvas } = await import('@napi-rs/canvas');
        const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
        const cMapUrl = path.join(process.cwd(), 'node_modules/pdfjs-dist/cmaps/').replace(/\\/g, '/') + '/';
        const standardFontDataUrl = path.join(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts/').replace(/\\/g, '/') + '/';

        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(buffer),
          cMapUrl,
          cMapPacked: true,
          standardFontDataUrl,
        });
        const pdfDoc = await loadingTask.promise;
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = createCanvas(viewport.width, viewport.height);
        const context = canvas.getContext('2d');

        await (page.render as any)({
          canvasContext: context,
          canvas: canvas,
          viewport: viewport,
        }).promise;

        const pngBuf = canvas.toBuffer('image/png');
        const thumbFileName = `${Date.now()}-${baseName}-thumb.png`;
        const thumbFilePath = path.join(targetDir, thumbFileName);
        await writeFile(thumbFilePath, pngBuf);
        thumbnailUrl = `/${folder === 'icons' ? 'icons' : 'uploads'}/${thumbFileName}`;
      } catch (pdfErr) {
        console.warn('PDF automatic thumbnail generation error:', pdfErr);
      }
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      thumbnailUrl,
      filename: uniqueFileName,
      size: buffer.length,
    });
  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json(
      { error: 'Gagal mengunggah file: ' + String(error) },
      { status: 500 }
    );
  }
}
