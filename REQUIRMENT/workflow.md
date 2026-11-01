# workflow.md — Alur Kerja

Dua bagian: **alur pembangunan** (untuk developer/agent) dan **alur operasional** (untuk owner/admin sehari-hari).

## A. Alur Pembangunan

### 1. Persiapan akun & lingkungan
1. Buat dua proyek Supabase: `muhun-dev` dan `muhun-prod`.
2. Auth: matikan signup publik; atur Site URL & Redirect URLs; siapkan SMTP kustom (Resend / SMTP Gmail app password).
3. Buat repo Git (`main` + branch fitur). Tambahkan `.gitignore` (tanpa secret).
4. Putuskan hosting (lihat `architecture.md` §1 catatan) dan sambungkan ke repo.
5. Simpan secret Edge Functions lewat Supabase (bukan di repo).

### 2. Siklus per tugas
```
Pilih tugas di TODO.md
   → baca dokumen terkait
   → (jika ambigu) ask-owner
   → buat branch  feat/<nama-singkat>
   → bangun (migrasi → API → UI → i18n)
   → jalankan checklist (§5)
   → commit kecil & jelas
   → gabung ke main setelah lulus
   → centang TODO.md + catat keputusan
```

### 3. Urutan membangun (ringkas; detail di TODO.md)
Fondasi & token → skema + RLS → katalog publik (baca) → auth & guard → admin produk → foto → diskon/link/stok → akun & pemulihan → pengaturan & beranda → i18n penuh → QA → rilis.

### 4. Konvensi
- Commit: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:` + kalimat pendek (mis. `feat: form produk dengan varian warna dan ukuran`).
- Migrasi: `0001_init.sql`, `0002_rls.sql`, dst.; tidak pernah mengubah migrasi yang sudah diterapkan di prod.
- Satu PR/gabungan = satu tujuan.

### 5. Checklist Kualitas (tiap tugas)
- [ ] Fungsi sesuai `prd.md`; tampilan sesuai `design.md`.
- [ ] Tidak ada error di konsol; tidak ada `innerHTML` dengan data pengguna.
- [ ] Uji lebar 360 / 768 / 1280 px.
- [ ] Teks ada di `id.json` dan `en.json`.
- [ ] RLS diuji dengan `anon`, admin, owner (skill `rls-test`).
- [ ] Kontras & keyboard (skill `accessibility-check`).
- [ ] Tidak ada secret/akun uji tertinggal.
- [ ] `TODO.md` diperbarui.

### 6. Checklist Rilis Produksi
- [ ] Migrasi diterapkan ke `muhun-prod` berurutan.
- [ ] Akun uji dihapus; owner dibuat dengan Gmail asli + password kuat; `must_change_password` terisi.
- [ ] Signup publik **mati** di prod.
- [ ] SMTP kustom aktif; uji lupa password & lupa username ke Gmail asli.
- [ ] `config.js` menunjuk ke prod; `service_role` tidak ada di repo.
- [ ] Header keamanan/CSP aktif; HTTPS aktif; domain terpasang.
- [ ] Nomor WhatsApp, tautan toko, ukuran, teks beranda diisi di Pengaturan.
- [ ] Minimal 10 produk nyata dengan link terverifikasi.
- [ ] Uji lengkap di HP Android & iPhone (Chrome/Safari).
- [ ] Rencana cadangan & pemantauan proyek Supabase (anti-jeda) siap.
- [ ] Panduan singkat owner diserahkan (lihat §B).

### 7. Setelah rilis
Pantau error 1 minggu pertama, kumpulkan masukan owner, prioritaskan fitur v1.1 (`prd.md` §6).

---

## B. Alur Operasional (Owner/Admin)

### B1. Menambah produk
1. Login `/admin/login`.
2. Produk → **Tambah produk**.
3. Isi nama (ID, EN opsional), kategori, deskripsi.
4. Unggah foto (minimal 3), pilih foto sampul, atur urutan.
5. Isi harga. Jika ada promo: isi diskon (%) dan tanggal berakhir bila perlu.
6. Tambah varian: tiap warna → (sepatu/sandal) pilih ukuran → isi stok.
7. Isi link Shopee dan/atau TikTok Shop → **Cek link** → buka link dan pastikan produk sama → centang "sudah saya cek".
8. Simpan sebagai draf, tinjau pratinjau, lalu **Publikasikan**.

### B2. Mengubah stok / harga / diskon
Produk → pilih produk → ubah angka stok per varian atau harga/diskon → Simpan. Perubahan langsung tampil di katalog.

### B3. Produk habis atau dihentikan
- Stok 0 di semua varian → otomatis berlabel "Habis".
- Tidak dijual lagi → **Sembunyikan** (draf). Owner dapat **Hapus permanen**.

### B4. Menambah admin (owner)
Akun → **Tambah admin** → isi nama, username, Gmail → admin menerima email untuk membuat password → saat login pertama wajib ganti password.
Menonaktifkan admin: Akun → pilih admin → **Nonaktifkan** (data produk tetap aman).

### B5. Lupa password
`/admin/forgot` → masukkan Gmail terdaftar → buka email → buat password baru.

### B6. Lupa username
`/admin/forgot` → "Lupa username?" → masukkan Gmail → username dikirim ke email tersebut.

### B7. Pemeliharaan berkala
- Mingguan: cek dashboard "stok menipis" dan "link perlu dicek".
- Bulanan: verifikasi ulang link produk unggulan; ekspor CSV produk sebagai cadangan.
- Setiap ada promo: atur diskon dengan tanggal berakhir agar otomatis kembali normal.

### B8. Jika ada masalah
| Masalah | Langkah |
|---|---|
| Tidak bisa login | Coba lupa password; jika akun dinonaktifkan, hubungi owner |
| Email pemulihan tidak masuk | Cek spam; pastikan Gmail benar; hubungi developer (cek SMTP) |
| Foto gagal diunggah | Pastikan file gambar (JPG/PNG/WebP); coba ukuran lebih kecil |
| Katalog kosong/error | Cek apakah proyek Supabase sedang dijeda (paket gratis); hubungi developer |
