# Contributing to Cek Supir BS

Terima kasih sudah mau berkontribusi! 🚌

## Cara Berkontribusi

1. **Fork** repo ini
2. Buat branch baru: `git checkout -b fitur/nama-fitur` atau `fix/nama-bug`
3. Commit perubahan dengan format [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat: tambah filter KIR expired`
   - `fix: perbaiki validasi plat nomor`
   - `chore: update dependencies`
   - `docs: perbaiki README`
4. Push ke fork: `git push origin fitur/nama-fitur`
5. Buat **Pull Request** ke branch `main`

## Standar Kode

- **TypeScript/Next.js**: Strict mode, type safety
- **Tailwind CSS**: Utility-first, responsive
- **MongoDB/Mongoose**: Schema validasi, index
- **Commit**: Conventional Commits (wajib)
- **PR**: Minimal 1 reviewer approve sebelum merge

## Development Setup

```bash
# Clone repo
git clone https://github.com/alifwildan14/Cek-Supir-BS.git
cd Cek-Supir-BS

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env dengan MONGODB_URI, NEXTAUTH_SECRET

# Jalankan development
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NEXTAUTH_SECRET` | Yes | NextAuth secret key |
| `NEXTAUTH_URL` | No | App URL (production) |

## Testing

```bash
# Lint
npm run lint

# Type check
npx tsc --noEmit

# Build
npm run build
```

## Melaporkan Bug

Gunakan [GitHub Issues](https://github.com/alifwildan14/Cek-Supir-BS/issues) dengan template:
- **Environment**: OS, Node version, Browser
- **Steps to reproduce**: Langkah-langkah detail
- **Expected vs Actual**: Apa yang diharapkan vs yang terjadi
- **Logs/Screenshots**: Jika ada

## Feature Request

Buka Issue dengan label `enhancement`, jelaskan:
- Masalah yang ingin diselesaikan
- Solusi yang diusulkan
- Alternatif yang dipertimbangkan

## Deploy

- **Vercel**: Auto-deploy dari branch `main`
- **Preview**: Setiap PR dapat preview deployment

## Lisensi

Dengan berkontribusi, Anda menyetujui bahwa kontribusi Anda akan dilisensikan di bawah [MIT License](LICENSE).