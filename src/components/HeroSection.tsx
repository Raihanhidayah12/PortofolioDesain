import React, { useState } from 'react';
import {
  IconArrowUpRight,
  IconCompass,
  IconMenu,
  IconX,
} from './icons';

interface HeroSectionProps {
  onExploreClick?: () => void;
  isEntered?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  isEntered = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [bouncedLetter, setBouncedLetter] = useState<string | null>(null);
  const [bounceKey, setBounceKey] = useState(0); // force animation restart
  const [pointerOffset, setPointerOffset] = useState({ x: 0, y: 0 });

  const openMenu = () => {
    setMobileMenuOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setMenuVisible(true)));
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setTimeout(() => setMobileMenuOpen(false), 320);
  };

  const triggerBounce = (key: string) => {
    setBouncedLetter(key);
    setBounceKey(k => k + 1);
    setTimeout(() => setBouncedLetter(null), 650);
  };

  const sunburstRays = Array.from({ length: 32 }, (_, i) => i * (360 / 32));

  return (
    <section
      id="top"
      onMouseMove={(e) => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 18;
        const ny = (e.clientY / window.innerHeight - 0.5) * 14;
        setPointerOffset({ x: nx, y: ny });
      }}
      className="relative min-h-[100dvh] w-full flex flex-col justify-between overflow-hidden p-2 sm:p-4 md:p-6 lg:p-7"
      style={{
        background:
          'radial-gradient(circle at 50% 50%, #0047CC 0%, #002D8A 52%, #021238 100%)'
      }}
    >
      {/* Radial Sunburst Light Rays */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
      >
        <g className="sunburst-spin">
          {sunburstRays.map((deg, idx) => (
            <polygon
              key={idx}
              points="0,0 -32,-950 32,-950"
              fill={idx % 2 === 0 ? '#1C64F2' : '#02133B'}
              transform={`rotate(${deg})`}
            />
          ))}
        </g>
      </svg>

      {/* Deep Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, transparent 40%, rgba(1, 8, 26, 0.74) 100%)'
        }}
      />

      {/* DOUBLE GOLD ART-DECO ROUNDED FRAME WITH ENTRANCE ANIMATION */}
      <div
        className={`relative flex-1 w-full rounded-[24px] sm:rounded-[44px] md:rounded-[58px] border-[2px] sm:border-[2.5px] border-[#C6A355] flex flex-col justify-between p-3 sm:p-6 md:p-8 lg:p-10 shadow-[inset_0_0_50px_rgba(0,0,0,0.45)] transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isEntered ? 'opacity-100 scale-100 blur-none' : 'opacity-0 scale-[0.96] blur-[2px]'
        }`}
      >
        {/* Inner Hairline Gold Border */}
        <div className="absolute inset-[4px] sm:inset-[7px] rounded-[20px] sm:rounded-[38px] md:rounded-[52px] border border-[#E2C275]/75 pointer-events-none" />

        {/* Corner Art-Deco Star Flourishes */}
        <span
          aria-hidden="true"
          className="hidden md:block absolute top-4 left-5 text-[#E2C275] text-xs select-none"
        >
          ✦
        </span>
        <span
          aria-hidden="true"
          className="hidden md:block absolute top-4 right-5 text-[#E2C275] text-xs select-none"
        >
          ✦
        </span>
        <span
          aria-hidden="true"
          className="hidden md:block absolute bottom-4 left-5 text-[#E2C275] text-xs select-none"
        >
          ✦
        </span>
        <span
          aria-hidden="true"
          className="hidden md:block absolute bottom-4 right-5 text-[#E2C275] text-xs select-none"
        >
          ✦
        </span>

        {/* LEFT VERTICAL MAROON MEDALLION (✦ P O R T O ✦) */}
        <div
          aria-hidden="true"
          className={`hidden md:flex flex-col items-center justify-center gap-1.5 w-8 md:w-11 py-3 md:py-6 rounded-full bg-[#6B0F1A] border-[1.5px] md:border-[2px] border-[#E2C275] shadow-[0_12px_28px_rgba(0,0,0,0.6)] absolute -left-[16px] md:-left-[22px] top-1/2 -translate-y-1/2 z-20 text-[#F6DFB0] font-serif text-[11px] md:text-sm font-bold leading-none select-none transition-all duration-700 ease-out ${
            isEntered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
          }`}
          style={{ transitionDelay: isEntered ? '320ms' : '0ms' }}
        >
          <span className="text-[9px]">✦</span>
          <span>P</span>
          <span>O</span>
          <span>R</span>
          <span>T</span>
          <span>O</span>
          <span className="text-[9px]">✦</span>
        </div>

        {/* RIGHT VERTICAL MAROON MEDALLION (✦ F O L I O ✦) */}
        <div
          aria-hidden="true"
          className={`hidden md:flex flex-col items-center justify-center gap-1.5 w-8 md:w-11 py-3 md:py-6 rounded-full bg-[#6B0F1A] border-[1.5px] md:border-[2px] border-[#E2C275] shadow-[0_12px_28px_rgba(0,0,0,0.6)] absolute -right-[16px] md:-right-[22px] top-1/2 -translate-y-1/2 z-20 text-[#F6DFB0] font-serif text-[11px] md:text-sm font-bold leading-none select-none transition-all duration-700 ease-out ${
            isEntered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'
          }`}
          style={{ transitionDelay: isEntered ? '320ms' : '0ms' }}
        >
          <span className="text-[9px]">✦</span>
          <span>F</span>
          <span>O</span>
          <span>L</span>
          <span>I</span>
          <span>O</span>
          <span className="text-[9px]">✦</span>
        </div>

        {/* TOP FLOATING GLASS NAVIGATION (DROPS IN FROM TOP) */}
        <header
          className={`relative z-30 flex items-center justify-between gap-2 px-1 sm:px-3 transition-all duration-700 ease-out ${
            isEntered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'
          }`}
          style={{ transitionDelay: isEntered ? '180ms' : '0ms' }}
        >
          <a
            href="#top"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-[#021238]/75 backdrop-blur-md border border-[#C6A355]/60 text-[11px] sm:text-xs font-bold tracking-wider uppercase text-[#F6DFB0]"
          >
            <span className="w-2 h-2 rounded-full bg-[#E2C275] animate-ping shrink-0" />
            <span className="truncate">HAN STUDIO</span>
          </a>

          {/* Center Floating Glass Pill Nav (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center gap-1 px-2 py-1.5 rounded-full bg-[#021238]/65 backdrop-blur-md border border-[#C6A355]/60 text-xs font-semibold text-blue-100 shadow-lg">
            <a
              href="#tools"
              className="px-3.5 py-1 rounded-full hover:bg-[#E2C275] hover:text-[#021238] transition-colors"
            >
              Kesibukan &amp; Tools
            </a>
            <a
              href="#journey"
              className="px-3.5 py-1 rounded-full hover:bg-[#E2C275] hover:text-[#021238] transition-colors"
            >
              Pengalaman Panitia
            </a>
            <a
              href="#certificates"
              className="px-3.5 py-1 rounded-full hover:bg-[#E2C275] hover:text-[#021238] transition-colors"
            >
              Sertifikat
            </a>
            <a
              href="#design-gallery"
              className="px-3.5 py-1 rounded-full hover:bg-[#E2C275] hover:text-[#021238] transition-colors"
            >
              Karya Desain
            </a>
            <a
              href="#photography-gallery"
              className="px-3.5 py-1 rounded-full hover:bg-[#E2C275] hover:text-[#021238] transition-colors"
            >
              Galeri Foto
            </a>
            <a
              href="#contact"
              className="px-3.5 py-1 rounded-full hover:bg-[#E2C275] hover:text-[#021238] transition-colors"
            >
              Golden Pass
            </a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href="https://hanportofolio.my.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full bg-[#6B0F1A]/90 hover:bg-[#8A1422] border border-[#E2C275] text-[11px] sm:text-xs font-semibold text-[#F6DFB0] transition-colors shadow"
              title="Kunjungi Portofolio IT (hanportofolio.my.id)"
            >
              <span>Portofolio IT</span>
              <IconArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => mobileMenuOpen ? closeMenu() : openMenu()}
              aria-label="Buka Menu Navigasi"
              className="lg:hidden p-2 rounded-full bg-[#021238]/80 border border-[#C6A355] text-[#F6DFB0] cursor-pointer hover:bg-[#021238]"
            >
              {mobileMenuOpen ? (
                <IconX className="w-4 h-4" />
              ) : (
                <IconMenu className="w-4 h-4" />
              )}
            </button>
          </div>
        </header>

        {/* Mobile Menu Dropdown Modal */}
        {mobileMenuOpen && (
          <div
            className={`lg:hidden absolute left-3 right-3 sm:left-6 sm:right-6 top-[72px] z-40 rounded-2xl bg-[#021238]/95 backdrop-blur-md border border-[#E2C275] p-4 flex flex-col gap-2.5 text-xs sm:text-sm font-semibold shadow-2xl
              transition-all duration-300 ease-out origin-top
              ${menuVisible ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2'}`}
          >
            <a
              href="#tools"
              onClick={() => closeMenu()}
              className="py-2 px-3 rounded-xl bg-[#041A4D]/80 text-[#F6DFB0] hover:bg-[#E2C275] hover:text-[#021238] transition-all duration-200"
            >
              01. Kesibukan &amp; Tools
            </a>
            <a
              href="#journey"
              onClick={() => closeMenu()}
              className="py-2 px-3 rounded-xl bg-[#041A4D]/80 text-[#F6DFB0] hover:bg-[#E2C275] hover:text-[#021238] transition-all duration-200"
            >
              02. Pengalaman Panitia
            </a>
            <a
              href="#certificates"
              onClick={() => closeMenu()}
              className="py-2 px-3 rounded-xl bg-[#041A4D]/80 text-[#F6DFB0] hover:bg-[#E2C275] hover:text-[#021238] transition-all duration-200"
            >
              03. Sertifikat Kepanitiaan
            </a>
            <a
              href="#design-gallery"
              onClick={() => closeMenu()}
              className="py-2 px-3 rounded-xl bg-[#041A4D]/80 text-[#F6DFB0] hover:bg-[#E2C275] hover:text-[#021238] transition-all duration-200"
            >
              04. Galeri Desain Grafis
            </a>
            <a
              href="#photography-gallery"
              onClick={() => closeMenu()}
              className="py-2 px-3 rounded-xl bg-[#041A4D]/80 text-[#F6DFB0] hover:bg-[#E2C275] hover:text-[#021238] transition-all duration-200"
            >
              05. Galeri Fotografi Acara
            </a>
            <a
              href="#contact"
              onClick={() => closeMenu()}
              className="py-2 px-3 rounded-xl bg-[#041A4D]/80 text-[#F6DFB0] hover:bg-[#E2C275] hover:text-[#021238] transition-all duration-200"
            >
              06. Kontak &amp; Ajak Kolaborasi
            </a>
            <a
              href="https://hanportofolio.my.id/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => closeMenu()}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#6B0F1A] to-[#8A1422] text-[#F6DFB0] border border-[#E2C275] hover:brightness-110 transition-all duration-200 flex items-center justify-between shadow-lg"
            >
              <span className="font-bold">Portofolio IT (hanportofolio.my.id)</span>
              <IconArrowUpRight className="w-4 h-4 text-[#E2C275]" />
            </a>
          </div>
        )}

        {/* CENTERPIECE: INTERACTIVE 3D STACKED 'PORTO FOLIO' DISPLAY */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center py-4 sm:py-6 select-none w-full max-w-full">
          {/* Mobile Archive Badge */}
          <div
            className={`md:hidden inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[11px] font-serif font-bold text-[#F6DFB0] mb-3 sm:mb-4 shadow-lg transition-all duration-600 ease-out ${
              isEntered ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
            }`}
            style={{ transitionDelay: isEntered ? '240ms' : '0ms' }}
          >
            <span>✦ CREATIVE ARCHIVE ✦</span>
          </div>

          <div
            onMouseEnter={() => triggerBounce('hero')}
            onClick={() => triggerBounce('hero')}
            style={{
              transform: `perspective(900px) rotateY(${
                pointerOffset.x * 0.45
              }deg) rotateX(${-pointerOffset.y * 0.45}deg)`
            }}
            className="transition-transform duration-200 ease-out cursor-pointer w-full max-w-full"
          >
            {/* ROW 1: P O R T O (Letter-by-Letter Entrance Stagger) */}
            <div className="flex items-center justify-center font-display font-bold text-white leading-[0.82] tracking-[-0.04em] text-[25vw] xs:text-[26vw] sm:text-[155px] md:text-[200px] lg:text-[245px]">
              {[
                { ch: 'P', rot: '-4deg', z: 'z-10', ml: '', delay: '0s', inDelay: '120ms' },
                { ch: 'O', rot: '2deg', z: 'z-20', ml: '-ml-1.5 xs:-ml-2 sm:-ml-3.5 md:-ml-4', delay: '0.18s', inDelay: '180ms' },
                { ch: 'R', rot: '-2.5deg', z: 'z-10', ml: '-ml-1.5 xs:-ml-2 sm:-ml-3.5 md:-ml-4', delay: '0.36s', inDelay: '240ms' },
                { ch: 'T', rot: '3.5deg', z: 'z-30', ml: '-ml-1.5 xs:-ml-2 sm:-ml-4 md:-ml-5', delay: '0.54s', inDelay: '300ms' },
                { ch: 'O', rot: '-2deg', z: 'z-20', ml: '-ml-1.5 xs:-ml-2 sm:-ml-4 md:-ml-5', delay: '0.72s', inDelay: '360ms' }
              ].map((item, i) => {
                const isBouncing = bouncedLetter === `p-${i}` || bouncedLetter === 'hero';
                return (
                  <span
                    key={`p-${i}`}
                    className={`inline-block ${item.z} ${item.ml} transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isEntered ? 'opacity-100 translate-y-0 scale-100 blur-none' : 'opacity-0 translate-y-9 scale-90 blur-[4px]'
                    }`}
                    style={{ transitionDelay: isEntered ? item.inDelay : '0ms' }}
                  >
                    <span
                      key={`p-inner-${i}-${isBouncing ? bounceKey : 'idle'}`}
                      onMouseEnter={() => triggerBounce(`p-${i}`)}
                      style={{
                        rotate: item.rot,
                        animation: isBouncing
                          ? 'letterBounce 0.65s cubic-bezier(0.36,0.07,0.19,0.97) both'
                          : `letterFloat 3.2s ease-in-out ${item.delay} infinite`,
                        textShadow:
                          '0 12px 24px rgba(1, 9, 28, 0.72), 0 3px 0 rgba(190, 210, 255, 0.35), 0 0 60px rgba(100, 160, 255, 0.18)'
                      }}
                      className="inline-block"
                    >
                      {item.ch}
                    </span>
                  </span>
                );
              })}
            </div>

            {/* ROW 2: F O L I O (Letter-by-Letter Entrance Stagger) */}
            <div className="flex items-center justify-center font-display font-bold text-white leading-[0.82] tracking-[-0.04em] text-[25vw] xs:text-[26vw] sm:text-[155px] md:text-[200px] lg:text-[245px] -mt-2 xs:-mt-3 sm:-mt-4 md:-mt-5">
              {[
                { ch: 'F', rot: '-3deg', z: 'z-20', ml: '', delay: '0.9s', inDelay: '420ms' },
                { ch: 'O', rot: '3deg', z: 'z-10', ml: '-ml-1.5 xs:-ml-2 sm:-ml-3.5 md:-ml-4', delay: '1.08s', inDelay: '480ms' },
                { ch: 'L', rot: '-3.5deg', z: 'z-30', ml: '-ml-1.5 xs:-ml-2 sm:-ml-3.5 md:-ml-4', delay: '1.26s', inDelay: '540ms' },
                { ch: 'I', rot: '1.5deg', z: 'z-20', ml: '-ml-1 xs:-ml-1.5 sm:-ml-2.5 md:-ml-3', delay: '1.44s', inDelay: '600ms' },
                { ch: 'O', rot: '-2.5deg', z: 'z-30', ml: '-ml-1 xs:-ml-1.5 sm:-ml-2.5 md:-ml-3', delay: '1.62s', inDelay: '660ms' }
              ].map((item, i) => {
                const isBouncing = bouncedLetter === `f-${i}` || bouncedLetter === 'hero';
                return (
                  <span
                    key={`f-${i}`}
                    className={`inline-block ${item.z} ${item.ml} transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                      isEntered ? 'opacity-100 translate-y-0 scale-100 blur-none' : 'opacity-0 translate-y-9 scale-90 blur-[4px]'
                    }`}
                    style={{ transitionDelay: isEntered ? item.inDelay : '0ms' }}
                  >
                    <span
                      key={`f-inner-${i}-${isBouncing ? bounceKey : 'idle'}`}
                      onMouseEnter={() => triggerBounce(`f-${i}`)}
                      style={{
                        rotate: item.rot,
                        animation: isBouncing
                          ? 'letterBounce 0.65s cubic-bezier(0.36,0.07,0.19,0.97) both'
                          : `letterFloat 3.2s ease-in-out ${item.delay} infinite`,
                        textShadow:
                          '0 14px 28px rgba(1, 9, 28, 0.78), 0 3px 0 rgba(190, 210, 255, 0.35), 0 0 60px rgba(100, 160, 255, 0.18)'
                      }}
                      className="inline-block"
                    >
                      {item.ch}
                    </span>
                  </span>
                );
              })}
            </div>
          </div>


          {/* Primary CTA Buttons */}
          <div
            className={`mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto px-2 sm:px-4 transition-all duration-700 ease-out ${
              isEntered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
            }`}
            style={{ transitionDelay: isEntered ? '840ms' : '0ms' }}
          >
            <a
              href="#journey"
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-full bg-[#E2C275] hover:bg-[#F5D98E] text-[#021238] font-bold text-xs sm:text-sm shadow-[0_10px_25px_rgba(0,0,0,0.45)] transition-all hover:-translate-y-0.5 active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <IconCompass className="w-4 h-4 shrink-0" />
              <span>Jelajahi Pengalaman Panitia</span>
            </a>
            <a
              href="#contact"
              className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-full bg-[#6B0F1A] hover:bg-[#8A1422] border border-[#E2C275] text-[#F6DFB0] font-bold text-xs sm:text-sm shadow-[0_10px_25px_rgba(0,0,0,0.45)] transition-all hover:-translate-y-0.5 active:scale-95 text-center cursor-pointer"
            >
              Tertarik Kolaborasi?
            </a>
          </div>
        </div>

        {/* BOTTOM HERO STATUS BAR */}
        <div
          className={`relative z-20 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono-code text-[#E2C275]/90 px-1 sm:px-4 text-center sm:text-left transition-all duration-700 ease-out ${
            isEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: isEntered ? '940ms' : '0ms' }}
        >
          <span>✦ DDM • JASA DESAIN • DOKUMENTASI • OPERATOR LAPANGAN</span>
          <span className="hidden sm:inline"></span>
          <a
            href="#tools"
            className="inline-flex items-center gap-1 text-white hover:text-[#E2C275] transition-colors"
          >
            <span>SCROLL EXPLORE ↓</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
