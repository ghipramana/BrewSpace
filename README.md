# BrewSpace PWA

BrewSpace adalah satu aplikasi React + Vite. Login, katalog, keranjang, favorit, pesanan, profil, CRUD produk, dan upload foto memakai Supabase langsung. Tidak ada server Express terpisah.

## Jalankan di komputer

1. Pastikan Node.js sudah terpasang.
2. Dari folder utama project, jalankan `npm install` satu kali.
3. Isi file `.env` di folder utama dengan konfigurasi Supabase:

   ```env
   VITE_SUPABASE_URL=https://PROJECT_ID.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=KUNCI_PUBLISHABLE_SUPABASE
   ```

4. Jalankan `npm run dev`.
5. Buka alamat yang ditampilkan Vite, biasanya `http://localhost:5173`.

## Siapkan Supabase

Di Supabase Dashboard, pilih **SQL Editor**. Untuk project Supabase baru, jalankan file berikut secara berurutan:

1. `supabase/schema.sql`
2. `supabase/seed.sql`
3. `supabase/direct_access.sql`
4. `supabase/product_images_storage.sql`
5. `supabase/checkout_stock.sql`
6. `supabase/admin_dashboard_access.sql`

Jika tabel dan produk BrewSpace sudah ada, jalankan `direct_access.sql`, `product_images_storage.sql`, `checkout_stock.sql`, dan `admin_dashboard_access.sql`. Skrip dashboard admin memberi akses baca pesanan dan profil pelanggan kepada admin.

### Akun admin

Jalankan `supabase/direct_access.sql` untuk membatasi CRUD produk ke admin. Daftarkan akun yang akan dipakai admin di aplikasi, lalu ganti `EMAIL_ADMIN_KAMU` di `supabase/make_admin.sql` dengan email akun itu dan jalankan query tersebut di SQL Editor. Pelanggan yang tidak tercantum di `admin_users` hanya dapat melihat produk.

## Deploy ke Vercel

Import repository BrewSpace ke Vercel. Gunakan root directory `./`, framework **Vite**, build command `npm run build`, dan output directory `dist`. Tambahkan `VITE_SUPABASE_URL` serta `VITE_SUPABASE_PUBLISHABLE_KEY` di **Settings → Environment Variables**, lalu deploy.

Setelah deploy, buka Supabase **Authentication → URL Configuration** dan tambahkan alamat domain Vercel ke **Redirect URLs** agar verifikasi email dapat kembali ke aplikasi.

## Perintah

- `npm run dev` — jalankan aplikasi lokal.
- `npm run build` — buat build untuk deploy.
- `npm run preview` — lihat hasil build secara lokal.
