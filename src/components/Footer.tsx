import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#C6A355]/30 py-8 px-4 sm:px-8 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-blue-200/75 text-center sm:text-left">
      <div className="flex flex-col xs:flex-row items-center gap-2 sm:gap-2.5">
        <span className="px-3 py-0.5 rounded-full bg-[#6B0F1A] border border-[#C6A355] font-mono-code text-[10px] text-[#F6DFB0] shrink-0">
          ✦ HAN STUDIO ✦
        </span>
        <span>Han Studio — Visual, DDM &amp; Event Photography Portfolio.</span>
      </div>

      <div className="flex items-center gap-2 font-mono-code text-[10px] sm:text-[11px] text-[#E2C275]">
        <a
          href="#top"
          className="hover:underline text-white inline-flex items-center gap-1"
        >
          <span>Kembali ke Atas ↑</span>
        </a>
      </div>
    </footer>
  );
};
