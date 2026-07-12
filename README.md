# PixConvertly Image Converter

PixConvertly adalah aplikasi **image converter berbasis browser** yang dibangun dengan **Next.js 14 App Router**, React, TypeScript, dan Tailwind CSS. Aplikasi ini mengonversi gambar langsung di browser menggunakan Canvas API, sehingga file pengguna tidak perlu di-upload ke server.

## Fitur utama

- Konversi gambar JPG, PNG, WebP, dan HEIC/HEIF.
- Upload banyak file sekaligus dengan drag & drop.
- Pilihan output JPG, PNG, WebP, atau AVIF jika browser mendukung encode AVIF via Canvas.
- Quality slider untuk mengatur kompresi JPG/WebP/AVIF.
- Resize gambar: original size, percentage, max width, max height, atau custom width/height.
- Statistik before-after ukuran file dan ringkasan penghematan batch.
- Download satu file hasil konversi.
- Download banyak hasil konversi sebagai file ZIP.
- Onboarding tour untuk pengguna baru.
- PWA installable dengan offline support setelah kunjungan pertama.
- SEO metadata, sitemap, robots, dan halaman donate.

## Privacy

Images are processed locally in your browser. File gambar diproses di perangkat pengguna melalui API browser dan tidak di-upload ke server aplikasi.

## Format yang didukung

Input:

- JPG / JPEG
- PNG
- WebP
- HEIC / HEIF (lazy-loaded client-side decoder; support dapat bergantung browser/perangkat)

Output:

- JPG / JPEG
- PNG
- WebP
- AVIF (hanya aktif jika browser mendukung `canvas.toBlob('image/avif')`)

## Tech stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui-style components + Radix UI
- JSZip untuk download batch ZIP
- heic2any untuk decode HEIC/HEIF secara lazy-loaded di browser
- TanStack Query, React Hook Form, Zod, Axios, dan utilitas pendukung lain

## Menjalankan project

Install dependency:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Buka `http://localhost:3000` di browser.

Build production:

```bash
npm run build
```

Jalankan production server setelah build:

```bash
npm run start
```

Lint:

```bash
npm run lint
```

## Struktur singkat

- `src/app` route Next.js App Router, metadata, sitemap, robots, dan layout utama.
- `src/screens` screen/page-level component seperti homepage dan donate page.
- `src/components` reusable UI dan form components.
- `src/lib` helper umum seperti API client, date, sanitize, PDF, dan className utility.
- `src/providers` provider aplikasi.
- `public` aset statis seperti favicon, manifest, dan service worker PWA.
