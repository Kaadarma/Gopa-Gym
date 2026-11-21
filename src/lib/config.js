// Konfigurasi yang bisa diubah lewat file .env (lihat .env.example).
// Semua variabel Vite harus diawali VITE_. Jangan menaruh secret di frontend.
const env = import.meta.env;

export const config = {
  appName: env.VITE_APP_NAME || 'Gopa Gym',
  gym: {
    address: env.VITE_GYM_ADDRESS || 'Jl. Bypass Ngurah Rai No.88, Karangasem',
    email: env.VITE_GYM_EMAIL || 'hello@gopagym.id',
    phone: env.VITE_GYM_PHONE || '+62 812 3456 7890',
    hours: env.VITE_GYM_HOURS || '06.00 - 22.00 WIB',
  },
  // Maksimal ukuran foto profil dalam KB (data foto disimpan di localStorage).
  maxPhotoKb: Number(env.VITE_MAX_PHOTO_KB) || 500,
  // Tampilkan kartu akun demo di halaman login.
  showDemoAccounts: env.VITE_SHOW_DEMO_ACCOUNTS !== 'false',
};
