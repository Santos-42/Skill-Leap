# Implementation Plan: Dynamic Responsive Layout untuk Interview

## Goal

Mengubah komposisi tampilan halaman `/interview` secara dinamis (menjadi format 60:40 menyamping) ketika _sidebar_ ditutup, dan mempertahankan tampilan atas-bawah (_stack_) ketika _sidebar_ terbuka.

## Proposed Changes

### 1. Global State Management untuk Sidebar

#### [NEW] `src/lib/state/sidebar.svelte.ts`

- Karena status _collapsed_ (tutup/buka) dari sidebar saat ini hanya bersifat lokal di dalam komponen `Sidebar.svelte`, kita perlu mengangkat (hoist) state ini agar bisa dibaca oleh halaman `/interview`.
- Akan dibuat sebuah _class_ state menggunakan Svelte 5 Runes:
  ```ts
  class SidebarState {
    isCollapsed = $state(false);
  }
  export const sidebar = new SidebarState();
  ```

### 2. Modifikasi Komponen Sidebar

#### [MODIFY] `src/lib/components/Sidebar.svelte`

- Mengimpor `sidebar` state dari `src/lib/state/sidebar.svelte.ts`.
- Mengganti state lokal `let isCollapsed = $state(false);` menjadi `sidebar.isCollapsed`.

### 3. Penyesuaian Layout Halaman Interview

#### [MODIFY] `src/routes/(app)/interview/+page.svelte`

- Mengimpor `sidebar` state global.
- Membungkus kontainer Audio dan Transkrip ke dalam kontainer fleksibel dinamis.
- Mengubah _class_ kontainer utama:
  - **Jika sidebar terbuka (`sidebar.isCollapsed === false`):**
    Tata letak vertikal seperti sekarang (`flex-col`), di mana Audio di atas dan Transkrip di bawah.
  - **Jika sidebar tertutup (`sidebar.isCollapsed === true`):**
    Tata letak horizontal (`flex-row`), dengan:
    - Bagian Audio (kiri): Mengambil lebar 60% (`w-[60%]`).
    - Bagian Transkrip (kanan): Mengambil lebar 40% (`w-[40%]`).
- Memastikan tinggi kedua bagian disesuaikan (misal `h-full`) agar dapat tergulir (scrollable) dengan proporsi yang sejajar di layar.

## Verification Plan

1. Buka halaman `/interview`.
2. Klik tombol buka/tutup (Toggle) pada _sidebar_.
3. Perhatikan halaman _interview_:
   - Saat sidebar **terbuka** (lebar), susunan Audio dan Transkrip adalah vertikal.
   - Saat sidebar **tertutup** (menyempit), susunan langsung berubah secara otomatis menjadi horizontal (kiri-kanan) dengan proporsi layar 60:40.
4. Memastikan animasi spektrum dan transkrip tetap berfungsi normal pada kedua _layout_.
