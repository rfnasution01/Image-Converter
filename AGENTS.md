# AGENTS.md

Panduan kerja untuk coding agent dan developer pada project FileFlow Image Converter.

## Stack utama
- Next.js App Router + React + TypeScript.
- Tailwind CSS dengan CSS variables untuk light/dark mode.
- Alias import `@/*` menuju `src/*`.
- Komponen UI dasar mengikuti pola shadcn/ui + Radix UI.
- Form menggunakan `react-hook-form`, validasi via `@hookform/resolvers` + `zod`.
- API menggunakan `axios` + `@tanstack/react-query`.
- Table menggunakan `@tanstack/react-table`.

## Aturan penulisan kode
- Gunakan TypeScript strict. Hindari `any`; buat type/interface eksplisit.
- Gunakan functional component dan hooks.
- Gunakan alias `@` untuk import internal, contoh `@/components/ui/button`.
- Simpan reusable component di `src/components`, util di `src/lib`, provider di `src/providers`.
- Gunakan `cn()` dari `@/lib/utils` untuk menggabungkan className (`clsx` + `tailwind-merge`).
- Untuk variant styling gunakan `class-variance-authority`.
- Jangan render HTML mentah tanpa `sanitizeHtml()` dari `@/lib/sanitize`.
- Format tanggal lewat helper `formatDate()` / `dayjs` dari `@/lib/date`.

## Form component
- Komponen input reusable berada di `src/components/form`.
- `TextInput`, `DateInput`, `RadioInput`, `CheckboxInput`, dan `SelectInput` mendukung `prefix` dan `suffix`.
- `TextAreaInput` tidak memakai `prefix`/`suffix` sesuai kebutuhan project.
- Untuk komponen non-native seperti `SelectInput`, `CheckboxInput`, `RadioInput`, dan `TiptapEditor`, integrasikan dengan `Controller` dari `react-hook-form`.

## Styling light/dark
- Token warna ada di `src/index.css` pada `:root` dan `.dark`.
- Jangan hardcode warna jika bisa memakai token Tailwind: `bg-background`, `text-foreground`, `bg-card`, `border-border`, `text-muted-foreground`, `bg-primary`.
- Dark mode berbasis class `.dark` pada elemen `html`.

## API dan data fetching
- Gunakan instance `api` dari `src/lib/api.ts`.
- Query server-state harus melalui TanStack Query (`useQuery`, `useMutation`).
- Jangan simpan server-state kompleks di local component state kecuali hanya UI state.

## Checklist sebelum commit
- Jalankan `npm run lint`.
- Jalankan `npm run build`.
- Pastikan komponen reusable tidak mengandung logic bisnis spesifik halaman.
