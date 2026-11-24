/**
 * Konstanta konfigurasi frontend BrewSpace
 */

// Supabase Public Config
const configuredSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_URL = configuredSupabaseUrl
  .replace(/\/rest\/v1\/?$/i, '')
  .replace(/\/+$/, '');
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

// Pilihan tingkat gilingan kopi
export const GRIND_OPTIONS = [
  { id: 'Biji Utuh', label: 'Biji Utuh', desc: 'Disimpan lebih tahan lama' },
  { id: 'Kasar', label: 'Kasar', desc: 'Cocok untuk Cold Brew & French Press' },
  { id: 'Sedang', label: 'Sedang', desc: 'Cocok untuk V60, Drip, & Aeropress' },
  { id: 'Halus', label: 'Halus', desc: 'Cocok untuk Espresso & Kopi Tubruk' }
];

// Metode pembayaran toko
export const PAYMENT_METHODS = [
  { id: 'QRIS', name: 'QRIS GoPay Merchant', desc: 'Bayar dengan GoPay, mobile banking, atau e-wallet yang mendukung QRIS' }
];

/**
 * Format angka ke mata uang Rupiah (contoh: Rp 85.000)
 */
export const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number || 0);
};

/**
 * Format tanggal ISO ke format Indonesia yang mudah dibaca
 */
export const formatDate = (isoString) => {
  if (!isoString) return '-';
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
