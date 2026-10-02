# KonsulYuk! 🌿

Platform Bimbingan & Konseling Sekolah berbasis Web yang aman, ramah, dan solutif untuk siswa dan Guru BK.

---

## 📁 Struktur Direktori Terpisah

Proyek ini telah dipisahkan menjadi dua folder mandiri:

```
KonsulYuk/
├── 📂 frontend/              # Aplikasi Web Frontend (React 19, Vite, Tailwind CSS v4)
│   ├── src/
│   │   ├── app/App.tsx       # Komponen UI utama & navigasi
│   │   ├── services/api.ts   # Client API terintegrasi ke backend
│   │   └── ...
│   ├── package.json
│   └── vite.config.ts
│
└── 📂 backend/               # Backend Server Super Cepat (Deno 2, Hono, PostgreSQL, Prisma)
    ├── src/
    │   ├── index.ts          # Server entrypoint Deno + Hono (Port 5000)
    │   ├── middleware/       # Autentikasi JWT & Role Guard
    │   ├── routes/           # REST API: auth, consultations, messages, notifications, users
    │   └── lib/prisma.ts     # PostgreSQL ORM Client
    ├── prisma/
    │   ├── schema.prisma     # Skema database PostgreSQL
    │   └── seed.ts           # Seeder data demo siswa & guru BK
    ├── deno.json             # Task manager Deno (dev, start, db, pm2)
    ├── .env                  # Konfigurasi database & port
    └── package.json
```

---

## 🚀 Cara Menjalankan Backend (Deno 2 ⚡)

Backend menggunakan **Deno 2**, framework **Hono**, dan **Prisma ORM** yang terhubung ke **PostgreSQL**. Sangat ringan, cepat, dan kompatibel dengan semua jenis CPU server Linux.

1. **Masuk ke folder backend:**
   ```bash
   cd backend
   ```

2. **Siapkan environment:**
   ```bash
   cp .env.example .env
   # Sesuaikan DATABASE_URL dan JWT_SECRET di file .env
   ```

3. **Sinkronisasi Skema Database & Seeding Data Demo (jika diperlukan ulang):**
   ```bash
   deno task db:push
   deno task db:seed
   ```

4. **Jalankan Backend Server:**
   ```bash
   deno task dev
   ```
   > Server akan berjalan di: **`http://localhost:5000`**  
   > Health check: **`http://localhost:5000/api/health`**

5. **(Opsional) Buka Prisma Studio (GUI Database Viewer):**
   ```bash
   deno task db:studio
   ```
   > Buka di browser: **`http://localhost:5555`** untuk melihat data PostgreSQL secara visual.

---

## 💻 Cara Menjalankan Frontend

1. **Buka terminal baru dan masuk ke folder frontend:**
   ```bash
   cd frontend
   ```

2. **Jalankan dev server:**
   ```bash
   npm run dev
   # atau menggunakan pnpm:
   # pnpm dev
   ```
   > Aplikasi frontend berjalan di port default Vite (misalnya `http://localhost:8443` atau `http://localhost:5173`).

---

## 🔑 Akun Demo Siap Pakai

Semua akun berikut sudah terdaftar di PostgreSQL database `konsulyuk_db`:

| Peran | Nama | Email | Kata Sandi |
|---|---|---|---|
| **Guru BK** | Ibu Ratna Sari, S.Pd., Kons. | `ratna@konsulyuk.id` | `password123` |
| **Guru BK** | Bapak Dimas Saputra, M.Pd. | `dimas@konsulyuk.id` | `password123` |
| **Siswa** | Aditya Pratama (XI IPA 2) | `aditya@siswa.id` | `password123` |
| **Siswa** | Nadia Putri (XI IPS 1) | `nadia@siswa.id` | `password123` |

---

## 📡 Daftar Endpoint API Utama

- `GET  /api/health` - Status server & koneksi database PostgreSQL
- `POST /api/auth/register` - Pendaftaran akun siswa/guru
- `POST /api/auth/login` - Masuk & peroleh token JWT
- `GET  /api/auth/me` - Profil pengguna yang sedang login
- `GET  /api/auth/teachers` - Daftar guru BK yang bertugas beserta jadwal
- `GET  /api/consultations` - Daftar konsultasi siswa/guru
- `POST /api/consultations` - Ajukan jadwal konsultasi baru
- `GET  /api/consultations/:id` - Detail sesi konsultasi beserta riwayat chat
- `PATCH /api/consultations/:id/status` - Konfirmasi (Terima/Tolak/Selesai) oleh Guru BK
- `GET  /api/consultations/:id/messages` - Riwayat pesan percakapan
- `POST /api/consultations/:id/messages` - Kirim pesan baru
- `GET  /api/notifications` - Notifikasi siswa/guru
- `GET  /api/users/stats` - Statistik ringkasan dashboard
