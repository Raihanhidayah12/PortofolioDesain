'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { CreativeTool, TreasureStop, GalleryWork, CertificateItem, PhotoItem, OutputItem } from '@/types';
import { ArtPreview } from '@/components/ArtPreview';
import { notifyPortfolioUpdate } from '@/lib/usePortfolioSync';

interface Inquiry {
  id: number;
  role: string;
  sender_email: string;
  message: string;
  created_at: string;
}

// Brand accent colors matching the portfolio aesthetic
const TOOL_ACCENTS: Record<
  string,
  { border: string; glow: string; badgeBg: string; badgeText: string; barColor: string }
> = {
  figma: {
    border: 'border-[#F24E1E]/50 hover:border-[#F24E1E]',
    glow: 'hover:shadow-[0_8px_30px_rgba(242,78,30,0.25)]',
    badgeBg: 'bg-[#2A0E12] border-[#F24E1E]/60',
    badgeText: 'text-[#F24E1E]',
    barColor: 'bg-gradient-to-r from-[#F24E1E] to-[#E2C275]',
  },
  lightroom: {
    border: 'border-[#31A8FF]/50 hover:border-[#31A8FF]',
    glow: 'hover:shadow-[0_8px_30px_rgba(49,168,255,0.25)]',
    badgeBg: 'bg-[#071833] border-[#31A8FF]/60',
    badgeText: 'text-[#31A8FF]',
    barColor: 'bg-gradient-to-r from-[#31A8FF] to-[#E2C275]',
  },
  illustrator: {
    border: 'border-[#FF9A00]/50 hover:border-[#FF9A00]',
    glow: 'hover:shadow-[0_8px_30px_rgba(255,154,0,0.25)]',
    badgeBg: 'bg-[#281702] border-[#FF9A00]/60',
    badgeText: 'text-[#FF9A00]',
    barColor: 'bg-gradient-to-r from-[#FF9A00] to-[#E2C275]',
  },
  photoshop: {
    border: 'border-[#00C8FF]/50 hover:border-[#00C8FF]',
    glow: 'hover:shadow-[0_8px_30px_rgba(0,200,255,0.25)]',
    badgeBg: 'bg-[#031D38] border-[#00C8FF]/60',
    badgeText: 'text-[#00C8FF]',
    barColor: 'bg-gradient-to-r from-[#00C8FF] to-[#E2C275]',
  },
  capcut: {
    border: 'border-[#A855F7]/50 hover:border-[#A855F7]',
    glow: 'hover:shadow-[0_8px_30px_rgba(168,85,247,0.25)]',
    badgeBg: 'bg-[#200A38] border-[#A855F7]/60',
    badgeText: 'text-[#C084FC]',
    barColor: 'bg-gradient-to-r from-[#A855F7] to-[#E2C275]',
  },
  camera: {
    border: 'border-[#E2C275]/50 hover:border-[#E2C275]',
    glow: 'hover:shadow-[0_8px_30px_rgba(226,194,117,0.25)]',
    badgeBg: 'bg-[#261E08] border-[#E2C275]/60',
    badgeText: 'text-[#E2C275]',
    barColor: 'bg-gradient-to-r from-[#C6A355] to-[#E2C275]',
  },
};

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<{ email: string; name: string } | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Active Tab & Mobile Drawer
  const [activeTab, setActiveTab] = useState<'tools' | 'journey' | 'certificates' | 'gallery' | 'photography' | 'inquiries'>('tools');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [journeyRouteFilter, setJourneyRouteFilter] = useState<number | 'all'>('all');
  const [galleryCategoryFilter, setGalleryCategoryFilter] = useState<string>('all');
  const [certificateCategoryFilter, setCertificateCategoryFilter] = useState<string>('all');

  // Data States
  const [tools, setTools] = useState<CreativeTool[]>([]);
  const [stops, setStops] = useState<TreasureStop[]>([]);
  const [certificates, setCertificates] = useState<CertificateItem[]>([]);
  const [works, setWorks] = useState<GalleryWork[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Upload States
  const [uploading, setUploading] = useState(false);

  // Modals for Create/Edit
  const [editingTool, setEditingTool] = useState<Partial<CreativeTool> | null>(null);
  const [editingStop, setEditingStop] = useState<Partial<TreasureStop> | null>(null);
  const [editingCertificate, setEditingCertificate] = useState<Partial<CertificateItem> | null>(null);
  const [editingWork, setEditingWork] = useState<Partial<GalleryWork> | null>(null);
  const [stopModalSubTab, setStopModalSubTab] = useState<'info' | 'photos' | 'outputs'>('info');

  // Check Session Auth on mount via secure cookie endpoint
  useEffect(() => {
    fetch('/api/admin/auth')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.authenticated) {
          setIsAuthenticated(true);
          setAdminUser(data.user || { email: 'g3muhraihan.hidayah@gmail.com', name: 'Han Studio Admin' });
        }
      })
      .catch((err) => {
        console.warn('Session check notice:', err);
      });
  }, []);

  // Fetch all data when authenticated
  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [toolsRes, journeyRes, certRes, galleryRes, inqRes] = await Promise.all([
        fetch('/api/tools', { cache: 'no-store' }),
        fetch('/api/journey', { cache: 'no-store' }),
        fetch('/api/certificates', { cache: 'no-store' }),
        fetch('/api/gallery', { cache: 'no-store' }),
        fetch('/api/inquiries', { cache: 'no-store' }),
      ]);

      if (toolsRes.ok) {
        const d = await toolsRes.json();
        setTools(d.tools || []);
      }
      if (journeyRes.ok) {
        const d = await journeyRes.json();
        setStops(d.stops || []);
      }
      if (certRes.ok) {
        const d = await certRes.json();
        setCertificates(d.certificates || []);
      }
      if (galleryRes.ok) {
        const d = await galleryRes.json();
        setWorks(d.works || []);
      }
      if (inqRes.ok) {
        const d = await inqRes.json();
        setInquiries(d.inquiries || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      showNotice('Gagal mengambil data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const showNotice = (message: string, type: 'success' | 'error' = 'success') => {
    setNotice({ message, type });
    setTimeout(() => setNotice(null), 3000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput,
          password: passwordInput,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAdminUser(data.user);
        showNotice('Berhasil masuk ke Pusat Kontrol');
      } else {
        setAuthError(data.error || 'Email atau kata sandi tidak sesuai');
      }
    } catch (err) {
      setAuthError('Gagal terhubung ke server');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch (err) {
      console.warn('Logout notice:', err);
    }
    setIsAuthenticated(false);
    setAdminUser(null);
    setEmailInput('');
    setPasswordInput('');
  };

  // Helper File Upload
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (url: string, data?: { url?: string; thumbnailUrl?: string }) => void,
    folder: 'icons' | 'uploads' = 'uploads'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        onSuccess(data.url, data);
        showNotice('File berhasil diunggah');
      } else {
        showNotice(data.error || 'Gagal mengunggah', 'error');
      }
    } catch (err) {
      showNotice('Error: ' + String(err), 'error');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // --- CRUD: TOOLS ---
  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool || !editingTool.id || !editingTool.name) {
      showNotice('ID dan Nama wajib diisi', 'error');
      return;
    }

    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTool),
      });

      const data = await res.json();
      if (data.success) {
        showNotice('Tool berhasil disimpan');
        notifyPortfolioUpdate();
        setEditingTool(null);
        fetchAllData();
      } else {
        showNotice(data.error || 'Gagal menyimpan', 'error');
      }
    } catch (err) {
      showNotice('Error: ' + String(err), 'error');
    }
  };

  const handleDeleteTool = async (id: string, name: string) => {
    if (!confirm(`Hapus tool "${name}"?`)) return;
    try {
      const res = await fetch(`/api/tools?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showNotice('Tool dihapus');
        notifyPortfolioUpdate();
        fetchAllData();
      } else {
        showNotice(data.error || 'Gagal menghapus', 'error');
      }
    } catch (err) {
      showNotice('Error: ' + String(err), 'error');
    }
  };

  // --- CRUD: JOURNEY ---
  const handleSaveStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStop || !editingStop.id || !editingStop.event) {
      showNotice('ID dan Nama Event wajib diisi', 'error');
      return;
    }

    try {
      const res = await fetch('/api/journey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingStop),
      });

      const data = await res.json();
      if (data.success) {
        showNotice('Pos berhasil disimpan');
        notifyPortfolioUpdate();
        setEditingStop(null);
        fetchAllData();
      } else {
        showNotice(data.error || 'Gagal menyimpan', 'error');
      }
    } catch (err) {
      showNotice('Error: ' + String(err), 'error');
    }
  };

  const handleDeleteStop = async (id: string, code: string) => {
    if (!confirm(`Hapus pos "${code}"?`)) return;
    try {
      const res = await fetch(`/api/journey?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showNotice('Pos dihapus');
        notifyPortfolioUpdate();
        fetchAllData();
      } else {
        showNotice(data.error || 'Gagal menghapus', 'error');
      }
    } catch (err) {
      showNotice('Error: ' + String(err), 'error');
    }
  };

  // --- CRUD: GALLERY ---
  const handleSaveWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWork || !editingWork.title) {
      showNotice('Judul wajib diisi', 'error');
      return;
    }

    const payload = {
      ...editingWork,
      id: editingWork.id || `${editingWork.category === 'photography' ? 'photo' : 'work'}-${Date.now()}`,
      category: editingWork.category || 'photography',
      categoryLabel: editingWork.category === 'photography' ? 'Fotografi' : (editingWork.categoryLabel || 'Karya Desain'),
      committee: editingWork.committee || (editingWork.category === 'photography' ? 'Fotografi' : ''),
      dim: editingWork.dim || '3:2',
      spanClass: editingWork.spanClass || 'md:col-span-6 lg:col-span-4',
      aspectClass: editingWork.aspectClass || 'aspect-[3/2]',
      tools: Array.isArray(editingWork.tools) ? editingWork.tools : [],
      colors: Array.isArray(editingWork.colors) && editingWork.colors.length > 0
        ? editingWork.colors
        : ['#041A4D', '#E2C275', '#6B0F1A'],
      art: editingWork.art || '',
      desc: editingWork.desc || '',
    };

    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showNotice('Karya berhasil disimpan');
        notifyPortfolioUpdate();
        setEditingWork(null);
        fetchAllData();
      } else {
        showNotice(data.error || 'Gagal menyimpan', 'error');
      }
    } catch (err) {
      showNotice('Error: ' + String(err), 'error');
    }
  };

  const handleDeleteWork = async (id: string, title: string) => {
    if (!confirm(`Hapus karya "${title}"?`)) return;
    try {
      const res = await fetch(`/api/gallery?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showNotice('Karya dihapus');
        notifyPortfolioUpdate();
        fetchAllData();
      } else {
        showNotice(data.error || 'Gagal menghapus', 'error');
      }
    } catch (err) {
      showNotice('Error: ' + String(err), 'error');
    }
  };

  // --- CRUD: CERTIFICATES ---
  const handleSaveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCertificate || !editingCertificate.id || !editingCertificate.title) {
      showNotice('ID dan Judul Sertifikat wajib diisi', 'error');
      return;
    }

    try {
      const res = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCertificate),
      });

      const data = await res.json();
      if (data.success) {
        showNotice('Sertifikat berhasil disimpan');
        notifyPortfolioUpdate();
        setEditingCertificate(null);
        fetchAllData();
      } else {
        showNotice(data.error || 'Gagal menyimpan', 'error');
      }
    } catch (err) {
      showNotice('Error: ' + String(err), 'error');
    }
  };

  const handleDeleteCertificate = async (id: string, title: string) => {
    if (!confirm(`Hapus sertifikat "${title}"?`)) return;
    try {
      const res = await fetch(`/api/certificates?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showNotice('Sertifikat dihapus');
        notifyPortfolioUpdate();
        fetchAllData();
      } else {
        showNotice(data.error || 'Gagal menghapus', 'error');
      }
    } catch (err) {
      showNotice('Error: ' + String(err), 'error');
    }
  };

  // --- CRUD: INQUIRIES ---
  const handleDeleteInquiry = async (id: number) => {
    if (!confirm('Hapus pesan ini?')) return;
    try {
      const res = await fetch(`/api/inquiries?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        showNotice('Pesan dihapus');
        fetchAllData();
      } else {
        showNotice(data.error || 'Gagal menghapus', 'error');
      }
    } catch (err) {
      showNotice('Error: ' + String(err), 'error');
    }
  };

  // Filtered Data Calculations
  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return tools;
    const q = searchQuery.toLowerCase();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.abbr.toLowerCase().includes(q)
    );
  }, [tools, searchQuery]);

  const filteredStops = useMemo(() => {
    let result = stops;
    if (journeyRouteFilter !== 'all') {
      result = result.filter((s) => s.route === journeyRouteFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.event.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.role.toLowerCase().includes(q)
      );
    }
    return result;
  }, [stops, searchQuery, journeyRouteFilter]);

  const designWorks = useMemo(() => {
    return works.filter((w) => w.category !== 'photography');
  }, [works]);

  const photographyWorks = useMemo(() => {
    return works.filter((w) => w.category === 'photography');
  }, [works]);

  const filteredDesignWorks = useMemo(() => {
    let result = designWorks;
    if (galleryCategoryFilter !== 'all') {
      result = result.filter((w) => w.category === galleryCategoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.committee.toLowerCase().includes(q) ||
          (w.desc && w.desc.toLowerCase().includes(q))
      );
    }
    return result;
  }, [designWorks, searchQuery, galleryCategoryFilter]);

  const filteredPhotographyWorks = useMemo(() => {
    let result = photographyWorks;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.committee.toLowerCase().includes(q) ||
          (w.desc && w.desc.toLowerCase().includes(q)) ||
          w.tools.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [photographyWorks, searchQuery]);

  const filteredWorks = filteredDesignWorks;

  const filteredCertificates = useMemo(() => {
    let result = certificates;
    if (certificateCategoryFilter !== 'all') {
      result = result.filter(
        (c) => (c.category || '').toLowerCase() === certificateCategoryFilter.toLowerCase()
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.event.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          (c.issuer && c.issuer.toLowerCase().includes(q))
      );
    }
    return result;
  }, [certificates, searchQuery, certificateCategoryFilter]);

  const filteredInquiries = useMemo(() => {
    if (!searchQuery.trim()) return inquiries;
    const q = searchQuery.toLowerCase();
    return inquiries.filter(
      (inq) =>
        inq.sender_email.toLowerCase().includes(q) ||
        inq.role.toLowerCase().includes(q) ||
        inq.message.toLowerCase().includes(q)
    );
  }, [inquiries, searchQuery]);

  // =========================================================================
  // 1. LOGIN SCREEN (Art-Deco Luxury Portal)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#01081F] flex items-center justify-center p-4 relative overflow-hidden selection:bg-[#E2C275] selection:text-[#01081F]">
        <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-[#6B0F1A]/25 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-[#E2C275]/15 blur-[150px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm rounded-[32px] bg-gradient-to-b from-[#052368]/95 via-[#03174C]/95 to-[#010C24]/98 border-2 border-[#E2C275] p-7 sm:p-9 shadow-[0_24px_80px_rgba(0,0,0,0.85)] backdrop-blur-xl">
          <div className="absolute inset-[6px] rounded-[26px] border border-[#E2C275]/40 pointer-events-none" />

          <div className="text-center mb-6 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[10px] font-mono-code font-bold text-[#F6DFB0] mb-3 shadow-md">
              <span>✦</span>
              <span>HAN STUDIO</span>
              <span>✦</span>
            </div>
            <h1 className="font-display font-bold text-2xl text-white tracking-tight">Admin Portal</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 relative z-10">
            <div>
              <label className="block text-[11px] font-mono-code font-bold text-[#E2C275] mb-1.5">EMAIL</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#E2C275]/70 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="nama@email.com"
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#010D2E] border border-[#C6A355]/60 text-white placeholder-blue-300/30 focus:outline-none focus:border-[#E2C275] focus:ring-2 focus:ring-[#E2C275]/25 text-xs font-mono-code transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono-code font-bold text-[#E2C275] mb-1.5">KATA SANDI</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-[#E2C275]/70 pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 rounded-xl bg-[#010D2E] border border-[#C6A355]/60 text-white placeholder-blue-300/30 focus:outline-none focus:border-[#E2C275] focus:ring-2 focus:ring-[#E2C275]/25 text-xs font-mono-code transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-blue-300/70 hover:text-white cursor-pointer transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>

              {authError && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-rose-950/90 border border-rose-500/80 text-rose-200 text-xs font-mono-code flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{authError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-[#6B0F1A] via-[#8A1422] to-[#6B0F1A] border border-[#E2C275] text-[#F6DFB0] font-bold text-xs shadow-[0_8px_20px_rgba(107,15,26,0.5)] hover:shadow-[0_10px_24px_rgba(226,194,117,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{authLoading ? 'Memverifikasi...' : 'Masuk ke Pusat Kontrol →'}</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-white/10 text-center relative z-10">
            <Link
              href="/"
              className="text-xs text-blue-200/70 hover:text-[#E2C275] font-mono-code transition-colors inline-flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Kembali ke Website Portofolio</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================================
  // 2. AUTHENTICATED DASHBOARD (Sidebar Layout)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#01081F] text-white flex selection:bg-[#E2C275] selection:text-[#01081F] relative overflow-x-hidden">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-64 w-[600px] h-[600px] rounded-full bg-[#052368]/20 blur-[180px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#6B0F1A]/15 blur-[160px] pointer-events-none" />

      {/* Toast Notification */}
      {notice && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-2.5 rounded-xl border shadow-[0_16px_40px_rgba(0,0,0,0.8)] text-xs font-mono-code flex items-center gap-2.5 backdrop-blur-md animate-slide-up ${
            notice.type === 'error'
              ? 'bg-rose-950/95 border-rose-500 text-rose-200'
              : 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
          }`}
        >
          <span>{notice.type === 'error' ? '⚠️' : '✓'}</span>
          <span>{notice.message}</span>
        </div>
      )}

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* ===================================================================== */}
      {/* LUXURY ART-DECO SIDEBAR */}
      {/* ===================================================================== */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-[#03174C]/95 via-[#021034]/98 to-[#010922]/98 backdrop-blur-2xl border-r-2 border-[#E2C275]/40 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Brand Section */}
        <div>
          <div className="p-6 border-b border-[#C6A355]/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#6B0F1A] via-[#8A1422] to-[#6B0F1A] border-2 border-[#E2C275] flex items-center justify-center font-display font-black text-base text-[#F6DFB0] shadow-[0_4px_16px_rgba(107,15,26,0.6)]">
                  H
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display font-bold text-base tracking-wider text-white">HAN STUDIO</span>
                    <span className="text-[10px] text-[#E2C275]">✦</span>
                  </div>
                  <span className="text-[10px] font-mono-code text-blue-200/60 block tracking-widest uppercase">
                    Pusat Kontrol
                  </span>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Neon DB Status Badge */}
            <div className="mt-4 flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#010D2E]/90 border border-emerald-500/40 shadow-inner">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono-code font-bold text-emerald-300 tracking-wider">
                  NEON DATABASE
                </span>
              </div>
              <span className="text-[9px] font-mono-code text-emerald-400/80">ONLINE</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-2">
            {[
              {
                id: 'tools' as const,
                label: 'Creative Tools',
                count: tools.length,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <polygon points="12 2 2 7 12 12 22 7 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="2 17 12 22 22 17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points="2 12 12 17 22 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                id: 'journey' as const,
                label: 'Pos Ekspedisi',
                count: stops.length,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" strokeWidth="2" />
                  </svg>
                ),
              },
              {
                id: 'certificates' as const,
                label: 'Sertifikat',
                count: certificates.length,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="7" strokeWidth="2" />
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ),
              },
              {
                id: 'gallery' as const,
                label: 'Galeri Desain',
                count: designWorks.length,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" strokeWidth="2" />
                    <polyline points="21 15 16 10 5 21" strokeWidth="2" />
                  </svg>
                ),
              },
              {
                id: 'photography' as const,
                label: 'Galeri Fotografi',
                count: photographyWorks.length,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                id: 'inquiries' as const,
                label: 'Pesan Masuk',
                count: inquiries.length,
                icon: (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
              },
            ].map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSearchQuery('');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-mono-code transition-all duration-200 cursor-pointer group relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-[#6B0F1A] via-[#8A1422] to-[#6B0F1A] text-[#F6DFB0] font-bold border-2 border-[#E2C275] shadow-[0_8px_24px_rgba(107,15,26,0.6)]'
                      : 'text-blue-200/75 hover:text-white hover:bg-white/[0.06] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <span className={`${isActive ? 'text-[#E2C275]' : 'text-blue-300/70 group-hover:text-[#E2C275]'} transition-colors`}>
                      {item.icon}
                    </span>
                    <span className="tracking-wide">{item.label}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold relative z-10 ${
                      isActive
                        ? 'bg-[#020F30] text-[#E2C275] border border-[#E2C275]/50'
                        : 'bg-white/10 text-blue-200/70 group-hover:bg-white/15'
                    }`}
                  >
                    {item.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#C6A355]/30 bg-[#010922]/60 space-y-3">
          {adminUser && (
            <div className="p-2.5 rounded-xl bg-[#010D2E] border border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#6B0F1A] border border-[#E2C275] flex items-center justify-center text-[10px] font-bold text-[#F6DFB0] shrink-0">
                A
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-blue-200/50 block font-mono-code">ADMIN RESMI</span>
                <span className="text-xs text-white truncate block font-mono-code">{adminUser.email}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="flex-1 text-center py-2 rounded-xl bg-[#021238] hover:bg-[#031B54] border border-[#E2C275]/50 hover:border-[#E2C275] text-xs font-mono-code text-[#F6DFB0] transition-colors flex items-center justify-center gap-1.5 shadow"
            >
              <span>Website</span>
              <span>↗</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-[#6B0F1A]/80 hover:bg-[#6B0F1A] border border-[#E2C275]/50 text-xs font-mono-code text-[#F6DFB0] transition-colors cursor-pointer shadow"
            >
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* ===================================================================== */}
      {/* MAIN WORKSPACE */}
      {/* ===================================================================== */}
      <main className="flex-1 lg:pl-72 flex flex-col min-h-screen relative z-10">
        {/* Mobile Top Header */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#021034]/95 backdrop-blur-xl border-b border-[#E2C275]/30">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl bg-[#6B0F1A] border border-[#E2C275] text-[#F6DFB0] cursor-pointer"
            >
              ☰
            </button>
            <span className="font-display font-bold text-sm text-white">Han Studio Admin</span>
          </div>
          <span className="text-xs font-mono-code text-[#E2C275] font-bold uppercase tracking-wider">
            {activeTab === 'tools' && 'Creative Tools'}
            {activeTab === 'journey' && 'Pos Ekspedisi'}
            {activeTab === 'certificates' && 'Sertifikat'}
            {activeTab === 'gallery' && 'Galeri Desain'}
            {activeTab === 'photography' && 'Galeri Fotografi'}
            {activeTab === 'inquiries' && 'Pesan Masuk'}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-7 lg:p-9 max-w-6xl w-full mx-auto flex-1">
          {/* ================================================================= */}
          {/* TAB 1: CREATIVE TOOLS (Aesthetic Cards with Brand Accents) */}
          {/* ================================================================= */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#052368]/90 via-[#03174C]/95 to-[#010C24]/98 border-2 border-[#E2C275] shadow-[0_16px_50px_rgba(0,0,0,0.5)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[9px] font-mono-code font-bold text-[#F6DFB0]">
                      ✦ CREATIVE SUITE
                    </span>
                    <span className="text-xs font-mono-code text-blue-200/70">{tools.length} software aktif</span>
                  </div>
                  <h2 className="font-display font-bold text-2xl text-white tracking-tight">Creative Tools</h2>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-blue-300/60 pointer-events-none">
                      🔍
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari tool..."
                      className="w-44 sm:w-56 pl-9 pr-3 py-2 rounded-xl bg-[#010D2E] border border-[#C6A355]/50 text-white placeholder-blue-300/40 text-xs font-mono-code focus:outline-none focus:border-[#E2C275]"
                    />
                  </div>

                  <button
                    onClick={() =>
                      setEditingTool({
                        id: '',
                        abbr: '',
                        name: '',
                        category: '',
                        usage: '90%',
                        highlight: '',
                        desc: '',
                        tilt: '0deg',
                        icon_url: '',
                        order_num: tools.length + 1,
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B0F1A] via-[#8A1422] to-[#6B0F1A] border border-[#E2C275] text-xs font-mono-code font-bold text-[#F6DFB0] shadow-md hover:brightness-110 cursor-pointer shrink-0 transition-all"
                  >
                    + Tambah Tool
                  </button>
                </div>
              </div>

              {/* Tools Cards Grid (Matching Visual Image 1) */}
              {filteredTools.length === 0 ? (
                <div className="rounded-3xl bg-[#021238]/60 border border-[#C6A355]/40 p-12 text-center text-xs text-blue-200/60">
                  Tidak ada tool yang cocok.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTools.map((t) => {
                    const accent = TOOL_ACCENTS[t.id] || TOOL_ACCENTS.figma;
                    const parsedUsage = parseInt(t.usage) || 90;
                    return (
                      <div
                        key={t.id}
                        className={`rounded-[26px] bg-gradient-to-br from-[#052368]/95 via-[#03174C]/95 to-[#010C24] border-2 ${accent.border} ${accent.glow} p-5 flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.6)] transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden`}
                      >
                        {/* Subtle inner hairline frame */}
                        <div className="absolute inset-[4px] rounded-[22px] border border-white/5 pointer-events-none" />

                        <div>
                          {/* Top Row: Icon Badge & Percentage Pill */}
                          <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-2xl ${accent.badgeBg} border-2 flex items-center justify-center p-2.5 shadow-md shadow-black/40 overflow-hidden`}>
                              {t.icon_url ? (
                                <img src={t.icon_url} alt={t.name} className="w-full h-full object-contain" />
                              ) : (
                                <span className={`font-display font-black text-base ${accent.badgeText}`}>{t.abbr}</span>
                              )}
                            </div>

                            <span className="px-3 py-1 rounded-full bg-[#010D2E] border border-white/10 text-xs font-mono-code font-bold text-white shadow-inner">
                              {t.usage}
                            </span>
                          </div>

                          {/* Tool Name & Category */}
                          <h3 className="font-display font-bold text-lg text-white group-hover:text-[#E2C275] transition-colors">
                            {t.name}
                          </h3>
                          <p className="text-xs font-mono-code text-blue-200/70 mt-0.5">{t.category}</p>

                          {/* Highlight Text */}
                          {t.highlight && (
                            <p className="text-xs font-semibold text-[#E2C275] mt-2 line-clamp-1">
                              {t.highlight}
                            </p>
                          )}

                          {/* Glowing Progress Bar (Matching Image 1) */}
                          <div className="mt-4">
                            <div className="h-1.5 w-full bg-[#010D2E] rounded-full overflow-hidden border border-white/10">
                              <div
                                className={`h-full ${accent.barColor} rounded-full transition-all duration-500`}
                                style={{ width: `${Math.min(parsedUsage, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Card Action Footer */}
                        <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-end gap-2 relative z-10">
                          <button
                            onClick={() => setEditingTool(t)}
                            className="px-3 py-1.5 rounded-xl bg-blue-900/50 hover:bg-blue-800 border border-blue-400/50 text-xs font-mono-code text-blue-200 cursor-pointer transition-colors shadow"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTool(t.id, t.name)}
                            className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-500/50 text-xs font-mono-code text-rose-300 cursor-pointer transition-colors shadow"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 2: JOURNEY STOPS (Pos Ekspedisi Waypoints) */}
          {/* ================================================================= */}
          {activeTab === 'journey' && (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#052368]/90 via-[#03174C]/95 to-[#010C24]/98 border-2 border-[#E2C275] shadow-[0_16px_50px_rgba(0,0,0,0.5)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[9px] font-mono-code font-bold text-[#F6DFB0]">
                      ✦ EXPEDITION WAYPOINTS
                    </span>
                    <span className="text-xs font-mono-code text-blue-200/70">{stops.length} pos kepanitiaan</span>
                  </div>
                  <h2 className="font-display font-bold text-2xl text-white tracking-tight">Pos Ekspedisi</h2>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-[#010D2E] border border-white/10 text-[11px] font-mono-code">
                    {[
                      { label: 'Semua', value: 'all' as const },
                      { label: 'Rute 1', value: 1 },
                      { label: 'Rute 2', value: 2 },
                      { label: 'Rute 3', value: 3 },
                    ].map((r) => (
                      <button
                        key={String(r.value)}
                        onClick={() => setJourneyRouteFilter(r.value)}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                          journeyRouteFilter === r.value
                            ? 'bg-[#6B0F1A] text-[#F6DFB0] font-bold border border-[#E2C275]'
                            : 'text-blue-200/60 hover:text-white'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari pos..."
                    className="w-40 sm:w-48 px-3 py-2 rounded-xl bg-[#010D2E] border border-[#C6A355]/50 text-white placeholder-blue-300/40 text-xs font-mono-code focus:outline-none focus:border-[#E2C275]"
                  />

                  <button
                    onClick={() => {
                      setEditingStop({
                        id: `pos-${stops.length + 1}`,
                        code: `POS ${stops.length + 1 < 10 ? '0' : ''}${stops.length + 1}`,
                        number: stops.length + 1,
                        route: 1,
                        year: '2024',
                        period: 'Agu - Okt 2024',
                        event: '',
                        role: '',
                        roleTags: ['ddm', 'foto', 'staff'],
                        summary: '',
                        marker: `P${stops.length + 1}`,
                        coord: '50% 50%',
                        photos: [],
                        outputs: [],
                      });
                      setStopModalSubTab('info');
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B0F1A] via-[#8A1422] to-[#6B0F1A] border border-[#E2C275] text-xs font-mono-code font-bold text-[#F6DFB0] shadow-md hover:brightness-110 cursor-pointer shrink-0 transition-all"
                  >
                    + Tambah Pos
                  </button>
                </div>
              </div>

              {/* Waypoint Cards Grid */}
              {filteredStops.length === 0 ? (
                <div className="rounded-3xl bg-[#021238]/60 border border-[#C6A355]/40 p-12 text-center text-xs text-blue-200/60">
                  Tidak ada pos yang cocok.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredStops.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-[26px] bg-gradient-to-br from-[#052368]/95 via-[#03174C]/95 to-[#010C24] border-2 border-[#C6A355]/50 hover:border-[#E2C275] p-5 sm:p-6 flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div>
                        {/* Waypoint Header */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <span className="px-3 py-1 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[10px] font-mono-code font-bold text-[#F6DFB0] shadow">
                            {s.code} • Rute {s.route} ({s.year})
                          </span>
                          <div className="flex items-center gap-2 text-[11px] font-mono-code text-blue-300/80">
                            <span className="px-2 py-0.5 rounded-lg bg-[#010D2E] border border-white/10">
                              📷 {s.photos?.length || 0}
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-[#010D2E] border border-white/10">
                              🎨 {s.outputs?.length || 0}
                            </span>
                          </div>
                        </div>

                        <h3 className="font-display font-bold text-lg text-white group-hover:text-[#E2C275] transition-colors leading-snug">
                          {s.event}
                        </h3>
                        <p className="text-xs font-semibold text-[#E2C275] mt-1">{s.role}</p>

                        {/* Filter Tags Badges */}
                        <div className="flex flex-wrap gap-1 mt-2.5">
                          {(s.roleTags || []).map((t) => (
                            <span
                              key={t}
                              className="px-2 py-0.5 rounded-md bg-[#010D2E] border border-[#E2C275]/40 text-[9px] font-mono-code text-[#F6DFB0]"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between">
                        <span className="text-[11px] font-mono-code text-blue-200/60">{s.period}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingStop(s);
                              setStopModalSubTab('info');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-blue-900/50 hover:bg-blue-800 border border-blue-400/50 text-xs font-mono-code text-blue-200 cursor-pointer transition-colors shadow"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteStop(s.id, s.code)}
                            className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-500/50 text-xs font-mono-code text-rose-300 cursor-pointer transition-colors shadow"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB: CERTIFICATES (Sertifikat Kepanitiaan) */}
          {/* ================================================================= */}
          {activeTab === 'certificates' && (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#052368]/90 via-[#03174C]/95 to-[#010C24]/98 border-2 border-[#E2C275] shadow-[0_16px_50px_rgba(0,0,0,0.5)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[9px] font-mono-code font-bold text-[#F6DFB0]">
                      ✦ OFFICIAL RECOGNITION
                    </span>
                    <span className="text-xs font-mono-code text-blue-200/70">{certificates.length} sertifikat kepanitiaan</span>
                  </div>
                  <h2 className="font-display font-bold text-2xl text-white tracking-tight">Sertifikat Kepanitiaan</h2>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-[#010D2E] border border-white/10 text-[11px] font-mono-code">
                    {[
                      { label: 'Semua', value: 'all' },
                      { label: 'Kepanitiaan', value: 'Kepanitiaan' },
                      { label: 'Organisasi', value: 'Organisasi' },
                      { label: 'Volunteer', value: 'Volunteer' },
                    ].map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setCertificateCategoryFilter(c.value)}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                          certificateCategoryFilter === c.value
                            ? 'bg-[#6B0F1A] text-[#F6DFB0] font-bold border border-[#E2C275]'
                            : 'text-blue-200/60 hover:text-white'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari sertifikat..."
                    className="px-3.5 py-2 rounded-xl bg-[#010D2E] border border-white/15 text-xs text-white placeholder-blue-200/40 font-mono-code focus:border-[#E2C275] focus:outline-none w-44"
                  />

                  <button
                    onClick={() =>
                      setEditingCertificate({
                        id: `cert-${Date.now()}`,
                        title: '',
                        event: '',
                        role: '',
                        issuer: '',
                        year: new Date().getFullYear().toString(),
                        category: 'Kepanitiaan',
                        imageUrl: '',
                        credentialUrl: '',
                        desc: '',
                        orderNum: certificates.length + 1,
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B0F1A] via-[#8A1422] to-[#6B0F1A] border border-[#E2C275] text-xs font-mono-code font-bold text-[#F6DFB0] hover:brightness-110 cursor-pointer shadow flex items-center gap-1.5"
                  >
                    <span>+ Tambah Sertifikat</span>
                  </button>
                </div>
              </div>

              {/* Certificates List */}
              {filteredCertificates.length === 0 ? (
                <div className="py-16 text-center rounded-3xl bg-[#020F30]/60 border border-white/10 flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#6B0F1A]/80 border-2 border-[#E2C275] flex items-center justify-center text-[#E2C275] mb-3 shadow">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="8" r="7" strokeWidth="2" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-white font-display font-bold text-lg mb-1">Belum Ada Data Sertifikat</p>
                  <p className="text-xs text-blue-200/60 max-w-sm mb-4">
                    Tambahkan bukti sertifikat kepanitiaan Anda agar tampil di portofolio publik.
                  </p>
                  <button
                    onClick={() =>
                      setEditingCertificate({
                        id: `cert-${Date.now()}`,
                        title: '',
                        event: '',
                        role: '',
                        issuer: '',
                        year: new Date().getFullYear().toString(),
                        category: 'Kepanitiaan',
                        imageUrl: '',
                        credentialUrl: '',
                        desc: '',
                        orderNum: 1,
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-[#E2C275] hover:bg-[#F5D98E] text-[#021238] font-bold text-xs font-mono-code cursor-pointer transition-colors"
                  >
                    + Tambah Sertifikat Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCertificates.map((cert) => (
                    <div
                      key={cert.id}
                      className="group rounded-3xl bg-gradient-to-b from-[#052368]/85 via-[#03174C]/90 to-[#010C24]/95 border-2 border-[#C6A355]/60 hover:border-[#E2C275] overflow-hidden flex flex-col justify-between shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-all duration-200"
                    >
                      <div>
                        {/* Thumbnail / Plaque */}
                        <div className="aspect-[16/10] w-full bg-[#010B24] border-b border-[#C6A355]/30 relative overflow-hidden flex items-center justify-center">
                          {cert.imageUrl ? (
                            <img
                              src={cert.imageUrl}
                              alt={cert.title}
                              className="w-full h-full object-cover"
                            />
                          ) : cert.credentialUrl && cert.credentialUrl.toLowerCase().includes('.pdf') ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gradient-to-br from-[#062464] to-[#010B24]">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8A1422] to-[#6B0F1A] border-2 border-[#E2C275] flex flex-col items-center justify-center text-[#E2C275] mb-1.5 shadow">
                                <svg className="w-6 h-6 text-[#F6DFB0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <span className="text-[10px] font-mono-code text-[#E2C275] uppercase font-bold">
                                ✦ DOKUMEN PDF ✦
                              </span>
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4 bg-gradient-to-br from-[#062464] to-[#010B24]">
                              <div className="w-12 h-12 rounded-full bg-[#6B0F1A] border-2 border-[#E2C275] flex items-center justify-center text-[#E2C275] mb-2 shadow">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <circle cx="12" cy="8" r="7" strokeWidth="2" />
                                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </div>
                              <span className="text-[10px] font-mono-code text-[#E2C275] uppercase">
                                ✦ SERTIFIKAT RESMI ✦
                              </span>
                            </div>
                          )}

                          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#6B0F1A]/90 border border-[#E2C275] text-[9px] font-mono-code text-[#F6DFB0]">
                            {cert.category || 'Kepanitiaan'}
                          </span>

                          {cert.year && (
                            <span className="absolute bottom-2.5 right-3 px-2 py-0.5 rounded-full bg-[#021238]/85 border border-[#C6A355]/60 text-[9px] font-mono-code text-[#F6DFB0]">
                              {cert.year}
                            </span>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-4 space-y-2">
                          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#020F30] border border-[#E2C275]/50 text-[10px] font-mono-code text-[#E2C275] font-semibold">
                            {cert.role || 'Peran Panitia'}
                          </span>
                          <h3 className="font-display font-bold text-base text-white leading-snug">
                            {cert.title}
                          </h3>
                          <p className="text-xs text-blue-200/80">
                            Acara: <span className="text-white font-medium">{cert.event}</span>
                          </p>
                          {cert.issuer && (
                            <p className="text-[11px] text-blue-200/60 truncate">
                              Penerbit: {cert.issuer}
                            </p>
                          )}
                          {cert.desc && (
                            <p className="text-xs text-blue-100/70 line-clamp-2 mt-1">
                              {cert.desc}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-4 pt-2 border-t border-white/10 flex items-center justify-between gap-2 bg-[#020F30]/50">
                        {cert.credentialUrl ? (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-mono-code text-[#E2C275] hover:underline flex items-center gap-1"
                          >
                            <span>Lihat Kredensial</span>
                            <span>↗</span>
                          </a>
                        ) : (
                          <span className="text-[10px] font-mono-code text-blue-200/40">No URL</span>
                        )}

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingCertificate(cert)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-mono-code text-white cursor-pointer transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteCertificate(cert.id, cert.title)}
                            className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-500/50 text-xs font-mono-code text-rose-300 cursor-pointer transition-colors shadow"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: GALLERY WORKS (Galeri Desain Grafis) */}
          {/* ================================================================= */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#052368]/90 via-[#03174C]/95 to-[#010C24]/98 border-2 border-[#E2C275] shadow-[0_16px_50px_rgba(0,0,0,0.5)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[9px] font-mono-code font-bold text-[#F6DFB0]">
                      ✦ VISUAL DESIGN VAULT
                    </span>
                    <span className="text-xs font-mono-code text-blue-200/70">{designWorks.length} karya desain</span>
                  </div>
                  <h2 className="font-display font-bold text-2xl text-white tracking-tight">Galeri Desain Grafis</h2>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-[#010D2E] border border-white/10 text-[11px] font-mono-code">
                    {[
                      { label: 'Semua Desain', value: 'all' },
                      { label: 'Poster', value: 'poster' },
                      { label: 'Feed (4:5)', value: 'feed' },
                      { label: 'Identity & Print', value: 'identity' },
                    ].map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setGalleryCategoryFilter(c.value)}
                        className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                          galleryCategoryFilter === c.value
                            ? 'bg-[#6B0F1A] text-[#F6DFB0] font-bold border border-[#E2C275]'
                            : 'text-blue-200/60 hover:text-white'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari karya desain..."
                    className="w-40 sm:w-48 px-3 py-2 rounded-xl bg-[#010D2E] border border-[#C6A355]/50 text-white placeholder-blue-300/40 text-xs font-mono-code focus:outline-none focus:border-[#E2C275]"
                  />

                  <button
                    onClick={() =>
                      setEditingWork({
                        id: `w-${Date.now()}`,
                        title: '',
                        category: 'poster',
                        categoryLabel: 'Event Poster',
                        committee: '',
                        spanClass: 'md:col-span-6 lg:col-span-4',
                        aspectClass: 'aspect-[4/5]',
                        dim: '1080 × 1350 px',
                        tools: ['Figma'],
                        colors: ['#0038A8', '#C6A355', '#6B0F1A'],
                        desc: '',
                        art: '',
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B0F1A] via-[#8A1422] to-[#6B0F1A] border border-[#E2C275] text-xs font-mono-code font-bold text-[#F6DFB0] shadow-md hover:brightness-110 cursor-pointer shrink-0 transition-all"
                  >
                    + Tambah Desain Baru
                  </button>
                </div>
              </div>

              {/* Gallery Works Cards */}
              {filteredDesignWorks.length === 0 ? (
                <div className="rounded-3xl bg-[#021238]/60 border border-[#C6A355]/40 p-12 text-center text-xs text-blue-200/60">
                  Tidak ada karya desain yang cocok.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDesignWorks.map((w) => (
                    <div
                      key={w.id}
                      className="rounded-[26px] bg-gradient-to-br from-[#052368]/95 via-[#03174C]/95 to-[#010C24] border-2 border-[#C6A355]/50 hover:border-[#E2C275] overflow-hidden flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div>
                        {/* Visual Thumbnail */}
                        <div className="aspect-[16/10] w-full bg-[#010D2E] border-b-2 border-[#C6A355]/40 overflow-hidden relative">
                          <ArtPreview type={w.art} title={w.title} />
                          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#6B0F1A]/95 border border-[#E2C275] text-[10px] font-mono-code font-bold text-[#F6DFB0] shadow-md">
                            {w.categoryLabel || w.category}
                          </span>
                        </div>

                        <div className="p-4 sm:p-5">
                          <span className="text-[11px] font-mono-code text-[#E2C275] block mb-1 font-semibold">
                            {w.committee}
                          </span>
                          <h3 className="font-display font-bold text-base text-white line-clamp-1 group-hover:text-[#E2C275] transition-colors">
                            {w.title}
                          </h3>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 pt-0 border-t border-white/10 flex items-center justify-between pt-3">
                        <span className="text-[10px] font-mono-code text-blue-200/60">{w.dim}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingWork(w)}
                            className="px-3 py-1.5 rounded-xl bg-blue-900/50 hover:bg-blue-800 border border-blue-400/50 text-xs font-mono-code text-blue-200 cursor-pointer transition-colors shadow"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWork(w.id, w.title)}
                            className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-500/50 text-xs font-mono-code text-rose-300 cursor-pointer transition-colors shadow"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: PHOTOGRAPHY GALLERY (Galeri Fotografi Acara) */}
          {/* ================================================================= */}
          {activeTab === 'photography' && (
            <div className="space-y-6">
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#052368]/90 via-[#03174C]/95 to-[#010C24]/98 border-2 border-[#E2C275] shadow-[0_16px_50px_rgba(0,0,0,0.5)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[9px] font-mono-code font-bold text-[#F6DFB0]">
                      ✦ PHOTOGRAPHY VAULT
                    </span>
                    <span className="text-xs font-mono-code text-blue-200/70">
                      {photographyWorks.length} foto aktif
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-2xl text-white tracking-tight">
                    Galeri Fotografi
                  </h2>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari foto..."
                    className="w-48 sm:w-64 px-3.5 py-2 rounded-xl bg-[#010D2E] border border-[#C6A355]/50 text-white placeholder-blue-300/40 text-xs font-mono-code focus:outline-none focus:border-[#E2C275]"
                  />

                  <button
                    onClick={() =>
                      setEditingWork({
                        id: `photo-${Date.now()}`,
                        title: '',
                        category: 'photography',
                        categoryLabel: 'Fotografi',
                        committee: '',
                        spanClass: 'md:col-span-6 lg:col-span-4',
                        aspectClass: 'aspect-[3/2]',
                        dim: '3:2',
                        tools: [],
                        colors: ['#041A4D', '#E2C275', '#6B0F1A'],
                        desc: '',
                        art: '',
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B0F1A] via-[#8A1422] to-[#6B0F1A] border border-[#E2C275] text-xs font-mono-code font-bold text-[#F6DFB0] shadow-md hover:brightness-110 cursor-pointer shrink-0 transition-all flex items-center gap-1.5"
                  >
                    <span>📸</span>
                    <span>+ Upload Foto Baru</span>
                  </button>
                </div>
              </div>

              {/* Photography Cards */}
              {filteredPhotographyWorks.length === 0 ? (
                <div className="rounded-[28px] bg-[#021238]/70 border-2 border-dashed border-[#C6A355]/40 p-10 sm:p-14 text-center flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#6B0F1A] border border-[#E2C275] flex items-center justify-center text-2xl text-[#E2C275] shadow-lg mb-3">
                    📸
                  </div>
                  <h3 className="font-display font-bold text-lg text-white mb-1">
                    Belum Ada Foto di Galeri
                  </h3>
                  <p className="text-xs text-blue-200/70 max-w-md leading-relaxed mb-4">
                    Foto yang di-upload di tab ini akan langsung ditampilkan pada bagian{' '}
                    <strong className="text-[#E2C275]">Galeri Fotografi</strong> di halaman utama portofolio.
                  </p>
                  <button
                    onClick={() =>
                      setEditingWork({
                        id: `photo-${Date.now()}`,
                        title: '',
                        category: 'photography',
                        categoryLabel: 'Fotografi',
                        committee: '',
                        spanClass: 'md:col-span-6 lg:col-span-4',
                        aspectClass: 'aspect-[3/2]',
                        dim: '3:2',
                        tools: [],
                        colors: ['#041A4D', '#E2C275', '#6B0F1A'],
                        desc: '',
                        art: '',
                      })
                    }
                    className="px-5 py-2.5 rounded-full bg-[#6B0F1A] hover:bg-[#8A1422] border border-[#E2C275] text-xs font-mono-code font-bold text-[#F6DFB0] shadow-lg transition-all cursor-pointer"
                  >
                    + Upload Foto Pertama
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {filteredPhotographyWorks.map((w) => (
                    <div
                      key={w.id}
                      className="rounded-[26px] bg-gradient-to-br from-[#052368]/95 via-[#03174C]/95 to-[#010C24] border-2 border-[#C6A355]/50 hover:border-[#E2C275] overflow-hidden flex flex-col justify-between shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1 transition-all duration-300 group"
                    >
                      <div>
                        {/* Visual Thumbnail */}
                        <div className="aspect-[3/2] w-full bg-[#010D2E] border-b-2 border-[#C6A355]/40 overflow-hidden relative">
                          <ArtPreview type={w.art} title={w.title} />
                          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#6B0F1A]/95 border border-[#E2C275] text-[10px] font-mono-code font-bold text-[#F6DFB0] shadow-md flex items-center gap-1">
                            <span>📸</span>
                            <span>{w.committee}</span>
                          </span>
                        </div>

                        <div className="p-4 sm:p-5">
                          <div className="flex items-center justify-between text-[10px] font-mono-code text-[#E2C275] mb-1">
                            <span>{w.dim}</span>
                            <span className="text-blue-200/70 truncate max-w-[150px]">{w.tools.join(', ')}</span>
                          </div>
                          <h3 className="font-display font-bold text-base text-white line-clamp-1 group-hover:text-[#E2C275] transition-colors">
                            {w.title}
                          </h3>
                          {w.desc && (
                            <p className="text-xs text-blue-100/75 line-clamp-2 mt-1 leading-relaxed">
                              {w.desc}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 pt-0 border-t border-white/10 flex items-center justify-between pt-3">
                        {/* Palette chips */}
                        <div className="flex items-center gap-1">
                          {w.colors.map((c) => (
                            <span
                              key={c}
                              style={{ backgroundColor: c }}
                              className="w-3.5 h-3.5 rounded-full border border-white/40"
                              title={c}
                            />
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingWork(w)}
                            className="px-3 py-1.5 rounded-xl bg-blue-900/50 hover:bg-blue-800 border border-blue-400/50 text-xs font-mono-code text-blue-200 cursor-pointer transition-colors shadow"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteWork(w.id, w.title)}
                            className="px-3 py-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900 border border-rose-500/50 text-xs font-mono-code text-rose-300 cursor-pointer transition-colors shadow"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 4: INQUIRIES (Pesan Masuk) */}
          {/* ================================================================= */}
          {activeTab === 'inquiries' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#052368]/90 via-[#03174C]/95 to-[#010C24]/98 border-2 border-[#E2C275] shadow-[0_16px_50px_rgba(0,0,0,0.5)]">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[9px] font-mono-code font-bold text-[#F6DFB0]">
                      ✦ INBOX PESAN
                    </span>
                    <span className="text-xs font-mono-code text-blue-200/70">{inquiries.length} pesan masuk</span>
                  </div>
                  <h2 className="font-display font-bold text-2xl text-white tracking-tight">Pesan Pengunjung</h2>
                </div>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari pesan atau email..."
                  className="w-full sm:w-64 px-4 py-2 rounded-xl bg-[#010D2E] border border-[#C6A355]/50 text-white placeholder-blue-300/40 text-xs font-mono-code focus:outline-none focus:border-[#E2C275]"
                />
              </div>

              {filteredInquiries.length === 0 ? (
                <div className="rounded-3xl bg-[#021238]/60 border border-[#C6A355]/40 p-12 text-center text-blue-200/60 text-xs">
                  Belum ada pesan masuk.
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredInquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="rounded-[26px] bg-gradient-to-br from-[#052368]/95 via-[#03174C]/95 to-[#010C24] border-2 border-[#C6A355]/50 p-5 sm:p-6 flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-lg"
                    >
                      <div className="space-y-2.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="px-3 py-1 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[10px] font-mono-code font-bold text-[#F6DFB0]">
                            {inq.role}
                          </span>
                          <span className="text-xs font-mono-code text-[#E2C275] font-semibold">{inq.sender_email}</span>
                          <span className="text-[10px] font-mono-code text-blue-300/50">
                            {new Date(inq.created_at).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-[#010D2E] border border-white/10 text-xs text-blue-100/90 whitespace-pre-wrap leading-relaxed">
                          {inq.message}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0">
                        <a
                          href={`mailto:${inq.sender_email}?subject=Balasan Kolaborasi: ${encodeURIComponent(inq.role)} — Han Studio`}
                          className="px-3 py-1.5 rounded-xl bg-blue-900/60 hover:bg-blue-800 border border-blue-400/50 text-xs font-mono-code text-blue-100 transition-colors shadow"
                        >
                          Balas Email
                        </a>
                        <a
                          href={`https://wa.me/6282310699436?text=${encodeURIComponent(`Halo! Terima kasih atas pesan Anda mengenai [${inq.role}].`)}`}
                          target="_blank"
                          className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-xs font-mono-code text-emerald-200 transition-colors shadow"
                        >
                          WhatsApp
                        </a>
                        <button
                          onClick={() => handleDeleteInquiry(inq.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-500/50 text-xs font-mono-code text-rose-300 cursor-pointer transition-colors shadow"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* =================================================================== */}
      {/* MODAL 1: TOOL EDITOR */}
      {/* =================================================================== */}
      {editingTool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-[32px] bg-gradient-to-b from-[#052368] via-[#03174C] to-[#010C24] border-2 border-[#E2C275] shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden">
            <div className="absolute inset-[6px] rounded-[26px] border border-[#E2C275]/30 pointer-events-none" />

            <div className="shrink-0 flex items-center justify-between p-5 border-b border-[#C6A355]/40 bg-[#03174C]/95 relative z-10">
              <div>
                <span className="text-[10px] font-mono-code text-[#E2C275] block font-bold">✦ TOOL EDITOR ✦</span>
                <h3 className="font-display font-bold text-lg text-white">
                  {editingTool.name ? `Edit: ${editingTool.name}` : 'Tambah Creative Tool'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTool(null)}
                className="w-8 h-8 rounded-full bg-[#6B0F1A] hover:bg-[#8A1422] border border-[#E2C275] text-[#F6DFB0] flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTool} id="toolForm" className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs relative z-10 no-scrollbar">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">ID (SLUG)</label>
                  <input
                    type="text"
                    required
                    value={editingTool.id || ''}
                    onChange={(e) => setEditingTool({ ...editingTool, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="figma"
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code focus:border-[#E2C275] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">INISIAL (ABBR)</label>
                  <input
                    type="text"
                    required
                    value={editingTool.abbr || ''}
                    onChange={(e) => setEditingTool({ ...editingTool, abbr: e.target.value })}
                    placeholder="Fg"
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code focus:border-[#E2C275] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">NAMA SOFTWARE</label>
                  <input
                    type="text"
                    required
                    value={editingTool.name || ''}
                    onChange={(e) => setEditingTool({ ...editingTool, name: e.target.value })}
                    placeholder="Figma"
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white focus:border-[#E2C275] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">KATEGORI</label>
                  <input
                    type="text"
                    required
                    value={editingTool.category || ''}
                    onChange={(e) => setEditingTool({ ...editingTool, category: e.target.value })}
                    placeholder="DDM System & UI/UX"
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white focus:border-[#E2C275] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">STATUS PENGGUNAAN</label>
                  <input
                    type="text"
                    required
                    value={editingTool.usage || ''}
                    onChange={(e) => setEditingTool({ ...editingTool, usage: e.target.value })}
                    placeholder="98% atau Ready"
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code focus:border-[#E2C275] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">NO. URUT</label>
                  <input
                    type="number"
                    value={editingTool.order_num ?? 1}
                    onChange={(e) => setEditingTool({ ...editingTool, order_num: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code focus:border-[#E2C275] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#E2C275] font-mono-code font-bold mb-1">HIGHLIGHT UTAMA</label>
                <input
                  type="text"
                  required
                  value={editingTool.highlight || ''}
                  onChange={(e) => setEditingTool({ ...editingTool, highlight: e.target.value })}
                  placeholder="Sistem Feed 4:5, Poster & Live Team Collaboration"
                  className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white focus:border-[#E2C275] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#E2C275] font-mono-code font-bold mb-1">DESKRIPSI PERAN</label>
                <textarea
                  rows={2}
                  required
                  value={editingTool.desc || ''}
                  onChange={(e) => setEditingTool({ ...editingTool, desc: e.target.value })}
                  placeholder="Peran software dalam pekerjaan kepanitiaan..."
                  className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white focus:border-[#E2C275] focus:outline-none"
                />
              </div>

              {/* Icon Upload Zone */}
              <div className="p-3.5 rounded-2xl bg-[#010D2E] border border-[#C6A355]/30 space-y-2.5">
                <label className="block text-[#E2C275] font-mono-code font-bold">LOGO / ICON (SVG / PNG)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={editingTool.icon_url || ''}
                    onChange={(e) => setEditingTool({ ...editingTool, icon_url: e.target.value })}
                    placeholder="/icons/figma.svg atau https://..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#021238] border border-white/20 text-white font-mono-code text-xs focus:border-[#E2C275] focus:outline-none"
                  />
                  <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 border border-blue-400 text-[#F6DFB0] cursor-pointer shrink-0 font-mono-code font-bold shadow">
                    <span>{uploading ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(
                          e,
                          (url) => setEditingTool((prev) => (prev ? { ...prev, icon_url: url } : null)),
                          'icons'
                        )
                      }
                    />
                  </label>
                </div>

                {editingTool.icon_url && (
                  <div className="flex items-center gap-3 p-2 rounded-xl bg-[#021238] border border-white/10">
                    <img src={editingTool.icon_url} alt="Icon Preview" className="w-7 h-7 object-contain" />
                    <span className="text-[11px] text-blue-200/60 truncate flex-1 font-mono-code">
                      {editingTool.icon_url}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingTool({ ...editingTool, icon_url: '' })}
                      className="text-rose-400 text-xs hover:underline cursor-pointer px-2"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </form>

            <div className="shrink-0 flex items-center justify-end gap-2.5 p-4 border-t border-[#C6A355]/40 bg-[#03174C]/95 relative z-10">
              <button
                type="button"
                onClick={() => setEditingTool(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                form="toolForm"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6B0F1A] via-[#8A1422] to-[#6B0F1A] border border-[#E2C275] text-[#F6DFB0] font-bold shadow-lg hover:brightness-110 cursor-pointer"
              >
                Simpan ke Neon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: JOURNEY STOP EDITOR */}
      {/* =================================================================== */}
      {editingStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[32px] bg-gradient-to-b from-[#052368] via-[#03174C] to-[#010C24] border-2 border-[#E2C275] shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden">
            <div className="absolute inset-[6px] rounded-[26px] border border-[#E2C275]/30 pointer-events-none" />

            <div className="shrink-0 p-5 border-b border-[#C6A355]/40 bg-[#03174C]/95 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[10px] font-mono-code text-[#E2C275] block font-bold">✦ POS EKSPEDISI EDITOR ✦</span>
                  <h3 className="font-display font-bold text-lg text-white">
                    {editingStop.event ? `${editingStop.code} — ${editingStop.event}` : 'Tambah Pos Ekspedisi'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingStop(null)}
                  className="w-8 h-8 rounded-full bg-[#6B0F1A] hover:bg-[#8A1422] border border-[#E2C275] text-[#F6DFB0] flex items-center justify-center cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Sub-tabs inside modal */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#010D2E] border border-white/10 w-fit text-xs font-mono-code">
                <button
                  type="button"
                  onClick={() => setStopModalSubTab('info')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    stopModalSubTab === 'info'
                      ? 'bg-[#6B0F1A] text-[#F6DFB0] font-bold border border-[#E2C275]'
                      : 'text-blue-200/60 hover:text-white'
                  }`}
                >
                  ✦ Info Pos &amp; Peran
                </button>
                <button
                  type="button"
                  onClick={() => setStopModalSubTab('photos')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    stopModalSubTab === 'photos'
                      ? 'bg-[#6B0F1A] text-[#F6DFB0] font-bold border border-[#E2C275]'
                      : 'text-blue-200/60 hover:text-white'
                  }`}
                >
                  📷 Foto ({editingStop.photos?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setStopModalSubTab('outputs')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    stopModalSubTab === 'outputs'
                      ? 'bg-[#6B0F1A] text-[#F6DFB0] font-bold border border-[#E2C275]'
                      : 'text-blue-200/60 hover:text-white'
                  }`}
                >
                  🎨 Desain ({editingStop.outputs?.length || 0})
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveStop} id="stopForm" className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs relative z-10 no-scrollbar">
              {stopModalSubTab === 'info' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[#E2C275] font-mono-code font-bold mb-1">ID (SLUG)</label>
                      <input
                        type="text"
                        required
                        value={editingStop.id || ''}
                        onChange={(e) => setEditingStop({ ...editingStop, id: e.target.value })}
                        placeholder="pos-01"
                        className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code"
                      />
                    </div>
                    <div>
                      <label className="block text-[#E2C275] font-mono-code font-bold mb-1">KODE POS</label>
                      <input
                        type="text"
                        required
                        value={editingStop.code || ''}
                        onChange={(e) => setEditingStop({ ...editingStop, code: e.target.value })}
                        placeholder="POS 01"
                        className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code"
                      />
                    </div>
                    <div>
                      <label className="block text-[#E2C275] font-mono-code font-bold mb-1">NO. URUT</label>
                      <input
                        type="number"
                        required
                        value={editingStop.number ?? 1}
                        onChange={(e) => setEditingStop({ ...editingStop, number: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[#E2C275] font-mono-code font-bold mb-1">RUTE</label>
                      <input
                        type="number"
                        required
                        value={editingStop.route ?? 1}
                        onChange={(e) => setEditingStop({ ...editingStop, route: Number(e.target.value) })}
                        placeholder="1, 2, atau 3"
                        className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code"
                      />
                    </div>
                    <div>
                      <label className="block text-[#E2C275] font-mono-code font-bold mb-1">TAHUN</label>
                      <input
                        type="text"
                        required
                        value={editingStop.year || ''}
                        onChange={(e) => setEditingStop({ ...editingStop, year: e.target.value })}
                        placeholder="2024"
                        className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code"
                      />
                    </div>
                    <div>
                      <label className="block text-[#E2C275] font-mono-code font-bold mb-1">PERIODE</label>
                      <input
                        type="text"
                        required
                        value={editingStop.period || ''}
                        onChange={(e) => setEditingStop({ ...editingStop, period: e.target.value })}
                        placeholder="Agu - Okt 2024"
                        className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#E2C275] font-mono-code font-bold mb-1">NAMA ACARA</label>
                    <input
                      type="text"
                      required
                      value={editingStop.event || ''}
                      onChange={(e) => setEditingStop({ ...editingStop, event: e.target.value })}
                      placeholder="misal: PKKMB Fakultas Ilmu Komputer"
                      className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[#E2C275] font-mono-code font-bold mb-1">PERAN KEPANITIAAN</label>
                    <input
                      type="text"
                      required
                      value={editingStop.role || ''}
                      onChange={(e) => setEditingStop({ ...editingStop, role: e.target.value })}
                      placeholder="misal: Staff Publikasi & Dokumentasi"
                      className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[#E2C275] font-mono-code font-bold mb-1">RINGKASAN</label>
                    <textarea
                      rows={2}
                      required
                      value={editingStop.summary || ''}
                      onChange={(e) => setEditingStop({ ...editingStop, summary: e.target.value })}
                      placeholder="Ringkasan pengalaman..."
                      className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white leading-relaxed"
                    />
                  </div>

                  {/* TAG FILTER KEPANITIAAN: DIVISI & POSISI */}
                  <div className="p-4 rounded-2xl bg-[#010D2E] border border-[#C6A355]/40 space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[#E2C275] font-mono-code font-bold">
                          TAG DIVISI (Filter Peta Perjalanan)
                        </label>
                        <span className="text-[10px] text-blue-200/60 font-mono-code">Bisa pilih lebih dari satu</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { id: 'ddm', label: 'DDM / Desain' },
                          { id: 'foto', label: 'Foto / Dokumentasi' },
                          { id: 'operator', label: 'Operator' },
                          { id: 'lapangan', label: 'Lapangan / Korlap' },
                          { id: 'acara', label: 'Acara / Rundown' },
                          { id: 'humas', label: 'Humas / LO' },
                          { id: 'logistik', label: 'Logistik / Perkap' },
                          { id: 'konsumsi', label: 'Konsumsi' },
                          { id: 'sponsorship', label: 'Sponsorship / Danus' },
                          { id: 'keamanan', label: 'Keamanan' },
                          { id: 'dekorasi', label: 'Dekorasi' },
                        ].map((d) => {
                          const isSelected = (editingStop.roleTags || []).includes(d.id);
                          return (
                            <button
                              key={d.id}
                              type="button"
                              onClick={() => {
                                const current = editingStop.roleTags || [];
                                const next = isSelected
                                  ? current.filter((t) => t !== d.id)
                                  : [...current, d.id];
                                setEditingStop({ ...editingStop, roleTags: next });
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs font-mono-code font-bold border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#6B0F1A] text-[#F6DFB0] border-[#E2C275] shadow-md scale-105'
                                  : 'bg-[#021238] text-blue-200/60 border-white/20 hover:border-white/40'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}
                              {d.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-white/10">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[#E2C275] font-mono-code font-bold">
                          TAG POSISI (Filter Peta Perjalanan)
                        </label>
                        <span className="text-[10px] text-blue-200/60 font-mono-code">Bisa pilih lebih dari satu</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {[
                          { id: 'staff', label: 'Staff' },
                          { id: 'koord', label: 'Koordinator' },
                          { id: 'wakil', label: 'Wakil Koordinator' },
                          { id: 'ketua', label: 'Ketua Pelaksana' },
                          { id: 'wakil_ketua', label: 'Wakil Ketua' },
                          { id: 'volunteer', label: 'Volunteer' },
                          { id: 'bph', label: 'BPH / Pengurus' },
                        ].map((p) => {
                          const isSelected = (editingStop.roleTags || []).includes(p.id);
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                const current = editingStop.roleTags || [];
                                const next = isSelected
                                  ? current.filter((t) => t !== p.id)
                                  : [...current, p.id];
                                setEditingStop({ ...editingStop, roleTags: next });
                              }}
                              className={`px-3 py-1.5 rounded-full text-xs font-mono-code font-bold border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#6B0F1A] text-[#F6DFB0] border-[#E2C275] shadow-md scale-105'
                                  : 'bg-[#021238] text-blue-200/60 border-white/20 hover:border-white/40'
                              }`}
                            >
                              {isSelected ? '✓ ' : '+ '}
                              {p.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-white/10">
                      <label className="block text-[#E2C275] font-mono-code font-bold mb-1">
                        SEMUA TAG AKTIF / TAMBAH DIVISI &amp; POSISI KUSTOM (pisahkan dengan koma)
                      </label>
                      <input
                        type="text"
                        value={(editingStop.roleTags || []).join(', ')}
                        onChange={(e) => {
                          const tags = e.target.value
                            .split(',')
                            .map((t) => t.trim().toLowerCase())
                            .filter(Boolean);
                          setEditingStop({ ...editingStop, roleTags: tags });
                        }}
                        placeholder="ddm, foto, staff, lapangan, acara, humas, logistik..."
                        className="w-full px-3 py-2 rounded-xl bg-[#021238] border border-white/20 text-white font-mono-code text-xs"
                      />
                      <span className="text-[10px] text-blue-200/60 mt-1 block font-mono-code">
                        Tip: Jika kamu memasukkan divisi baru di sini (misal: <em>acara</em> atau <em>lapangan</em>), tombol filternya akan langsung muncul otomatis di baris filter DIVISI pada peta halaman utama!
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#E2C275] font-mono-code font-bold mb-1">MARKER PETA</label>
                      <input
                        type="text"
                        value={editingStop.marker || 'P1'}
                        onChange={(e) => setEditingStop({ ...editingStop, marker: e.target.value })}
                        placeholder="P1"
                        className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code"
                      />
                    </div>
                    <div>
                      <label className="block text-[#E2C275] font-mono-code font-bold mb-1">KOORDINAT (X% Y%)</label>
                      <input
                        type="text"
                        value={editingStop.coord || '50% 50%'}
                        onChange={(e) => setEditingStop({ ...editingStop, coord: e.target.value })}
                        placeholder="50% 50%"
                        className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code"
                      />
                    </div>
                  </div>
                </div>
              )}

              {stopModalSubTab === 'photos' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs font-mono-code text-[#E2C275]">
                      FOTO DOKUMENTASI LAPANGAN
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newPhoto: PhotoItem = {
                          id: `p-${Date.now()}`,
                          title: 'Dokumentasi',
                          meta: '50mm • f/1.8',
                          caption: 'Dokumentasi kegiatan',
                          scene: 'stage-blue',
                        };
                        setEditingStop({
                          ...editingStop,
                          photos: [...(editingStop.photos || []), newPhoto],
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 border border-blue-400 text-xs font-mono-code text-[#F6DFB0] cursor-pointer shadow"
                    >
                      + Tambah Foto
                    </button>
                  </div>

                  {(!editingStop.photos || editingStop.photos.length === 0) ? (
                    <div className="p-6 text-center text-blue-200/60 border border-white/10 rounded-2xl bg-[#010D2E]">
                      Belum ada foto dokumentasi.
                    </div>
                  ) : (
                    editingStop.photos.map((ph, idx) => (
                      <div key={ph.id || idx} className="p-3.5 rounded-2xl bg-[#010D2E] border border-white/15 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#E2C275] font-mono-code">FOTO #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (editingStop.photos || []).filter((_, i) => i !== idx);
                              setEditingStop({ ...editingStop, photos: updated });
                            }}
                            className="text-rose-400 text-xs hover:underline cursor-pointer"
                          >
                            ✕ Hapus
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <input
                            type="text"
                            value={ph.title}
                            onChange={(e) => {
                              const updated = [...(editingStop.photos || [])];
                              updated[idx].title = e.target.value;
                              setEditingStop({ ...editingStop, photos: updated });
                            }}
                            placeholder="Judul Foto"
                            className="px-3 py-1.5 rounded-xl bg-[#021238] border border-white/15 text-white"
                          />
                          <input
                            type="text"
                            value={ph.meta}
                            onChange={(e) => {
                              const updated = [...(editingStop.photos || [])];
                              updated[idx].meta = e.target.value;
                              setEditingStop({ ...editingStop, photos: updated });
                            }}
                            placeholder="50mm f/1.8"
                            className="px-3 py-1.5 rounded-xl bg-[#021238] border border-white/15 text-white font-mono-code"
                          />
                        </div>

                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={ph.scene}
                            onChange={(e) => {
                              const updated = [...(editingStop.photos || [])];
                              updated[idx].scene = e.target.value;
                              setEditingStop({ ...editingStop, photos: updated });
                            }}
                            placeholder="URL Gambar (/uploads/...)"
                            className="flex-1 px-3 py-1.5 rounded-xl bg-[#021238] border border-white/15 text-white font-mono-code text-xs"
                          />
                          <label className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 border border-blue-400 text-xs font-mono-code text-[#F6DFB0] cursor-pointer shrink-0 shadow">
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload(e, (url) => {
                                  const updated = [...(editingStop.photos || [])];
                                  updated[idx].scene = url;
                                  setEditingStop({ ...editingStop, photos: updated });
                                })
                              }
                            />
                          </label>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {stopModalSubTab === 'outputs' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs font-mono-code text-[#E2C275]">
                      HASIL KARYA DESAIN DDM
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newOutput: OutputItem = {
                          id: `out-${Date.now()}`,
                          title: 'Aset Visual',
                          type: 'Event Poster',
                          dim: '1920 × 1080 px',
                          tools: ['Figma', 'Illustrator'],
                          colors: ['#0038A8', '#E2C275'],
                          art: 'cover-banner',
                        };
                        setEditingStop({
                          ...editingStop,
                          outputs: [...(editingStop.outputs || []), newOutput],
                        });
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 border border-blue-400 text-xs font-mono-code text-[#F6DFB0] cursor-pointer shadow"
                    >
                      + Tambah Desain
                    </button>
                  </div>

                  {(!editingStop.outputs || editingStop.outputs.length === 0) ? (
                    <div className="p-6 text-center text-blue-200/60 border border-white/10 rounded-2xl bg-[#010D2E]">
                      Belum ada karya desain ditambahkan.
                    </div>
                  ) : (
                    editingStop.outputs.map((out, idx) => (
                      <div key={out.id || idx} className="p-3.5 rounded-2xl bg-[#010D2E] border border-white/15 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-[#E2C275] font-mono-code">KARYA #{idx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (editingStop.outputs || []).filter((_, i) => i !== idx);
                              setEditingStop({ ...editingStop, outputs: updated });
                            }}
                            className="text-rose-400 text-xs hover:underline cursor-pointer"
                          >
                            ✕ Hapus
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <input
                            type="text"
                            value={out.title}
                            onChange={(e) => {
                              const updated = [...(editingStop.outputs || [])];
                              updated[idx].title = e.target.value;
                              setEditingStop({ ...editingStop, outputs: updated });
                            }}
                            placeholder="Judul Desain"
                            className="px-3 py-1.5 rounded-xl bg-[#021238] border border-white/15 text-white"
                          />
                          <input
                            type="text"
                            value={out.type}
                            onChange={(e) => {
                              const updated = [...(editingStop.outputs || [])];
                              updated[idx].type = e.target.value;
                              setEditingStop({ ...editingStop, outputs: updated });
                            }}
                            placeholder="Tipe (Poster, Feed...)"
                            className="px-3 py-1.5 rounded-xl bg-[#021238] border border-white/15 text-white font-mono-code"
                          />
                        </div>

                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={out.art}
                            onChange={(e) => {
                              const updated = [...(editingStop.outputs || [])];
                              updated[idx].art = e.target.value;
                              setEditingStop({ ...editingStop, outputs: updated });
                            }}
                            placeholder="URL Gambar (/uploads/...)"
                            className="flex-1 px-3 py-1.5 rounded-xl bg-[#021238] border border-white/15 text-white font-mono-code text-xs"
                          />
                          <label className="px-3 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 border border-blue-400 text-xs font-mono-code text-[#F6DFB0] cursor-pointer shrink-0 shadow">
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload(e, (url) => {
                                  const updated = [...(editingStop.outputs || [])];
                                  updated[idx].art = url;
                                  setEditingStop({ ...editingStop, outputs: updated });
                                })
                              }
                            />
                          </label>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </form>

            <div className="shrink-0 flex items-center justify-end gap-2.5 p-4 border-t border-[#C6A355]/40 bg-[#03174C]/95 relative z-10">
              <button
                type="button"
                onClick={() => setEditingStop(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                form="stopForm"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6B0F1A] via-[#8A1422] to-[#6B0F1A] border border-[#E2C275] text-[#F6DFB0] font-bold shadow-lg hover:brightness-110 cursor-pointer"
              >
                Simpan ke Neon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: GALLERY WORK EDITOR */}
      {/* =================================================================== */}
      {editingWork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-[32px] bg-gradient-to-b from-[#052368] via-[#03174C] to-[#010C24] border-2 border-[#E2C275] shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden">
            <div className="absolute inset-[6px] rounded-[26px] border border-[#E2C275]/30 pointer-events-none" />

            <div className="shrink-0 flex items-center justify-between p-5 border-b border-[#C6A355]/40 bg-[#03174C]/95 relative z-10">
              <div>
                <span className="text-[10px] font-mono-code text-[#E2C275] block font-bold">
                  {editingWork.category === 'photography' ? '✦ FOTOGRAFI ✦' : '✦ GALLERY EDITOR ✦'}
                </span>
                <h3 className="font-display font-bold text-lg text-white">
                  {editingWork.title
                    ? `Edit: ${editingWork.title}`
                    : editingWork.category === 'photography'
                    ? 'Upload Foto Baru'
                    : 'Tambah Karya Galeri'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingWork(null)}
                className="w-8 h-8 rounded-full bg-[#6B0F1A] hover:bg-[#8A1422] border border-[#E2C275] text-[#F6DFB0] flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {editingWork.category === 'photography' ? (
              // ULTRA-CLEAN SIMPLIFIED PHOTOGRAPHY FORM
              <form onSubmit={handleSaveWork} id="workForm" className="flex-1 overflow-y-auto p-5 space-y-4 text-xs relative z-10 no-scrollbar">
                {/* 1. UPLOAD FOTO & PRATINJAU LANGSUNG */}
                <div className="p-4 rounded-2xl bg-[#010D2E] border-2 border-dashed border-[#C6A355]/60 hover:border-[#E2C275] transition-all space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[#E2C275] font-mono-code font-bold text-xs">
                      ✦ FILE FOTO <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[10px] font-mono-code text-blue-200/60">JPG, PNG, atau WebP</span>
                  </div>

                  {editingWork.art ? (
                    <div className="relative rounded-xl overflow-hidden border border-[#E2C275]/50 group">
                      <div className="aspect-[3/2] w-full max-h-56 bg-black/50">
                        <ArtPreview type={editingWork.art} title={editingWork.title || 'Preview Foto'} />
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-mono-code font-bold cursor-pointer text-xs shadow-md">
                          Ganti Foto
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, (url) => setEditingWork((prev) => (prev ? { ...prev, art: url } : null)))
                            }
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setEditingWork({ ...editingWork, art: '' })}
                          className="px-3 py-1.5 rounded-xl bg-red-800 hover:bg-red-700 text-white font-mono-code text-xs cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center py-7 px-4 rounded-xl border border-white/10 bg-[#021238]/60 hover:bg-[#021238] cursor-pointer transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-[#6B0F1A] border border-[#E2C275] flex items-center justify-center text-xl text-[#E2C275] mb-2 shadow-md">
                        📸
                      </div>
                      <span className="text-white font-bold text-xs">
                        {uploading ? 'Sedang mengunggah foto...' : 'Klik di sini untuk upload foto'}
                      </span>
                      <span className="text-[10px] text-blue-200/60 mt-0.5">
                        Foto otomatis tersimpan aman di database
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (url) => setEditingWork((prev) => (prev ? { ...prev, art: url } : null)))
                        }
                      />
                    </label>
                  )}

                  <input
                    type="text"
                    value={editingWork.art || ''}
                    onChange={(e) => setEditingWork({ ...editingWork, art: e.target.value })}
                    placeholder="Atau tempel URL gambar (/uploads/...)"
                    className="w-full px-3 py-1.5 rounded-lg bg-[#021238] border border-white/10 text-white font-mono-code text-[11px]"
                  />
                </div>

                {/* 2. JUDUL FOTO */}
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">
                    JUDUL FOTO <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingWork.title || ''}
                    onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })}
                    placeholder="Misal: Sorotan Panggung Utama, Golden Hour di Pantai, Street Portrait..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#010D2E] border border-white/20 text-white text-sm focus:border-[#E2C275] focus:outline-none"
                  />
                </div>

                {/* 3. LOKASI / ACARA / SERI & KAMERA (OPSIONAL) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#E2C275] font-mono-code font-bold mb-1">
                      LOKASI / ACARA / KATEGORI (OPSIONAL)
                    </label>
                    <input
                      type="text"
                      value={editingWork.committee || ''}
                      onChange={(e) => setEditingWork({ ...editingWork, committee: e.target.value })}
                      placeholder="Misal: Malang, Techfair, Portrait, Street..."
                      className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white placeholder-blue-300/30 text-xs"
                    />
                    <span className="text-[9px] text-blue-200/50 mt-0.5 block">Boleh dikosongkan jika bukan kepanitiaan</span>
                  </div>

                  <div>
                    <label className="block text-[#E2C275] font-mono-code font-bold mb-1">
                      KAMERA / GEAR (OPSIONAL)
                    </label>
                    <input
                      type="text"
                      value={editingWork.tools ? editingWork.tools.join(', ') : ''}
                      onChange={(e) =>
                        setEditingWork({
                          ...editingWork,
                          tools: e.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="Misal: Canon EOS, Sony A7, iPhone..."
                      className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white placeholder-blue-300/30 font-mono-code text-[11px]"
                    />
                    <span className="text-[9px] text-blue-200/50 mt-0.5 block">Pisahkan dengan koma jika lebih dari satu</span>
                  </div>
                </div>

                {/* 4. CERITA / KETERANGAN SINGKAT */}
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">
                    CERITA / KETERANGAN SINGKAT (OPSIONAL)
                  </label>
                  <textarea
                    rows={2}
                    value={editingWork.desc || ''}
                    onChange={(e) => setEditingWork({ ...editingWork, desc: e.target.value })}
                    placeholder="Ceritakan momen, pencahayaan, atau suasana di balik foto ini..."
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white text-xs leading-relaxed placeholder-blue-300/30"
                  />
                </div>

                {/* COLLAPSIBLE ADVANCED SETTINGS */}
                <details className="rounded-xl bg-[#010D2E]/60 border border-white/10 p-3 text-[11px]">
                  <summary className="cursor-pointer text-[#E2C275] font-mono-code font-bold select-none hover:text-white transition-colors">
                    ⚙️ Pengaturan Lanjutan (Ukuran Kartu &amp; Grid)
                  </summary>
                  <div className="mt-3 space-y-3 pt-2.5 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-blue-200/80 font-mono-code mb-1">ASPEK RASIO KARTU</label>
                        <select
                          value={editingWork.aspectClass || 'aspect-[3/2]'}
                          onChange={(e) => setEditingWork({ ...editingWork, aspectClass: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#021238] border border-white/20 text-white text-[11px]"
                        >
                          <option value="aspect-[3/2]">Landscape Kamera 3:2 (Default)</option>
                          <option value="aspect-[16/9]">Landscape Lebar 16:9</option>
                          <option value="aspect-[4/3]">Standar 4:3</option>
                          <option value="aspect-[4/5]">Portrait / Feed 4:5</option>
                          <option value="aspect-square">Square 1:1</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-blue-200/80 font-mono-code mb-1">LEBAR GRID</label>
                        <select
                          value={editingWork.spanClass || 'md:col-span-6 lg:col-span-4'}
                          onChange={(e) => setEditingWork({ ...editingWork, spanClass: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#021238] border border-white/20 text-white text-[11px]"
                        >
                          <option value="md:col-span-6 lg:col-span-4">Standar (3 per baris)</option>
                          <option value="md:col-span-6">Sedang (2 per baris)</option>
                          <option value="md:col-span-12">Lebar Penuh (1 per baris)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </details>
              </form>
            ) : (
              // FORM UNTUK KARYA DESAIN GRAFIS
              <form onSubmit={handleSaveWork} id="workForm" className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs relative z-10 no-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#E2C275] font-mono-code font-bold mb-1">ID (SLUG)</label>
                    <input
                      type="text"
                      required
                      value={editingWork.id || ''}
                      onChange={(e) => setEditingWork({ ...editingWork, id: e.target.value })}
                      placeholder="w-01"
                      className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code"
                    />
                  </div>
                  <div>
                    <label className="block text-[#E2C275] font-mono-code font-bold mb-1">KATEGORI</label>
                    <select
                      value={editingWork.category || 'poster'}
                      onChange={(e) => {
                        const cat = e.target.value;
                        let label = 'Event Poster';
                        if (cat === 'feed') label = 'Social Media Feed';
                        if (cat === 'identity') label = 'Identity & Print';
                        setEditingWork({ ...editingWork, category: cat, categoryLabel: label });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white"
                    >
                      <option value="poster">Poster Event</option>
                      <option value="feed">Social Media Feed (4:5)</option>
                      <option value="identity">Identity &amp; Print</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">JUDUL KARYA</label>
                  <input
                    type="text"
                    required
                    value={editingWork.title || ''}
                    onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })}
                    placeholder="Judul karya..."
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#E2C275] font-mono-code font-bold mb-1">KEPANITIAAN / ACARA</label>
                    <input
                      type="text"
                      required
                      value={editingWork.committee || ''}
                      onChange={(e) => setEditingWork({ ...editingWork, committee: e.target.value })}
                      placeholder="INNOFAIR 2024"
                      className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[#E2C275] font-mono-code font-bold mb-1">DIMENSI UKURAN</label>
                    <input
                      type="text"
                      required
                      value={editingWork.dim || ''}
                      onChange={(e) => setEditingWork({ ...editingWork, dim: e.target.value })}
                      placeholder="1080 × 1350 px"
                      className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code"
                    />
                  </div>
                </div>

                {/* Aspect Ratio & Span Controls */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#E2C275] font-mono-code font-bold mb-1">ASPEK RASIO KARTU</label>
                    <select
                      value={editingWork.aspectClass || 'aspect-[16/10]'}
                      onChange={(e) => setEditingWork({ ...editingWork, aspectClass: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white text-xs font-mono-code"
                    >
                      <option value="aspect-[3/2]">Landscape Kamera 3:2</option>
                      <option value="aspect-[16/9]">Landscape Lebar 16:9</option>
                      <option value="aspect-[4/3]">Landscape Standar 4:3</option>
                      <option value="aspect-[16/10]">Landscape 16:10</option>
                      <option value="aspect-[4/5]">Feed Instagram 4:5</option>
                      <option value="aspect-[9/16]">Poster / Banner 9:16</option>
                      <option value="aspect-square">Square 1:1</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#E2C275] font-mono-code font-bold mb-1">LEBAR GRID</label>
                    <select
                      value={editingWork.spanClass || 'md:col-span-6'}
                      onChange={(e) => setEditingWork({ ...editingWork, spanClass: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white text-xs font-mono-code"
                    >
                      <option value="md:col-span-6 lg:col-span-4">Standar (4 Kolom / 3 per baris)</option>
                      <option value="md:col-span-6">Sedang (6 Kolom / 2 per baris)</option>
                      <option value="md:col-span-12">Lebar Penuh (12 Kolom / 1 per baris)</option>
                    </select>
                  </div>
                </div>

                {/* Tools Input */}
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">TOOLS YANG DIGUNAKAN</label>
                  <input
                    type="text"
                    value={editingWork.tools ? editingWork.tools.join(', ') : ''}
                    onChange={(e) =>
                      setEditingWork({
                        ...editingWork,
                        tools: e.target.value
                          .split(',')
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="Figma, Lightroom, Photoshop"
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code text-xs"
                  />
                </div>

                {/* Colors Palette Input */}
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">PALET WARNA HEX</label>
                  <input
                    type="text"
                    value={editingWork.colors ? editingWork.colors.join(', ') : ''}
                    onChange={(e) =>
                      setEditingWork({
                        ...editingWork,
                        colors: e.target.value
                          .split(',')
                          .map((c) => c.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="#0038A8, #C6A355, #6B0F1A"
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code text-xs"
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">DESKRIPSI KARYA (OPSIONAL)</label>
                  <textarea
                    rows={2}
                    value={editingWork.desc || ''}
                    onChange={(e) => setEditingWork({ ...editingWork, desc: e.target.value })}
                    placeholder="Deskripsi konsep visual, tujuan desain, atau konteks acara..."
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white text-xs leading-relaxed"
                  />
                </div>

                {/* Cover Art Upload Zone */}
                <div className="p-3.5 rounded-2xl bg-[#010D2E] border border-[#C6A355]/30 space-y-2.5">
                  <label className="block text-[#E2C275] font-mono-code font-bold">GAMBAR COVER / PREVIEW</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={editingWork.art || ''}
                      onChange={(e) => setEditingWork({ ...editingWork, art: e.target.value })}
                      placeholder="URL gambar (/uploads/...)"
                      className="flex-1 px-3 py-2 rounded-xl bg-[#021238] border border-white/20 text-white font-mono-code text-xs"
                    />
                    <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-900 to-blue-800 hover:from-blue-800 hover:to-blue-700 border border-blue-400 text-[#F6DFB0] cursor-pointer shrink-0 font-mono-code font-bold shadow">
                      <span>{uploading ? '...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (url) => setEditingWork((prev) => (prev ? { ...prev, art: url } : null)))
                        }
                      />
                    </label>
                  </div>

                  {editingWork.art && (
                    <div className="h-32 rounded-xl overflow-hidden border border-[#E2C275]/40 relative mt-2">
                      <ArtPreview type={editingWork.art} title={editingWork.title} />
                    </div>
                  )}
                </div>
              </form>
            )}

            <div className="shrink-0 flex items-center justify-end gap-2.5 p-4 border-t border-[#C6A355]/40 bg-[#03174C]/95 relative z-10">
              <button
                type="button"
                onClick={() => setEditingWork(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                form="workForm"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6B0F1A] via-[#8A1422] to-[#6B0F1A] border border-[#E2C275] text-[#F6DFB0] font-bold shadow-lg hover:brightness-110 cursor-pointer"
              >
                Simpan ke Neon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: CERTIFICATE EDITOR */}
      {/* =================================================================== */}
      {editingCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-[32px] bg-gradient-to-b from-[#052368] via-[#03174C] to-[#010C24] border-2 border-[#E2C275] shadow-[0_24px_70px_rgba(0,0,0,0.85)] overflow-hidden">
            <div className="absolute inset-[6px] rounded-[26px] border border-[#E2C275]/30 pointer-events-none" />

            <div className="shrink-0 flex items-center justify-between p-5 border-b border-[#C6A355]/40 bg-[#03174C]/95 relative z-10">
              <div>
                <span className="text-[10px] font-mono-code text-[#E2C275] block font-bold">
                  ✦ CERTIFICATE RECOGNITION EDITOR ✦
                </span>
                <h3 className="font-display font-bold text-lg text-white">
                  {editingCertificate.title ? `Edit: ${editingCertificate.title}` : 'Tambah Sertifikat Kepanitiaan'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCertificate(null)}
                className="w-8 h-8 rounded-full bg-[#6B0F1A] hover:bg-[#8A1422] border border-[#E2C275] text-[#F6DFB0] flex items-center justify-center cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSaveCertificate}
              id="certificateForm"
              className="flex-1 overflow-y-auto p-5 space-y-4 text-xs relative z-10 no-scrollbar"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">ID (SLUG)</label>
                  <input
                    type="text"
                    required
                    value={editingCertificate.id || ''}
                    onChange={(e) =>
                      setEditingCertificate({
                        ...editingCertificate,
                        id: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
                      })
                    }
                    placeholder="cert-dies-natalis-60"
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code focus:border-[#E2C275] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">KATEGORI</label>
                  <select
                    value={editingCertificate.category || 'Kepanitiaan'}
                    onChange={(e) =>
                      setEditingCertificate({ ...editingCertificate, category: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white focus:border-[#E2C275] focus:outline-none"
                  >
                    <option value="Kepanitiaan">Kepanitiaan</option>
                    <option value="Organisasi">Organisasi</option>
                    <option value="Volunteer">Volunteer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">JUDUL SERTIFIKAT</label>
                  <input
                    type="text"
                    required
                    value={editingCertificate.title || ''}
                    onChange={(e) =>
                      setEditingCertificate({ ...editingCertificate, title: e.target.value })
                    }
                    placeholder="Sertifikat Kepanitiaan / Volunteer"
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white focus:border-[#E2C275] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">NAMA ACARA / EVENT</label>
                  <input
                    type="text"
                    required
                    value={editingCertificate.event || ''}
                    onChange={(e) =>
                      setEditingCertificate({ ...editingCertificate, event: e.target.value })
                    }
                    placeholder="Nama Acara / Kegiatan / Organisasi"
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white focus:border-[#E2C275] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">PERAN / JABATAN</label>
                  <input
                    type="text"
                    required
                    value={editingCertificate.role || ''}
                    onChange={(e) =>
                      setEditingCertificate({ ...editingCertificate, role: e.target.value })
                    }
                    placeholder="Koordinator / Staff / LO / Anggota"
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white focus:border-[#E2C275] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">LEMBAGA / PENERBIT</label>
                  <input
                    type="text"
                    value={editingCertificate.issuer || ''}
                    onChange={(e) =>
                      setEditingCertificate({ ...editingCertificate, issuer: e.target.value })
                    }
                    placeholder="Panitia Pelaksana / BEM / Lembaga"
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white focus:border-[#E2C275] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">TAHUN / PERIODE</label>
                  <input
                    type="text"
                    value={editingCertificate.year || ''}
                    onChange={(e) =>
                      setEditingCertificate({ ...editingCertificate, year: e.target.value })
                    }
                    placeholder="2024"
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code focus:border-[#E2C275] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#E2C275] font-mono-code font-bold mb-1">NOMOR URUT TAMPIL</label>
                  <input
                    type="number"
                    value={editingCertificate.orderNum ?? 0}
                    onChange={(e) =>
                      setEditingCertificate({
                        ...editingCertificate,
                        orderNum: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white font-mono-code focus:border-[#E2C275] focus:outline-none"
                  />
                </div>
              </div>

              {/* Upload Foto / Scan Sertifikat */}
              <div className="p-3.5 rounded-2xl bg-[#010D2E]/90 border border-white/10 space-y-2.5">
                <label className="block text-[#E2C275] font-mono-code font-bold">
                  FOTO / SCAN SERTIFIKAT (GAMBAR)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingCertificate.imageUrl || ''}
                    onChange={(e) =>
                      setEditingCertificate({ ...editingCertificate, imageUrl: e.target.value })
                    }
                    placeholder="/uploads/... atau https://..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#020F30] border border-white/20 text-white font-mono-code focus:border-[#E2C275] focus:outline-none text-[11px]"
                  />
                  <label className="px-3 py-2 rounded-xl bg-[#6B0F1A] hover:bg-[#8A1422] border border-[#E2C275] text-[#F6DFB0] font-mono-code text-[11px] font-bold cursor-pointer transition-colors shrink-0">
                    {uploading ? 'Mengunggah...' : 'Unggah Foto'}
                    <input
                      type="file"
                      accept="image/*,.pdf,application/pdf"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) =>
                        handleFileUpload(e, (url, resData) =>
                          setEditingCertificate((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  imageUrl: resData?.thumbnailUrl || url,
                                  credentialUrl: url.toLowerCase().includes('.pdf') ? url : prev.credentialUrl,
                                }
                              : null
                          )
                        )
                      }
                    />
                  </label>
                </div>

                {editingCertificate.imageUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-[#E2C275]/40 h-36 bg-[#020F30] flex items-center justify-center">
                    <img
                      src={editingCertificate.imageUrl}
                      alt="Preview Sertifikat"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setEditingCertificate((prev) => (prev ? { ...prev, imageUrl: '' } : null))
                      }
                      className="absolute top-2 right-2 px-2 py-0.5 rounded-lg bg-rose-950/80 border border-rose-500 text-rose-300 text-[10px] font-mono-code cursor-pointer"
                    >
                      Hapus Foto
                    </button>
                  </div>
                )}
              </div>

              {/* Link Kredensial / File PDF */}
              <div className="p-3.5 rounded-2xl bg-[#010D2E]/90 border border-white/10 space-y-2.5">
                <label className="block text-[#E2C275] font-mono-code font-bold">
                  LINK KREDENSIAL / FILE PDF DOKUMEN (OPSIONAL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingCertificate.credentialUrl || ''}
                    onChange={(e) =>
                      setEditingCertificate({
                        ...editingCertificate,
                        credentialUrl: e.target.value,
                      })
                    }
                    placeholder="https://... atau /uploads/sertifikat.pdf"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#020F30] border border-white/20 text-white font-mono-code focus:border-[#E2C275] focus:outline-none text-[11px]"
                  />
                  <label className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-blue-200 font-mono-code text-[11px] cursor-pointer transition-colors shrink-0">
                    {uploading ? 'Mengunggah...' : 'Unggah PDF'}
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) =>
                        handleFileUpload(e, (url, resData) =>
                          setEditingCertificate((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  credentialUrl: url,
                                  imageUrl: prev.imageUrl || resData?.thumbnailUrl || '',
                                }
                              : null
                          )
                        )
                      }
                    />
                  </label>
                </div>

                {editingCertificate.credentialUrl && editingCertificate.credentialUrl.toLowerCase().includes('.pdf') && (
                  <div className="p-3 rounded-xl bg-[#020F30] border border-[#E2C275]/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#6B0F1A] border border-[#E2C275] flex items-center justify-center text-[#E2C275] shrink-0 font-bold text-xs">
                        PDF
                      </div>
                      <div className="min-w-0">
                        <span className="block text-white font-mono-code text-[11px] truncate">
                          {editingCertificate.credentialUrl.split('/').pop()}
                        </span>
                        <span className="block text-[10px] font-mono-code text-[#E2C275]">
                          Dokumen PDF Terpasang
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={editingCertificate.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-[#E2C275] hover:bg-[#F5D98E] text-[#021238] font-bold text-[10px] font-mono-code"
                      >
                        Buka PDF ↗
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingCertificate((prev) => (prev ? { ...prev, credentialUrl: '' } : null))
                        }
                        className="px-2 py-1 rounded-lg bg-rose-950/80 border border-rose-500 text-rose-300 text-[10px] font-mono-code cursor-pointer"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-[#E2C275] font-mono-code font-bold mb-1">
                  CATATAN / DESKRIPSI KONTRIBUSI (OPSIONAL)
                </label>
                <textarea
                  rows={2}
                  value={editingCertificate.desc || ''}
                  onChange={(e) =>
                    setEditingCertificate({ ...editingCertificate, desc: e.target.value })
                  }
                  placeholder="Catatan peran, kontribusi, atau pencapaian selama kegiatan berlangsung..."
                  className="w-full px-3 py-2 rounded-xl bg-[#010D2E] border border-white/20 text-white focus:border-[#E2C275] focus:outline-none leading-relaxed"
                />
              </div>
            </form>

            <div className="shrink-0 flex items-center justify-end gap-2.5 p-4 border-t border-[#C6A355]/40 bg-[#03174C]/95 relative z-10">
              <button
                type="button"
                onClick={() => setEditingCertificate(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                form="certificateForm"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6B0F1A] via-[#8A1422] to-[#6B0F1A] border border-[#E2C275] text-[#F6DFB0] font-bold shadow-lg hover:brightness-110 cursor-pointer"
              >
                Simpan ke Neon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
