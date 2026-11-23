import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  IconCamera,
  IconCompass,
  IconLayers,
  IconMapPin,
  IconX,
} from './icons';
import { ArtPreview } from './ArtPreview';
import { TreasureStop, LightboxItem } from '@/types';
import { usePortfolioSync } from '@/lib/usePortfolioSync';
import { POSITION_KEYS, formatTagLabel } from '@/lib/tags';

interface JourneySectionProps {
  onOpenLightbox: (item: LightboxItem) => void;
  onCopyHex: (hex: string) => void;
}

export const JourneySection: React.FC<JourneySectionProps> = ({
  onOpenLightbox,
  onCopyHex,
}) => {
  const [stops, setStops] = useState<TreasureStop[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeStopId, setActiveStopId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [divisiFilter, setDivisiFilter] = useState<string | null>(null);
  const [posisiFilter, setPosisiFilter] = useState<string | null>(null);
  const [hoveredStopId, setHoveredStopId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'photos' | 'outputs'>('photos');

  const fetchStops = useCallback(() => {
    fetch('/api/journey', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error('Network error');
        return res.json();
      })
      .then((data) => {
        if (data && Array.isArray(data.stops)) {
          setStops(data.stops);
        }
      })
      .catch((err) => {
        console.warn('Neon DB sync notice: using empty stops', err);
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  // Sync with live Neon Postgres database on mount
  useEffect(() => {
    setMounted(true);
    fetchStops();
  }, [fetchStops]);

  // Live real-time sync across tabs & devices without page reload
  usePortfolioSync(fetchStops);

  const activeStop = stops.find((s) => s.id === activeStopId) || null;

  // Lock background scroll when waypoint modal is open
  useEffect(() => {
    if (activeStopId && activeStop) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [activeStopId, activeStop]);

  const filteredMapStops = stops.filter((stop) => {
    let matchDivisi = true;
    let matchPosisi = true;

    const tags = Array.isArray(stop.roleTags) ? stop.roleTags : [];

    if (divisiFilter) {
      matchDivisi = tags.includes(divisiFilter);
    }

    if (posisiFilter) {
      matchPosisi = tags.includes(posisiFilter);
    }

    return matchDivisi && matchPosisi;
  });

  // Dynamic Division filters (DDM, Foto, Operator, plus any custom divisions present in database)
  const divisionFilterOptions = useMemo(() => {
    const list: Array<{ id: string | null; label: string }> = [
      { id: null, label: 'Semua' },
      { id: 'ddm', label: 'DDM / Desain' },
      { id: 'foto', label: 'Foto / Dokumentasi' },
      { id: 'operator', label: 'Operator' },
    ];
    const existingIds = new Set(['ddm', 'foto', 'operator']);

    stops.forEach((s) => {
      (s.roleTags || []).forEach((t) => {
        const clean = t.toLowerCase().trim();
        if (clean && !POSITION_KEYS.has(clean) && !existingIds.has(clean)) {
          existingIds.add(clean);
          list.push({
            id: clean,
            label: formatTagLabel(clean, 'divisi'),
          });
        }
      });
    });

    return list;
  }, [stops]);

  // Dynamic Position filters (Staff, Koordinator, Wakil, etc. plus any custom positions present in database)
  const positionFilterOptions = useMemo(() => {
    const list: Array<{ id: string | null; label: string }> = [
      { id: null, label: 'Semua' },
      { id: 'staff', label: 'Staff' },
      { id: 'koord', label: 'Koordinator' },
      { id: 'wakil', label: 'Wakil Koordinator' },
      { id: 'volunteer', label: 'Volunteer' },
    ];
    const existingIds = new Set(['staff', 'koord', 'wakil', 'volunteer']);

    stops.forEach((s) => {
      (s.roleTags || []).forEach((t) => {
        const clean = t.toLowerCase().trim();
        if (clean && POSITION_KEYS.has(clean) && !existingIds.has(clean)) {
          existingIds.add(clean);
          list.push({
            id: clean,
            label: formatTagLabel(clean, 'posisi'),
          });
        }
      });
    });

    return list;
  }, [stops]);

  const visibleMapStops = filteredMapStops;

  const openModal = (stop: TreasureStop) => {
    setActiveStopId(stop.id);
    setActiveModalTab('photos');
    requestAnimationFrame(() => requestAnimationFrame(() => setModalVisible(true)));
  };

  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setActiveStopId(null), 300);
  };

  const handleSelectCheckpoint = (stop: TreasureStop) => {
    openModal(stop);
  };

  // Close on Escape (only when no child modal like Lightbox is active)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeStopId) {
        // If LightboxModal or any higher modal is open, don't close Journey modal
        const dialogs = document.querySelectorAll('[role="dialog"]');
        if (dialogs.length > 1) return;
        closeModal();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeStopId]);

  return (
    <section
      id="journey"
      className="relative py-14 sm:py-20 md:py-28 px-3 sm:px-6 md:px-8 max-w-6xl mx-auto"
    >
      {/* SECTION AMBIENT LIGHTING - Breaks monotonous blue */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-[#6B0F1A]/20 blur-[150px] pointer-events-none" />
      <div className="absolute top-3/4 -right-20 w-[500px] h-[500px] rounded-full bg-[#E2C275]/18 blur-[160px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-6 mb-8 sm:mb-10 relative z-10">
        <div>
          <span className="inline-block px-3.5 py-1 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[10px] sm:text-[11px] font-mono-code text-[#F6DFB0] mb-2.5 sm:mb-3 shadow-md">
            ✦ PETA PERJALANAN • PENGALAMAN PANITIA ✦
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-5xl md:text-6xl text-white leading-[0.95] tracking-tight drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]">
            Peta Ekspedisi &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E2C275] via-[#F6DFB0] to-[#E2C275]">
              Jejak Lapangan
            </span>
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-blue-100/90 max-w-md leading-relaxed">
          Rute berliku menelusuri <strong>pengalaman panitia</strong> dan karya DDM dari awal mula berlayar hingga pos pencapaian terkini. Ikuti jalur berliku emas dan klik pos mana saja untuk membuka log ekspedisi.
        </p>
      </div>

      {/* FILTER CONTROLS & CHECKPOINT RADAR */}
      <div className="mb-6 rounded-[24px] sm:rounded-[30px] bg-gradient-to-r from-[#041A4D]/95 via-[#062466]/95 to-[#021238]/95 border-2 border-[#C6A355]/80 p-4 sm:p-5 md:p-6 space-y-3.5 shadow-2xl relative z-10 backdrop-blur-md">
        {/* Divisi Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] sm:text-[11px] font-mono-code text-[#E2C275] mr-1">DIVISI:</span>
          {divisionFilterOptions.map((item) => (
            <button
              key={item.id ?? 'all'}
              onClick={() => setDivisiFilter(item.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold border transition-all cursor-pointer ${
                divisiFilter === item.id
                  ? 'bg-[#6B0F1A] text-[#F6DFB0] border-[#E2C275] shadow-lg scale-105'
                  : 'bg-[#021238]/80 text-blue-100 border-[#C6A355]/45 hover:border-[#E2C275]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Posisi Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-white/10">
          <span className="text-[10px] sm:text-[11px] font-mono-code text-[#E2C275] mr-1">POSISI:</span>
          {positionFilterOptions.map((item) => (
            <button
              key={item.id ?? 'all'}
              onClick={() => setPosisiFilter(item.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold border transition-all cursor-pointer ${
                posisiFilter === item.id
                  ? 'bg-[#6B0F1A] text-[#F6DFB0] border-[#E2C275] shadow-lg scale-105'
                  : 'bg-[#021238]/80 text-blue-100 border-[#C6A355]/45 hover:border-[#E2C275]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* AUTHENTIC TREASURE MAP CANVAS (PETA HARTA KARUN BERLIKU) */}
      <div
        className="rounded-[28px] sm:rounded-[38px] md:rounded-[48px] border-[2.5px] border-[#C6A355] p-3 sm:p-7 md:p-12 relative overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.7)]"
        style={{
          background:
            'radial-gradient(circle at 50% 15%, #0044C4 0%, #031D56 45%, #010C24 100%)'
        }}
      >
        {/* Inner Vintage Nautical Frame */}
        <div className="absolute inset-[5px] sm:inset-[7px] rounded-[22px] sm:rounded-[32px] md:rounded-[42px] border border-[#E2C275]/50 pointer-events-none" />

        {/* Vintage Map Watermark - Compass Rose in Background */}
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-10 flex items-center justify-center select-none"
        >
          <div className="w-full h-full border-4 border-dashed border-[#E2C275] rounded-full animate-spin-slow" />
          <span className="absolute font-serif text-8xl text-[#E2C275]">🧭</span>
        </div>

        {/* Map Header Status & Navigation Coordinates */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 mb-6 sm:mb-8 text-[10px] sm:text-xs font-mono-code text-[#F6DFB0] bg-[#021238]/85 border border-[#C6A355]/60 rounded-full px-3.5 py-1.5 shadow-lg">
          <span className="inline-flex items-center gap-1.5">
            <IconCompass className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E2C275] shrink-0" />
            <span>RUTE LAUT: {stops.length > 0 ? `${stops.length} TITIK KEPANITIAAN` : 'EKSPEDISI KEPANITIAAN'}</span>
          </span>
          <span className="text-[#E2C275] flex items-center gap-1">
            <span>SEKTOR DDM &bull; FOTOGRAFI &bull; OPERATOR</span>
          </span>
        </div>

        {/* DYNAMIC CONTINUOUS WINDING S-CURVE TREASURE TRAIL SVG (MOBILE & DESKTOP) */}
        {(() => {
          const stepH = 260; // vertical step between waypoints
          const totalH = Math.max(500, visibleMapStops.length * stepH + 120);

          // Weave trail between left (x=240) and right (x=760)
          const curveSegments = visibleMapStops
            .map((st, idx) => {
              const x = idx % 2 === 0 ? 240 : 760;
              const y = 130 + idx * stepH;
              if (idx === 0) return `M ${x} ${y}`;
              const prevX = (idx - 1) % 2 === 0 ? 240 : 760;
              const prevY = 130 + (idx - 1) * stepH;
              const midY = (prevY + y) / 2;
              return `C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y}`;
            })
            .join(' ');

          return (
            <svg
              aria-hidden="true"
              viewBox={`0 0 1000 ${totalH}`}
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
            >
              {/* Topographic depth waves */}
              <path
                d="M-50,140 C220,50 480,240 780,120 C910,75 990,160 1060,130"
                stroke="#60A5FA"
                strokeOpacity="0.14"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d={`M-50,${totalH * 0.5} C260,${totalH * 0.42} 520,${totalH * 0.58} 820,${totalH * 0.48} C930,${totalH * 0.44} 1060,${totalH * 0.48}`}
                stroke="#60A5FA"
                strokeOpacity="0.14"
                strokeWidth="1.5"
                fill="none"
              />

              {/* Serpentine Glowing Trail Aura */}
              {visibleMapStops.length > 1 && (
                <path
                  d={curveSegments}
                  stroke="#E2C275"
                  strokeWidth="8"
                  strokeOpacity="0.18"
                  strokeLinecap="round"
                  fill="none"
                />
              )}

              {/* Main Winding Dashed Treasure Trail */}
              {visibleMapStops.length > 1 && (
                <path
                  d={curveSegments}
                  stroke="#E2C275"
                  strokeWidth="3.5"
                  strokeDasharray="12 10"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.95"
                  className="animate-trail-flow"
                />
              )}

              {/* Checkpoint Nodes along the S-Curve with Reactive Halos */}
              {visibleMapStops.map((st, idx) => {
                const x = idx % 2 === 0 ? 240 : 760;
                const y = 130 + idx * stepH;
                const isFinal = st.marker === 'X';
                const isHovered = hoveredStopId === st.id;

                return (
                  <g key={`node-${st.id}`} className="transition-all duration-300">
                    {/* Ping radar ring when hovered or final checkpoint */}
                    {(isHovered || isFinal) && (
                      <circle
                        cx={x}
                        cy={y}
                        r={isFinal ? 28 : 22}
                        stroke={isFinal ? '#FF4D4D' : '#E2C275'}
                        strokeWidth="2"
                        strokeOpacity="0.75"
                        fill={isFinal ? 'rgba(255, 77, 77, 0.2)' : 'rgba(226, 194, 117, 0.25)'}
                        className="animate-ping"
                      />
                    )}
                    {/* Outer pulse halo */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 20 : isFinal ? 18 : 12}
                      stroke={isFinal ? '#FF4D4D' : '#E2C275'}
                      strokeWidth={isHovered ? '2.5' : '2'}
                      strokeOpacity={isHovered ? '0.9' : '0.45'}
                      fill={isHovered ? 'rgba(226, 194, 117, 0.2)' : 'none'}
                    />
                    {/* Inner anchor coin */}
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 11 : isFinal ? 10 : 7}
                      fill={isFinal ? '#6B0F1A' : isHovered ? '#FFFFFF' : '#E2C275'}
                      stroke={isHovered ? '#E2C275' : '#FFFFFF'}
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </svg>
          );
        })()}

        {/* WINDING WAYPOINTS: STAGGERED LEFT & RIGHT (CREATING REAL MAP ZIGZAG ON MOBILE & DESKTOP) */}
        {visibleMapStops.length === 0 ? (
          <div className="relative z-10 py-16 px-4 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#021238]/90 border border-[#E2C275] flex items-center justify-center text-3xl mb-4 shadow-xl">
              ⚓
            </div>
            <h4 className="font-display font-bold text-lg sm:text-xl text-[#F6DFB0] mb-2">
              Belum Ada Catatan Ekspedisi
            </h4>
            <p className="text-xs sm:text-sm text-blue-200/80 max-w-md leading-relaxed">
              Catatan rute dan arsip perjalanan kepanitiaan sedang dalam proses pembaruan.
            </p>
          </div>
        ) : (
          <div className="relative z-10 space-y-6 sm:space-y-8">
            {visibleMapStops.map((stop, idx) => {
              const isRight = idx % 2 === 1;
              const isX = stop.marker === 'X';
              const isStart = stop.marker === 'START';

              return (
                <div
                  key={stop.id}
                  className={`flex ${isRight ? 'justify-end' : 'justify-start'} w-full relative`}
                >
                  {/* Checkpoint Card: Staggered w-[84%] on mobile leaving the open side for the visible winding trail */}
                  <button
                    type="button"
                    onMouseEnter={() => setHoveredStopId(stop.id)}
                    onMouseLeave={() => setHoveredStopId(null)}
                    onClick={() => openModal(stop)}
                    className={`w-[84%] xs:w-[82%] sm:w-[78%] md:w-[62%] lg:w-[56%] text-left rounded-[22px] sm:rounded-[28px] p-4 sm:p-5 md:p-6 border-2 transition-all duration-300 cursor-pointer relative shadow-2xl group overflow-hidden ${
                      isX
                        ? 'bg-gradient-to-br from-[#6B0F1A]/95 via-[#3D080F]/95 to-[#021238]/98 border-[#E2C275] shadow-[0_12px_36px_rgba(226,194,117,0.35)] hover:-translate-y-2.5 hover:scale-[1.015] hover:shadow-[0_20px_50px_rgba(226,194,117,0.45)]'
                        : 'bg-gradient-to-br from-[#062464]/95 via-[#03184A]/95 to-[#010E2E]/98 hover:from-[#082E80] hover:to-[#02143D] border-[#C6A355]/70 hover:border-[#E2C275] hover:-translate-y-2.5 hover:scale-[1.015] hover:shadow-[0_20px_45px_rgba(226,194,117,0.28)]'
                    }`}
                  >
                    {/* Subtle Light Flare Sheen Sweep on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.07] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />

                    {/* Waypoint Nautical Seal & Route Badge */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5 relative z-10">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-mono-code font-bold border shadow transition-all duration-300 ${
                            isX
                              ? 'bg-[#E2C275] text-[#021238] border-white group-hover:shadow-[0_0_12px_rgba(226,194,117,0.8)]'
                              : isStart
                              ? 'bg-[#6B0F1A] text-[#F6DFB0] border-[#E2C275]'
                              : 'bg-[#021238] text-[#E2C275] border-[#C6A355]/70 group-hover:border-[#E2C275]'
                          }`}
                        >
                          {isStart
                            ? '🚩 POS 01 • AWAL RUTE'
                            : isX
                            ? '✕ TITIK PENCAPAIAN TERKINI'
                            : `⚓ ${stop.code}`}
                        </span>

                        <span className="px-2 py-0.5 rounded-full bg-[#021238]/80 border border-white/10 text-[9px] sm:text-[10px] font-mono-code text-blue-200">
                          {stop.year}
                        </span>
                      </div>

                      <span className="text-[10px] sm:text-[11px] font-mono-code text-blue-200/90 flex items-center gap-1">
                        <IconMapPin className="w-3 h-3 text-[#E2C275] shrink-0" />
                        <span className="truncate max-w-[120px] sm:max-w-none">{stop.period}</span>
                      </span>
                    </div>

                    {/* Role & Event Name */}
                    <h3 className="font-display font-bold text-base sm:text-xl text-white group-hover:text-[#E2C275] transition-colors leading-tight relative z-10">
                      {stop.role}
                    </h3>
                    <p className="text-xs sm:text-sm font-bold text-[#E2C275] mt-0.5 relative z-10">
                      {stop.event}
                    </p>
                    <p className="text-[11px] sm:text-xs text-blue-100/85 mt-2 leading-relaxed line-clamp-3 relative z-10">
                      {stop.summary}
                    </p>

                    {/* Scattered Mini Polaroid Peek + Open Log Indicator */}
                    <div className="mt-3.5 pt-2.5 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 relative z-10">
                      <div className="flex items-center -space-x-2">
                        {stop.photos.slice(0, 3).map((ph, pIdx) => (
                          <div
                            key={ph.id}
                            style={{
                              transform: `rotate(${pIdx % 2 === 0 ? -6 : 6}deg)`
                            }}
                            className={`w-8 h-6 sm:w-10 sm:h-8 rounded-md overflow-hidden border-1.5 border-[#E2C275] shadow-md shrink-0 bg-[#021238] transition-all duration-300 ${
                              pIdx === 0
                                ? 'group-hover:rotate-[-14deg] group-hover:-translate-x-1.5 group-hover:scale-110'
                                : 'group-hover:rotate-[14deg] group-hover:translate-x-1.5 group-hover:scale-110'
                            }`}
                          >
                            <ArtPreview type={ph.scene} />
                          </div>
                        ))}
                        <span className="pl-3 sm:pl-4 text-[10px] font-mono-code text-[#F6DFB0]">
                          {stop.photos.length} Foto
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#021238] border border-[#C6A355]/60 text-[10px] sm:text-[11px] font-mono-code text-[#E2C275] font-bold group-hover:bg-[#E2C275] group-hover:text-[#021238] group-hover:border-[#E2C275] group-hover:shadow-[0_4px_14px_rgba(226,194,117,0.4)] transition-all duration-300">
                        <span>Buka Log Pos</span>
                        <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                      </span>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ACTIVE WAYPOINT EXPEDITION LOG MODAL (PORTALED TO DOCUMENT BODY) */}
      {mounted && activeStopId && activeStop && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${activeStop.role} — ${activeStop.event}`}
          className={`fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 transition-all duration-350 ease-out ${
            modalVisible
              ? 'bg-[#01091F]/90 backdrop-blur-md opacity-100'
              : 'bg-[#01091F]/0 backdrop-blur-none opacity-0 pointer-events-none'
          }`}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            onClick={closeModal}
          />

          {/* Modal Card */}
          <div
            style={{
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className={`relative z-10 w-full max-w-4xl max-h-[88vh] flex flex-col rounded-[26px] sm:rounded-[34px] bg-gradient-to-b from-[#052368] via-[#03174C] to-[#010C24] border-2 border-[#E2C275] shadow-[0_24px_70px_rgba(0,0,0,0.7)] transition-all duration-350 overflow-hidden ${
              modalVisible
                ? 'scale-100 translate-y-0 opacity-100'
                : 'scale-[0.88] translate-y-8 opacity-0'
            }`}
          >
            {/* Modal Header (Fixed at top, never scrolls away) */}
            <div className="shrink-0 flex items-start justify-between gap-3 p-4 sm:p-6 border-b border-[#C6A355]/40 bg-[#03174C]/95 backdrop-blur-md">
              <div>
                <span className="inline-block px-3 py-0.5 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[9px] sm:text-[10px] font-mono-code text-[#F6DFB0] mb-1.5">
                  {activeStop.code} &bull; {activeStop.period}
                </span>
                <h3 className="font-display font-bold text-lg sm:text-2xl text-white leading-tight">
                  {activeStop.role} — {activeStop.event}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 sm:p-2 rounded-full bg-[#6B0F1A] hover:bg-[#8A1422] border border-[#E2C275] text-[#F6DFB0] cursor-pointer shrink-0 transition-colors"
                aria-label="Tutup Detail"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 sm:p-6 space-y-5">
              {/* Event Summary */}
              <div className="rounded-2xl bg-[#021238]/85 border border-[#C6A355]/40 p-4">
                <span className="text-[10px] font-mono-code text-[#E2C275] block mb-1">
                  ✦ RINGKASAN PERAN KEPANITIAAN:
                </span>
                <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                  {activeStop.summary}
                </p>
              </div>

              {/* Tab Selector Buttons */}
              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#010B22] border border-[#C6A355]/40 w-full sm:w-fit">
                <button
                  type="button"
                  onClick={() => setActiveModalTab('photos')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono-code font-bold transition-all cursor-pointer ${
                    activeModalTab === 'photos'
                      ? 'bg-gradient-to-r from-[#6B0F1A] to-[#8A1422] text-[#F6DFB0] border border-[#E2C275] shadow-md'
                      : 'text-blue-200/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconCamera className="w-3.5 h-3.5 text-[#E2C275]" />
                  <span>Dokumentasi Lapangan ({activeStop.photos.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveModalTab('outputs')}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono-code font-bold transition-all cursor-pointer ${
                    activeModalTab === 'outputs'
                      ? 'bg-gradient-to-r from-[#6B0F1A] to-[#8A1422] text-[#F6DFB0] border border-[#E2C275] shadow-md'
                      : 'text-blue-200/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconLayers className="w-3.5 h-3.5 text-[#E2C275]" />
                  <span>Hasil Desain DDM ({activeStop.outputs.length})</span>
                </button>
              </div>

              {/* TAB 1: POLAROID DOCUMENTATION PHOTOS */}
              {activeModalTab === 'photos' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] sm:text-[11px] font-mono-code text-[#E2C275]">
                      ✦ Klik foto untuk perbesar pratinjau resolusi penuh
                    </span>
                  </div>

                  {activeStop.photos.length === 0 ? (
                    <div className="p-8 text-center text-xs text-blue-200/70 border border-white/10 rounded-xl bg-[#021238]/60">
                      Belum ada dokumentasi foto untuk pos ini.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                      {activeStop.photos.map((photo, index) => {
                        const organicTilt =
                          index === 0
                            ? 'md:-rotate-1'
                            : index === 1
                            ? 'md:rotate-1'
                            : index === 2
                            ? 'md:-rotate-1'
                            : index === 3
                            ? 'md:rotate-1'
                            : 'md:-rotate-1';
                        return (
                          <button
                            key={photo.id}
                            onClick={() =>
                              onOpenLightbox({
                                title: photo.title,
                                subtitle: `${activeStop.code} • ${activeStop.event}`,
                                meta: photo.meta,
                                desc: photo.caption,
                                art: photo.scene
                              })
                            }
                            className={`group text-left rounded-xl sm:rounded-2xl bg-[#021238] border-2 border-[#C6A355]/75 hover:border-[#E2C275] p-2 sm:p-2.5 transition-all duration-300 hover:rotate-0 hover:-translate-y-1 shadow-xl cursor-pointer ${organicTilt}`}
                          >
                            <div className="aspect-[4/3] w-full rounded-lg sm:rounded-xl overflow-hidden border border-white/10">
                              <ArtPreview
                                type={photo.scene}
                                title={photo.title}
                                meta={photo.meta}
                              />
                            </div>
                            <div className="pt-2 sm:pt-2.5 px-0.5 sm:px-1">
                              <span className="text-[9px] sm:text-[10px] font-mono-code text-[#E2C275]">
                                FOTO 0{index + 1}
                              </span>
                              <p className="text-[11px] sm:text-xs font-bold text-white group-hover:text-[#E2C275] truncate mt-0.5">
                                {photo.title}
                              </p>
                              <p className="text-[10px] sm:text-[11px] text-blue-200/75 line-clamp-2 mt-0.5">
                                {photo.caption}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: DDM DESIGN OUTPUTS */}
              {activeModalTab === 'outputs' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] sm:text-[11px] font-mono-code text-[#E2C275]">
                      ✦ Klik karya untuk melihat detail visual &amp; palet warna
                    </span>
                  </div>

                  {activeStop.outputs.length === 0 ? (
                    <div className="p-8 text-center text-xs text-blue-200/70 border border-white/10 rounded-xl bg-[#021238]/60">
                      Belum ada aset desain DDM untuk pos ini.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
                      {activeStop.outputs.map((out) => (
                        <div
                          key={out.id}
                          onClick={() =>
                            onOpenLightbox({
                              title: out.title,
                              subtitle: `${activeStop.code} • ${out.type}`,
                              meta: `${out.dim} • ${out.tools.join(', ')}`,
                              desc: `Karya desain yang diproduksi pada kepanitiaan ${activeStop.event}.`,
                              art: out.art,
                              colors: out.colors
                            })
                          }
                          className="group rounded-xl sm:rounded-2xl bg-[#021238] border-2 border-[#C6A355]/75 hover:border-[#E2C275] overflow-hidden cursor-pointer transition-all hover:-translate-y-1.5 shadow-xl"
                        >
                          <div className="aspect-[16/10] w-full overflow-hidden border-b border-[#C6A355]/30">
                            <ArtPreview type={out.art} title={out.title} />
                          </div>
                          <div className="p-3.5 sm:p-4">
                            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono-code text-[#E2C275] mb-1">
                              <span>{out.type}</span>
                              <span>{out.dim}</span>
                            </div>
                            <h5 className="font-bold text-xs sm:text-sm text-white group-hover:text-[#E2C275] truncate">
                              {out.title}
                            </h5>

                            <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-white/10 flex items-center justify-between">
                              <span className="text-[9px] sm:text-[10px] font-mono-code text-blue-200/75 truncate pr-2">
                                {out.tools.join(' • ')}
                              </span>
                              <div
                                className="flex items-center gap-1 shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {out.colors.map((hex) => (
                                  <button
                                    key={hex}
                                    onClick={() => onCopyHex(hex)}
                                    title={`Salin ${hex}`}
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-white/40 cursor-pointer hover:scale-125 transition-transform"
                                    style={{ backgroundColor: hex }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};