import { config } from './config';
const INTENTS = [
  {
    keys: ['halo', 'hai', 'selamat', 'pagi', 'siang', 'malam'],
    reply: 'Halo! Saya asisten Gopa Gym. Tanyakan tentang jam buka, paket, fasilitas, atau check-in.',
  },
  {
    keys: ['diet', 'cedera', 'sakit', 'obat', 'nyeri', 'medis'],
    reply:
      'Untuk saran diet atau kondisi cedera/kesehatan, silakan konsultasi langsung dengan pelatih kami. Chatbot tidak memberikan saran medis.',
  },
  {
    keys: ['jam', 'buka', 'tutup', 'operasional'],
    reply: `${config.appName} buka setiap hari pukul ${config.gym.hours}.`,
  },
  {
    keys: ['harga', 'paket', 'biaya', 'tarif', 'membership'],
    reply:
      'Paket membership: Basic Rp150.000 (30 hari), Standard Rp300.000 (90 hari), Premium Rp550.000 (180 hari).',
  },
  {
    keys: ['fasilitas', 'alat', 'loker', 'locker', 'kelas', 'parkir', 'shower'],
    reply:
      'Fasilitas kami: area gym dengan alat modern, loker, kelas (Strength Foundations, HIIT, Mobility & Recovery), dan parkir.',
  },
  {
    keys: ['perpanjang', 'kedaluwarsa', 'expired', 'habis', 'masa aktif'],
    reply:
      'Masa aktif membership bisa dilihat di Dashboard Member. Untuk perpanjangan, silakan hubungi staff di resepsionis.',
  },
  {
    keys: ['check-in', 'checkin', 'barcode', 'qr', 'scan', 'absen'],
    reply:
      'Buka menu Barcode di aplikasi lalu pindai di resepsionis. Check-in hanya diterima jika membership masih aktif.',
  },
];

export const QUICK_REPLIES = ['Jam buka?', 'Paket membership', 'Fasilitas apa saja?', 'Cara check-in'];

export const FALLBACK =
  'Maaf, saya hanya bisa menjawab seputar layanan dan fasilitas Gopa Gym. Silakan hubungi staff untuk bantuan lain.';

export function reply(text) {
  const t = text.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const intent of INTENTS) {
    const score = intent.keys.filter((k) => t.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }
  return best ? best.reply : FALLBACK;
}
