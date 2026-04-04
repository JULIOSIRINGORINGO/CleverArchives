---
description: SOP Wajib (Strict Guidelines) untuk refactor komponen dan halaman guna memastikan clean code, modularitas, pemisahan tanggung jawab, serta integritas logika dan layout.
---

# Panduan Refactor Halaman & Fitur (Absolute Design System)
**Version:** 5.0.0-final (Absolute)  
**Enforcement:** Absolute / Zero ClassName Return  
**Principle:** Prop-Driven Layout & Bundled Aesthetics

---

## I. INTEGRITAS LOGIKA & LAYOUT

### 1. Preservasi Flow Logika
* **DILARANG KERAS** mengubah alur logika bisnis, state management, atau urutan eksekusi fungsi saat melakukan refactor visual.
* Semua props fungsional (`onClick`, `onChange`, `value`, `ref`) harus tetap terhubung dengan sempurna.

### 2. Stabilitas Layout
* Refactor hanya bertujuan mengubah "cara menulis" kode (dari HTML mentah ke Primitives), **BUKAN** mengubah hasil akhir tampilan (Zero Visual Regression).
* Struktur grid, flexbox, margin, dan padding utama harus tetap identik dengan desain baseline.

### 3. Dokumentasi Visual (Pre-Refactor)
* **WAJIB** mencatat atau mendokumentasikan (screenshot/notes) detail UI yang sudah ada sebelum melakukan perubahan.
* Tujuannya adalah untuk menghindari kesalahan desain (Wrong Design) dan memastikan integritas tampilan tetap terjaga 100% setelah refactor.

---

## II. PRINSIP UTAMA: ZERO CLASSNAME RETURN

### 1. Filosofi Komponisasi
* Halaman fitur (`_components/`) hanya bertugas **Menyusun** (Composing) komponen, bukan **Mendesain** (Visualizing).
* **Zero Visual Tailwind:** Dilarang menulis class visual (`bg-*`, `text-warna`, `shadow-*`, `border-*`, `rounded-*`) di file fitur.

### 2. Larangan ClassName di JSX (Zero Tolerance)
* **DILARANG KERAS** menulis atribut `className` di dalam blok `return` JSX pada komponen fitur.
* Segala kebutuhan tata letak, posisi, dan estetika **WAJIB** menggunakan:
  - **Layout Props:** (`spacing`, `padding`, `align`, `justify`, etc.)
  - **Atomic Positioning Props:** (`position`, `top`, `bottom`, `left`, `right`, `zIndex`, `inset`)
  - **Bundled Variants:** (`variant="modal-container"`, etc.)
* **Hanya 1 Pengecualian:** `className` hanya diizinkan di **Level Definisi Variant** (di dalam file UI Library) atau jika komponen tersebut diteruskan sebagai `asChild` dan membutuhkan *external injection* dari library animasi pihak ketiga (seperti `framer-motion`), namun tetap harus diminimalisir.

---

## III. PEMISAHAN PROPS (LAYOUT) VS VARIANTS (ESTETIKA)

### 1. Pure Layout Props
* Gunakan Properti bawaan Primitives (`Box`, `Stack`, `Inline`) untuk menyusun tata letak.
* **Allowed Props:** `spacing`, `padding`, `align`, `justify`, `display`, `direction`, `gap`.

### 2. Bundled Aesthetics Variants
* Gunakan `variant` untuk menentukan tampilan visual elemen.
* **DILARANG** menguraikan estetika manual di file fitur.
  
#### Contoh Perbandingan:
```tsx
// ❌ SALAH (Over-configuration & Sulit di-update secara masal)
<Stack spacing="md" padding="lg" background="white" rounded="3xl" shadow="sm">...</Stack>

// ✅ BENAR (Bundled Aesthetics: Perubahan desain cukup di 1 file UI)
<Stack spacing="md" padding="lg" variant="surface">...</Stack>
```

---

## IV. PROSEDUR ELEVASI DESAIN (NAIK KELAS)

Jika sebuah fitur membutuhkan desain visual baru (misal: kartu dengan border biru khusus) yang belum tersedia di library UI:
1. **Dilarang** menulis class manual `border-blue-500` di file fitur.
2. **Wajib** membuka file UI terkait (misal: `Box.tsx` atau `WorkspacePanel.tsx`).
3. **Wajib** menambahkan `variant` baru (misal: `variant="info-panel"`) yang berisi desain tersebut.
4. **Wajib** memanggil varian tersebut di file fitur.

---

## V. ANATOMI & DESAIN KOMPONEN FITUR

### 1. Hierarki Visual (Typography)
* **Judul Utama/Card:** Wajib menggunakan `<Text variant="heading" as="h1">`.
* **Label/Meta:** Wajib menggunakan `<Text variant="caption" weight="black" className="uppercase tracking-widest text-[10px]">`.
* **Body Text:** Wajib menggunakan `<Text variant="body">`.

### 2. Standar Jarak (Global Spacing)
* **Outer Padding:** Gunakan `padding="md"` (p-4) atau `padding="lg"` (p-6).
* **Grup Berurutan (List):** Wajib menggunakan `<Stack spacing="sm">` (gap-2) atau `spacing="md"` (gap-4).

---

## VI. DAFTAR LARANGAN KERAS (ZERO TOLERANCE)

### 1. Larangan Tag HTML Mentah (no_raw_html)
* **DILARANG KERAS** menggunakan tag HTML mentah (`div`, `span`, `button`, `input`, `a`) di file fitur.
* Wajib dibungkus/diganti dengan UI Primitives (`Box`, `Text`, `Input`, `Button`, `IconWrapper`).

### 2. Larangan Aksi Manual (no_raw_action)
* Untuk tombol aksi (Close, More, Search), wajib menggunakan:
  - `<Button variant="ghost" size="icon" rounded="xl">` atau variant yang sesuai.

### 3. Larangan Shadow & Rounding Manual
* **DILARANG** menulis `shadow-*` atau `rounded-*` di file fitur. Visual ini harus ter-bundling di dalam `variant`.
