export const DIVISION_OPTIONS = [
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
] as const;

export const POSITION_OPTIONS = [
  { id: 'staff', label: 'Staff' },
  { id: 'koord', label: 'Koordinator' },
  { id: 'wakil', label: 'Wakil Koordinator' },
  { id: 'ketua', label: 'Ketua Pelaksana' },
  { id: 'wakil_ketua', label: 'Wakil Ketua' },
  { id: 'volunteer', label: 'Volunteer' },
  { id: 'bph', label: 'BPH / Pengurus' },
] as const;

export const DIVISION_MAP: Record<string, string> = {
  ddm: 'DDM / Desain',
  foto: 'Foto / Dokumentasi',
  operator: 'Operator',
  lapangan: 'Lapangan / Korlap',
  korlap: 'Lapangan / Korlap',
  acara: 'Acara / Rundown',
  humas: 'Humas / LO',
  logistik: 'Logistik / Perkap',
  konsumsi: 'Konsumsi',
  sponsorship: 'Sponsorship / Danus',
  danus: 'Sponsorship / Danus',
  keamanan: 'Keamanan',
  dekorasi: 'Dekorasi',
  publikasi: 'Publikasi',
};

export const POSITION_MAP: Record<string, string> = {
  staff: 'Staff',
  koord: 'Koordinator',
  koordinator: 'Koordinator',
  wakil: 'Wakil Koordinator',
  wakil_koord: 'Wakil Koordinator',
  ketua: 'Ketua Pelaksana',
  ketupel: 'Ketua Pelaksana',
  wakil_ketua: 'Wakil Ketua',
  volunteer: 'Volunteer',
  bph: 'BPH / Pengurus',
};

export const POSITION_KEYS = new Set([
  'staff',
  'koord',
  'koordinator',
  'wakil',
  'wakil_koord',
  'ketua',
  'ketupel',
  'wakil_ketua',
  'volunteer',
  'bph',
]);

export function formatTagLabel(tag: string, type: 'divisi' | 'posisi'): string {
  const clean = tag.toLowerCase().trim();
  if (type === 'posisi' && POSITION_MAP[clean]) {
    return POSITION_MAP[clean];
  }
  if (type === 'divisi' && DIVISION_MAP[clean]) {
    return DIVISION_MAP[clean];
  }
  // Fallback: title case
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
