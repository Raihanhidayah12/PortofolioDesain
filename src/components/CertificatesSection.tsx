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
  const [loading, setLoading] = useState(true);

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
              onClick={() => setSelectedCategory(cat)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 relative z-10">
          {sortedCertificates.map((cert) => {
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
                className="group rounded-[26px] sm:rounded-[30px] bg-gradient-to-br from-[#062464]/95 via-[#03184A]/95 to-[#010E2E]/98 border-2 border-[#C6A355]/75 hover:border-[#E2C275] overflow-hidden flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-2 shadow-[0_16px_45px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(226,194,117,0.25)] relative"
              >
                {/* Top Inner Hairline Border */}
                <div className="absolute inset-[5px] rounded-[21px] sm:rounded-[25px] border border-[#E2C275]/25 pointer-events-none z-20" />

                <div>
                  {/* PREVIEW CONTAINER */}
                  <div className="aspect-[16/10] w-full relative overflow-hidden bg-[#020F2B] border-b border-[#C6A355]/40 flex items-center justify-center">
                    {isImage ? (
                      <div className="w-full h-full relative overflow-hidden">
                        <Image
                          src={cert.imageUrl}
                          alt={cert.title}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          quality={78}
                          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#021238]/90 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      </div>
                    ) : isPdf ? (
                      /* Stylized Art-Deco PDF Document Plaque */
                      <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#062464] via-[#041A4D] to-[#020F2B] relative select-none">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8A1422] to-[#6B0F1A] border-2 border-[#E2C275] flex flex-col items-center justify-center text-[#E2C275] mb-2 shadow-lg group-hover:scale-110 transition-transform">
                          <svg className="w-7 h-7 text-[#F6DFB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-[8px] font-mono-code font-bold tracking-wider text-[#E2C275] -mt-0.5">PDF</span>
                        </div>
                        <span className="text-[10px] font-mono-code text-[#E2C275] uppercase tracking-wider font-semibold">
                          ✦ DOKUMEN RESMI PDF ✦
                        </span>
                        <h4 className="font-display font-bold text-sm text-white line-clamp-1 mt-0.5 px-2">
                          {cert.event}
                        </h4>
                        <span className="text-[9px] text-blue-200/70 font-mono-code mt-0.5">
                          Klik untuk Baca Sertifikat
                        </span>
                      </div>
                    ) : (
                      /* Stylized Art-Deco Certificate Seal Plaque */
                      <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-gradient-to-br from-[#062464] via-[#041A4D] to-[#020F2B] relative select-none">
                        <div className="w-14 h-14 rounded-full bg-[#6B0F1A] border-2 border-[#E2C275] flex items-center justify-center text-[#E2C275] mb-2 shadow-lg group-hover:scale-110 transition-transform">
                          <IconAward className="w-7 h-7" />
                        </div>
                        <span className="text-[10px] font-mono-code text-[#E2C275] uppercase tracking-wider">
                          ✦ SERTIFIKAT RESMI ✦
                        </span>
                        <h4 className="font-display font-bold text-sm text-white line-clamp-1 mt-0.5 px-2">
                          {cert.event}
                        </h4>
                      </div>
                    )}

                    {/* Category Ribbon Badge */}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-[#6B0F1A]/95 border border-[#E2C275] text-[9px] sm:text-[10px] font-mono-code text-[#F6DFB0] shadow-md z-10 flex items-center gap-1">
                      <IconAward className="w-3 h-3 text-[#E2C275]" />
                      <span>{cert.category || 'Kepanitiaan'}</span>
                    </span>

                    {/* Zoom Icon Button */}
                    <span className="absolute top-3 right-3 p-1.5 sm:p-2 rounded-full bg-[#021238]/90 border border-[#C6A355] text-[#E2C275] opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                      <IconMaximize2 className="w-3.5 h-3.5" />
                    </span>

                    {/* Year Tag */}
                    {cert.year && (
                      <span className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-full bg-[#021238]/85 backdrop-blur-sm border border-[#C6A355]/60 text-[9px] font-mono-code text-[#F6DFB0] z-10">
                        {cert.year}
                      </span>
                    )}
                  </div>

                  {/* DETAILS BODY */}
                  <div className="p-4 sm:p-5">
                    {/* Role Tag */}
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-[#041A4D] border border-[#E2C275]/70 text-[10px] font-mono-code text-[#E2C275] mb-2 font-semibold">
                      {cert.role}
                    </div>

                    <h3 className="font-display font-bold text-base sm:text-lg text-white group-hover:text-[#E2C275] transition-colors leading-snug">
                      {cert.title}
                    </h3>

                    <p className="text-xs text-blue-200/80 mt-1 font-medium">
                      Acara: <span className="text-white">{cert.event}</span>
                    </p>

                    {cert.issuer && (
                      <p className="text-[11px] text-blue-200/65 mt-0.5 truncate">
                        Penerbit: {cert.issuer}
                      </p>
                    )}

                    {cert.desc && (
                      <p className="text-xs text-blue-100/80 mt-2.5 line-clamp-2 leading-relaxed">
                        {cert.desc}
                      </p>
                    )}
                  </div>
                </div>

                {/* BOTTOM FOOTER BAR */}
                <div className="px-4 sm:p-5 py-3 bg-[#020F2B]/90 border-t border-[#C6A355]/30 flex items-center justify-between gap-2 z-10">
                  <span className="text-[11px] font-mono-code text-[#E2C275] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Lihat Sertifikat</span>
                    <span>→</span>
                  </span>

                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="px-2.5 py-1 rounded-full bg-[#6B0F1A]/80 hover:bg-[#8A1422] border border-[#E2C275] text-[10px] font-mono-code text-[#F6DFB0] flex items-center gap-1 transition-colors"
                      title="Buka Kredensial / PDF Asli"
                    >
                      <span>Verifikasi</span>
                      <IconArrowUpRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default CertificatesSection;
