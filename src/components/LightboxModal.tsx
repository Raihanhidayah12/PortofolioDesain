'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IconX } from './icons';
import { ArtPreview } from './ArtPreview';
import { LightboxItem } from '@/types';

interface LightboxModalProps {
  item: LightboxItem | null;
  onClose: () => void;
  onCopyHex: (hex: string) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  item,
  onClose,
  onCopyHex,
}) => {
  const [activeItem, setActiveItem] = useState<LightboxItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isClosingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (item) {
      isClosingRef.current = false;
      setActiveItem(item);
      // Double requestAnimationFrame ensures initial closed scale/opacity renders first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsOpen(true);
        });
      });
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else if (activeItem && isOpen) {
      handleClose();
    }
  }, [item]);

  const handleClose = () => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    setIsOpen(false);

    // Wait for the smooth 300ms exit animation to finish before unmounting
    setTimeout(() => {
      setActiveItem(null);
      isClosingRef.current = false;
      // Only unlock scroll if no other modal (like Journey waypoint modal) is open
      const hasOtherOpenModal = document.querySelectorAll('[role="dialog"]').length > 1;
      if (!hasOtherOpenModal) {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
      }
      onClose();
    }, 320);
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeItem && isOpen) {
        e.preventDefault();
        e.stopImmediatePropagation();
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [activeItem, isOpen]);

  if (!mounted || !activeItem) return null;

  const isImageArt = Boolean(
    activeItem.art &&
      (activeItem.art.startsWith('/') ||
        activeItem.art.startsWith('http://') ||
        activeItem.art.startsWith('https://') ||
        activeItem.art.match(/\.(png|jpe?g|svg|webp|gif)/i))
  );
  const rawImage = activeItem.imageUrl || (isImageArt ? activeItem.art : null);
  const imageSrc = rawImage && !rawImage.toLowerCase().includes('.pdf') ? rawImage : null;

  const pdfSrc =
    (activeItem.credentialUrl && activeItem.credentialUrl.toLowerCase().includes('.pdf') ? activeItem.credentialUrl : null) ||
    (activeItem.imageUrl && activeItem.imageUrl.toLowerCase().includes('.pdf') ? activeItem.imageUrl : null) ||
    (activeItem.art && activeItem.art.toLowerCase().includes('.pdf') ? activeItem.art : null);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={activeItem.title}
      onClick={handleClose}
      className={`fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 transition-all duration-300 ease-out ${
        isOpen
          ? 'bg-[#01091F]/90 backdrop-blur-md opacity-100'
          : 'bg-[#01091F]/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`max-w-2xl w-full max-h-[94dvh] flex flex-col rounded-[24px] sm:rounded-[30px] bg-[#041A4D] border-2 border-[#E2C275] overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.7)] transition-all duration-300 ${
          isOpen
            ? 'scale-100 translate-y-0 opacity-100'
            : 'scale-[0.88] translate-y-8 opacity-0'
        }`}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-[#021238] border-b border-[#C6A355]/40 flex items-center justify-between shrink-0">
          <span className="text-[10px] sm:text-[11px] font-mono-code text-[#E2C275] truncate mr-2">
            {activeItem.subtitle}
          </span>
          <button
            onClick={handleClose}
            aria-label="Tutup Detail"
            className="p-1.5 rounded-full bg-[#6B0F1A] border border-[#C6A355] text-[#F6DFB0] cursor-pointer hover:bg-[#8A1422] transition-all hover:scale-110 active:scale-95 shrink-0"
          >
            <IconX className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-3.5 sm:space-y-4 overflow-y-auto no-scrollbar">
          {imageSrc ? (
            <div className="w-full max-h-[58vh] sm:max-h-[66vh] rounded-xl sm:rounded-2xl overflow-hidden border border-[#C6A355]/60 shrink-0 shadow-inner bg-[#01091F] flex items-center justify-center p-2 relative">
              <img
                src={imageSrc}
                alt={activeItem.title}
                className={`max-w-full max-h-[54vh] sm:max-h-[62vh] w-auto h-auto object-contain rounded-lg drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)] transition-transform duration-500 ease-out ${
                  isOpen ? 'scale-100' : 'scale-95'
                }`}
              />
            </div>
          ) : (
            <div className="aspect-[16/10] max-h-[44vh] w-full rounded-xl sm:rounded-2xl overflow-hidden border border-[#C6A355] shrink-0 shadow-inner bg-[#010B24] flex items-center justify-center">
              <div
                className={`w-full h-full transition-transform duration-500 ease-out flex items-center justify-center ${
                  isOpen ? 'scale-100' : 'scale-95'
                }`}
              >
                <ArtPreview
                  type={activeItem.art || 'minimal-card'}
                  title={activeItem.title}
                  meta={activeItem.meta}
                />
              </div>
            </div>
          )}

          <div>
            <h3 className="font-display font-bold text-lg sm:text-xl text-white">
              {activeItem.title}
            </h3>
            {activeItem.desc && (
              <p className="text-xs sm:text-sm text-blue-100/85 mt-1 sm:mt-1.5 leading-relaxed">
                {activeItem.desc}
              </p>
            )}

            <div className="mt-3.5 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono-code text-[#E2C275]">
              <span className="truncate">{activeItem.meta}</span>
              {activeItem.credentialUrl && (
                <a
                  href={activeItem.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 rounded-full bg-[#E2C275] text-[#021238] font-bold flex items-center gap-1.5 hover:bg-[#F5D98E] transition-colors"
                >
                  <span>Buka Kredensial / PDF ↗</span>
                </a>
              )}
              {activeItem.colors && (
                <div className="flex flex-wrap gap-1.5">
                  {activeItem.colors.map((hex) => (
                    <button
                      key={hex}
                      onClick={() => onCopyHex(hex)}
                      title={`Salin ${hex}`}
                      className="px-2.5 py-1 rounded-full bg-[#021238] border border-[#C6A355] text-[#F6DFB0] flex items-center gap-1.5 cursor-pointer hover:border-[#E2C275] transition-all hover:scale-105 active:scale-95"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: hex }}
                      />
                      <span>{hex}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LightboxModal;
