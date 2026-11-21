import { TreasureStop, RouteChapter, CreativeTool, GalleryWork } from '@/types';

export const RAW_COMMITTEE_JOURNEY = [
  {
    code: 'POS 01',
    route: 1,
    year: '2023',
    period: 'Agu — Okt 2023',
    event: 'PKKMB Fakultas Ilmu Komputer',
    role: 'Staff Publikasi & Dokumentasi',
    roleTags: ['foto', 'ddm'],
    summary:
      'Titik awal berlayar di dunia kreatif kepanitiaan. Turun langsung memegang kamera lapangan mengabadikan 600+ mahasiswa baru sekaligus menyusun recap harian.'
  },
  {
    code: 'POS 02',
    route: 1,
    year: '2024',
    period: 'Feb — Apr 2024',
    event: 'Creative Workshop & Tech Talk',
    role: 'Koordinator Lapangan & Foto Event',
    roleTags: ['foto', 'lead'],
    summary:
      'Belokan kedua mengasah ketajaman visual panggung dan tempo publikasi cepat. Mengatur alur liputan pembicara serta live report IG Story.'
  },
  {
    code: 'POS 03',
    route: 1,
    year: '2024',
    period: 'Jun — Nov 2024',
    event: 'HMPSTI — Staf Ahli Medinfo',
    role: 'Staf Ahli Media & Informasi',
    roleTags: ['ddm'],
    summary:
      'Mengawal identitas visual himpunan selama satu periode penuh. Merancang sistem template feed, poster hari besar, hingga perlengkapan cetak pengurus.'
  },
  {
    code: 'POS 04',
    route: 1,
    year: '2024',
    period: 'Okt — Des 2024',
    event: 'Malam Keakraban & Farewell Kabinet',
    role: 'Staff DDM & Stage Documentation',
    roleTags: ['ddm', 'foto'],
    summary:
      'Menutup tahun 2024 dengan produksi aftermovie singkat, photobooth frame, serta dokumentasi malam penghargaan pengurus.'
  },
  {
    code: 'POS 05',
    route: 1,
    year: '2025',
    period: 'Jan 2025 • Q1 Rush',
    event: 'Open Recruitment Pengurus HMPSTI 2025',
    role: 'Lead Designer & Visual Identity',
    roleTags: ['ddm', 'lead'],
    summary:
      'Pembuka rangkaian kegiatan di awal tahun. Merancang key visual oprec, microblog alur pendaftaran, serta poster pengumuman lolos tahap.'
  },
  {
    code: 'POS 06',
    route: 1,
    year: '2025',
    period: 'Feb 2025 • Q1',
    event: 'Upgrading & Rapat Kerja Kabinet 2025',
    role: 'Event & Candid Photographer',
    roleTags: ['foto'],
    summary:
      'Liputan dua hari penuh sesi perumusan program kerja dan malam keakraban pengurus baru dengan tone warna dokumenter hangat.'
  },
  {
    code: 'POS 07',
    route: 2,
    year: '2025',
    period: 'Feb 2025 • Q1',
    event: 'Seminar Nasional Artificial Intelligence',
    role: 'Koordinator Divisi DDM',
    roleTags: ['ddm', 'lead'],
    summary:
      'Mengatur 8 staf DDM untuk memproduksi backdrop LED panggung utama, ID card pembicara nasional, serta countdown feed.'
  },
  {
    code: 'POS 08',
    route: 2,
    year: '2025',
    period: 'Mar 2025 • Q1',
    event: 'UI/UX Design Bootcamp & Challenge',
    role: 'Visual Designer & Mentor Publikasi',
    roleTags: ['ddm'],
    summary:
      'Membangun aset publikasi kompetisi UI/UX tingkat mahasiswa lengkap dengan modul panduan peserta dan sertifikat digital.'
  },
  {
    code: 'POS 09',
    route: 2,
    year: '2025',
    period: 'Mar 2025 • Q1',
    event: 'Buka Bersama & Charity Ramadhan Fest',
    role: 'Dokumentasi & Live IG Story Desk',
    roleTags: ['foto', 'ddm'],
    summary:
      'Mengabadikan momen berbagi takjil dan buka bersama sekaligus merilis poster donasi serta laporan transparansi dana.'
  },
  {
    code: 'POS 10',
    route: 2,
    year: '2025',
    period: 'Apr 2025 • Q2',
    event: 'Studi Banding Antar Himpunan Mahasiswa',
    role: 'Stage & Documentary Photographer',
    roleTags: ['foto'],
    summary:
      'Mendokumentasikan forum diskusi antar-organisasi dan sesi pertukaran plakat dengan pengiriman foto siap unggah di hari yang sama.'
  },
  {
    code: 'POS 11',
    route: 2,
    year: '2025',
    period: 'Apr 2025 • Q2',
    event: 'Company Visit Tech Startup Jakarta',
    role: 'Tim Kreatif & Dokumentasi Perjalanan',
    roleTags: ['foto', 'ddm'],
    summary:
      'Merancang ID card peserta kunjungan industri, banner bus, dan mengabadikan tur kantor perusahaan teknologi.'
  },
  {
    code: 'POS 12',
    route: 2,
    year: '2025',
    period: 'Mei 2025 • Q2',
    event: 'Pelatihan Desain Grafis & Figma Dasar',
    role: 'Pemateri & Penyusun Modul Visual',
    roleTags: ['ddm', 'lead'],
    summary:
      'Berbagi alur kerja Figma untuk kebutuhan DDM kepanitiaan kepada 90+ peserta mahasiswa baru.'
  },
  {
    code: 'POS 13',
    route: 2,
    year: '2025',
    period: 'Jun 2025 • Q2',
    event: 'Dies Natalis & Malam Apresiasi Fakultas',
    role: 'Koordinator Dokumentasi Panggung',
    roleTags: ['foto', 'lead'],
    summary:
      'Mengatur pembagian sudut kamera panggung utama, backstage penampil, dan red carpet tamu undangan.'
  },
  {
    code: 'POS 14',
    route: 3,
    year: '2025',
    period: 'Jul 2025 • Q3 Peak',
    event: 'Pekan Olahraga & Seni Mahasiswa (PORSENI)',
    role: 'Lead DDM & Matchday Photographer',
    roleTags: ['ddm', 'foto', 'lead'],
    summary:
      'Memasuki Q3 Peak Season 2025: merancang scoreboard grafis harian dan memotret aksi cabang olahraga serta pentas seni.'
  },
  {
    code: 'POS 15',
    route: 3,
    year: '2025',
    period: 'Agu 2025 • Q3 Peak',
    event: 'PKKMB Universitas & Fakultas 2025',
    role: 'Kepala Divisi DDM',
    roleTags: ['ddm', 'lead'],
    summary:
      'Memimpin tim besar DDM untuk penyambutan ribuan mahasiswa baru: buku panduan, lanyard panitia, videotron, dan recap harian.'
  },
  {
    code: 'POS 16',
    route: 3,
    year: '2025',
    period: 'Agu 2025 • Q3 Peak',
    event: 'Expo UKM & Komunitas Kampus 2025',
    role: 'Art Director Booth & Visual',
    roleTags: ['ddm'],
    summary:
      'Mendesain dekorasi visual booth pameran, X-banner interaktif, dan kartu stiker merchandise pengunjung.'
  },
  {
    code: 'POS 17',
    route: 3,
    year: '2025',
    period: 'Sep 2025 • Q3 Peak',
    event: 'National Hackathon & Innovation Sprint',
    role: 'Kepala Divisi DDM & Branding',
    roleTags: ['ddm', 'lead'],
    summary:
      'Membangun identitas visual hackathon 48 jam dari nol: poster nasional, twibbon peserta, lanyard marun-emas, hingga layar timer panggung.'
  },
  {
    code: 'POS 18',
    route: 3,
    year: '2025',
    period: 'Sep 2025 • Q3 Peak',
    event: 'Workshop Fotografi Panggung & Lighting',
    role: 'Koordinator Lapangan & Dokumentasi',
    roleTags: ['foto', 'lead'],
    summary:
      'Menyiapkan simulasi pencahayaan panggung sekaligus mendokumentasikan sesi praktik peserta.'
  },
  {
    code: 'POS 19',
    route: 3,
    year: '2025',
    period: 'Okt 2025 • Q4 Rush',
    event: 'Festival Musik & Malam Puncak Kampus',
    role: 'Stage Photographer (Main Stage)',
    roleTags: ['foto'],
    summary:
      'Memotret performa guest star dan band kampus di bawah sorotan lampu panggung dinamis menggunakan lensa bukaan lebar.'
  },
  {
    code: 'POS 20',
    route: 4,
    year: '2025',
    period: 'Okt 2025 • Q4 Rush',
    event: 'Kompetisi Esport & Tech Arena 2025',
    role: 'Motion & Graphic Designer DDM',
    roleTags: ['ddm'],
    summary:
      'Memproduksi template roster tim, bracket turnamen dinamis, dan overlay streaming pertandingan.'
  },
  {
    code: 'POS 21',
    route: 4,
    year: '2025',
    period: 'Nov 2025 • Q4 Rush',
    event: 'Bakti Sosial & Pengabdian Desa Binaan',
    role: 'Tim Dokumentasi & Cerita Visual',
    roleTags: ['foto', 'ddm'],
    summary:
      'Mengabadikan kegiatan mengajar dan pembangunan fasilitas desa dalam format foto esai dokumenter.'
  },
  {
    code: 'POS 22',
    route: 4,
    year: '2025',
    period: 'Nov 2025 • Q4 Rush',
    event: 'Musyawarah Besar & Sidang Pleno Mahasiswa',
    role: 'Koordinator Publikasi & Dokumentasi',
    roleTags: ['ddm', 'foto', 'lead'],
    summary:
      'Mengawal dokumentasi persidangan resmi dan merilis infografis hasil ketetapan musyawarah.'
  },
  {
    code: 'POS 23',
    route: 4,
    year: '2025',
    period: 'Des 2025 • Q4 Finale',
    event: 'Graduation Celebration & Wisuda Periode IV',
    role: 'Lead Photographer & Visual Frame',
    roleTags: ['foto', 'ddm'],
    summary:
      'Menutup rangkaian kepanitiaan tahunan dengan memotret perayaan wisudawan dan merancang frame ucapan resmi.'
  },
  {
    code: 'POS 24',
    route: 4,
    year: '2025',
    period: 'Des 2025 • Q4 Finale',
    event: 'Year-End Creative Archive & Exhibition',
    role: 'Kurator Visual & Desainer Pameran',
    roleTags: ['ddm', 'lead'],
    summary:
      'Menyusun kurasi karya desain dan foto terbaik sepanjang rangkaian kepanitiaan.'
  },
  {
    code: 'POS 25',
    route: 4,
    year: '2026',
    period: '2026 • X Marks The Spot',
    event: 'INNOFAIR & Visual Showcase 2026',
    role: 'Kepala Divisi DDM & Visual Lead',
    roleTags: ['ddm', 'foto', 'lead'],
    summary:
      'Titik X karya terkini. Memimpin divisi DDM dan mengarahkan identitas visual menyeluruh—mulai dari key visual PORTO FOLIO 2026, lanyard, hingga pameran karya.'
  }
];

export const SCENE_ROTATION = ['stage-blue', 'auditorium', 'candid-gold', 'sunset', 'night-desk'];

export const TREASURE_STOPS: TreasureStop[] = RAW_COMMITTEE_JOURNEY.map((item, idx) => {
  const num = idx + 1;
  const latMin = 58 - Math.floor(idx / 2);
  const lngMin = 30 + (idx % 15);
  return {
    ...item,
    id: `pos-${String(num).padStart(2, '0')}`,
    number: num,
    marker:
      num === 1
        ? 'START'
        : num === RAW_COMMITTEE_JOURNEY.length
        ? 'X'
        : String(num).padStart(2, '0'),
    coord: `07°${String(latMin).padStart(2, '0')}′S 112°${String(lngMin).padStart(2, '0')}′E`,
    photos: [
      {
        id: `p${num}-1`,
        title: `Briefing & Setup ${item.event}`,
        meta: '07:30 WIB • 35mm f/2.0',
        caption: `Koordinasi tim lapangan dan pengecekan sudut visual sebelum ${item.event} dimulai.`,
        scene: SCENE_ROTATION[idx % 5]
      },
      {
        id: `p${num}-2`,
        title: 'Momen Utama Panggung & Sesi Inti',
        meta: '10:15 WIB • 50mm f/1.8',
        caption: `Dokumentasi jalannya rangkaian acara utama pada ${item.event}.`,
        scene: SCENE_ROTATION[(idx + 1) % 5]
      },
      {
        id: `p${num}-3`,
        title: 'Candid Panitia & Interaksi Peserta',
        meta: '13:20 WIB • 50mm',
        caption: 'Ekspresi natural panitia dan antusiasme peserta di lokasi kegiatan.',
        scene: SCENE_ROTATION[(idx + 2) % 5]
      },
      {
        id: `p${num}-4`,
        title: 'Golden Hour & Suasana Venue',
        meta: '16:45 WIB • 24mm Wide',
        caption: 'Atmosfer pencahayaan sore menjelang penutupan rangkaian acara.',
        scene: SCENE_ROTATION[(idx + 3) % 5]
      },
      {
        id: `p${num}-5`,
        title: 'Live Desk Culling & Foto Tim',
        meta: '20:30 WIB • Basecamp',
        caption: 'Kurasi foto terbaik hari itu bersama rekan divisi DDM & dokumentasi.',
        scene: SCENE_ROTATION[(idx + 4) % 5]
      }
    ],
    outputs: [
      {
        id: `o${num}-1`,
        title: `${item.event} — Key Visual & Feed 4:5`,
        type: 'Social Media Grid',
        dim: '1080 × 1350',
        tools: ['Figma', 'Lightroom'],
        colors: ['#0038A8', '#E2C275', '#FFFFFF'],
        art: 'feed-recap'
      },
      {
        id: `o${num}-2`,
        title: 'Poster Resmi & Story Announcement',
        type: 'Event Poster 9:16',
        dim: '1080 × 1920',
        tools: ['Illustrator', 'Photoshop'],
        colors: ['#6B0F1A', '#E2C275', '#021542'],
        art: 'poster-vertical'
      },
      {
        id: `o${num}-3`,
        title: 'Lanyard, ID Card & Stage Visual',
        type: 'Identity & Print',
        dim: '900 × 45 mm',
        tools: ['Illustrator', 'Figma'],
        colors: ['#6B0F1A', '#C6A355', '#0038A8'],
        art: num % 2 === 0 ? 'cover-banner' : 'lanyard-print'
      }
    ]
  };
});

export const ROUTE_CHAPTERS: RouteChapter[] = [
  { id: 1, label: 'Fase 1: Langkah Awal', range: 'Awal Perjalanan' },
  { id: 2, label: 'Fase 2: Eksplorasi DDM', range: 'Kreativitas & Media' },
  { id: 3, label: 'Fase 3: Puncak Acara', range: 'Event Besar & Panggung' },
  { id: 4, label: 'Fase 4: Showcase Terkini', range: 'Proyek Terkini' }
];

export const CREATIVE_TOOLS: CreativeTool[] = [
  {
    id: 'figma',
    abbr: 'Fg',
    name: 'Figma',
    category: 'DDM System & UI/UX',
    usage: '98%',
    highlight: 'Sistem Feed 4:5, Poster & Live Team Collaboration',
    desc: 'Senjata utama untuk membangun sistem template media sosial kepanitiaan, komponen reusable, dan prototipe UI/UX.',
    tilt: '-2deg'
  },
  {
    id: 'lightroom',
    abbr: 'Lr',
    name: 'Adobe Lightroom',
    category: 'Photo Culling & Grading',
    usage: '95%',
    highlight: 'Preset Warna Acara & Kurasi Ratusan Foto RAW',
    desc: 'Mengolah ratusan foto dokumentasi lapangan secara cepat agar tone warna panggung dan candid tetap seragam.',
    tilt: '2.5deg'
  },
  {
    id: 'illustrator',
    abbr: 'Ai',
    name: 'Adobe Illustrator',
    category: 'Vector, Logo & Print',
    usage: '92%',
    highlight: 'Logo Acara, Lanyard, ID Card & Backdrop Besar',
    desc: 'Mengerjakan aset vektor tajam siap cetak skala besar, pola Art-Deco, lanyard panitia, dan identitas visual event.',
    tilt: '-1.5deg'
  },
  {
    id: 'photoshop',
    abbr: 'Ps',
    name: 'Adobe Photoshop',
    category: 'Key Visual & Manipulation',
    usage: '90%',
    highlight: 'Key Visual Poster, Cutout 3D Type & Retouching',
    desc: 'Komposisi poster utama, efek tipografi bertumpuk, pencahayaan dramatis, serta retouching potret pembicara.',
    tilt: '2deg'
  },
  {
    id: 'capcut',
    abbr: 'Cc',
    name: 'CapCut Desktop',
    category: 'Aftermovie & Reels',
    usage: '86%',
    highlight: 'Teaser Panggung, Bumper & Video Recap Event',
    desc: 'Menyunting video recap cepat berirama dinamis untuk kebutuhan publikasi Instagram Reels dan bumper acara.',
    tilt: '-2.5deg'
  },
  {
    id: 'camera',
    abbr: '35mm',
    name: 'Field Camera & Prime Kit',
    category: 'Stage & Low-Light Gear',
    usage: 'Ready',
    highlight: 'Lensa Bukaan Lebar f/1.8 — f/2.0 untuk Panggung',
    desc: 'Siap menghadapi kondisi cahaya panggung yang kontras maupun liputan dokumenter outdoor tanpa kehilangan momen.',
    tilt: '1.5deg'
  }
];

export const GALLERY_WORKS: GalleryWork[] = [
  {
    id: 'w-01',
    title: 'PORTO FOLIO — Royal Sunburst Master',
    category: 'poster',
    categoryLabel: 'Event Poster',
    committee: 'INNOFAIR',
    spanClass: 'md:col-span-7',
    aspectClass: 'aspect-[16/10]',
    dim: '1920 × 1080 px',
    tools: ['Figma', 'Illustrator', 'Photoshop'],
    colors: ['#0038A8', '#021238', '#C6A355', '#6B0F1A', '#FFFFFF'],
    desc: 'Key visual utama dengan latar sinar radial biru royal, bingkai Art-Deco emas ganda, lencana marun vertikal, dan tipografi 3D bertumpuk.',
    art: 'cover-banner'
  },
  {
    id: 'w-02',
    title: 'INNOFAIR Exhibition — Editorial Feed 4:5',
    category: 'feed',
    categoryLabel: 'Social Media Feed',
    committee: 'INNOFAIR 2026',
    spanClass: 'md:col-span-5',
    aspectClass: 'aspect-[4/4]',
    dim: '1080 × 1350 px',
    tools: ['Figma', 'Lightroom'],
    colors: ['#0038A8', '#FFFFFF', '#C6A355'],
    desc: 'Sistem microblog dan pengumuman pembicara dengan tata letak bersih, hirarki tipografi tegas, dan aksen garis emas.',
    art: 'feed-recap'
  },
  {
    id: 'w-03',
    title: 'National Tech Hackathon — Call For Participants',
    category: 'poster',
    categoryLabel: 'Event Poster',
    committee: 'HMPSTI',
    spanClass: 'md:col-span-4',
    aspectClass: 'aspect-[3/4]',
    dim: '1080 × 1920 px',
    tools: ['Illustrator', 'Photoshop'],
    colors: ['#6B0F1A', '#E2C275', '#021542'],
    desc: 'Poster vertikal pendaftaran kompetisi berskala nasional dengan kombinasi marun royal dan bingkai klasik modern.',
    art: 'poster-vertical'
  },
  {
    id: 'w-04',
    title: 'Auditorium Keynote & Stage Spotlight',
    category: 'photography',
    categoryLabel: 'Event Photography',
    committee: 'Creative Workshop',
    spanClass: 'md:col-span-8',
    aspectClass: 'aspect-[16/10]',
    dim: '6000 × 4000 px • 35mm f/2.0',
    tools: ['Adobe Lightroom'],
    colors: ['#021542', '#C6A355', '#F8FAFC'],
    desc: 'Dokumentasi panggung utama seminar nasional menangkap sorotan lampu panggung dan ekspresi pembicara.',
    art: 'photo-stage'
  },
  {
    id: 'w-05',
    title: 'Golden Hour Campus Closing Series',
    category: 'photography',
    categoryLabel: 'Event Photography',
    committee: 'PKKMB Fakultas',
    spanClass: 'md:col-span-6',
    aspectClass: 'aspect-[16/10]',
    dim: '6000 × 4000 px • 50mm f/1.8',
    tools: ['Adobe Lightroom'],
    colors: ['#7C2D12', '#E2C275', '#FEF3C7'],
    desc: 'Rangkaian foto dokumenter penutupan acara luar ruang dengan profil warna hangat sinematik.',
    art: 'photo-sunset'
  }
];
