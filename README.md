# BrewSpace: Marketplace Kopi PWA

> **Judul Formal Tugas Akhir:**  
> *"Perancangan dan Pembangunan Aplikasi Marketplace Produk Kopi Berbasis Progressive Web App (PWA) Menggunakan JavaScript"*  
> **Mata Kuliah:** Praktikum Pemrograman Perangkat Bergerak (PPB)

---

## ☕ 1. Deskripsi Proyek
**BrewSpace** adalah aplikasi e-commerce khusus produk kopi nusantara berbasis **Progressive Web App (PWA)** dengan antarmuka *mobile-first* bernuansa *specialty coffee shop* yang modern, minimalis, dan elegan.

Aplikasi ini mencakup katalog biji kopi (whole beans), bubuk kopi, drip bag/instan, hingga minuman siap saji (cold brew & latte). Pengguna dapat melakukan pencarian, penyaringan berdasarkan kategori, pengurutan harga, penandaan produk favorit, pengelolaan keranjang dengan varian ukuran gilingan (*grind size*), simulasi proses checkout, pelacakan riwayat pesanan bertingkat, serta pengeditan profil pengguna.

Aplikasi juga dirancang dengan kapabilitas **offline PWA** berkat Service Worker dan App Shell precaching, sehingga katalog tetap dapat diakses meski koneksi internet terputus.

---

## 🛠️ 2. Tech Stack (Bebas Next.js / TypeScript / Tailwind)
- **Frontend**:
  - React 18 & Vite (JavaScript ES6+)
  - React Router DOM v6
  - Axios (HTTP client dengan interceptor token otomatis)
  - Pure CSS3 kustom (Desain sistem palet coffee: `#3E2723`, `#795548`, `#F8F3EA`, `#E8DCCB`, `#2B211D`)
  - Lucide React (Ikon minimalis)
- **Backend API**:
  - Node.js & Express.js
  - Arsitektur **MVC** murni (*Models, Controllers, Routes, Middleware*)
  - CORS, Morgan logger, Dotenv
- **Database & Autentikasi**:
  - PostgreSQL hosted di **Supabase**
  - Supabase Auth terhubung dengan tabel `public.users` via trigger PostgreSQL
- **PWA**:
  - `manifest.webmanifest` (Name, Icons 192, 512, maskable, standalone mode, theme color)
  - `service-worker.js` (App shell precaching, Cache-First aset statis, Network-First API data, offline detection banner)

---

## 📂 3. Struktur Folder Project

```text
BrewSpace/
├── .gitignore                      # Mengabaikan .env dan node_modules
├── README.md                       # Dokumentasi lengkap proyek
├── backend/
│   ├── .env.example                # Template kredensial backend
│   ├── package.json                # Dependensi Express, Supabase, CORS, dll
│   ├── postman_collection.json     # Koleksi Postman pengujian seluruh endpoint API
│   ├── test_api.js                 # Skrip automated test 15 endpoint API lokal
│   ├── sql/
│   │   ├── schema.sql              # DDL: Tabel, trigger auth, RLS, relasi
│   │   └── seed.sql                # DML: 4 kategori & 14 produk kopi realistis
│   └── src/
│       ├── app.js                  # Setup Express, CORS, Morgan, Error handlers
│       ├── server.js               # Server entry point (Port 5000)
│       ├── config/
│       │   └── supabase.js         # Client Supabase & check status
│       ├── controllers/            # Logic pengendali request/response
│       │   ├── categoryController.js
│       │   ├── productController.js
│       │   ├── favoriteController.js
│       │   ├── cartController.js
│       │   ├── orderController.js
│       │   └── userController.js
│       ├── models/                 # Akses data & integrasi Supabase / fallback
│       │   ├── categoryModel.js
│       │   ├── productModel.js
│       │   ├── favoriteModel.js
│       │   ├── cartModel.js
│       │   ├── orderModel.js
│       │   └── userModel.js
│       ├── middleware/
│       │   ├── authMiddleware.js   # Verifikasi Bearer token Supabase Auth
│       │   ├── errorMiddleware.js  # 404 & Global 500 handler
│       │   └── validator.js        # Validasi body request
│       ├── routes/
│       │   ├── apiRoutes.js        # Aggregator root endpoint /api
│       │   ├── categoryRoutes.js
│       │   ├── productRoutes.js
│       │   ├── favoriteRoutes.js
│       │   ├── cartRoutes.js
│       │   ├── orderRoutes.js
│       │   └── userRoutes.js
│       └── utils/
│           └── responseFormatter.js # Standarisasi format JSON API
│
└── frontend/
    ├── .env.example                # Template environment frontend
    ├── index.html                  # HTML entry point dengan PWA meta tags
    ├── package.json                # Dependensi React, Vite, Axios, Lucide
    ├── vite.config.js              # Konfigurasi build Vite
    ├── public/
    │   ├── manifest.webmanifest    # Web App Manifest PWA
    │   ├── service-worker.js       # Service worker offline caching
    │   └── icons/
    │       ├── icon.svg            # Vector icon kopi
    │       ├── icon-192.png        # Icon 192x192
    │       ├── icon-512.png        # Icon 512x512
    │       └── icon-maskable-512.png
    └── src/
        ├── App.jsx                 # Router React Router DOM
        ├── main.jsx                # React root & SW registration
        ├── index.css               # Desain sistem CSS custom lengkap
        ├── config/
        │   └── constants.js        # Rupiah & date formatter, opsi gilingan
        ├── context/
        │   ├── AuthContext.jsx     # State user & session login
        │   └── CartContext.jsx     # State keranjang belanja terpusat
        ├── hooks/
        │   ├── useNetworkStatus.js # Deteksi online/offline real-time
        │   └── useInstallPrompt.js # Event instalasi PWA
        ├── services/
        │   ├── api.js              # Instance Axios & pemanggilan API
        │   └── authService.js      # Supabase client auth
        ├── components/
        │   ├── common/             # Navbar, BottomNav, Loading, Empty, Error, OfflineBadge
        │   └── product/            # ProductCard interaktif
        └── pages/
            ├── Home.jsx            # Tab 1: Promo, Kategori, Terlaris, Rekomendasi
            ├── Explore.jsx         # Tab 2: Katalog lengkap, Filter & Sortir
            ├── Favorites.jsx       # Tab 3: Wishlist produk kopi
            ├── Orders.jsx          # Tab 4: Riwayat pesanan & status
            ├── Profile.jsx         # Tab 5: Akun, Info Praktikum & Dosen
            ├── ProductDetail.jsx   # Detail produk, opsi grind, tambah ke cart
            ├── Cart.jsx            # Manajemen keranjang belanja
            ├── Checkout.jsx        # Formulir alamat, simulasi bayar, offline guard
            ├── OrderDetail.jsx     # Rincian pesanan & tracking status
            ├── Login.jsx           # Autentikasi Masuk
            └── Register.jsx        # Pendaftaran Pengguna Baru
```

---

## 🚀 4. Panduan Menjalankan di Komputer Lokal

### Langkah 1: Clone Repository
```bash
git clone <URL_REPOSITORY_ANDA>
cd BrewSpace
```

### Langkah 2: Setup Database Supabase
1. Buka [Supabase Dashboard](https://supabase.com) dan buat project baru.
2. Masuk ke menu **SQL Editor**.
3. Buka file `backend/sql/schema.sql`, salin seluruh isi teks, tempelkan ke SQL Editor, lalu klik tombol **Run**.
4. Buka file `backend/sql/seed.sql`, salin seluruh isinya, tempelkan ke SQL Editor, lalu klik tombol **Run**.
5. Salin kredensial API dari menu **Project Settings** -> **API**:
   - `Project URL`
   - `anon` `public` key
   - `service_role` `secret` key

### Langkah 3: Konfigurasi Environment Variable
- Buat file `backend/.env` (salin format dari `backend/.env.example`):
  ```env
  PORT=5000
  NODE_ENV=development
  SUPABASE_URL=https://id-project-anda.supabase.co
  SUPABASE_SERVICE_ROLE_KEY=kunci_service_role_rahasia_anda
  SUPABASE_ANON_KEY=kunci_anon_publik_anda
  CLIENT_URL=http://localhost:5173
  ```
- Buat file `frontend/.env` (salin format dari `frontend/.env.example`):
  ```env
  VITE_API_BASE_URL=http://localhost:5000/api
  VITE_SUPABASE_URL=https://id-project-anda.supabase.co
  VITE_SUPABASE_ANON_KEY=kunci_anon_publik_anda
  ```

### Langkah 4: Menjalankan Backend (Express.js)
```bash
cd backend
npm install
npm run dev
# Server aktif di: http://localhost:5000
# Endpoint API: http://localhost:5000/api
```

### Langkah 5: Menjalankan Frontend (React + Vite PWA)
Buka terminal baru di folder root:
```bash
cd frontend
npm install
npm run dev
# Frontend aktif di: http://localhost:5173
```

---

## 🧪 5. Pengujian API (Postman & Automated Test)

### Menjalankan Uji Otomatis Seluruh Endpoint (CLI)
Pada folder `backend/`, jalankan:
```bash
node test_api.js
```
*Skrip ini secara otomatis memvalidasi 15 skenario: Health check, Kategori, Produk, Filter, Pencarian, Keranjang, Favorit, Checkout, Riwayat Pesanan, Profil User, Validasi 401 Unauthorized, dan 404 Handler.*

### Menggunakan Postman
1. Buka aplikasi Postman.
2. Klik tombol **Import** dan pilih file [`backend/postman_collection.json`](backend/postman_collection.json).
3. Koleksi berisi contoh request dan response JSON terformat untuk:
   - `GET /api/categories` & `GET /api/categories/:id`
   - `GET /api/products` (dengan query `category_id`, `search`, `sort`)
   - `GET /api/cart`, `POST /api/cart`, `PUT /api/cart/:id`, `DELETE /api/cart/:id`
   - `GET /api/favorites`, `POST /api/favorites`, `DELETE /api/favorites/:id`
   - `GET /api/orders`, `GET /api/orders/:id`, `POST /api/orders`
   - `GET /api/users/:id`, `PUT /api/users/:id`

---

## 🌐 6. Panduan Deployment Production

### A. Deploy Backend ke Render (Gratis)
1. Buka [render.com](https://render.com) dan buat **New Web Service**.
2. Hubungkan repository GitHub Anda.
3. Konfigurasikan:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Masukkan **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `SUPABASE_URL`: `<URL_SUPABASE_ANDA>`
   - `SUPABASE_SERVICE_ROLE_KEY`: `<SERVICE_ROLE_KEY>`
   - `CLIENT_URL`: `https://brewspace-frontend.vercel.app` (URL Vercel Anda)
5. Simpan dan deploy. Anda akan mendapatkan URL backend (misal: `https://brewspace-api.onrender.com`).

### B. Deploy Frontend PWA ke Vercel (Gratis)
1. Buka [vercel.com](https://vercel.com) dan buat **Add New Project**.
2. Pilih repository GitHub Anda.
3. Konfigurasikan:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Tambahkan **Environment Variable**:
   - `VITE_API_BASE_URL`: `https://brewspace-api.onrender.com/api` (mengarahkan ke URL backend di Render)
   - `VITE_SUPABASE_URL`: `<URL_SUPABASE_ANDA>`
   - `VITE_SUPABASE_ANON_KEY`: `<ANON_KEY>`
5. Klik **Deploy**. Aplikasi PWA akan live dengan protokol HTTPS yang siap diinstal di smartphone dosen maupun mahasiswa.

---

## 📱 7. Pengujian Fitur PWA (Progressive Web App)
1. **Instalasi di Browser/Smartphone**:
   - Buka URL aplikasi di browser (Google Chrome / Edge / Safari).
   - Di desktop: Klik ikon instalasi di sebelah kanan address bar browser.
   - Di smartphone: Klik prompt banner "Install BrewSpace di Smartphone" atau menu browser *"Add to Home Screen"*.
2. **Pengujian Mode Offline**:
   - Buka menu Developer Tools di Chrome (`F12`) -> Tab **Network** -> centang opsi **Offline**.
   - Muat ulang (*refresh*) halaman: Halaman utama tetap terbuka secara instan berkat **App Shell Precaching**.
   - Muncul banner peringatan: *"Anda sedang offline. Menampilkan katalog dari cache perangkat"*.
   - Buka halaman **Checkout**: Tombol konfirmasi otomatis dinonaktifkan dengan peringatan bahwa transaksi membutuhkan koneksi server.

---

## 📸 8. Tempat Screenshot Aplikasi (Untuk Laporan Tugas Akhir)
Simpan screenshot dokumentasi pengujian pada lokasi berikut:
- **Tampilan Beranda (Home)**: `docs/screenshots/01_home.png`
- **Tampilan Explore & Filter**: `docs/screenshots/02_explore.png`
- **Detail Produk & Pilihan Grind**: `docs/screenshots/03_product_detail.png`
- **Keranjang Belanja (Cart)**: `docs/screenshots/04_cart.png`
- **Simulasi Checkout**: `docs/screenshots/05_checkout.png`
- **Riwayat Pesanan (Orders)**: `docs/screenshots/06_orders.png`
- **Profil & Halaman Dosen**: `docs/screenshots/07_profile_about.png`
- **Audit PWA & Instalasi**: `docs/screenshots/08_pwa_install.png`

---

## 📋 9. Tabel Pemenuhan Persyaratan Dosen

| No | Persyaratan Dosen | Cara Dipenuhi di BrewSpace | Lokasi File / Komponen | Status |
| :---: | :--- | :--- | :--- | :---: |
| 1 | **API Buatan Sendiri (MVC + .env)** | Backend Node.js & Express.js dengan pola MVC (Models, Controllers, Routes, Middleware, Utils) terhubung ke PostgreSQL Supabase. | `backend/src/` (`controllers/`, `models/`, `routes/`, `middleware/`) | ✅ **Terpenuhi** |
| 2 | **Bottom Navigation Bar** | Navigasi bawah responsif bergaya mobile app dengan 5 tab utama dan active state indicator. | `frontend/src/components/common/BottomNav.jsx` | ✅ **Terpenuhi** |
| 3 | **Minimal 5 Halaman** | Memiliki total 11 halaman: Home, Explore, Favorites, Orders, Profile, Product Detail, Cart, Checkout, Order Detail, Login, Register. | `frontend/src/pages/` | ✅ **Terpenuhi** |
| 4 | **Minimal 2 Halaman List ke Detail** | 1. **Explore** -> Klik item membuka **Product Detail**.<br>2. **Orders** -> Klik pesanan membuka **Order Detail**. | `frontend/src/pages/Explore.jsx` -> `ProductDetail.jsx`<br>`frontend/src/pages/Orders.jsx` -> `OrderDetail.jsx` | ✅ **Terpenuhi** |
| 5 | **Satu Halaman Profile / About** | Halaman Profile memuat foto profil pengguna, form edit identitas, deskripsi visi misi BrewSpace, dan rubrik tugas akhir praktikum. | `frontend/src/pages/Profile.jsx` | ✅ **Terpenuhi** |
| 6 | **Source Code di GitHub** | Proyek terstruktur rapi, bebas dari upload secret (`.gitignore`), instruksi git commit dan repository remote. | `.gitignore`, `README.md` | ✅ **Terpenuhi** |
| 7 | **Judul Project Unik** | *"Perancangan dan Pembangunan Aplikasi Marketplace Produk Kopi Berbasis Progressive Web App (PWA) Menggunakan JavaScript"* (BrewSpace). | Seluruh dokumentasi & PWA manifest | ✅ **Terpenuhi** |
| 8 | **PWA di-deploy di Free Hosting** | Dilengkapi manifest & service worker, offline fallback, caching strategies, dan panduan deploy HTTPS ke Vercel & Render. | `frontend/public/manifest.webmanifest`, `service-worker.js` | ✅ **Terpenuhi** |
