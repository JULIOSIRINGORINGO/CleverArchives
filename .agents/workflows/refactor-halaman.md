---
description: SOP Wajib (Strict Guidelines) untuk refactor komponen dan halaman guna memastikan clean code, modularitas, pemisahan tanggung jawab, serta integritas logika dan layout.
---

# Panduan Refactor Halaman & Fitur (Absolute Design System)
**Version:** 5.6.0 (Strictly Encapsulated)  
**Enforcement:** Zero ClassName in Logic & Strict Tiering  
**Principle:** Prop-Driven Layout, Isolated Aesthetics, Lean Primitives, and Gradual Promotion.

---

## I. PROSEDUR VERIFIKASI & BACKUP (SAFETY FIRST)

### 1. Pembuatan File Backup
* **WAJIB** membuat salinan file asli (e.g., `page.tsx.bak`) sebelum refactor.
* File backup **WAJIB DIHAPUS** segera setelah proses refactor selesai dan diverifikasi.

### 2. Dokumentasi Visual
* Catat detail posisi elemen untuk memastikan **Zero Visual Regression**.

---

## II. HIERARKI ESTETIKA (3-LEVEL ISOLATION)

### Level 1: UI Dasar / Primitives (Lean Global Library)
* **File:** `Box.tsx`, `Stack.tsx`, `Inline.tsx`, `Text.tsx`.
* **Kriteria:** Hanya untuk gaya **REUSABLE** lintas fitur yang bersifat atomik. Jaga file ini tetap tipis.

### Level 2: UI Fitur / Shared Feature UI (Wrapper Components)
* **File:** `features/[nama-fitur]/_components/[Feature]Aesthetics.tsx`.
* **Pemicu:** Pindahkan gaya ke sini jika sudah digunakan **DI DUA (2x)** tempat berbeda dalam satu fitur.
* **Bentuk:** Wajib berupa *Wrapper Components*.

### Level 3: Estetika Lokal (One-Off ONLY)
* **Aturan Strict:** Hanya boleh ada **MAKSIMAL 1-2** komponen estetika lokal di bagian atas file.
* **Pemicu:** Jika desain tersebut digunakan kembali (2x), segera **"TENDANG"** ke Level 2. 
* **Tujuan:** Menjaga bagian atas file tetap ramping dan fokus. Logika `return` utama tetap bersih (Zero ClassName).

---

## III. STANDAR ALUR DATA & LOGIKA (CUSTOM HOOKS)

* Semua logika wajib didelegasikan ke Custom Hook (e.g., `use[Feature]Data.ts`).
* UI Komponen dilarang memproses state bisnis yang rumit secara internal.

---

## IV. ATURAN PENULISAN (PROPS VS VARIANTS)

1. **Pure Layout Props:** Gunakan properti bawaan Primitives (`spacing`, `padding`, `align`, `justify`, `display`, `direction`).
2. **Prop Validation:** Jika prop estetika belum terdaftar di Level 1, gunakan pola Level 3 (Local Wrapper) alih-alih memaksakan `className` di dalam `return`.

---

## V. DAFTAR LARANGAN KERAS (ZERO TOLERANCE)

1. **No Raw HTML:** Wajib menggunakan UI Primitives.
2. **No Inline Aesthetics:** Dilarang menulis gaya visual kompleks langsung di dalam `className` pada blok kode `return` fungsi utama.
3. **No Direct API in UI:** Wajib melalui Handlers di Custom Hook.
4. **No Primitive Alteration:** Dilarang menghapus *class* dasar pada file UI Dasar (`Inline`, `Box`, `Stack`).
