'use client';

import React, { useState, useEffect } from 'react';
import {
  HeroSection,
  MarqueeRibbon,
  ToolsSection,
  JourneySection,
  CertificatesSection,
  WorksSection,
  ContactSection,
  Footer,
  LightboxModal,
  SplashScreen,
  ScrollReveal,
} from '@/components';
import { LightboxItem } from '@/types';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [pageEntered, setPageEntered] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<LightboxItem | null>(null);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // Ensure the page always starts at the top (top: 0) and prevents browser hash jumping
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, []);

  // Prevent scroll during splash screen
  useEffect(() => {
    if (showSplash) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      setPageEntered(true);
    }
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [showSplash]);

  const handleStartExit = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setPageEntered(true);
  };

  const handleFinishSplash = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setPageEntered(true);
    setShowSplash(false);
  };

  const handleCopyHex = (hex: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(hex).catch(() => {});
    }
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxItem(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <main
      id="top"
      style={{ backgroundColor: '#010B24' }}
      className="min-h-screen bg-[#010B24] text-white selection:bg-[#E2C275] selection:text-[#021238] relative"
    >
      {/* Cinematic Art-Deco Wax Seal Splash Screen */}
      {showSplash && (
        <SplashScreen
          onStartExit={handleStartExit}
          onFinish={handleFinishSplash}
        />
      )}

      {/* GLOBAL ATMOSPHERIC LIGHTING & TEXTURE - Eliminates "biru doang" flatness */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-1000 ease-out ${
          pageEntered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        aria-hidden="true"
      >
        {/* Top-Right Burgundy Ambient Bloom behind Tools & Journey */}
        <div className="absolute top-[12%] -right-[15%] w-[750px] h-[750px] rounded-full bg-[#6B0F1A]/25 blur-[160px] pointer-events-none" />
        {/* Mid-Left Golden Amber Ambient Bloom */}
        <div className="absolute top-[36%] -left-[15%] w-[680px] h-[680px] rounded-full bg-[#C6A355]/20 blur-[150px] pointer-events-none" />
        {/* Mid-Right Royal Sapphire Light Core */}
        <div className="absolute top-[58%] -right-[12%] w-[700px] h-[700px] rounded-full bg-[#0047CC]/24 blur-[160px] pointer-events-none" />
        {/* Bottom Warm Crimson/Burgundy & Gold Glow */}
        <div className="absolute bottom-[10%] left-[10%] w-[800px] h-[800px] rounded-full bg-[#6B0F1A]/20 blur-[180px] pointer-events-none" />
        {/* Subtle Luxury Art-Deco Celestial Dot Matrix */}
        <div
          className="absolute inset-0 opacity-[0.045] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #E2C275 1.5px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Hero Section with Staggered Entrance Animation */}
        <HeroSection isEntered={pageEntered} />

        {/* Marquee Ribbon */}
        <ScrollReveal threshold={0.05} distance={20}>
          <MarqueeRibbon />
        </ScrollReveal>

        {/* Section 1: Kesibukan & Senjata Kreatif */}
        <ScrollReveal threshold={0.08} distance={36}>
          <ToolsSection />
        </ScrollReveal>

        {/* Section 2: Peta Jejak Pengalaman Panitia */}
        <ScrollReveal threshold={0.05} distance={40}>
          <JourneySection
            onOpenLightbox={(item) => setLightboxItem(item)}
            onCopyHex={handleCopyHex}
          />
        </ScrollReveal>

        {/* Section 2.5: Arsip Sertifikat Kepanitiaan */}
        <ScrollReveal threshold={0.05} distance={36}>
          <CertificatesSection
            onOpenLightbox={(item) => setLightboxItem(item)}
          />
        </ScrollReveal>

        {/* Section 3: Asymmetric Visual Vault & Galeri Desain */}
        <WorksSection
          onOpenLightbox={(item) => setLightboxItem(item)}
          onCopyHex={handleCopyHex}
        />

        {/* Section 4: Golden Ticket VIP Pass & Neon DB Kolaborasi */}
        <ScrollReveal threshold={0.08} distance={36}>
          <ContactSection />
        </ScrollReveal>

        {/* Footer */}
        <ScrollReveal threshold={0.05} distance={20}>
          <Footer />
        </ScrollReveal>
      </div>

      {/* Global Color Copy Toast */}
      {copiedHex && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-xs font-mono-code text-[#F6DFB0] shadow-2xl animate-fade-in">
          Kode warna {copiedHex} disalin!
        </div>
      )}

      {/* Full-Screen Lightbox Modal */}
      <LightboxModal
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
        onCopyHex={handleCopyHex}
      />
    </main>
  );
}
