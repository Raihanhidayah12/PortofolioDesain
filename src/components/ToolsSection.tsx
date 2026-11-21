import React, { useState, useEffect, useCallback } from 'react';
import { IconSparkles, IconLayers, IconCamera, IconCompass } from './icons';
import { CreativeTool } from '@/types';
import { usePortfolioSync } from '@/lib/usePortfolioSync';

// Brand accent colors for each tool badge
const TOOL_ACCENTS: Record<string, { border: string; glow: string; badgeBg: string; badgeText: string; activeGradient: string }> = {
  figma: {
    border: 'border-[#F24E1E]/50 hover:border-[#F24E1E]',
    glow: 'hover:shadow-[0_8px_24px_rgba(242,78,30,0.25)]',
    badgeBg: 'bg-[#2A0E12] border-[#F24E1E]/60',
    badgeText: 'text-[#F24E1E]',
    activeGradient: 'from-[#6B0F1A] via-[#4A0A12] to-[#021238]'
  },
  lightroom: {
    border: 'border-[#31A8FF]/50 hover:border-[#31A8FF]',
    glow: 'hover:shadow-[0_8px_24px_rgba(49,168,255,0.25)]',
    badgeBg: 'bg-[#071833] border-[#31A8FF]/60',
    badgeText: 'text-[#31A8FF]',
    activeGradient: 'from-[#0038A8] via-[#052266] to-[#021238]'
  },
  illustrator: {
    border: 'border-[#FF9A00]/50 hover:border-[#FF9A00]',
    glow: 'hover:shadow-[0_8px_24px_rgba(255,154,0,0.25)]',
    badgeBg: 'bg-[#281702] border-[#FF9A00]/60',
    badgeText: 'text-[#FF9A00]',
    activeGradient: 'from-[#854D0E] via-[#543007] to-[#021238]'
  },
  photoshop: {
    border: 'border-[#00C8FF]/50 hover:border-[#00C8FF]',
    glow: 'hover:shadow-[0_8px_24px_rgba(0,200,255,0.25)]',
    badgeBg: 'bg-[#031D38] border-[#00C8FF]/60',
    badgeText: 'text-[#00C8FF]',
    activeGradient: 'from-[#034096] via-[#042054] to-[#021238]'
  },
  capcut: {
    border: 'border-[#A855F7]/50 hover:border-[#A855F7]',
    glow: 'hover:shadow-[0_8px_24px_rgba(168,85,247,0.25)]',
    badgeBg: 'bg-[#200A38] border-[#A855F7]/60',
    badgeText: 'text-[#C084FC]',
    activeGradient: 'from-[#581C87] via-[#3B0764] to-[#021238]'
  },
  camera: {
    border: 'border-[#E2C275]/50 hover:border-[#E2C275]',
    glow: 'hover:shadow-[0_8px_24px_rgba(226,194,117,0.25)]',
    badgeBg: 'bg-[#261E08] border-[#E2C275]/60',
    badgeText: 'text-[#E2C275]',
    activeGradient: 'from-[#78350F] via-[#451A03] to-[#021238]'
  }
};

export const ToolsSection: React.FC = () => {
  const [tools, setTools] = useState<CreativeTool[]>([]);
  const [activeToolId, setActiveToolId] = useState<string>('figma');
  const [iconErrors, setIconErrors] = useState<Record<string, boolean>>({});

  const fetchTools = useCallback(() => {
    fetch('/api/tools', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.tools)) {
          setTools(data.tools);
          if (data.tools.length > 0) {
            setActiveToolId((prev) => {
              const exists = data.tools.some((t: CreativeTool) => t.id === prev);
              return exists ? prev : data.tools[0].id;
            });
          }
        }
      })
      .catch((err) => {
        console.warn('Neon DB tools sync notice:', err);
      });
  }, []);

  // Initial fetch on mount
  useEffect(() => {
    fetchTools();
  }, [fetchTools]);

  // Live real-time sync across tabs & devices without page reload
  usePortfolioSync(fetchTools);

  const activeTool =
    tools.find((t) => t.id === activeToolId) || tools[0] || null;
  const activeAccent = activeTool
    ? TOOL_ACCENTS[activeTool.id] || TOOL_ACCENTS.figma
    : TOOL_ACCENTS.figma;

  return (
    <section
      id="tools"
      className="relative py-14 sm:py-20 md:py-28 px-3 sm:px-6 md:px-8 max-w-6xl mx-auto"
    >
      {/* SECTION AMBIENT LIGHTS - Breaks the monotonous blue */}
      <div className="absolute -top-10 -left-10 w-96 h-96 rounded-full bg-[#6B0F1A]/20 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-96 h-96 rounded-full bg-[#E2C275]/15 blur-[120px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start relative z-10">
        {/* LEFT: KESIBUKAN & CREATIVE FOCUS (5 Cols) */}
        <div className="lg:col-span-5 rounded-[26px] sm:rounded-[34px] bg-gradient-to-b from-[#052368]/95 via-[#03174C]/95 to-[#020E2F]/98 border-[2.5px] border-[#C6A355] p-5 sm:p-7 md:p-8 relative shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-md">
          {/* Inner Hairline Art-Deco Gold Frame */}
          <div className="absolute inset-[5px] sm:inset-[6px] rounded-[21px] sm:rounded-[28px] border border-[#E2C275]/45 pointer-events-none" />

          {/* Top Status Indicators */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 sm:mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[10px] sm:text-[11px] font-mono-code text-[#F6DFB0] shadow-md">
              <IconSparkles className="w-3.5 h-3.5 text-[#E2C275]" />
              <span>KESIBUKAN &amp; FOKUS AKTIF</span>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-[9px] font-mono-code text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>SIAP KOLABORASI</span>
            </span>
          </div>

          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-white leading-tight">
            DDM, Desain, Foto &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E2C275] via-[#F6DFB0] to-[#E2C275]">
              Operator Lapangan
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-2.5 sm:mt-3 leading-relaxed">
            Fokus utama saya terpusat pada empat pilar: <strong className="text-[#E2C275]">DDM Acara</strong> untuk tata kelola media, 
            <strong className="text-[#FBBF24]"> Jasa Desain</strong> untuk aset publikasi cepat &amp; presisi, 
            <strong className="text-[#60A5FA]"> Dokumentasi</strong> untuk liputan foto kegiatan, serta 
            <strong className="text-emerald-400"> Operator</strong> untuk kelancaran visual hari-H.
          </p>

          {/* 4 Rich Focus Cards with distinctive color identities */}
          <div className="mt-5 sm:mt-6 space-y-2.5">
            {/* Pillar 1: DDM Event Lead */}
            <div className="rounded-2xl bg-gradient-to-r from-[#6B0F1A]/40 via-[#041A4D]/85 to-[#021238]/95 border-2 border-[#E2C275]/60 hover:border-[#E2C275] p-3 sm:p-3.5 transition-all duration-300 hover:translate-x-1 shadow-lg group">
              <div className="flex items-center justify-between mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#6B0F1A] border border-[#E2C275]/60 text-[9px] font-mono-code text-[#F6DFB0]">
                  <IconLayers className="w-3 h-3 text-[#E2C275]" />
                  <span>DDM LEAD</span>
                </span>
                <span className="text-[10px] font-mono-code text-[#E2C275]">✦ PILAR 01</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#E2C275] transition-colors mt-0.5">
                Divisi DDM (Desain, Dokumentasi &amp; Media)
              </h3>
              <p className="text-[11px] sm:text-xs text-blue-100/80 mt-1 leading-snug">
                Penyusunan identitas visual acara, sistem template feed, panduan grafis, serta kepemimpinan alur kerja tim media.
              </p>
            </div>

            {/* Pillar 2: Jasa Desain Grafis */}
            <div className="rounded-2xl bg-gradient-to-r from-[#854D0E]/40 via-[#041A4D]/85 to-[#021238]/95 border-2 border-amber-400/50 hover:border-amber-300 p-3 sm:p-3.5 transition-all duration-300 hover:translate-x-1 shadow-lg group">
              <div className="flex items-center justify-between mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#854D0E] border border-amber-400/60 text-[9px] font-mono-code text-amber-200">
                  <IconSparkles className="w-3 h-3 text-amber-300" />
                  <span>JASA DESAIN</span>
                </span>
                <span className="text-[10px] font-mono-code text-amber-300">✦ PILAR 02</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors mt-0.5">
                Jasa Desain Grafis &amp; Joki Publikasi
              </h3>
              <p className="text-[11px] sm:text-xs text-blue-100/80 mt-1 leading-snug">
                Pembuatan poster resmi, feed carousel 4:5, ID card &amp; lanyard, backdrop panggung, hingga materi modul siap cetak.
              </p>
            </div>

            {/* Pillar 3: Stage & Documentary Photography */}
            <div className="rounded-2xl bg-gradient-to-r from-[#0038A8]/40 via-[#041A4D]/85 to-[#021238]/95 border-2 border-blue-400/50 hover:border-blue-300 p-3 sm:p-3.5 transition-all duration-300 hover:translate-x-1 shadow-lg group">
              <div className="flex items-center justify-between mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0038A8] border border-blue-400/60 text-[9px] font-mono-code text-blue-200">
                  <IconCamera className="w-3 h-3 text-blue-300" />
                  <span>DOKUMENTASI</span>
                </span>
                <span className="text-[10px] font-mono-code text-blue-300">✦ PILAR 03</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors mt-0.5">
                Dokumentasi Kegiatan &amp; Fotografi Panggung
              </h3>
              <p className="text-[11px] sm:text-xs text-blue-100/80 mt-1 leading-snug">
                Liputan panggung dinamis, momen candid crowd, framing estetik, serta culling &amp; color grading cepat hari-H.
              </p>
            </div>

            {/* Pillar 4: Field Coordination & Live Media Operator */}
            <div className="rounded-2xl bg-gradient-to-r from-[#064E3B]/40 via-[#041A4D]/85 to-[#021238]/95 border-2 border-emerald-400/50 hover:border-emerald-300 p-3 sm:p-3.5 transition-all duration-300 hover:translate-x-1 shadow-lg group">
              <div className="flex items-center justify-between mb-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#064E3B] border border-emerald-400/60 text-[9px] font-mono-code text-emerald-200">
                  <IconCompass className="w-3 h-3 text-emerald-300" />
                  <span>OPERATOR</span>
                </span>
                <span className="text-[10px] font-mono-code text-emerald-300">✦ PILAR 04</span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors mt-0.5">
                Operator Lapangan &amp; Visual Display Acara
              </h3>
              <p className="text-[11px] sm:text-xs text-blue-100/80 mt-1 leading-snug">
                Pengawasan visual display panggung, rundown media live, operator broadcast, dan koordinasi teknis tim di lapangan.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: INTERACTIVE TACTILE SOFTWARE & GEAR DOCK (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="inline-block px-3 py-0.5 rounded-full bg-[#6B0F1A]/80 border border-[#E2C275] text-[10px] sm:text-[11px] font-mono-code text-[#F6DFB0] mb-1.5">
                ✦ CREATIVE ARSENAL &amp; SOFTWARE ✦
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-4xl md:text-5xl text-white leading-tight">
                Tools &amp; Software yang{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E2C275] via-[#FFF] to-[#E2C275]">
                  Saya Gunakan
                </span>
              </h2>
            </div>
            {tools.length > 0 && (
              <span className="text-[11px] font-mono-code text-[#E2C275] hidden sm:block">
                KLIK KARTU UNTUK INSPEKSI
              </span>
            )}
          </div>

          {/* Empty state if tools in Neon is 0 */}
          {tools.length === 0 ? (
            <div className="rounded-[24px] sm:rounded-[30px] bg-[#021238]/70 border border-[#C6A355]/40 p-8 sm:p-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-[#021238] border border-[#E2C275] flex items-center justify-center text-2xl mb-3 shadow-lg">
                🛠️
              </div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-[#F6DFB0] mb-1.5">
                Belum Ada Daftar Tools Ditampilkan
              </h3>
              <p className="text-xs sm:text-sm text-blue-200/75 max-w-md leading-relaxed">
                Daftar software dan perangkat kreatif sedang dalam proses pembaruan.
              </p>
            </div>
          ) : (
            <>
              {/* Tactile Tool Badges (2 columns on mobile, 3 on tablet/desktop) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {tools.map((tool) => {
                  const isSelected = activeTool && tool.id === activeTool.id;
                  const accent = TOOL_ACCENTS[tool.id] || TOOL_ACCENTS.figma;
                  const hasIcon = Boolean(tool.icon_url && !iconErrors[tool.id]);

                  return (
                    <button
                      key={tool.id}
                      onClick={() => setActiveToolId(tool.id)}
                      style={{
                        transform: isSelected
                          ? 'scale(1.03) translateY(-2px)'
                          : `rotate(${tool.tilt || '0deg'})`
                      }}
                      className={`text-left rounded-2xl p-3.5 sm:p-4 border-2 transition-all duration-300 cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? `bg-gradient-to-br ${accent.activeGradient} border-[#E2C275] shadow-[0_12px_28px_rgba(226,194,117,0.3)]`
                          : `bg-gradient-to-br from-[#062464]/90 to-[#021033]/95 ${accent.border} ${accent.glow} shadow-md`
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        <span
                          className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center font-display font-bold text-xs sm:text-sm shadow-inner shrink-0 overflow-hidden p-1.5 ${accent.badgeBg} ${accent.badgeText}`}
                        >
                          {hasIcon ? (
                            <img
                              src={tool.icon_url}
                              alt={tool.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-contain"
                              onError={() => {
                                setIconErrors((prev) => ({ ...prev, [tool.id]: true }));
                              }}
                            />
                          ) : (
                            tool.abbr
                          )}
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-mono-code px-2 py-0.5 rounded-md bg-[#021238]/80 border border-white/10 text-[#F6DFB0]">
                          {tool.usage}
                        </span>
                      </div>

                      <h3 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-[#E2C275]">
                        {tool.name}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-blue-200/85 mt-0.5 truncate">
                        {tool.category}
                      </p>

                      {/* Visual Capability Meter */}
                      <div className="w-full bg-[#021238]/80 rounded-full h-1 mt-2.5 overflow-hidden border border-white/10">
                        <div
                          className="bg-gradient-to-r from-[#C6A355] to-[#E2C275] h-full rounded-full transition-all duration-500"
                          style={{ width: tool.usage.includes('%') ? tool.usage : '100%' }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Active Tool Inspector Spotlight - Art-Deco Master Console */}
              {activeTool && (
                <div className="rounded-[24px] sm:rounded-[30px] bg-gradient-to-br from-[#062670] via-[#03184C] to-[#010C24] border-2 border-[#E2C275] p-5 sm:p-7 relative shadow-[0_16px_45px_rgba(0,0,0,0.65)] overflow-hidden">
                  {/* Subtle corner star flourish */}
                  <span className="absolute top-3 right-4 text-[#E2C275]/50 text-xs select-none">✦</span>

                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2">
                      {activeTool.icon_url && !iconErrors[activeTool.id] && (
                        <div className="w-6 h-6 rounded-md overflow-hidden bg-black/20 p-0.5 shrink-0">
                          <img
                            src={activeTool.icon_url}
                            alt={activeTool.name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      <span className="px-3 py-1 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[10px] font-mono-code font-bold text-[#F6DFB0] shadow">
                        AKTIF: {activeTool.name.toUpperCase()}
                      </span>
                      <span className="text-[9px] font-mono-code text-emerald-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        VERIFIED IN FIELD
                      </span>
                    </div>
                    <span className="text-[11px] sm:text-xs font-mono-code text-[#E2C275] font-semibold">
                      {activeTool.highlight}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed mt-2.5">
                    {activeTool.desc}
                  </p>

                  {/* Capability Feature Badges */}
                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2 text-[10px] font-mono-code text-[#F6DFB0]">
                    <span className="px-2.5 py-0.5 rounded-md bg-[#021238]/80 border border-[#C6A355]/40">
                      ✦ Standar Cetak &amp; Digital
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#021238]/80 border border-[#C6A355]/40">
                      ✦ Alur Cepat Hari-H
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-[#021238]/80 border border-[#C6A355]/40">
                      ✦ Kolaborasi Tim Efisien
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
};
