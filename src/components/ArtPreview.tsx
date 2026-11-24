import React from 'react';
import Image from 'next/image';

interface ArtPreviewProps {
  type: string;
  title?: string;
  meta?: string;
  fit?: 'cover' | 'contain';
  position?: 'top' | 'center' | 'bottom';
  className?: string;
}

export const ArtPreview: React.FC<ArtPreviewProps> = ({
  type,
  title,
  meta,
  fit = 'cover',
  position = 'center',
  className = ''
}) => {
  // If type is a direct image path or URL
  if (
    type &&
    (type.startsWith('/') ||
      type.startsWith('http://') ||
      type.startsWith('https://') ||
      type.match(/\.(png|jpe?g|svg|webp|gif|avif)/i))
  ) {
    const isSvg = type.includes('.svg');
    const posClass =
      position === 'top'
        ? 'object-top'
        : position === 'bottom'
        ? 'object-bottom'
        : 'object-center';
    const fitClass = fit === 'contain' ? 'object-contain' : 'object-cover';

    return (
      <div className="w-full h-full relative overflow-hidden bg-[#021238] flex items-center justify-center">
        {isSvg ? (
          <img
            src={type}
            alt={title || 'Preview'}
            loading="lazy"
            decoding="async"
            className={`w-full h-full ${fitClass} ${posClass} ${className}`}
          />
        ) : (
          <Image
            src={type}
            alt={title || 'Preview'}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            quality={80}
            className={`${fitClass} ${posClass} ${className}`}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  switch (type) {
    case 'cover-banner': {
      const rays = Array.from({ length: 24 }, (_, i) => i * 15);
      return (
        <div
          className="w-full h-full relative overflow-hidden flex items-center justify-center p-4"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, #0047CC 0%, #002B80 55%, #021238 100%)'
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 400 240"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full opacity-35"
          >
            <g transform="translate(200,120)">
              {rays.map((a, idx) => (
                <polygon
                  key={idx}
                  points="0,0 -12,-280 12,-280"
                  fill={idx % 2 === 0 ? '#1E6BFF' : '#021238'}
                  transform={`rotate(${a})`}
                />
              ))}
            </g>
          </svg>
          <div className="absolute inset-2.5 rounded-2xl border border-[#C6A355]" />
          <div className="relative z-10 text-center font-display font-bold text-white text-2xl sm:text-4xl leading-[0.84] tracking-tight drop-shadow-[0_6px_14px_rgba(0,0,0,0.65)]">
            <div>PORTO</div>
            <div>FOLIO</div>
          </div>
        </div>
      );
    }
    case 'feed-recap':
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#0038A8] to-[#021542] p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-2 rounded-xl border border-[#C6A355]/60 pointer-events-none" />
          <div className="flex items-center justify-between text-[10px] font-mono-code text-[#E2C275] z-10">
            <span>✦ SERIES 4:5</span>
            <span>1080×1350</span>
          </div>
          <div className="my-auto z-10 px-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#6B0F1A] border border-[#C6A355] text-[9px] font-mono-code text-[#F6DFB0] mb-2">
              DDM VISUAL SYSTEM
            </span>
            <p className="font-display font-bold text-white text-base sm:text-lg leading-snug">
              {title || 'Editorial Grid & Carousel'}
            </p>
          </div>
          <div className="text-[10px] font-mono-code text-blue-200/80 z-10">
            HAN STUDIO ARCHIVE
          </div>
        </div>
      );
    case 'poster-vertical':
      return (
        <div className="w-full h-full bg-gradient-to-b from-[#6B0F1A] via-[#4A0A12] to-[#021542] p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-2 rounded-xl border border-[#E2C275]/75 pointer-events-none" />
          <div className="text-[10px] font-mono-code text-[#E2C275] flex justify-between z-10">
            <span>POSTER 9:16</span>
            <span>✦ ARCHIVE ✦</span>
          </div>
          <div className="my-auto text-center z-10 px-2">
            <p className="font-display font-bold text-white text-lg sm:text-xl leading-tight uppercase tracking-tight drop-shadow">
              {title || 'EVENT POSTER'}
            </p>
            <p className="text-[10px] font-mono-code text-[#F6DFB0] mt-1.5">
              OFFICIAL KEY VISUAL
            </p>
          </div>
          <div className="text-center text-[9px] font-mono-code text-[#E2C275]/80 z-10">
            1080 × 1920 PX
          </div>
        </div>
      );
    case 'lanyard-print':
      return (
        <div className="w-full h-full bg-[#031338] p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-2 rounded-xl border border-[#C6A355]/50 pointer-events-none" />
          <span className="text-[10px] font-mono-code text-[#E2C275] z-10">
            ✦ PRINT &amp; LANYARD KIT
          </span>
          <div className="my-auto space-y-2.5 z-10">
            <div className="h-7 rounded-full bg-[#6B0F1A] border border-[#E2C275] px-3.5 flex items-center justify-between text-[10px] font-mono-code text-[#F6DFB0] shadow">
              <span>✦ CREATIVE ✦</span>
              <span className="font-bold">ALL ACCESS DDM</span>
              <span>✦ VIP ✦</span>
            </div>
            <div className="h-7 rounded-full bg-[#0038A8] border border-[#C6A355] px-3.5 flex items-center justify-between text-[10px] font-mono-code text-white shadow">
              <span>COMMITTEE</span>
              <span>INNOFAIR</span>
            </div>
          </div>
          <span className="text-[9px] font-mono-code text-blue-200/70 z-10">
            900 × 45 MM • CMYK READY
          </span>
        </div>
      );
    case 'photo-stage':
    case 'stage-blue':
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#0038A8] via-[#041845] to-[#01091C] p-3.5 flex flex-col justify-between relative overflow-hidden">
          <div
            className="absolute -top-10 right-0 w-36 h-36 rounded-full opacity-40 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #E2C275 0%, transparent 70%)'
            }}
          />
          <span className="text-[9px] font-mono-code text-[#E2C275] z-10">
            {meta || '35MM • F/2.0'}
          </span>
          <div className="z-10">
            <p className="text-xs font-bold text-white line-clamp-1">
              {title || 'Stage Documentary'}
            </p>
            <p className="text-[10px] text-blue-200/75">Raw Color Graded</p>
          </div>
        </div>
      );
    case 'photo-sunset':
    case 'sunset':
      return (
        <div className="w-full h-full bg-gradient-to-tr from-[#450A0A] via-[#9A3412] to-[#D97706] p-3.5 flex flex-col justify-between relative overflow-hidden">
          <span className="text-[9px] font-mono-code text-amber-200 z-10">
            {meta || '50MM • F/1.8'}
          </span>
          <div className="z-10">
            <p className="text-xs font-bold text-white line-clamp-1">
              {title || 'Golden Hour Frame'}
            </p>
            <p className="text-[10px] text-amber-100/80">Warm Film Tone</p>
          </div>
        </div>
      );
    case 'auditorium':
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#0A2563] via-[#06153A] to-[#020817] p-3.5 flex flex-col justify-between relative overflow-hidden">
          <span className="text-[9px] font-mono-code text-sky-300 z-10">
            {meta || '24MM • WIDE'}
          </span>
          <div className="z-10">
            <p className="text-xs font-bold text-white line-clamp-1">
              {title || 'Auditorium Session'}
            </p>
            <p className="text-[10px] text-slate-300">Event Documentation</p>
          </div>
        </div>
      );
    case 'candid-gold':
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#6B0F1A] via-[#2C0B1E] to-[#04153B] p-3.5 flex flex-col justify-between relative overflow-hidden">
          <span className="text-[9px] font-mono-code text-[#E2C275] z-10">
            {meta || '50MM • PORTRAIT'}
          </span>
          <div className="z-10">
            <p className="text-xs font-bold text-white line-clamp-1">
              {title || 'Candid Crew Moment'}
            </p>
            <p className="text-[10px] text-rose-100/80">Editorial Portrait</p>
          </div>
        </div>
      );
    case 'night-desk':
    default:
      return (
        <div className="w-full h-full bg-gradient-to-br from-[#071D4E] via-[#030F2B] to-[#090D16] p-3.5 flex flex-col justify-between relative overflow-hidden">
          <span className="text-[9px] font-mono-code text-[#C6A355] z-10">
            {meta || 'LIVE DESK'}
          </span>
          <div className="z-10">
            <p className="text-xs font-bold text-white line-clamp-1">
              {title || 'Media & Culling Desk'}
            </p>
            <p className="text-[10px] text-blue-200/75">Same-Day Workflow</p>
          </div>
        </div>
      );
  }
};
