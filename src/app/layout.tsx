import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#010B24',
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: 'HAN STUDIO — PORTO FOLIO (DDM, Desain, Dokumentasi & Operator)',
  description:
    'Portofolio Kreatif & Pengalaman Kepanitiaan Han Studio — Spesialisasi DDM Event, Jasa Desain Grafis, Dokumentasi Kegiatan & Event Photography, serta Operator Lapangan.',
  keywords: [
    'Han Studio',
    'DDM Kepanitiaan',
    'Jasa Desain Grafis',
    'Joki Desain',
    'Dokumentasi Kegiatan',
    'Event Photography',
    'Operator Lapangan Acara',
    'Pengalaman Panitia',
    'Poster Design',
    'Social Media Feed 4:5',
    'PORTO FOLIO',
  ],
  authors: [{ name: 'Han' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark bg-[#010B24]" style={{ backgroundColor: '#010B24', colorScheme: 'dark' }}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="color-scheme" content="dark" />
        <meta name="theme-color" content="#010B24" />
      </head>
      <body className="bg-[#010B24] text-white selection:bg-[#E2C275] selection:text-[#021238]" style={{ backgroundColor: '#010B24' }}>
        {children}
      </body>
    </html>
  );
}
