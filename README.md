# 👮 Cek Supir BS

[![CI](https://github.com/alifwildan14/Cek-Supir-BS/actions/workflows/ci.yml/badge.svg)](https://github.com/alifwildan14/Cek-Supir-BS/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38Bdf8.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248.svg)](https://mongoosejs.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000.svg)](https://vercel.com/)

Aplikasi web untuk **cek data sopir & bus** — validasi KIR (Kendaraan Instrumentasi Rumah), plat nomor, dan status sopir. Built with **Next.js 15, TypeScript, Tailwind CSS v4, MongoDB**.

🔗 **Live Demo**: (deploy ke Vercel)

---

## ✨ Fitur

| Fitur | Deskripsi |
|-------|-----------|
| 🔍 **Cari Sopir** | Cari data sopir berdasarkan nama atau ID |
| 🚌 **Data Bus & Plat** | Detail bus, plat nomor, tahun pembuatan |
| 📅 **Validasi KIR** | Cek masa berlaku KIR sopir |
| 🔐 **Admin Panel** | Kelola data sopir & bus (login terlebih dahulu) |
| 📱 **Responsive** | Tailwind CSS, mobile-friendly |
| 🗄️ **MongoDB** | Data tersimpan di MongoDB Atlas |

---

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB (Mongoose ODM)
- **API**: Next.js Route Handlers (`app/api/`)
- **Deploy**: Vercel

---

## 📁 Struktur Project

```
Cek-Supir-BS/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Halaman utama (cari sopir)
│   ├── admin/
│   │   └── page.tsx         # Admin dashboard
│   ├── login/
│   │   └── page.tsx         # Halaman login admin
│   └── api/
│       └── drivers/
│           └── [id]/route.ts # API driver detail & delete
├── components/
│   └── SearchAndDisplay.tsx # Komponen pencarian & tampilan
├── lib/
│   └── dbConnect.ts         # Koneksi MongoDB
├── models/
│   └── Driver.ts            # Schema sopir (Mongoose)
├── middleware.ts            # Middleware Next.js
├── public/                  # Static assets
├── package.json
├── .gitignore
├── LICENSE                  # MIT
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── eslint.config.mjs
```

---

## 🚀 Quick Start

### Prasyarat

- Node.js 20+
- MongoDB Atlas account
- Vercel account (untuk deploy)

### Development

```bash
# Clone
git clone https://github.com/alifwildan14/Cek-Supir-BS.git
cd Cek-Supir-BS

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cek-supir
# NEXTAUTH_SECRET=your-secret

# Jalankan development server
npm run dev
# Buka http://localhost:3000
```

### Build & Production

```bash
npm run build
npm start
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/drivers/[id]` | Detail sopir by ID |
| `DELETE` | `/api/drivers/[id]` | Hapus sopir (admin only) |

### Contoh Response

```json
{
  "driverName": "Budi Santoso",
  "plateNumber": "B 1234 CD",
  "kirExpiration": "2025-12-31T00:00:00Z",
  "busYear": 2020
}
```

---

## 🧪 Testing & Lint

```bash
# Lint (ESLint)
npm run lint

# Type check
npx tsc --noEmit

# Build (Vercel/Next.js)
npm run build
```

---

## 🚀 Deploy ke Vercel

### Otomatis (GitHub Integration)

1. Push ke GitHub
2. Vercel Dashboard → **Add New Project** → Import `alifwildan14/Cek-Supir-BS`
3. Environment Variables: tambah `MONGODB_URI`, `NEXTAUTH_SECRET`
4. **Deploy**

### Manual (CLI)

```bash
npm i -g vercel
vercel login
vercel --prod
```

---

## 🤝 Kontribusi

Lihat [CONTRIBUTING.md](CONTRIBUTING.md) untuk panduan:
- Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`)
- PR workflow
- Code standards

---

## 📜 Lisensi

[MIT License](LICENSE) © 2024 Wildan Alif Ardyanto

---

## 🔗 Links

- **Repo**: https://github.com/alifwildan14/Cek-Supir-BS
- **Live Demo**: (Vercel URL)
- **Issues**: https://github.com/alifwildan14/Cek-Supir-BS/issues