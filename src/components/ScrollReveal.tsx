'use client';

import React, { useRef, useState, useEffect } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  threshold?: number;
  direction?: 'up' | 'down' | 'none';
  distance?: number;
}

/**
 * ScrollReveal — Wrapper komponen untuk animasi Scroll In & Scroll Out interaktif
 * 
 * - Memicu animasi masuk (slide up, scale, fade in, unblur) saat elemen memasuki viewport.
 * - Memicu animasi keluar (fade out, slide down, subtle scale) saat elemen dilewati / keluar viewport.
 * - Otomatis menghormati prefers-reduced-motion untuk aksesibilitas WCAG.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delayMs = 0,
  threshold = 0.08,
  direction = 'up',
  distance = 32,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold,
        rootMargin: '-20px 0px -20px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, prefersReducedMotion]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const hiddenTransform =
    direction === 'up'
      ? `translateY(${distance}px) scale(0.97)`
      : direction === 'down'
      ? `translateY(-${distance}px) scale(0.97)`
      : 'scale(0.96)';

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: '700ms',
        transitionDelay: isVisible ? `${delayMs}ms` : '0ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isVisible ? 'none' : hiddenTransform,
        opacity: isVisible ? 1 : 0,
        filter: isVisible ? 'blur(0px)' : 'blur(1.5px)',
      }}
      className={`transition-all will-change-[opacity,transform] ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
