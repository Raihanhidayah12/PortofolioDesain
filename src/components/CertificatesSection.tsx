import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { IconAward, IconMaximize2, IconSparkles, IconLayers, IconArrowUpRight } from './icons';
import { CertificateItem, LightboxItem } from '@/types';
import { usePortfolioSync } from '@/lib/usePortfolioSync';

interface CertificatesSectionProps {
  onOpenLightbox: (item: LightboxItem) => void;
}

export const CertificatesSection: React.FC<CertificatesSectionProps> = ({
  onOpenLightbox,
}) => {
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [loading, setLoading] = useState(true);
  const INITIAL_CERTIFICATES_LIMIT = 6;

  const fetchCertificates = useCallback(() => {
    fetch('/api/certificates', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.certificates)) {
          setCertificates(data.certificates);
        }
      })
      .catch((err) => {
        console.warn('Neon DB certificates sync notice:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Sync with live Neon Postgres database on mount
  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  // Real-time live sync across tabs & devices without page reload
  usePortfolioSync(fetchCertificates);

  // Filter & Year-based sorting (Newest year to oldest)
  const categories = ['all', 'Kepanitiaan', 'Organisasi', 'Volunteer'];
  const filteredCertificates =
    selectedCategory === 'all'
      ? certificates
      : certificates.filter(
          (c) => (c.category || '').toLowerCase() === selectedCategory.toLowerCase()
        );

  const getCertYear = (c: CertificateItem): number => {
    if (c.year) {
      const match = c.year.match(/\b(20\d\d)\b/);
      if (match) return parseInt(match[1]);
      const parsed = parseInt(c.year);
      if (!isNaN(parsed) && parsed > 1900) return parsed;
    }
    return 0;
  };

  const sortedCertificates = [...filteredCertificates].sort((a, b) => {
    const yA = getCertYear(a);
    const yB = getCertYear(b);
    if (yB !== yA) return yB - yA;
    return (a.orderNum || 0) - (b.orderNum || 0);
  });

  const displayedCertificates = showAllCertificates
    ? sortedCertificates
    : sortedCertificates.slice(0, INITIAL_CERTIFICATES_LIMIT);
  const remainingCertificatesCount = sortedCertificates.length - displayedCertificates.length;

  return (
    <section
      id="certificates"
      className="relative py-14 sm:py-20 md:py-28 px-3 sm:px-6 md:px-8 max-w-6xl mx-auto"
    >
      {/* SECTION AMBIENT LIGHTS */}
      <div className="absolute top-1/4 -left-10 w-96 h-96 rounded-full bg-[#E2C275]/12 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 rounded-full bg-[#6B0F1A]/20 blur-[130px] pointer-events-none" />

      {/* HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 sm:gap-6 mb-8 sm:mb-12 relative z-10">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[10px] sm:text-[11px] font-mono-code text-[#F6DFB0] mb-2.5 sm:mb-3 shadow-md">
            <IconAward className="w-3.5 h-3.5 text-[#E2C275]" />
            <span>✦ OFFICIAL RECOGNITION VAULT ✦</span>
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-5xl md:text-6xl text-white leading-[0.95] tracking-tight drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]">
            Sertifikat <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E2C275] via-[#F6DFB0] to-[#E2C275]">Kepanitiaan</span>
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/85 mt-2.5 max-w-xl leading-relaxed">
            Arsip kredensial resmi, legitimasi peran, dan pengakuan kontribusi aktif di berbagai bidang kepanitiaan acara, kepengurusan organisasi, serta kegiatan volunteer.
          </p>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setShowAllCertificates(false);
              }}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-[11px] sm:text-xs font-bold border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#6B0F1A] text-[#F6DFB0] border-[#E2C275] shadow-lg scale-105'
                  : 'bg-gradient-to-r from-[#062464]/80 to-[#021238]/90 text-blue-100 border-[#C6A355]/50 hover:border-[#E2C275]'
              }`}
            >
              {cat === 'all' ? 'Semua Sertifikat' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT GRID */}
      {sortedCertificates.length === 0 ? (
        <div className="relative z-10 py-16 px-6 text-center rounded-[28px] bg-gradient-to-b from-[#052368]/80 via-[#03174C]/90 to-[#020E2F]/95 border-2 border-[#C6A355]/60 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[#6B0F1A]/80 border-2 border-[#E2C275] flex items-center justify-center text-[#E2C275] mb-4 shadow-lg shadow-[#E2C275]/20 animate-pulse">
            <IconAward className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-mono-code text-[#E2C275] tracking-widest uppercase mb-1.5">
            ✦ DOKUMENTASI RESMI ✦
          </span>
          <h3 className="text-lg sm:text-xl font-display font-bold text-white mb-2">
            Arsip Sertifikat Sedang Diperbarui
          </h3>
          <p className="text-xs sm:text-sm text-blue-200/80 max-w-md leading-relaxed">
            Dokumentasi dan kredensial resmi pengalaman kepanitiaan, kepengurusan, serta pencapaian sedang dalam proses digitalisasi dan akan segera ditampilkan.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 relative z-10">
            {displayedCertificates.map((cert) => {
              const isImage = Boolean(
                cert.imageUrl &&
                cert.imageUrl.trim().length > 0 &&
                !cert.imageUrl.toLowerCase().includes('.pdf')
              );
              const isPdf = Boolean(
                (cert.credentialUrl && cert.credentialUrl.toLowerCase().includes('.pdf')) ||
                (cert.imageUrl && cert.imageUrl.toLowerCase().includes('.pdf'))
              );
              const pdfUrl = (cert.credentialUrl && cert.credentialUrl.toLowerCase().includes('.pdf'))
                ? cert.credentialUrl
                : (cert.imageUrl && cert.imageUrl.toLowerCase().includes('.pdf') ? cert.imageUrl : null);

              const handleCardClick = () => {
                onOpenLightbox({
                  title: cert.title,
                  subtitle: `${cert.role} • ${cert.event}`,
                  meta: `${cert.year || 'Tahun'} • Penerbit: ${cert.issuer || 'Panitia Pelaksana'}`,
                  desc: cert.desc || `Sertifikat resmi atas kontribusi dan dedikasi sebagai ${cert.role} pada ${cert.event}.`,
                  imageUrl: isImage ? cert.imageUrl : undefined,
                  credentialUrl: cert.credentialUrl || (isPdf ? (pdfUrl || undefined) : undefined),
                  art: isImage ? cert.imageUrl : (isPdf ? (pdfUrl || 'minimal-card') : 'minimal-card'),
                });
              };

              return (
                <div
                  key={cert.id}
                  onClick={handleCardClick}
                  className="group relative w-full aspect-[16/10] rounded-[18px] sm:rounded-[24px] overflow-hidden border-2 border-[#C6A355]/60 hover:border-[#E2C275] bg-[#020F2B] cursor-pointer transition-all duration-500 hover:-translate-y-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.65)] hover:shadow-[0_20px_50px_rgba(226,194,117,0.3)] flex flex-col justify-between"
                >
                  {/* 1. FULL BLEED CERTIFICATE BACKGROUND */}
                  <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#021238]">
                    {isImage ? (
                      <Image
                        src={cert.imageUrl}
                        alt={cert.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        quality={80}
                        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-106"
                      />
                    ) : isPdf ? (
                      <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#062464] via-[#041A4D] to-[#020F2B] relative select-none">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8A1422] to-[#6B0F1A] border border-[#E2C275] flex flex-col items-center justify-center text-[#E2C275] mb-1.5 shadow-lg group-hover:scale-110 transition-transform">
                          <svg className="w-6 h-6 text-[#F6DFB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-[7px] font-mono-code font-bold tracking-wider text-[#E2C275] -mt-0.5">PDF</span>
                        </div>
                        <span className="text-[9px] font-mono-code text-[#E2C275] uppercase tracking-wider font-semibold">
                          ✦ DOKUMEN RESMI PDF ✦
                        </span>
                        <h4 className="font-display font-bold text-xs text-white line-clamp-1 mt-0.5 px-2">
                          {cert.event}
                        </h4>
                      </div>
                    ) : (
                      <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#062464] via-[#041A4D] to-[#020F2B] relative select-none">
                        <div className="w-12 h-12 rounded-full bg-[#6B0F1A] border border-[#E2C275] flex items-center justify-center text-[#E2C275] mb-1.5 shadow-lg group-hover:scale-110 transition-transform">
                          <IconAward className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-mono-code text-[#E2C275] uppercase tracking-wider">
                          ✦ SERTIFIKAT RESMI ✦
                        </span>
                        <h4 className="font-display font-bold text-xs text-white line-clamp-1 mt-0.5 px-2">
                          {cert.event}
                        </h4>
                      </div>
                    )}
                    {/* Subtle top & edge vignette */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent pointer-events-none" />
                  </div>

                  {/* 2. TOP FLOATING BADGES */}
                  <div className="relative z-10 p-2 sm:p-2.5 flex items-center justify-between gap-1.5 pointer-events-none w-full min-w-0">
                    {cert.category ? (
                      <span
                        title={cert.category}
                        className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#E2C275]/60 text-[8.5px] sm:text-[9.5px] font-mono-code text-[#F6DFB0] flex items-center gap-1 shadow-md min-w-0 max-w-[calc(100%-34px)]"
                      >
                        <span className="shrink-0 text-[10px]">🎖️</span>
                        <span className="truncate font-semibold block min-w-0">
                          {cert.category}
                        </span>
                      </span>
                    ) : cert.issuer ? (
                      <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-black/75 backdrop-blur-md border border-[#E2C275]/60 text-[8.5px] sm:text-[9.5px] font-mono-code text-[#F6DFB0] shadow-md font-bold shrink-0 truncate max-w-[calc(100%-34px)]">
                        📍 {cert.issuer}
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
                    {/* Year & Role Micro-Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-1 min-w-0">
                      {cert.year && (
                        <span className="px-1.5 py-0.5 rounded bg-[#6B0F1A]/95 border border-[#E2C275]/70 text-[8px] sm:text-[9px] font-mono-code text-[#F6DFB0] font-bold shadow-sm shrink-0">
                          ✦ {cert.year}
                        </span>
                      )}
                      {cert.role && (
                        <span className="text-[8px] sm:text-[9px] font-mono-code text-blue-200/90 flex items-center gap-1 truncate max-w-full min-w-0">
                          <span className="shrink-0">🏷️</span>
                          <span className="truncate">{cert.role}</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="font-display font-bold text-xs sm:text-sm md:text-base text-white group-hover:text-[#E2C275] transition-colors leading-snug drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] truncate min-w-0">
                      {cert.title}
                    </h3>

                    {/* Event Subtitle */}
                    {cert.event && (
                      <p className="text-[9px] sm:text-[10px] text-blue-200/75 truncate mt-0.5">
                        Acara: {cert.event}
                      </p>
                    )}

                    {/* Interactive CTA & Verifikasi link */}
                    <div className="flex items-center justify-between gap-1 text-[8px] sm:text-[9px] font-mono-code text-[#E2C275] mt-1.5">
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-all duration-300">
                        <span className="font-semibold">Lihat Sertifikat Resolusi Penuh</span>
                        <span className="group-hover:translate-x-1 transition-transform">↗</span>
                      </div>

                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="px-2 py-0.5 rounded-full bg-[#6B0F1A]/90 hover:bg-[#8A1422] border border-[#E2C275]/80 text-[8px] sm:text-[9px] font-mono-code text-[#F6DFB0] flex items-center gap-1 transition-colors shrink-0"
                          title="Buka Dokumen PDF / Kredensial Asli"
                        >
                          <span>Verifikasi</span>
                          <IconArrowUpRight className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expand/Collapse Button for Certificates Vault */}
          {sortedCertificates.length > INITIAL_CERTIFICATES_LIMIT && (
            <div className="mt-8 sm:mt-12 text-center relative z-10">
              <button
                onClick={() => {
                  if (showAllCertificates) {
                    setShowAllCertificates(false);
                    const el = document.getElementById('certificates');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  } else {
                    setShowAllCertificates(true);
                  }
                }}
                className="group relative inline-flex items-center gap-3 px-7 sm:px-9 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#6B0F1A] via-[#851322] to-[#6B0F1A] border-2 border-[#E2C275] text-[#F6DFB0] font-mono-code text-xs sm:text-sm font-bold shadow-[0_8px_30px_rgba(107,15,26,0.6)] hover:shadow-[0_12px_45px_rgba(226,194,117,0.35)] transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <span className="text-[#E2C275] text-xs">✦</span>
                <span>
                  {showAllCertificates
                    ? 'Tampilkan Lebih Sedikit'
                    : `Lihat Sertifikat Lainnya (+${remainingCertificatesCount} Sertifikat)`}
                </span>
                <span
                  className={`text-[#E2C275] transition-transform duration-300 ${
                    showAllCertificates ? 'rotate-180' : 'group-hover:translate-y-0.5'
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

export default CertificatesSection;
