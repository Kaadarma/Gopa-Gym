# Gopa Gym Frontend

Frontend aplikasi membership Gopa Gym (React 18 + Vite 5 + Tailwind CSS 3), dengan desain mengikuti file figcraft `gopa-gym.figcraft`.

## Prasyarat

- Node.js 20
- npm (lockfile: `package-lock.json`)

## Menjalankan lokal

```bash
npm ci
npm run dev        # dev server Vite
npm run build      # build produksi ke dist/
npm run preview    # preview hasil build
npm run check:secrets   # cek kredensial yang ter-commit
```

Variabel environment opsional (dibaca di `src/lib/config.js`), misalnya `VITE_DEMO_MEMBER_EMAIL` dan `VITE_DEMO_MEMBER_PASSWORD`. Jika tidak diisi, nilai default demo dipakai. Jangan commit file `.env` berisi nilai asli.

## CI/CD

Pipeline ada di `.github/workflows/ci.yml` dan berjalan di GitHub Actions.

### Kapan berjalan

- `push` ke branch `main`
- `pull_request` (semua branch)
- manual lewat `workflow_dispatch` di tab Actions

Jika ada run baru untuk branch yang sama, run lama otomatis dibatalkan (`concurrency`).

### Tahapan job `verify` (ubuntu-latest, timeout 15 menit)

1. **Checkout** repo.
2. **Setup Node 20** dengan cache npm berdasarkan `package-lock.json`.
3. **`npm ci`**: install dependency persis sesuai lockfile.
4. **`npm run check:secrets`**: memindai file yang ter-track di git. Job gagal jika:
   - ada file `.env` (selain `*.example`) yang ter-track, atau
   - ada baris berbentuk `password=...`, `secret: "..."`, `token=...`, `api_key=...`, dan sejenisnya dengan nilai yang bukan placeholder.
   
   Nilai placeholder seperti `change-me`, `example`, `demo`, atau referensi `process.env` / `import.meta.env` diabaikan.
5. **`npm run build`**: build produksi Vite.
6. **Upload artifact `dist`** (disimpan 7 hari). Jika folder `dist` tidak ada, job gagal.

### Yang belum ada

- Tidak ada tahap deploy (CD). Hasil build hanya tersedia sebagai artifact di run GitHub Actions dan belum dipublikasikan ke server atau hosting mana pun.
- Tidak ada test otomatis. Belum ada script `test` di `package.json`.

## Alur kerja yang disarankan

1. Buat branch dari `main`, commit perubahan.
2. Buka pull request ke `main`. Tunggu job `verify` hijau.
3. Merge ke `main`. Job `verify` berjalan lagi di `main`.

Sebelum commit, jalankan `npm run build` dan `npm run check:secrets` secara lokal agar tidak menunggu CI.

## Struktur singkat

```
src/
  pages/        halaman landing, login, admin, dan member
  components/   layout, UI, chatbot, barcode
  lib/          store, config, utils, theme, chatbot
scripts/
  check-secrets.mjs   pemindai kredensial untuk CI
.github/workflows/
  ci.yml              pipeline CI
```
