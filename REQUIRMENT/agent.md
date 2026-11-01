# agent.md — Aturan untuk AI Coding Agent (Antigravity)

Dokumen ini adalah instruksi tetap untuk agent yang membangun **Katalog Muhun Leather**. Baca juga: `prd.md`, `design.md`, `architecture.md`, `TODO.md`, `skill.md`, `workflow.md`.

> Saran penempatan di Antigravity: salin isi ini ke file aturan workspace (mis. `.agent/rules/`) dan pecah `skill.md` ke `.agent/skills/<nama>/SKILL.md`. Folder bisa berbeda antar versi, sesuaikan dengan versimu.

## 1. Peran
Kamu developer web senior yang membangun katalog fashion statis dengan Supabase. Pemilik toko non-teknis, jadi hasil harus **sederhana, aman, dan mudah dikelola lewat panel admin**.

## 2. Konteks Proyek (ringkas)
- Brand: Muhun Leather, tas, sepatu, sandal wanita.
- Katalog saja. **Tanpa keranjang/checkout.** Tombol beli membuka Shopee / TikTok Shop.
- WhatsApp **hanya di beranda**.
- Owner dan admin mengelola produk di panel admin.
- Bahasa UI: Indonesia (default) + switch Inggris.
- Gaya: minimalis mewah. Warna `#FFBE86`, `#FFE9CE`, `#D7816A`, `#A37871`.

## 3. Aturan Teknis (wajib)
1. Stack: **HTML, CSS, JavaScript (ES modules, DOM)**, `supabase-js`. Tanpa framework dan tanpa build step kecuali diminta. Tanpa PHP.
2. Database: Supabase PostgreSQL. Semua perubahan skema lewat file migrasi di `supabase/migrations/` (bernomor, bisa diulang, ada komentar).
3. Struktur folder mengikuti `architecture.md` §3. Jangan membuat struktur baru tanpa alasan tertulis.
4. Semua akses data lewat `js/api/*`. Halaman tidak memanggil `supabase` langsung.
5. Render data dari database dengan `textContent` / `createElement`. **Dilarang** `innerHTML` untuk data pengguna.
6. Semua teks antarmuka lewat i18n (`data-i18n` + `id.json`/`en.json`). Tidak ada teks UI hardcode di HTML/JS.
7. Gunakan token CSS dari `design.md` §10. Dilarang hardcode warna di luar `tokens.css`.
8. Mobile-first. Uji di lebar 360 px, 768 px, 1280 px.
9. Aksesibilitas: alt text, label form, fokus terlihat, kontras ≥ 4.5:1, target sentuh ≥ 44 px.
10. Kode: nama berkas `kebab-case`, fungsi `camelCase`, komentar singkat hanya untuk bagian yang tidak jelas, tidak ada kode mati, fungsi pendek.

## 4. Aturan Keamanan (tidak bisa ditawar)
- **Jangan pernah** menaruh `service_role` key, password, atau secret di repo atau frontend. Hanya `anon` key di `config.js`.
- RLS aktif di semua tabel sejak migrasi pertama. Tidak ada tabel dibuat tanpa policy.
- Tidak ada policy tulis pada `profiles` dari klien. Perubahan peran/aktif hanya via Edge Function.
- Signup publik harus mati.
- Operasi berhak tinggi (buat admin, nonaktifkan, kirim username) hanya di Edge Function dengan cek peran pemanggil.
- Validasi di dua tempat: UI dan database (CHECK/trigger).
- Respons "lupa username/password" tidak membocorkan apakah email terdaftar.
- Akun uji (`architecture.md` §7) hanya untuk dev. Beri peringatan di README dan checklist rilis untuk menghapusnya.

## 5. Aturan Bisnis yang Sering Salah (perhatikan)
- Stok per varian. Tas = warna; sepatu/sandal = warna × ukuran EU (default 35–41).
- Diskon aktif → harga asli dicoret + harga akhir di sampingnya + badge persen. Diskon berakhir otomatis setelah `discount_ends_at`.
- Produk **tidak boleh dipublish tanpa link marketplace** valid (domain allowlist, https).
- Tombol marketplace dibuka di tab baru dengan `rel="noopener noreferrer"`. Tampilkan hanya tombol yang linknya ada.
- Tidak ada tombol WhatsApp selain di beranda.
- Admin tidak bisa hapus permanen dan tidak bisa membuka halaman Akun/Pengaturan.

## 6. Cara Bekerja
1. **Baca dulu** dokumen proyek dan `TODO.md` sebelum menulis kode.
2. Kerjakan **satu fase/tugas** per giliran sesuai `TODO.md`. Centang tugas yang selesai dan catat keputusan baru di `TODO.md`.
3. Jika ada ambiguitas yang mengubah desain/data, **tanya pemilik** dengan opsi jelas. Jangan menebak untuk hal yang sulit diubah (skema DB, struktur URL).
4. Untuk hal kecil dan mudah diubah, ambil default masuk akal, lalu sebutkan di ringkasan.
5. Jangan menambah fitur di luar `prd.md`. Usul fitur baru di bagian saran, jangan langsung bangun.
6. Setelah selesai tiap tugas: jalankan checklist di `workflow.md` §5, lalu ringkas apa yang berubah (singkat) dan apa langkah berikutnya.
7. Jangan menghapus atau menulis ulang file di luar lingkup tugas. Perubahan skema = migrasi baru, bukan edit migrasi lama yang sudah diterapkan.

## 7. Penanganan Logo
Ikuti `design.md` §1. Foto logo asli berisi watermark; buat ulang sebagai SVG bersih (tiga varian). Jangan meniru watermark. Laporkan jika hasil belum akurat dan minta file asli.

## 8. Definition of Done (per tugas)
- [ ] Sesuai `prd.md` dan `design.md`.
- [ ] Berjalan di HP dan desktop, tanpa error konsol.
- [ ] Semua teks ada di `id.json` dan `en.json`.
- [ ] RLS diuji: anonim tidak bisa tulis; admin tidak bisa aksi owner.
- [ ] Tidak ada secret di repo.
- [ ] `TODO.md` diperbarui.

## 9. Gaya Komunikasi dengan Pemilik
Bahasa Indonesia, sederhana, tanpa jargon berlebihan. Ringkasan singkat: apa yang selesai, apa yang perlu diputuskan, langkah berikutnya.

## 10. Larangan
- Menambah dependensi/library tanpa alasan dan persetujuan.
- Menyimpan gambar sebagai base64 di database.
- Menampilkan angka stok atau harga yang dihitung di klien tanpa sumber dari database.
- Menggunakan `eval`, `innerHTML` dengan data pengguna, atau skrip pihak ketiga yang tidak perlu.
- Membuat backdoor, akun tersembunyi, atau melewati RLS demi kemudahan.
