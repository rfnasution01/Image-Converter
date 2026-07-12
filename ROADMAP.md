# ROADMAP.md

Roadmap perubahan FileFlow Image Converter berdasarkan kondisi kode saat ini.

## Tujuan utama

Menjadikan FileFlow sebagai image converter browser-based yang lebih lengkap, private, cepat, SEO-friendly, mudah digunakan, dan siap dikembangkan jangka panjang.

## Status saat ini

- App berjalan dengan Next.js 14 App Router.
- Fitur utama sudah ada:
  - Upload JPG, PNG, WebP, HEIC/HEIF.
  - Drag & drop.
  - Batch conversion via Canvas API.
  - Output JPG, PNG, WebP, dan AVIF jika browser mendukung encode AVIF.
  - Download single image.
  - Download batch sebagai ZIP.
  - Onboarding tour.
  - Donate page.
  - SEO metadata, sitemap, robots.
- `npm run lint` berhasil.
- `npm run build` berhasil.

## Masalah / catatan teknis saat ini

- README dan package metadata sudah disesuaikan dengan identitas FileFlow Image Converter berbasis Next.js.
- Banyak styling masih hardcoded seperti `bg-white`, `text-slate-*`, `border-slate-*`, sehingga dark mode belum siap penuh.
- Upload file baru mengganti seluruh daftar image lama.
- Quality control untuk JPG/WebP sudah tersedia.
- Resize image sudah tersedia dengan mode original, percentage, max width, max height, dan custom dimensions.
- Belum ada progress batch yang jelas.
- Nama file dalam ZIP berpotensi bentrok jika ada file dengan nama sama.
- Belum ada statistik before-after seperti penghematan ukuran file.
- PWA/offline support sudah tersedia melalui manifest, service worker, dan install prompt ringan.
- Belum ada opsi menampilkan ulang onboarding.

---

# Phase 1 — Cleanup project identity dan dokumentasi

## Checklist

- [x] Update `README.md` agar sesuai dengan project saat ini.
- [x] Update nama package di `package.json` dari boilerplate menjadi nama project, misalnya `fileflow-image-converter`.
- [x] Hapus referensi Vite boilerplate yang tidak relevan.
- [x] Pastikan dokumentasi menjelaskan:
  - Next.js App Router.
  - Browser-based image conversion.
  - Privacy: file tidak di-upload ke server.
  - Supported formats.
  - Cara menjalankan dev/build/lint.

## Acceptance criteria

- [x] README tidak lagi menyebut boilerplate Vite.
- [x] Developer baru bisa memahami fitur dan cara menjalankan project hanya dari README.

---

# Phase 2 — Refactor struktur logic converter

## Tujuan

Memisahkan logic conversion dari UI agar fitur baru seperti quality, resize, progress, dan format tambahan lebih mudah dikembangkan.

## Checklist

- [x] Buat folder `src/features/converter`.
- [x] Pindahkan type converter ke file terpisah, misalnya:
  - `src/features/converter/types.ts`
- [x] Pindahkan helper converter ke:
  - `src/features/converter/utils.ts`
  - `src/features/converter/image-conversion.ts`
- [x] Pindahkan konstanta format ke:
  - `src/features/converter/constants.ts`
- [x] Pastikan `HomePage` hanya fokus pada state dan rendering UI.

## Rekomendasi type awal

```ts
type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';

type ResizeMode = 'original' | 'percentage' | 'dimensions' | 'max-width' | 'max-height';

type ConversionSettings = {
  outputFormat: OutputFormat;
  quality: number;
  resizeMode: ResizeMode;
  width?: number;
  height?: number;
  percentage?: number;
  keepAspectRatio: boolean;
};
```

## Acceptance criteria

- [x] Tidak ada perubahan behavior user-facing.
- [x] `npm run lint` dan `npm run build` tetap lolos.

---

# Phase 3 — Quality slider untuk JPG/WebP

## Tujuan

User bisa mengatur kualitas output untuk mengontrol ukuran file.

## Checklist

- [x] Tambahkan state `quality`, default `0.92` atau `92`.
- [x] Tambahkan UI slider/input di bagian output settings.
- [x] Quality hanya aktif untuk `image/jpeg` dan `image/webp`.
- [x] Untuk PNG, tampilkan info bahwa PNG bersifat lossless dan quality slider tidak dipakai.
- [x] Gunakan quality pada `canvas.toBlob(type, quality)`.
- [x] Saat quality berubah, reconvert images yang sudah ada.

## Acceptance criteria

- [x] User bisa memilih kualitas JPG/WebP.
- [x] Output size berubah sesuai quality.
- [x] PNG tetap bisa convert tanpa error.

---

# Phase 4 — Resize image

## Tujuan

User bisa mengecilkan/mengubah dimensi gambar sebelum download.

## Checklist

- [x] Tambahkan setting resize:
  - Original size.
  - Percentage.
  - Max width.
  - Max height.
  - Custom width/height.
- [x] Tambahkan opsi `keep aspect ratio`.
- [x] Hitung canvas width/height berdasarkan setting.
- [x] Validasi input dimensi agar tidak 0, negatif, atau terlalu besar.
- [x] Tampilkan dimensi original dan output pada setiap item.

## Acceptance criteria

- [x] User bisa resize gambar tanpa distorsi jika keep aspect ratio aktif.
- [x] Output image memiliki dimensi sesuai pengaturan.
- [x] Error handling jelas untuk input tidak valid.

---

# Phase 5 — Append upload dan remove per image

## Tujuan

Upload baru tidak otomatis menghapus file lama. User juga bisa menghapus image tertentu.

## Checklist

- [x] Ubah `handleFileUpload` agar append file baru ke daftar existing.
- [x] Tambahkan tombol `Remove` per image.
- [x] Tetap sediakan tombol `Clear all`.
- [x] Pastikan object URL direvoke hanya untuk item yang dihapus.
- [x] Hindari memory leak saat clear/unmount.

## Acceptance criteria

- [x] Upload kedua menambah daftar image, bukan mengganti.
- [x] User bisa hapus satu file tanpa menghapus semua.
- [x] Object URL tetap dibersihkan dengan benar.

---

# Phase 6 — Progress indicator batch conversion

## Tujuan

User mendapat feedback jelas ketika convert banyak file.

## Checklist

- [x] Tambahkan state progress:
  - total files.
  - completed files.
  - failed files.
  - current file name jika diperlukan.
- [x] Tampilkan progress bar global.
- [x] Tampilkan status per file:
  - queued.
  - processing.
  - done.
  - error.
- [x] Pertimbangkan concurrency limit agar browser tidak freeze saat file banyak.

## Acceptance criteria

- [x] Saat convert 10 file, user bisa melihat progres seperti `4 of 10 converted`.
- [x] UI tetap responsif.

---

# Phase 7 — Duplicate filename handling untuk ZIP

## Tujuan

Menghindari file tertimpa di dalam ZIP jika nama output sama.

## Checklist

- [x] Buat helper `getUniqueFileName()`.
- [x] Jika nama sudah ada, tambahkan suffix:
  - `image.webp`
  - `image-2.webp`
  - `image-3.webp`
- [x] Terapkan helper saat menambahkan file ke ZIP.
- [x] Pertimbangkan juga untuk download single jika ada konflik tidak perlu diubah.

## Acceptance criteria

- [x] ZIP tidak memiliki nama file duplicate.
- [x] Semua file tetap masuk ZIP.

---

# Phase 8 — Before-after stats dan compression summary

## Tujuan

User bisa melihat manfaat conversion secara jelas.

## Checklist

- [x] Tampilkan ukuran original dan converted.
- [x] Hitung persentase perubahan ukuran:
  - saved jika lebih kecil.
  - increased jika lebih besar.
- [x] Tampilkan total original size, total converted size, dan total saved untuk batch.
- [x] Tambahkan visual badge seperti `Saved 64%`.
- [x] Jika output lebih besar, tampilkan info netral seperti `Size increased 12%`.

## Acceptance criteria

- [x] Setiap image menampilkan before-after size.
- [x] Batch summary tampil setelah conversion selesai.

---

# Phase 9 — Metadata / EXIF privacy notice

## Tujuan

Memberi edukasi bahwa proses canvas biasanya menghapus metadata, sehingga lebih privacy-friendly.

## Checklist

- [x] Tambahkan notice pada section privacy.
- [x] Tambahkan FAQ kecil:
  - Apakah file di-upload?
  - Apakah metadata dihapus?
  - Format apa yang didukung?
- [x] Hindari klaim absolut jika belum diverifikasi penuh di semua browser. Gunakan wording aman seperti “usually strips most metadata”.

## Acceptance criteria

- [x] User memahami file diproses lokal.
- [x] User memahami efek conversion terhadap metadata.

---

# Phase 10 — Dark mode penuh

## Tujuan

Dark mode berbasis class `.dark` berjalan konsisten.

## Checklist

- [x] Tambahkan token `.dark` di `src/index.css`.
- [x] Tambahkan theme toggle di header.
- [x] Simpan preference di localStorage.
- [x] Respect system preference via `prefers-color-scheme`.
- [x] Ganti class hardcoded:
  - `bg-white` → `bg-card` atau token lain.
  - `text-slate-*` → `text-foreground` / `text-muted-foreground`.
  - `border-slate-*` → `border-border`.
- [x] Pastikan onboarding overlay tetap readable di dark mode.

## Acceptance criteria

- [x] Toggle dark/light berjalan.
- [x] UI tetap readable di dark mode.
- [x] Tidak ada section utama yang terlihat rusak karena warna hardcoded.

---

# Phase 11 — Show tutorial again

## Tujuan

User bisa membuka onboarding setelah sebelumnya ditutup.

## Checklist

- [x] Tambahkan tombol `Tutorial` atau `Help` di header/footer/converter card.
- [x] Tombol memanggil onboarding dari step pertama.
- [x] Jangan hapus localStorage kecuali user klik reset tutorial.

## Acceptance criteria

- [x] Onboarding bisa dibuka ulang kapan saja.

---

# Phase 12 — Support format tambahan AVIF / HEIC

## AVIF

- [x] Cek support browser untuk encode AVIF via `canvas.toBlob('image/avif')`.
- [x] Tampilkan AVIF hanya jika browser support.
- [x] Jika tidak support, tampilkan disabled option dengan tooltip.

## HEIC

- [x] Evaluasi library converter HEIC client-side (`heic2any`).
- [x] Pastikan ukuran bundle masih masuk akal.
- [x] Jika library besar, lazy-load hanya saat user upload HEIC.
- [x] Tambahkan warning bahwa HEIC support bisa bergantung browser/perangkat.

## Acceptance criteria

- [x] AVIF tidak membuat error di browser yang tidak support.
- [x] HEIC tidak membebani initial bundle secara berlebihan.

---

# Phase 13 — PWA dan offline support

## Tujuan

Karena conversion berjalan lokal, app cocok untuk offline usage.

## Checklist

- [x] Tambahkan manifest yang lengkap.
- [x] Tambahkan service worker.
- [x] Cache static assets.
- [x] Pastikan converter bisa dibuka offline setelah kunjungan pertama.
- [x] Tambahkan install prompt ringan jika diperlukan.

## Acceptance criteria

- [x] App bisa di-install.
- [x] Halaman utama bisa dibuka offline setelah cache tersedia.

---

# Phase 14 — Accessibility dan UX polish

## Checklist

- [x] Pastikan semua tombol icon punya `aria-label` spesifik.
- [x] Tambahkan keyboard navigation yang nyaman.
- [x] Tambahkan focus style konsisten.
- [x] Tambahkan live region untuk status conversion.
- [x] Pastikan contrast warna memenuhi standar.
- [x] Tambahkan empty/error/loading state yang konsisten.

## Acceptance criteria

- [x] Converter bisa digunakan dengan keyboard.
- [x] Screen reader mendapat update status conversion.

---

# Phase 15 — SEO dan content expansion

## Checklist

- [x] Tambahkan FAQ section di homepage.
- [x] Tambahkan structured data JSON-LD untuk WebApplication dan FAQ.
- [x] Buat landing copy yang menyasar keyword:
  - JPG to PNG converter.
  - PNG to WebP converter.
  - WebP to JPG converter.
  - Batch image converter.
- [x] Pertimbangkan halaman statis khusus tiap intent:
  - `/jpg-to-png`
  - `/png-to-webp`
  - `/webp-to-jpg`

## Acceptance criteria

- [x] Metadata tetap valid.
- [x] Konten homepage lebih kuat untuk SEO.

---

# Urutan implementasi yang disarankan

1. Phase 1 — Cleanup dokumentasi.
2. Phase 2 — Refactor converter logic.
3. Phase 3 — Quality slider.
4. Phase 4 — Resize image.
5. Phase 5 — Append upload dan remove per image.
6. Phase 6 — Progress indicator.
7. Phase 7 — Duplicate filename handling.
8. Phase 8 — Before-after stats.
9. Phase 10 — Dark mode.
10. Phase 11 — Show tutorial again.
11. Phase 9 — Metadata/EXIF notice dan FAQ.
12. Phase 13 — PWA.
13. Phase 12 — AVIF/HEIC.
14. Phase 14 — Accessibility polish.
15. Phase 15 — SEO expansion.

---

# Definition of Done untuk setiap phase

Sebelum phase dianggap selesai:

- [x] `npm run lint` berhasil.
- [x] `npm run build` berhasil.
- [x] Tidak ada TypeScript `any` baru tanpa alasan kuat.
- [x] Object URL direvoke jika membuat preview/download URL.
- [x] UI responsive mobile dan desktop.
- [x] Error state ditampilkan dengan jelas.
- [x] Perubahan dicatat di README jika memengaruhi penggunaan project.

---

# Catatan implementasi penting

## Canvas transparency ke JPG

Jika output `image/jpeg`, canvas harus diberi background putih sebelum draw image agar area transparan tidak menjadi hitam.

## Memory management

Setiap `URL.createObjectURL()` harus punya pasangan `URL.revokeObjectURL()` saat item dihapus, daftar di-clear, atau component unmount.

## Client-only API

Conversion memakai `window`, `document`, `canvas`, dan `localStorage`, jadi logic yang memakai API browser harus tetap berada di client component atau dipanggil setelah mount.

## Bundle size

Library besar seperti HEIC converter sebaiknya lazy-loaded agar initial page load tetap cepat.

## Privacy wording

Gunakan wording yang akurat:

- Baik: “Images are processed locally in your browser.”
- Hindari jika belum diverifikasi: “We remove all metadata in every case.”
- Lebih aman: “Canvas conversion usually strips most embedded metadata.”
