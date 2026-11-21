# HAN STUDIO — PORTO FOLIO 2026

Portofolio Desain Visual, Pengalaman Panitia & DDM, Event Photography, dan UI/UX Design dengan tema **Art-Deco Royal Blue & Gold**. Dibangun menggunakan **Next.js (App Router)**, **React**, **TypeScript**, **Tailwind CSS**, dan **Neon Serverless Postgres Database**.

---

## 🌟 Fitur Utama Website

1. **Poster Interaktif 3D 'PORTO FOLIO' Hero**:
   - Efek latar belakang *sunburst radial rays* berputar dinamis.
   - Bingkai ganda *Art-Deco* emas (`#C6A355`, `#E2C275`) dengan medali vertikal marun (`#6B0F1A`) bertuliskan `✦ 2 0 2 6 ✦`.
   - Huruf 3D interaktif yang merespons pergerakan kursor mouse (*perspective tilt*) dan efek pantulan (*letter bounce*) saat disentuh atau diklik.
   - Navigasi melayang kaca (*floating glass pill navbar*).

2. **Pita Marquee Miring Emas & Marun**:
   - Teks berjalan dinamis (*Visual Direction*, *DDM Pengalaman Panitia*, *Event Photography*, *Social Media Feed 4:5*, *UI/UX Design*).

3. **Kesibukan & Senjata Kreatif (`#tools`)**:
   - Status fokus terkini: *Kepala Divisi DDM & Art Direction*, *Event & Stage Photographer*, *UI/UX & Visual Brand Kit*.
   - Kartu tool interaktif miring (*tactile tilted badges*) untuk Figma, Adobe Lightroom, Illustrator, Photoshop, CapCut Desktop, dan Field Camera 35mm.

4. **Peta Jejak Pengalaman Panitia (`#journey`)**:
   - Jejak lengkap rangkaian **pengalaman panitia** dari awal perjalanan hingga showcase terkini.
   - Radar checkpoint interaktif untuk melompat langsung ke pos event yang dipilih.
   - Jalur *S-curve* berkelok dinamis SVG bertekstur peta topografi bahari.
   - Showcase mendalam tiap pos: **foto dokumentasi polaroid** dan **karya desain DDM siap cetak/feed** dengan palet warna yang bisa disalin (*copy-to-clipboard*).

5. **Asymmetric Visual Vault & Galeri Desain (`#works`)**:
   - Tata letak *Bento Grid 12-kolom* editorial untuk karya: Poster Acara, Social Media Feed 4:5, Identitas Lanyard/Print, dan Fotografi Panggung.
   - Filter kategori dinamis dan ekstraksi kode warna HEX langsung.

6. **Golden Ticket VIP Pass Kolaborasi & Terhubung Neon Database (`#contact`)**:
   - Bentuk tiket VIP fisik dengan takik samping (*side notches*) dan garis sobek (*tear-off dashed line*).
   - Pemilih peran kolaborasi (*Rekrut DDM*, *Booking Fotografer*, *Desain Feed/Poster*, *Project UI/UX*).
   - **Terhubung Langsung ke Neon Postgres**: Tombol "Simpan ke Neon DB" menyimpan pesan dan email pengirim secara *real-time* ke tabel `inquiries` di Neon Serverless Postgres.
   - Fitur "Salin Pesan" dan "Kirim Email Langsung".

7. **Full-Screen Lightbox Modal**:
   - Klik pada foto dokumentasi atau karya desain untuk memperbesar dengan tampilan detail, metadata resolusi/kamera, dan palet warna.

---

## 🛠️ Tech Stack & Database

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Library UI**: [React](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & PostCSS
- **Database**: [Neon](https://neon.tech/) Serverless Postgres via `@neondatabase/serverless`
- **Typography**: Google Fonts (*Fredoka*, *Plus Jakarta Sans*, *Space Mono*)

---

## 📂 Struktur Direktori Bersih & Modular

```
d:\MyPorto/
├── public/                 # Favicon dan aset statis
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── inquiries/  # Serverless API route untuk Neon Postgres
│   │   │       └── route.ts
│   │   ├── globals.css     # Tailwind directives, fonts, & keyframe animations
│   │   ├── layout.tsx      # Root layout, metadata & viewport
│   │   └── page.tsx        # Halaman utama ringkas & modular
│   ├── components/
│   │   ├── icons/          # Koleksi Icon SVG self-contained
│   │   │   └── index.tsx
│   │   ├── ArtPreview.tsx  # Renderer artwork SVG custom (tanpa broken image)
│   │   ├── HeroSection.tsx # Hero 3D interactive poster & floating navbar
│   │   ├── MarqueeRibbon.tsx# Pita berjalan diagonal marun & emas
│   │   ├── ToolsSection.tsx# Kesibukan 2026 & dock tools miring
│   │   ├── JourneySection.tsx # Peta pengalaman panitia, polaroid & karya DDM
│   │   ├── WorksSection.tsx# Bento grid visual vault & color swatches
│   │   ├── ContactSection.tsx # VIP Pass kolaborasi terhubung ke Neon DB
│   │   ├── Footer.tsx      # Footer & link navigasi
│   │   ├── LightboxModal.tsx # Modal perbesar gambar & karya
│   │   └── index.ts        # Re-export clean barrel
│   ├── data/
│   │   └── portfolioData.ts# Seluruh data pos kepanitiaan, tools, & galeri
│   ├── lib/
│   │   └── db.ts           # Koneksi driver Neon Serverless SQL helper
│   └── types/
│       └── index.ts        # Interface TypeScript terstruktur
├── tailwind.config.js      # Konfigurasi Tailwind & extended typography
├── postcss.config.mjs      # PostCSS config
├── .env.local              # Kredensial koneksi Neon Postgres
└── package.json
```

---

## ⚡ Cara Menjalankan

```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).
