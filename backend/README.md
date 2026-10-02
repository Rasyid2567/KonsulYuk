# KonsulYuk Backend ⚡ (Deno 2 + Hono + PostgreSQL)

Backend service mandiri untuk platform KonsulYuk yang dibangun menggunakan **Deno 2**, framework **Hono**, dan **Prisma ORM** yang terhubung ke **PostgreSQL**. Sangat ringan, cepat, dan kompatibel dengan semua jenis CPU server Linux.

## 🛠️ Persyaratan di PC Server
- **Deno** (Deno 2.x):
  ```bash
  curl -fsSL https://deno.land/install.sh | sh
  ```
- **PostgreSQL** (aktif di port 5432)

## ⚙️ Variabel Lingkungan (.env)
Buat file `.env` di dalam folder `backend/`:
```env
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/konsulyuk_db?schema=public"
JWT_SECRET="konsulyuk_super_secret_jwt_key_2026"
NODE_ENV="development"
CORS_ORIGIN="*"
```

---

## 🚀 Perintah Menjalankan (Deno)

Semua perintah sudah dikonfigurasi di `deno.json`:

```bash
# 1. Pasang dependensi / Prisma Client
deno install

# 2. Sinkronkan schema ke database PostgreSQL
deno task db:push

# 3. Masukkan data awal (Guru BK, Siswa demo, dll.)
deno task db:seed

# 4. Jalankan backend server (Mode Development / Auto-reload)
deno task dev

# 5. Jalankan backend server (Mode Production / Server Permanen)
deno task start

# 6. Buka Prisma Studio (Web GUI database)
deno task db:studio
```

---

## 📁 Apa Saja yang Perlu Di-Ignore / Jangan Di-Copy ke Server?

Saat meng-copy folder backend ke PC server, **abaikan (jangan copy)**:
1. `node_modules/` *(Biarkan server mengunduh sendiri dengan `deno install` agar binary engine Prisma sesuai arsitektur server)*
2. `.env` *(Buat/isi langsung di server sesuai kredensial database server)*
3. `.git/` *(Opsional jika pakai git clone)*

File yang **wajib** dibawa:
- `src/` (semua file kodingan backend)
- `prisma/` (file `schema.prisma` & `seed.ts`)
- `deno.json`
- `package.json`

---

## 🩺 Verifikasi Server
Buka terminal di server atau dari komputer lain:
```bash
curl http://localhost:5000/api/health
```
Respons:
```json
{
  "status": "ok",
  "service": "KonsulYuk Backend API (Deno / PostgreSQL)",
  "uptime": 12.34,
  "timestamp": "2026-09-30T10:45:00.000Z",
  "database": "connected"
}
```
