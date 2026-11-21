import React from 'react';

export const MarqueeRibbon: React.FC = () => {
  return (
    <div className="relative z-20 -mt-3 w-full max-w-full -rotate-1 bg-[#6B0F1A] border-y-2 border-[#E2C275] py-2.5 sm:py-3 overflow-hidden shadow-2xl">
      <div className="animate-marquee flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-mono-code font-bold tracking-wider uppercase text-[#F6DFB0] select-none">
        {[1, 2].map((loop) => (
          <React.Fragment key={loop}>
            <span>✦ DDM KEPANITIAAN</span>
            <span>✦ JASA DESAIN GRAFIS &amp; JOKI PUBLIKASI</span>
            <span>✦ DOKUMENTASI KEGIATAN &amp; FOTO PANGGUNG</span>
            <span>✦ OPERATOR LAPANGAN &amp; LIVE MEDIA</span>
            <span>✦ SISTEM FEED 4:5, POSTER &amp; PRINT IDENTITY</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
