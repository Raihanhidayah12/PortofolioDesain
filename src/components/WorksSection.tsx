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

  const designWorks = works.filter((item) => item.category !== 'photography');
  const filteredDesignWorks =
    designFilter === 'all'
      ? designWorks
      : designWorks.filter((item) => item.category === designFilter);

  const sortedDesignWorks = [...filteredDesignWorks].sort(sortByYearDesc);

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
              onClick={() => setDesignFilter(tab.id)}
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 relative z-10">
          {sortedDesignWorks.map((work) => (
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

export const PhotographyGallerySection: React.FC<WorksSectionProps> = ({
  onOpenLightbox,
  onCopyHex,
  works = [],
}) => {
  const photoWorks = works.filter((item) => item.category === 'photography');
  const sortedPhotoWorks = [...photoWorks].sort(sortByYearDesc);

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

      {/* Photography Works Showcase - Editorial Masonry Grid (Matching Gambar Kedua 100%) */}
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
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 sm:gap-6 relative z-10 w-full [column-fill:_balance]">
          {sortedPhotoWorks.map((work) => {
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
                className="break-inside-avoid mb-5 sm:mb-6 group relative rounded-[20px] sm:rounded-[26px] overflow-hidden border-2 border-[#C6A355]/60 hover:border-[#E2C275] bg-[#020F2B] cursor-pointer transition-all duration-500 hover:-translate-y-2 shadow-[0_12px_36px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_50px_rgba(226,194,117,0.3)] block w-full"
              >
                {/* 1. NATURAL FULL PHOTO - ZERO CROPPING */}
                <div className="relative w-full overflow-hidden bg-[#010D2E]">
                  {work.art &&
                  (work.art.startsWith('/') ||
                    work.art.startsWith('http') ||
                    work.art.match(/\.(png|jpe?g|webp|gif)/i)) ? (
                    <img
                      src={work.art}
                      alt={work.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto block transition-transform duration-700 ease-out group-hover:scale-104"
                    />
                  ) : (
                    <div className="w-full aspect-[4/3] transition-transform duration-700 ease-out group-hover:scale-104">
                      <ArtPreview type={work.art} title={work.title} />
                    </div>
                  )}

                  {/* Subtle top vignette */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* 2. TOP FLOATING BADGES */}
                  <div className="absolute top-0 left-0 right-0 p-3 sm:p-3.5 flex items-start justify-between gap-2 pointer-events-none z-10">
                    {work.committee ? (
                      <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#E2C275]/60 text-[9px] sm:text-[10px] font-mono-code text-[#F6DFB0] flex items-center gap-1.5 shadow-md max-w-[80%]">
                        <span className="shrink-0">📍</span>
                        <span className="font-semibold leading-tight line-clamp-1">
                          {work.committee}
                        </span>
                      </span>
                    ) : work.year ? (
                      <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#E2C275]/60 text-[9px] sm:text-[10px] font-mono-code text-[#F6DFB0] shadow-md font-bold">
                        ✦ {work.year}
                      </span>
                    ) : (
                      <div />
                    )}

                    <span className="p-1.5 sm:p-2 rounded-full bg-black/75 backdrop-blur-md border border-[#E2C275]/60 text-[#E2C275] group-hover:bg-[#6B0F1A] group-hover:border-[#E2C275] transition-all duration-300 shadow-lg group-hover:scale-110 flex items-center justify-center shrink-0">
                      <IconMaximize2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                  </div>

                  {/* 3. BOTTOM CINEMATIC OVERLAY - NON-INTRUSIVE & CLEAN */}
                  <div className="absolute bottom-0 left-0 right-0 p-3.5 sm:p-4.5 pt-14 sm:pt-16 bg-gradient-to-t from-black/95 via-black/55 to-transparent z-10">
                    {/* Micro-badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                      {work.year && (
                        <span className="px-1.5 py-0.5 rounded bg-[#6B0F1A]/95 border border-[#E2C275]/70 text-[8px] sm:text-[9px] font-mono-code text-[#F6DFB0] font-bold shadow-sm">
                          ✦ {work.year}
                        </span>
                      )}
                      {gear && (
                        <span className="text-[8px] sm:text-[9px] font-mono-code text-blue-200/90 flex items-center gap-1 leading-none">
                          <span>📷</span>
                          <span className="line-clamp-1">{gear}</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-bold text-sm sm:text-base text-white group-hover:text-[#E2C275] transition-colors leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] line-clamp-2">
                      {work.title}
                    </h3>

                    {/* Interactive CTA */}
                    <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-mono-code text-[#E2C275] opacity-80 group-hover:opacity-100 transition-all duration-300 mt-1.5">
                      <span className="font-semibold">Lihat Foto Resolusi Penuh</span>
                      <span className="group-hover:translate-x-1 transition-transform">↗</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
