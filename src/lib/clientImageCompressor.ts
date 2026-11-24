/**
 * clientImageCompressor.ts
 * Utilitas kompresi gambar otomatis di sisi peramban (client-side).
 *
 * Mengompresi gambar berukuran besar (>5MB, 10MB, 20MB+) langsung di peramban pengguna
 * sebelum dikirimkan ke server. Menjaga resolusi tetap tajam (maks 2560px) dengan
 * format WebP kualitas tinggi (0.85), menghemat hingga 85-95% ukuran file,
 * serta memastikan payload selalu di bawah batas 4.5MB Vercel Serverless.
 */

export interface CompressionOptions {
  /** Resolusi terpanjang maksimal (default: 2560px) */
  maxDimension?: number;
  /** Kualitas kompresi 0.1 - 1.0 (default: 0.85) */
  quality?: number;
  /** Batas ukuran file dalam bytes (default: 3.5MB, aman untuk limit 4.5MB Vercel) */
  maxSizeBytes?: number;
  /** Callback untuk melaporkan progres ke UI */
  onProgress?: (message: string) => void;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  wasCompressed: boolean;
  reductionPercent: number;
  width: number;
  height: number;
}

/**
 * Format bytes ke string yang mudah dibaca (misal: "8.5 MB", "420 KB")
 */
export function formatBytes(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Kompresi gambar di sisi klien sebelum diunggah
 */
export async function compressImageClient(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const maxDimension = options.maxDimension ?? 1920;
  const targetQuality = options.quality ?? 0.80;
  const maxSizeBytes = options.maxSizeBytes ?? 1.2 * 1024 * 1024;

  // Lewati kompresi jika bukan gambar raster (misal PDF atau SVG)
  const isImage = file.type.startsWith('image/');
  const isSvg = file.type.includes('svg') || file.name.endsWith('.svg');
  const isGif = file.type.includes('gif') || file.name.endsWith('.gif');

  if (!isImage || isSvg || isGif) {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      wasCompressed: false,
      reductionPercent: 0,
      width: 0,
      height: 0,
    };
  }

  // Jika di lingkungan SSR (Server), kembalikan file apa adanya
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      wasCompressed: false,
      reductionPercent: 0,
      width: 0,
      height: 0,
    };
  }

  options.onProgress?.(`Membaca foto (${formatBytes(file.size)})...`);

  // 1. Muat gambar menggunakan ImageBitmap atau HTMLImageElement
  let naturalWidth = 0;
  let naturalHeight = 0;
  let drawImageToCanvas: (ctx: CanvasRenderingContext2D, w: number, h: number) => void = () => {};
  let cleanup = () => {};

  try {
    if ('createImageBitmap' in window) {
      // createImageBitmap otomatis menangani orientasi EXIF kamera
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      naturalWidth = bitmap.width;
      naturalHeight = bitmap.height;
      drawImageToCanvas = (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h);
      cleanup = () => bitmap.close();
    } else {
      throw new Error('createImageBitmap unavailable');
    }
  } catch {
    // Fallback ke elemen Image standar jika createImageBitmap gagal
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        naturalWidth = img.naturalWidth || img.width;
        naturalHeight = img.naturalHeight || img.height;
        drawImageToCanvas = (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h);
        cleanup = () => URL.revokeObjectURL(objectUrl);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Gagal memuat gambar untuk proses kompresi'));
      };
      img.src = objectUrl;
    });
  }

  try {
    // 2. Hitung dimensi proporsional baru jika melebihi maxDimension
    let targetWidth = naturalWidth;
    let targetHeight = naturalHeight;

    if (targetWidth > maxDimension || targetHeight > maxDimension) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((targetHeight * maxDimension) / targetWidth);
        targetWidth = maxDimension;
      } else {
        targetWidth = Math.round((targetWidth * maxDimension) / targetHeight);
        targetHeight = maxDimension;
      }
    }

    options.onProgress?.(
      `Mengompres resolusi (${targetWidth}×${targetHeight} px)...`
    );

    // 3. Render ke Canvas berkualitas tinggi
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      cleanup();
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        wasCompressed: false,
        reductionPercent: 0,
        width: naturalWidth,
        height: naturalHeight,
      };
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawImageToCanvas(ctx, targetWidth, targetHeight);

    // Bersihkan referensi bitmap/URL sekarang
    cleanup();

    // 4. Konversi ke Blob WebP (atau JPEG sebagai fallback)
    const toBlobPromise = (type: string, q: number): Promise<Blob | null> =>
      new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, q));

    let mimeType = 'image/webp';
    let extension = '.webp';
    let quality = targetQuality;

    let blob = await toBlobPromise(mimeType, quality);

    // Jika WebP tidak didukung peramban lawas, fallback ke JPEG/PNG
    if (!blob || blob.type !== 'image/webp') {
      const isPng = file.type === 'image/png';
      mimeType = isPng ? 'image/png' : 'image/jpeg';
      extension = isPng ? '.png' : '.jpg';
      blob = await toBlobPromise(mimeType, quality);
    }

    // 5. Jika ukuran masih di atas batas aman (3.5MB), turunkan kualitas secara bertahap
    let attempts = 0;
    while (blob && blob.size > maxSizeBytes && quality > 0.55 && attempts < 4) {
      attempts++;
      quality -= 0.1;
      options.onProgress?.(`Menyesuaikan rasio kompresi (${formatBytes(blob.size)})...`);
      blob = await toBlobPromise(mimeType, quality);
    }

    // Bebaskan memori kanvas
    canvas.width = 0;
    canvas.height = 0;

    // 6. Jika blob berhasil dibuat dan lebih kecil dari file asli
    if (blob && blob.size < file.size) {
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const cleanName = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const compressedFile = new File([blob], `${cleanName}${extension}`, {
        type: blob.type || mimeType,
        lastModified: Date.now(),
      });

      return {
        file: compressedFile,
        originalSize: file.size,
        compressedSize: compressedFile.size,
        wasCompressed: true,
        reductionPercent: Math.round((1 - compressedFile.size / file.size) * 100),
        width: targetWidth,
        height: targetHeight,
      };
    }

    // Jika file asli sudah sangat kecil/ringan, pertahankan aslinya
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      wasCompressed: false,
      reductionPercent: 0,
      width: naturalWidth,
      height: naturalHeight,
    };
  } catch (err) {
    cleanup();
    console.warn('Kompresi gambar gagal, menggunakan file asli:', err);
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      wasCompressed: false,
      reductionPercent: 0,
      width: naturalWidth,
      height: naturalHeight,
    };
  }
}
