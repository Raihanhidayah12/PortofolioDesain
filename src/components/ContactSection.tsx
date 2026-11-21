import React, { useState } from 'react';
import {
  IconPhone,
  IconMail,
  IconTicket,
} from './icons';

export const ContactSection: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const myEmail = 'g3muhraihan.hidayah@gmail.com';
  const myPhone = '+62 823-1069-9436'; // Nomor WhatsApp Han
  const myPhoneClean = myPhone.replace(/\D/g, '').replace(/^0/, '62'); // Format angka untuk WhatsApp (6282310699436)

  const collaborationTypes = [
    {
      id: 'ddm',
      role: 'Tawaran Divisi DDM Event',
      badge: 'Koordinator / Staff DDM Acara',
      icon: '🎨',
      message: 'Halo Han! Kami dari panitia [Nama Acara] tertarik mengajak kamu bergabung ke dalam divisi DDM (Desain, Dokumentasi & Media). Boleh diskusi mengenai ketersediaan dan peran ini?'
    },
    {
      id: 'design',
      role: 'Jasa Desain Grafis / Joki Desain',
      badge: 'Poster, Feed 4:5, ID Card, Modul',
      icon: '✍️',
      message: 'Halo Han! Saya butuh bantuan jasa desain grafis untuk kebutuhan [Poster Resmi / Feed Instagram 4:5 / ID Card & Lanyard / Backdrop Acara]. Mau tanya pricelist dan estimasi pengerjaannya ya!'
    },
    {
      id: 'photo',
      role: 'Tim Dokumentasi Kegiatan & Foto',
      badge: 'Foto Panggung, Candid, Culling Hari-H',
      icon: '📸',
      message: 'Halo Han! Kami butuh tim dokumentasi foto untuk meliput kegiatan acara [Nama Acara] pada tanggal [Tanggal]. Mau tanya ketersediaan jadwal dan sistem liputannya ya!'
    },
    {
      id: 'operator',
      role: 'Operator Lapangan & Media Acara',
      badge: 'Visual Display, Broadcast, Teknis Acara',
      icon: '⚙️',
      message: 'Halo Han! Kami memerlukan operator lapangan / visual display untuk mengontrol materi visual panggung dan kelancaran teknis live acara [Nama Acara]. Boleh diskusi untuk kolaborasi ini?'
    }
  ];

  const selectedType = collaborationTypes.find(t => t.id === selectedRole);

  const handleEmailClick = () => {
    if (!selectedRole) {
      alert('Pilih tipe kolaborasi terlebih dahulu');
      return;
    }
    const message = selectedType?.message || '';
    const subject = encodeURIComponent(`Kolaborasi Kreatif: ${selectedType?.role}`);
    const body = encodeURIComponent(message);

    // Simpan ke database Neon di background secara otomatis
    try {
      fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: selectedType?.role || 'General',
          message: message,
          senderEmail: 'anonymous@visitor.com',
        }),
      }).catch(err => console.warn('Background Neon DB save:', err));
    } catch (e) {
      console.warn('Neon DB error:', e);
    }

    // Buka aplikasi email menuju Gmail
    window.location.href = `mailto:${myEmail}?subject=${subject}&body=${body}`;
  };

  const handleWhatsAppClick = () => {
    if (!selectedRole) {
      alert('Pilih tipe kolaborasi terlebih dahulu');
      return;
    }
    const message = selectedType?.message || '';
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${myPhoneClean}?text=${encodedMessage}`, '_blank');
  };

  return (
    <section
      id="contact"
      className="py-14 sm:py-20 md:py-28 px-3 sm:px-6 md:px-8 max-w-5xl mx-auto"
    >
      <div
        className="rounded-[28px] sm:rounded-[38px] md:rounded-[50px] border-[2px] sm:border-[2.5px] border-[#E2C275] p-4 sm:p-8 md:p-12 relative overflow-hidden shadow-[0_24px_70px_rgba(0,0,0,0.65)]"
        style={{
          background:
            'radial-gradient(circle at 50% 0%, #0044C4 0%, #031747 58%, #021033 100%)'
        }}
      >
        {/* Inner Art-Deco Gold Frame */}
        <div className="absolute inset-[4px] sm:inset-[6px] rounded-[24px] sm:rounded-[32px] md:rounded-[44px] border border-[#C6A355]/75 pointer-events-none" />

        {/* VIP Pass Ticket Side Notches */}
        <div
          aria-hidden="true"
          className="hidden md:block w-8 h-8 rounded-full bg-[#021238] border-2 border-[#E2C275] absolute -left-4 top-1/2 -translate-y-1/2 z-20"
        />
        <div
          aria-hidden="true"
          className="hidden md:block w-8 h-8 rounded-full bg-[#021238] border-2 border-[#E2C275] absolute -right-4 top-1/2 -translate-y-1/2 z-20"
        />

        <div className="relative z-10 text-center max-w-2xl mx-auto">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-1 rounded-full bg-[#6B0F1A] border border-[#E2C275] text-[10px] sm:text-[11px] font-mono-code text-[#F6DFB0]">
              <IconTicket className="w-3.5 h-3.5 text-[#E2C275] shrink-0" />
              <span>✦ DDM • JASA DESAIN • DOKUMENTASI • OPERATOR ✦</span>
            </span>
          </div>

          <h2 className="font-display font-bold text-2xl sm:text-4xl md:text-5xl text-white tracking-tight drop-shadow-[0_6px_14px_rgba(0,0,0,0.5)] leading-tight">
            Ajak Kolaborasi: DDM, Desain, Dokumentasi &amp; Operator
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/85 mt-2.5 sm:mt-3 leading-relaxed max-w-xl mx-auto">
            Tertarik merekrut saya ke divisi DDM event kamu, butuh jasa joki desain grafis cepat, tim dokumentasi foto lapangan, atau operator acara? Pilih kebutuhan di bawah ini:
          </p>
        </div>

        <div className="relative z-10 mt-6 sm:mt-8 max-w-3xl mx-auto space-y-6 sm:space-y-8">
          {/* Step 1: Select Collaboration Type */}
          <div>
            <label className="block text-[10px] sm:text-[11px] font-mono-code text-[#E2C275] mb-3 uppercase">
              ✦ Step 1: Pilih Kebutuhan Kolaborasi
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              {collaborationTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedRole(type.id)}
                  className={`px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl text-left text-xs sm:text-sm font-bold border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    selectedRole === type.id
                      ? 'bg-[#6B0F1A]/70 text-[#E2C275] border-[#E2C275] shadow-lg scale-[1.01]'
                      : 'bg-[#021238]/85 text-white border-[#C6A355]/60 hover:border-[#E2C275]'
                  }`}
                >
                  <span className="text-xl sm:text-2xl mt-0.5 shrink-0">{type.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="block font-bold leading-snug">{type.role}</span>
                    <span className="block text-[10px] sm:text-[11px] font-mono-code text-blue-200/80 mt-1">
                      {type.badge}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Contact Methods - Only show if role selected */}
          {selectedRole && (
            <div className="animate-slide-up pt-6 border-t-2 border-[#C6A355]/30 space-y-4">
              <label className="block text-[10px] sm:text-[11px] font-mono-code text-[#E2C275] uppercase">
                ✦ Step 2: Pilih Cara Hubungi
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {/* Email Button */}
                <button
                  onClick={handleEmailClick}
                  className="flex-1 rounded-xl sm:rounded-2xl bg-[#021238]/85 border-2 border-[#C6A355]/70 hover:border-[#E2C275] hover:bg-[#041A4D] text-[#E2C275] p-4 sm:p-5 transition-all duration-300 flex items-center justify-center gap-3 font-bold text-sm sm:text-base group hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <IconMail className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                  <span>Email</span>
                </button>

                {/* WhatsApp Button */}
                <button
                  onClick={handleWhatsAppClick}
                  className="flex-1 rounded-xl sm:rounded-2xl bg-[#021238]/85 border-2 border-[#6B0F1A]/80 hover:border-[#E2C275] hover:bg-[#6B0F1A]/40 text-[#E2C275] p-4 sm:p-5 transition-all duration-300 flex items-center justify-center gap-3 font-bold text-sm sm:text-base group hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  <IconPhone className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
                  <span>WhatsApp</span>
                </button>
              </div>

              {/* Preview Message */}
              <div className="pt-4 border-t border-[#C6A355]/30">
                <p className="text-[10px] sm:text-[11px] font-mono-code text-[#E2C275] mb-2.5 uppercase">📝 Preview Pesan:</p>
                <div className="bg-[#021238]/70 rounded-xl sm:rounded-2xl border border-[#C6A355]/60 p-3.5 sm:p-4">
                  <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">{selectedType?.message}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Info */}
          {!selectedRole && (
            <div className="text-center pt-4">
              <p className="text-[11px] sm:text-xs text-blue-200/60">
                Mulai dengan memilih tipe kolaborasi di atas ↑
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
