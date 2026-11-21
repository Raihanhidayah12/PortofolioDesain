'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * SplashScreen — Komponen Pembuka Sinematik Han Studio
 *
 * Pembaruan Berdasarkan Permintaan:
 * - Menghapus semua angka "2026" dari splash screen & status text
 * - Mengganti inisial "HS" menjadi emblem stiker melingkar dengan tipografi "HAN STUDIO" bergaya bubble retro
 *   (sesuai referensi stiker lingkaran bertepi putih, huruf tebal 'HAN' di atas dan 'STUDIO' di bawah)
 * - Menampilkan persentase progres dinamis di dalam kapsul emas emblem
 * - Mempertahankan 3D magnetic tilt, orbit astrolabe ganda, efek kilau foil emas, dan pembelahan tirai
 */
interface SplashScreenProps {
  onFinish?: () => void;
  onStartExit?: () => void;
  durationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  onStartExit,
  durationMs = 2800,
}) => {
  const [introActive, setIntroActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [done, setDone] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [sparkBurst, setSparkBurst] = useState(false);
  const triggeredRef = useRef(false);

  const sunburstRays = Array.from({ length: 36 }, (_, i) => i * (360 / 36));

  // Jalankan animasi in elemen internal sesaat setelah mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
    const timer = setTimeout(() => {
      setIntroActive(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Fungsi memicu animasi keluar (Pemisahan Tirai Emas & Penyingkapan Halaman)
  const triggerExit = () => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;
    setProgress(100);
    setSparkBurst(true);
    setExiting(true);

    // Beri tahu halaman agar animasi masuk (entrance) langsung dimulai seketika tirai terbuka
    if (typeof onStartExit === 'function') {
      onStartExit();
    }

    // Berikan waktu tirai beludru bergeser keluar layar secara sempurna sebelum unmount
    setTimeout(() => {
      setDone(true);
      if (typeof onFinish === 'function') {
        onFinish();
      }
    }, 920);
  };

  // Timer progres otomatis 0% -> 100%
  useEffect(() => {
    const delayTimer = setTimeout(() => {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const pct = Math.min(100, Math.round((elapsed / (durationMs - 250)) * 100));
        setProgress(pct);

        if (pct >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            triggerExit();
          }, 240);
        }
      }, 25);

      return () => clearInterval(interval);
    }, 250);

    return () => clearTimeout(delayTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs]);

  // Shortcut keyboard (Enter / Space) untuk melewati splash screen
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        triggerExit();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (done) return null;

  const statusText =
    progress < 30
      ? 'MENYIAPKAN KANVAS VISUAL...'
      : progress < 65
      ? 'MEMUAT PETA PENGALAMAN PANITIA...'
      : progress < 95
      ? 'MENYELARASKAN ARSIP DDM & FOTO...'
      : 'MEMBUKA SEGEL PORTO FOLIO...';

  const circleRadius = 104;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeOffset = circumference * (1 - progress / 100);

  return (
    <div
      role="dialog"
      aria-label="Han Studio Splash Screen"
      onClick={triggerExit}
      onMouseMove={(e) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 24;
        const ny = (e.clientY / window.innerHeight - 0.5) * 24;
        setTilt({ x: nx, y: ny });
      }}
      style={{ backgroundColor: exiting ? 'transparent' : '#010B24' }}
      className={`fixed inset-0 z-[100] overflow-hidden select-none transition-colors duration-300 ${
        exiting ? 'pointer-events-none' : 'pointer-events-auto cursor-pointer'
      }`}
    >
      <style>{`
        @keyframes hsSunburstRotate {
          from { transform: translate(50%, 50%) rotate(0deg); }
          to { transform: translate(50%, 50%) rotate(360deg); }
        }
        .hs-sunburst-spin {
          animation: hsSunburstRotate 90s linear infinite;
        }
        @keyframes hsOrbitCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes hsOrbitCCW {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .hs-orbit-cw {
          animation: hsOrbitCW 26s linear infinite;
        }
        .hs-orbit-ccw {
          animation: hsOrbitCCW 18s linear infinite;
        }
        @keyframes hsPulseAura {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(226, 194, 117, 0.45),
                        0 25px 60px rgba(0, 0, 0, 0.85);
          }
          50% {
            box-shadow: 0 0 0 22px rgba(226, 194, 117, 0),
                        0 30px 70px rgba(0, 0, 0, 0.95);
          }
        }
        .hs-seal-aura {
          animation: hsPulseAura 2.2s ease-in-out infinite;
        }
        @keyframes hsFoilSweep {
          0% { transform: translateX(-140%) rotate(25deg); }
          60%, 100% { transform: translateX(220%) rotate(25deg); }
        }
        .hs-foil-sweep {
          animation: hsFoilSweep 3.2s ease-in-out infinite;
        }
        @keyframes hsTwinkle {
          0%, 100% { opacity: 0.25; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.25); }
        }
        .hs-twinkle {
          animation: hsTwinkle 2.6s ease-in-out infinite;
        }
      `}</style>

      {/* =========================================================================
          PINTU TIRAI ATAS (TOP VELVET THEATER CURTAIN)
         ========================================================================= */}
      <div
        className={`absolute top-0 left-0 right-0 h-1/2 overflow-hidden border-b-[2.5px] border-[#E2C275] shadow-[0_12px_45px_rgba(226,194,117,0.38)] z-10 transition-transform ${
          exiting
            ? 'duration-900 ease-[cubic-bezier(0.76,0,0.24,1)] -translate-y-full'
            : 'duration-300 translate-y-0'
        }`}
        style={{
          background:
            'radial-gradient(ellipse at 50% 100%, #004AD6 0%, #00236E 52%, #010B24 100%)',
          backgroundColor: '#010B24',
        }}
      >
        {/* Sunburst Atas */}
        <div
          className={`absolute inset-0 overflow-hidden pointer-events-none transition-all duration-1000 ease-out ${
            introActive ? 'opacity-40 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <svg
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMidYMid slice"
            className="absolute top-0 left-0 w-full h-[200%] pointer-events-none"
          >
            <g className="hs-sunburst-spin">
              {sunburstRays.map((deg, idx) => (
                <polygon
                  key={idx}
                  points="0,0 -26,-950 26,-950"
                  fill={idx % 2 === 0 ? '#2563EB' : '#010C29'}
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>
          </svg>
        </div>

        {/* Bingkai Art-Deco Atas */}
        <div
          className={`absolute inset-3 sm:inset-6 bottom-0 rounded-t-[28px] sm:rounded-t-[48px] border-2 border-b-0 border-[#C6A355]/85 pointer-events-none transition-all duration-700 ease-out ${
            introActive ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.94]'
          }`}
          style={{ transitionDelay: introActive ? '120ms' : '0ms' }}
        >
          <div className="absolute inset-[5px] bottom-0 rounded-t-[23px] sm:rounded-t-[43px] border border-b-0 border-[#E2C275]/55" />
          <span className="absolute top-3 left-4 text-[#E2C275] text-xs">✦</span>
          <span className="absolute top-3 right-4 text-[#E2C275] text-xs">✦</span>
        </div>

        {/* Ambient Sparkles Atas */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${introActive ? 'opacity-100' : 'opacity-0'}`}>
          <span style={{ top: '25%', left: '20%', animationDelay: '0s' }} className="hs-twinkle absolute text-[#E2C275] text-sm">✦</span>
          <span style={{ top: '35%', right: '22%', animationDelay: '0.6s' }} className="hs-twinkle absolute text-[#E2C275] text-base">✦</span>
          <span style={{ top: '65%', left: '12%', animationDelay: '1.2s' }} className="hs-twinkle absolute text-[#E2C275] text-xs">✦</span>
        </div>
      </div>

      {/* =========================================================================
          PINTU TIRAI BAWAH (BOTTOM VELVET THEATER CURTAIN)
         ========================================================================= */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden border-t-[2.5px] border-[#E2C275] shadow-[0_-12px_45px_rgba(226,194,117,0.38)] z-10 transition-transform ${
          exiting
            ? 'duration-900 ease-[cubic-bezier(0.76,0,0.24,1)] translate-y-full'
            : 'duration-300 translate-y-0'
        }`}
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, #004AD6 0%, #00236E 52%, #010B24 100%)',
          backgroundColor: '#010B24',
        }}
      >
        {/* Sunburst Bawah */}
        <div
          className={`absolute inset-0 overflow-hidden pointer-events-none transition-all duration-1000 ease-out ${
            introActive ? 'opacity-40 scale-100' : 'opacity-0 scale-75'
          }`}
        >
          <svg
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMidYMid slice"
            className="absolute -top-[100%] left-0 w-full h-[200%] pointer-events-none"
          >
            <g className="hs-sunburst-spin">
              {sunburstRays.map((deg, idx) => (
                <polygon
                  key={idx}
                  points="0,0 -26,-950 26,-950"
                  fill={idx % 2 === 0 ? '#2563EB' : '#010C29'}
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>
          </svg>
        </div>

        {/* Bingkai Art-Deco Bawah */}
        <div
          className={`absolute inset-3 sm:inset-6 top-0 rounded-b-[28px] sm:rounded-b-[48px] border-2 border-t-0 border-[#C6A355]/85 pointer-events-none transition-all duration-700 ease-out ${
            introActive ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.94]'
          }`}
          style={{ transitionDelay: introActive ? '120ms' : '0ms' }}
        >
          <div className="absolute inset-[5px] top-0 rounded-b-[23px] sm:rounded-b-[43px] border border-t-0 border-[#E2C275]/55" />
          <span className="absolute bottom-3 left-4 text-[#E2C275] text-xs">✦</span>
          <span className="absolute bottom-3 right-4 text-[#E2C275] text-xs">✦</span>
        </div>

        {/* Ambient Sparkles Bawah */}
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ${introActive ? 'opacity-100' : 'opacity-0'}`}>
          <span style={{ bottom: '25%', left: '18%', animationDelay: '0.4s' }} className="hs-twinkle absolute text-[#E2C275] text-base">✦</span>
          <span style={{ bottom: '35%', right: '24%', animationDelay: '0.9s' }} className="hs-twinkle absolute text-[#E2C275] text-xs">✦</span>
          <span style={{ bottom: '60%', right: '14%', animationDelay: '1.4s' }} className="hs-twinkle absolute text-[#E2C275] text-sm">✦</span>
        </div>
      </div>

      {/* =========================================================================
          GOLDEN HORIZON FLASH (Garis Kilau Emas di Seam Tengah)
         ========================================================================= */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[4px] bg-gradient-to-r from-transparent via-[#E2C275] to-transparent pointer-events-none transition-all duration-700 ease-out z-15 ${
          exiting
            ? 'opacity-0 scale-y-[18] blur-md'
            : 'opacity-100 scale-y-100 blur-none'
        }`}
      />

      {/* =========================================================================
          CENTER 3D EMBLEM BADGE, ASTROLABE & STATUS DISPLAY
         ========================================================================= */}
      <div
        className={`absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center pointer-events-none transition-all ${
          exiting
            ? 'duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-0 scale-125 blur-sm'
            : 'duration-300 opacity-100'
        }`}
      >
        <div
          style={{
            transform: `perspective(900px) rotateY(${tilt.x * 0.55}deg) rotateX(${
              -tilt.y * 0.55
            }deg)`,
          }}
          className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center transition-transform duration-200 ease-out"
        >
          {/* Cincin Astrolabe Emas Luar (Berputar Masuk saat intro) */}
          <svg
            viewBox="0 0 300 300"
            className={`absolute inset-0 w-full h-full hs-orbit-cw pointer-events-none transition-all duration-900 ease-out ${
              introActive ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-45'
            }`}
          >
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke="#E2C275"
              strokeWidth="1.5"
              strokeDasharray="6 9"
              strokeOpacity="0.85"
            />
            <circle
              cx="150"
              cy="150"
              r="128"
              fill="none"
              stroke="#C6A355"
              strokeWidth="0.9"
              strokeOpacity="0.45"
            />
            <text x="145" y="16" fill="#E2C275" fontSize="12">✦</text>
            <text x="145" y="292" fill="#E2C275" fontSize="12">✦</text>
            <text x="6" y="154" fill="#E2C275" fontSize="12">✦</text>
            <text x="284" y="154" fill="#E2C275" fontSize="12">✦</text>
          </svg>

          {/* Cincin Filigree Dalam */}
          <svg
            viewBox="0 0 260 260"
            className={`absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] hs-orbit-ccw pointer-events-none transition-all duration-900 ease-out ${
              introActive ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-45'
            }`}
          >
            <circle
              cx="130"
              cy="130"
              r="118"
              fill="none"
              stroke="#F6DFB0"
              strokeWidth="1"
              strokeDasharray="3 6"
              strokeOpacity="0.65"
            />
            <polygon
              points="130,16 134,24 130,22 126,24"
              fill="#E2C275"
            />
            <polygon
              points="130,244 134,236 130,238 126,236"
              fill="#E2C275"
            />
            <polygon
              points="16,130 24,134 22,130 24,126"
              fill="#E2C275"
            />
            <polygon
              points="244,130 236,134 238,130 236,126"
              fill="#E2C275"
            />
          </svg>

          {/* SVG Circular Progress Gauge */}
          <svg
            className={`absolute inset-0 w-full h-full -rotate-90 pointer-events-none transition-opacity duration-700 ${
              introActive ? 'opacity-100' : 'opacity-0'
            }`}
            viewBox="0 0 240 240"
          >
            {/* Background Track */}
            <circle
              cx="120"
              cy="120"
              r={circleRadius}
              fill="none"
              stroke="#041A4D"
              strokeWidth="4"
              strokeOpacity="0.75"
            />
            {/* Animated Gold Progress Arc */}
            <circle
              cx="120"
              cy="120"
              r={circleRadius}
              fill="none"
              stroke="url(#hsGoldGradient)"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              className="transition-all duration-150"
            />
            <defs>
              <linearGradient id="hsGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#C6A355" />
                <stop offset="50%" stopColor="#FFF4D0" />
                <stop offset="100%" stopColor="#E2C275" />
              </linearGradient>
            </defs>
          </svg>

          {/* =========================================================================
              CUSTOM "HAN STUDIO" CIRCULAR BUBBLE EMBLEM BADGE
              - Mengikuti inspirasi stiker tipografi melingkar (tepi putih die-cut + huruf bubble)
              - Mendarat dengan efek Royal Stamp Bounce saat intro
             ========================================================================= */}
          <div
            style={{
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
              transitionDelay: introActive && !exiting ? '180ms' : '0ms',
            }}
            className={`hs-seal-aura relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden transition-all duration-700 pointer-events-auto cursor-pointer hover:scale-105 active:scale-95 ${
              sparkBurst
                ? 'scale-125'
                : introActive
                ? 'scale-100 opacity-100 translate-y-0'
                : 'scale-[1.38] opacity-0 -translate-y-6 blur-[3px]'
            }`}
          >
            {/* Shimmering Gold Foil Sweep */}
            <div
              aria-hidden="true"
              className="hs-foil-sweep absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-[#F6DFB0]/30 to-transparent pointer-events-none z-10"
            />

            {/* Vector Graphic: Circular Sticker Typography Lockup */}
            <svg viewBox="0 0 220 220" className="w-full h-full">
              <defs>
                <radialGradient id="badgeBlueBase" cx="50%" cy="40%" r="65%">
                  <stop offset="0%" stopColor="#0058FF" />
                  <stop offset="55%" stopColor="#0035B8" />
                  <stop offset="100%" stopColor="#001760" />
                </radialGradient>
                <filter id="bubbleDropShadow" x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000E38" floodOpacity="0.85" />
                </filter>
              </defs>

              {/* 1. Outer Thick White Die-Cut Sticker Contour */}
              <circle cx="110" cy="110" r="106" fill="#FFFFFF" />

              {/* 2. Royal Blue Inner Emblem Base */}
              <circle cx="110" cy="110" r="99" fill="url(#badgeBlueBase)" stroke="#001F6E" strokeWidth="3.5" />

              {/* 3. Gold Accent Dashed Ring */}
              <circle cx="110" cy="110" r="93" fill="none" stroke="#E2C275" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.8" />

              {/* 4. Bubble Lettering Group: HAN STUDIO */}
              <g
                filter="url(#bubbleDropShadow)"
                textAnchor="middle"
                fontFamily="'Fredoka', 'Plus Jakarta Sans', system-ui, sans-serif"
                fontWeight="900"
              >
                {/* HAN (Upper Bubble Word) */}
                <text
                  x="110"
                  y="96"
                  fontSize="64"
                  letterSpacing="2"
                  fill="#FFFFFF"
                  stroke="#00207A"
                  strokeWidth="7"
                  strokeLinejoin="round"
                  paintOrder="stroke fill"
                >
                  HAN
                </text>

                {/* STUDIO (Lower Bubble Word) */}
                <text
                  x="110"
                  y="144"
                  fontSize="38"
                  letterSpacing="2.5"
                  fill="#FFFFFF"
                  stroke="#00207A"
                  strokeWidth="5"
                  strokeLinejoin="round"
                  paintOrder="stroke fill"
                >
                  STUDIO
                </text>
              </g>

              {/* 5. Live Progress Percentage Pill */}
              <g transform="translate(110, 168)">
                <rect x="-26" y="-10" width="52" height="20" rx="10" fill="#021238" stroke="#E2C275" strokeWidth="1.4" />
                <text x="0" y="4" fontFamily="'Space Mono', monospace" fontWeight="700" fontSize="11" fill="#E2C275" textAnchor="middle">
                  {progress}%
                </text>
              </g>
            </svg>
          </div>
        </div>

        {/* Live Status Pill & Interactive Prompt */}
        <div
          className={`mt-6 space-y-2 pointer-events-auto transition-all duration-700 ease-out ${
            introActive && !exiting
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: introActive && !exiting ? '340ms' : '0ms' }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#021238]/90 backdrop-blur-md border border-[#C6A355]/75 text-[11px] font-mono-code text-[#F6DFB0] shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#E2C275] animate-ping" />
            <span>{statusText}</span>
          </div>

          <p className="text-[11px] font-mono-code text-blue-200/80">
            Klik segel atau tekan <span className="text-[#E2C275]">Enter</span> untuk langsung masuk ✦
          </p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
