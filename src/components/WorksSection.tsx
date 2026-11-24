import React, { useState, useEffect, useCallback } from 'react';
import { IconMaximize2, IconCamera, IconLayers } from './icons';
import { ArtPreview } from './ArtPreview';
import { GalleryWork, LightboxItem } from '@/types';
import { ScrollReveal } from './ScrollReveal';
import { usePortfolioSync } from '@/lib/usePortfolioSync';

interface WorksSectionProps {
  onOpenLightbox: (item: LightboxItem) => void;
  onCopyHex: (hex: string) => void;
  works?: GalleryWork[];
}

const getWorkYear = (w: GalleryWork): number => {
  if (w.year) {
    const match = w.year.match(/\b(20\d\d)\b/);
    if (match) return parseInt(match[1]);
    const parsed = parseInt(w.year);
    if (!isNaN(parsed) && parsed > 1900) return parsed;
  }
  // Fallback: extract 4-digit year from title, committee, or desc
  const match = `${w.title || ''} ${w.committee || ''} ${w.desc || ''}`.match(/\b(20\d\d)\b/);
  if (match) return parseInt(match[1]);
  return 0;
};

const sortByYearDesc = (a: GalleryWork, b: GalleryWork) => {
  const yA = getWorkYear(a);
  const yB = getWorkYear(b);
  if (yB !== yA) return yB - yA;
  return 0;
};

export const DesignGallerySection: React.FC<WorksSectionProps> = ({
  onOpenLightbox,
  onCopyHex,
  works = [],
}) => {
  const [designFilter, setDesignFilter] = useState('all');
  const [showAllDesigns, setShowAllDesigns] = useState(false);
  const INITIAL_DESIGN_LIMIT = 6;

  const designWorks = works.filter((item) => item.category !== 'photography');
  const filteredDesignWorks =
    designFilter === 'all'
      ? designWorks
      : designWorks.filter((item) => item.category === designFilter);

  const sortedDesignWorks = [...filteredDesignWorks].sort(sortByYearDesc);
  const displayedDesignWorks = showAllDesigns
    ? sortedDesignWorks
    : sortedDesignWorks.slice(0, INITIAL_DESIGN_LIMIT);

  return (
    <section
      id="design-gallery"
      className="relative py-14 sm:py-20 md:py-28 px-3 sm:px-6 md:px-8 max-w-6xl mx-auto"
    >
      {/* Ambient Lighting */}
      <div className="absolute top-10 right-10 w-96 h-96 rounded-full bg-[#6B0F1A]/20 blur-[130px] pointer-events-none" />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6 mb-8 sm:mb-12 relative z-10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[10px] sm:text-[11px] font-mono-code text-[#F6DFB0] mb-2.5 sm:mb-3 shadow-md">
            <IconLayers className="w-3.5 h-3.5 text-[#E2C275]" />
            <span>✦ VISUAL DESIGN VAULT ✦</span>
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-5xl md:text-6xl text-white leading-[0.95] tracking-tight drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]">
            Galeri <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E2C275] via-[#F6DFB0] to-[#E2C275]">Desain Grafis</span>
          </h2>
        </div>

        {/* Design Filter Pills */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {[
            { id: 'all', label: 'Semua Desain' },
            { id: 'poster', label: 'Poster Event' },
            { id: 'feed', label: 'Social Media Feed (4:5)' },
            { id: 'identity', label: 'Identity & Print' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setDesignFilter(tab.id);
                setShowAllDesigns(false);
              }}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold border transition-all cursor-pointer ${
                designFilter === tab.id
                  ? 'bg-[#6B0F1A] text-[#F6DFB0] border-[#E2C275] shadow-lg scale-105'
                  : 'bg-gradient-to-r from-[#062464]/80 to-[#021238]/90 text-blue-100 border-[#C6A355]/50 hover:border-[#E2C275]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Design Works Bento Grid */}
      {sortedDesignWorks.length === 0 ? (
        <div className="relative z-10 py-14 px-4 text-center rounded-[24px] bg-[#021238]/70 border border-[#C6A355]/40 flex flex-col items-center justify-center">
          <p className="text-base font-display font-bold text-[#F6DFB0] mb-1.5">
            Belum Ada Karya Desain Ditampilkan
          </p>
          <span className="text-xs text-blue-200/70">
            Koleksi visual dan aset publikasi sedang dalam proses kurasi.
          </span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 relative z-10">
            {displayedDesignWorks.map((work) => (
              <div
                key={work.id}
                onClick={() =>
                  onOpenLightbox({
                    title: work.title,
                    subtitle: `${work.categoryLabel} • ${work.committee}`,
                    meta: `${work.dim} • ${work.tools.join(', ')}`,
                    desc: work.desc,
                    art: work.art,
                    imageUrl: work.art,
                    colors: work.colors
                  })
                }
                className={`${work.spanClass} group rounded-[24px] sm:rounded-[32px] bg-gradient-to-br from-[#062464]/95 via-[#03184A]/95 to-[#010E2E]/98 border-2 border-[#C6A355]/75 hover:border-[#E2C275] overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-2 shadow-[0_16px_45px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(226,194,117,0.22)]`}
              >
                <div>
                  <div
                    className={`${work.aspectClass} max-h-[340px] sm:max-h-[380px] w-full relative overflow-hidden border-b border-[#C6A355]/40`}
                  >
                    <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
                      <ArtPreview type={work.art} title={work.title} meta={work.dim} />
                    </div>
                    <span className="absolute top-3 left-3 sm:top-3.5 sm:left-3.5 px-2.5 sm:px-3 py-1 rounded-full bg-[#021238]/90 backdrop-blur-sm border border-[#C6A355] text-[9px] sm:text-[10px] font-mono-code text-[#F6DFB0]">
                      {work.committee}
                    </span>
                    <span className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 p-1.5 sm:p-2 rounded-full bg-[#021238]/90 border border-[#C6A355] text-[#E2C275] opacity-0 group-hover:opacity-100 transition-opacity">
                      <IconMaximize2 className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div className="p-4 sm:p-6">
                    <span className="text-[10px] sm:text-[11px] font-mono-code text-[#E2C275] flex items-center gap-1.5">
                      <span>✦ {work.categoryLabel}</span>
                      <span>&bull;</span>
                      <span>{work.dim}</span>
                    </span>
                    <h3 className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-[#E2C275] transition-colors mt-1 line-clamp-1">
                      {work.title}
                    </h3>
                    {work.desc && (
                      <p className="text-xs sm:text-sm text-blue-100/85 mt-1.5 sm:mt-2 leading-relaxed line-clamp-2">
                        {work.desc}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-4 sm:px-6 py-3 bg-[#020F2B]/90 border-t border-[#C6A355]/30 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[10px] font-mono-code text-blue-200/80 truncate max-w-[200px] sm:max-w-none">
                    {work.tools.join(' • ')}
                  </span>
                  <div
                    className="flex items-center gap-1.5 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {work.colors.map((hex) => (
                      <button
                        key={hex}
                        onClick={() => onCopyHex(hex)}
                        title={`Salin kode warna ${hex}`}
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-white/50 cursor-pointer hover:scale-125 transition-transform"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Expand/Collapse Button for Graphic Design Works */}
          {sortedDesignWorks.length > INITIAL_DESIGN_LIMIT && (
            <div className="mt-8 sm:mt-12 text-center relative z-10">
              <button
                onClick={() => {
                  if (showAllDesigns) {
                    setShowAllDesigns(false);
                    const el = document.getElementById('design-gallery');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    setShowAllDesigns(true);
                  }
                }}
                className="group relative inline-flex items-center gap-3 px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#6B0F1A] via-[#851322] to-[#6B0F1A] border-2 border-[#E2C275] text-[#F6DFB0] font-mono-code text-xs sm:text-sm font-bold shadow-[0_8px_30px_rgba(107,15,26,0.6)] hover:shadow-[0_12px_45px_rgba(226,194,117,0.35)] transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <span className="text-[#E2C275] text-xs">✦</span>
                <span>
                  {showAllDesigns
                    ? 'Tampilkan Lebih Sedikit'
                    : `Lihat Desain Lainnya (+${sortedDesignWorks.length - INITIAL_DESIGN_LIMIT} Karya)`}
                </span>
                <span
                  className={`text-[#E2C275] transition-transform duration-300 ${
                    showAllDesigns ? 'rotate-180' : 'group-hover:translate-y-0.5'
                  }`}
                >
                  ▼
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

// Safelist mappings to ensure Tailwind compiles all dynamic aspect ratio and grid span variations
const ASPECT_CLASSES: Record<string, string> = {
  'aspect-[3/2]': 'aspect-[3/2]',
  'aspect-[4/3]': 'aspect-[4/3]',
  'aspect-[16/9]': 'aspect-[16/9]',
  'aspect-[16/10]': 'aspect-[16/10]',
  'aspect-[4/5]': 'aspect-[4/5]',
  'aspect-[2/3]': 'aspect-[2/3]',
  'aspect-[3/4]': 'aspect-[3/4]',
  'aspect-[9/16]': 'aspect-[9/16]',
  'aspect-square': 'aspect-square',
};

const SPAN_CLASSES: Record<string, string> = {
  'md:col-span-6 lg:col-span-4': 'md:col-span-6 lg:col-span-4',
  'md:col-span-6': 'md:col-span-6',
  'md:col-span-6 lg:col-span-3': 'md:col-span-6 lg:col-span-3',
  'md:col-span-8 lg:col-span-8': 'md:col-span-8 lg:col-span-8',
  'md:col-span-12': 'md:col-span-12',
};

// Numeric aspect ratio resolver for true Justified Mosaic Layout (Matching Gambar Kedua)
const getAspectRatioNumber = (aspectClass?: string): number => {
  if (!aspectClass) return 1.5;
  if (aspectClass === 'aspect-square' || aspectClass === 'aspect-[1/1]') return 1.0;
  if (aspectClass === 'aspect-video' || aspectClass === 'aspect-[16/9]') return 16 / 9; // ~1.78
  if (aspectClass === 'aspect-[16/10]') return 1.6;
  if (aspectClass === 'aspect-[3/2]') return 1.5;
  if (aspectClass === 'aspect-[4/3]') return 4 / 3; // ~1.333
  if (aspectClass === 'aspect-[4/5]') return 0.8;
  if (aspectClass === 'aspect-[3/4]') return 0.75;
  if (aspectClass === 'aspect-[2/3]') return 2 / 3; // ~0.667
  if (aspectClass === 'aspect-[9/16]') return 9 / 16; // ~0.5625
  const match = aspectClass.match(/aspect-\[(\d+)\/(\d+)\]/);
  if (match) {
    const w = parseFloat(match[1]);
    const h = parseFloat(match[2]);
    if (h > 0) return w / h;
  }
  return 1.5;
};

// Partitions photos into flush, justified horizontal rows (just like Google Photos & Gambar Kedua)
const groupPhotosIntoJustifiedRows = (
  photos: GalleryWork[],
  targetSumRatio = 3.5
): GalleryWork[][] => {
  if (photos.length <= 3) {
    return [photos];
  }

  const rows: GalleryWork[][] = [];
  let currentRow: GalleryWork[] = [];
  let currentSum = 0;

  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    const r = getAspectRatioNumber(p.aspectClass);
    currentRow.push(p);
    currentSum += r;

    const remaining = photos.length - 1 - i;
    if (currentSum >= targetSumRatio && remaining >= 2) {
      rows.push(currentRow);
      currentRow = [];
      currentSum = 0;
    }
  }

  if (currentRow.length > 0) {
    if (currentRow.length === 1 && rows.length > 0 && rows[rows.length - 1].length >= 3) {
      const popped = rows[rows.length - 1].pop();
      if (popped) currentRow.unshift(popped);
    }
    rows.push(currentRow);
  }

  return rows;
};

export const PhotographyGallerySection: React.FC<WorksSectionProps> = ({
  onOpenLightbox,
  onCopyHex,
  works = [],
}) => {
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const INITIAL_ROW_LIMIT = 2;

  const photoWorks = works.filter((item) => item.category === 'photography');
  const sortedPhotoWorks = [...photoWorks].sort(sortByYearDesc);
  const photoRows = groupPhotosIntoJustifiedRows(sortedPhotoWorks);

  const displayedPhotoRows = showAllPhotos
    ? photoRows
    : photoRows.slice(0, INITIAL_ROW_LIMIT);

  const displayedPhotosCount = displayedPhotoRows.reduce(
    (acc, row) => acc + row.length,
    0
  );
  const remainingPhotosCount = sortedPhotoWorks.length - displayedPhotosCount;

  return (
    <section
      id="photography-gallery"
      className="relative py-14 sm:py-20 md:py-28 px-3 sm:px-6 md:px-8 max-w-6xl mx-auto"
    >
      {/* Ambient Lighting */}
      <div className="absolute top-10 left-10 w-96 h-96 rounded-full bg-[#0047CC]/20 blur-[140px] pointer-events-none" />

      {/* Header matching exact styling of Galeri Desain Grafis & Sertifikat */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6 mb-8 sm:mb-12 relative z-10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[10px] sm:text-[11px] font-mono-code text-[#F6DFB0] mb-2.5 sm:mb-3 shadow-md">
            <IconCamera className="w-3.5 h-3.5 text-[#E2C275]" />
            <span>✦ PHOTOGRAPHY VAULT ✦</span>
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-5xl md:text-6xl text-white leading-[0.95] tracking-tight drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]">
            Galeri <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E2C275] via-[#F6DFB0] to-[#E2C275]">Fotografi</span>
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-blue-100/85 max-w-md leading-relaxed">
          Koleksi tangkapan visual, potret momen berkesan, dan dokumentasi fotografi sepanjang perjalanan karya.
        </p>
      </div>

      {/* Photography Works Showcase - Justified Rows Mosaic (Matching Gambar Kedua) */}
      {sortedPhotoWorks.length === 0 ? (
        <div className="relative z-10 py-14 px-4 text-center rounded-[24px] bg-[#021238]/70 border border-[#C6A355]/40 flex flex-col items-center justify-center">
          <p className="text-base font-display font-bold text-[#F6DFB0] mb-1.5">
            Belum Ada Foto Ditampilkan
          </p>
          <span className="text-xs text-blue-200/70">
            Koleksi fotografi akan segera diunggah melalui halaman admin.
          </span>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3.5 sm:gap-4 md:gap-5 relative z-10 w-full">
            {displayedPhotoRows.map((row, rowIdx) => (
              <div
                key={`photo-row-${rowIdx}`}
                className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 md:gap-5 w-full items-stretch"
              >
                {row.map((work) => {
                  const ratio = getAspectRatioNumber(work.aspectClass);
                  const gear = (work.tools || []).filter(Boolean).join(' • ');

                  return (
                    <div
                      key={work.id}
                      onClick={() =>
                        onOpenLightbox({
                          title: work.title,
                          subtitle: `${work.committee || 'Fotografi'}${work.year ? ` • ${work.year}` : ''}`,
                          meta: gear || work.dim,
                          desc: work.desc,
                          art: work.art,
                          imageUrl: work.art,
                          colors: work.colors,
                        })
                      }
                      style={{
                        flex: `${ratio} 1 0%`,
                        aspectRatio: `${ratio}`,
                      }}
                      className="group relative w-full sm:w-auto rounded-[18px] sm:rounded-[24px] overflow-hidden border-2 border-[#C6A355]/60 hover:border-[#E2C275] bg-[#020F2B] cursor-pointer transition-all duration-500 hover:-translate-y-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_50px_rgba(226,194,117,0.3)] flex flex-col justify-between shrink-0 sm:shrink max-h-[520px]"
                    >
                      {/* 1. FULL BLEED PHOTO BACKGROUND */}
                      <div className="absolute inset-0 w-full h-full overflow-hidden">
                        {work.art &&
                        (work.art.startsWith('/') ||
                          work.art.startsWith('http') ||
                          work.art.match(/\.(png|jpe?g|webp|gif)/i)) ? (
                          <img
                            src={work.art}
                            alt={work.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
                          />
                        ) : (
                          <div className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-106">
                            <ArtPreview type={work.art} title={work.title} />
                          </div>
                        )}
                        {/* Subtle top & edge vignette */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent pointer-events-none" />
                      </div>

                      {/* 2. TOP FLOATING BADGES */}
                      <div className="relative z-10 p-2 sm:p-2.5 flex items-center justify-between gap-1.5 pointer-events-none w-full min-w-0">
                        {work.committee ? (
                          <span
                            title={work.committee}
                            className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#E2C275]/60 text-[8.5px] sm:text-[9.5px] font-mono-code text-[#F6DFB0] flex items-center gap-1 shadow-md min-w-0 max-w-[calc(100%-34px)]"
                          >
                            <span className="shrink-0 text-[10px]">📍</span>
                            <span className="truncate font-semibold block min-w-0">
                              {work.committee}
                            </span>
                          </span>
                        ) : work.year ? (
                          <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#E2C275]/60 text-[8.5px] sm:text-[9.5px] font-mono-code text-[#F6DFB0] shadow-md font-bold shrink-0">
                            ✦ {work.year}
                          </span>
                        ) : (
                          <div />
                        )}

                        <span className="p-1 sm:p-1.5 rounded-full bg-black/75 backdrop-blur-md border border-[#E2C275]/60 text-[#E2C275] group-hover:bg-[#6B0F1A] group-hover:border-[#E2C275] transition-all duration-300 shadow-lg group-hover:scale-110 flex items-center justify-center shrink-0">
                          <IconMaximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </span>
                      </div>

                      {/* 3. BOTTOM CINEMATIC GRADIENT OVERLAY */}
                      <div className="relative z-10 p-2.5 sm:p-3.5 pt-10 sm:pt-12 bg-gradient-to-t from-black/95 via-black/55 to-transparent w-full min-w-0">
                        {/* Year & Gear Micro-Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-1 min-w-0">
                          {work.year && (
                            <span className="px-1.5 py-0.5 rounded bg-[#6B0F1A]/95 border border-[#E2C275]/70 text-[8px] sm:text-[9px] font-mono-code text-[#F6DFB0] font-bold shadow-sm shrink-0">
                              ✦ {work.year}
                            </span>
                          )}
                          {gear && (
                            <span className="text-[8px] sm:text-[9px] font-mono-code text-blue-200/90 flex items-center gap-1 truncate max-w-full min-w-0">
                              <span className="shrink-0">📷</span>
                              <span className="truncate">{gear}</span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-display font-bold text-xs sm:text-sm md:text-base text-white group-hover:text-[#E2C275] transition-colors leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] truncate min-w-0">
                          {work.title}
                        </h3>

                        {/* Interactive CTA Reveal on Hover */}
                        <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-mono-code text-[#E2C275] opacity-80 group-hover:opacity-100 transition-all duration-300 mt-1">
                          <span className="font-semibold">Lihat Foto Resolusi Penuh</span>
                          <span className="group-hover:translate-x-1 transition-transform">↗</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Expand/Collapse Button for Photography Vault */}
          {photoRows.length > INITIAL_ROW_LIMIT && (
            <div className="mt-8 sm:mt-12 text-center relative z-10">
              <button
                onClick={() => {
                  if (showAllPhotos) {
                    setShowAllPhotos(false);
                    const el = document.getElementById('photography-gallery');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    setShowAllPhotos(true);
                  }
                }}
                className="group relative inline-flex items-center gap-3 px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#6B0F1A] via-[#851322] to-[#6B0F1A] border-2 border-[#E2C275] text-[#F6DFB0] font-mono-code text-xs sm:text-sm font-bold shadow-[0_8px_30px_rgba(107,15,26,0.6)] hover:shadow-[0_12px_45px_rgba(226,194,117,0.35)] transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <span className="text-[#E2C275] text-xs">✦</span>
                <span>
                  {showAllPhotos
                    ? 'Tampilkan Lebih Sedikit'
                    : `Lihat Foto Lainnya (+${remainingPhotosCount} Foto)`}
                </span>
                <span
                  className={`text-[#E2C275] transition-transform duration-300 ${
                    showAllPhotos ? 'rotate-180' : 'group-hover:translate-y-0.5'
                  }`}
                >
                  ▼
                </span>
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export const WorksSection: React.FC<WorksSectionProps> = ({
  onOpenLightbox,
  onCopyHex,
}) => {
  const [works, setWorks] = useState<GalleryWork[]>([]);

  const fetchWorks = useCallback(() => {
    fetch('/api/gallery', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.works)) {
          setWorks(data.works);
        }
      })
      .catch((err) => {
        console.warn('Neon DB gallery sync notice:', err);
      });
  }, []);

  // Sync with live Neon Postgres database on mount
  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  // Live real-time sync across tabs & devices without page reload
  usePortfolioSync(fetchWorks);

  return (
    <>
      <ScrollReveal threshold={0.05} distance={36}>
        <DesignGallerySection
          onOpenLightbox={onOpenLightbox}
          onCopyHex={onCopyHex}
          works={works}
        />
      </ScrollReveal>
      <ScrollReveal threshold={0.05} distance={36}>
        <PhotographyGallerySection
          onOpenLightbox={onOpenLightbox}
          onCopyHex={onCopyHex}
          works={works}
        />
      </ScrollReveal>
    </>
  );
};
