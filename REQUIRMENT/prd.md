# PRD — Katalog Digital Muhun Leather

Versi 1.0 · 30 Okt 2026 · Status: Draft siap dibangun

## 1. Ringkasan
Website katalog fashion wanita untuk **Muhun Leather** (tas, sepatu, sandal). Pengunjung melihat produk, membuka halaman detail, lalu diarahkan ke Shopee / TikTok Shop untuk membeli. **Tidak ada keranjang dan checkout.** Owner dan admin mengelola produk sendiri lewat panel admin di web yang sama, tanpa aplikasi tambahan.

## 2. Tujuan
- Katalog yang simpel dan cepat dipakai pengunjung.
- Owner/admin bisa tambah, ubah, dan hapus produk, foto, harga, diskon, stok, serta link marketplace tanpa bantuan developer.
- Informasi akurat: link marketplace valid, stok per varian jelas.
- Tampilan minimalis namun mewah, sesuai brand.

## 3. Bukan Tujuan (Non-goals)
- Keranjang, checkout, pembayaran, ongkir.
- Akun pelanggan / login pembeli.
- Chat atau WhatsApp di semua halaman (hanya di beranda).
- Kategori selain tas, sepatu, sandal (bisa ditambah nanti).

## 4. Pengguna
| Peran | Akses |
|---|---|
| Pengunjung | Lihat katalog, cari, filter, buka detail, klik ke marketplace, hubungi via WA dari beranda |
| Admin | Kelola produk, varian, stok, foto, diskon, link. Ubah password sendiri |
| Owner | Semua hak admin + kelola akun admin, pengaturan situs (nomor WA, ukuran, teks beranda), hapus produk permanen |

## 5. User Stories (inti)
- Sebagai pengunjung, saya ingin melihat grid produk dengan foto agar cepat memilih.
- Sebagai pengunjung, saya ingin menekan produk dan melihat warna, harga, stok, dan ukuran (sepatu/sandal).
- Sebagai pengunjung, saya ingin tombol yang membawa saya langsung ke produk yang sama di Shopee/TikTok Shop.
- Sebagai pengunjung, saya ingin menghubungi toko lewat WhatsApp bila butuh bantuan.
- Sebagai pengunjung, saya ingin mengganti bahasa Indonesia ↔ Inggris.
- Sebagai owner/admin, saya ingin login, menambah produk dengan banyak foto, dan mengatur stok per warna/ukuran.
- Sebagai owner/admin, saya ingin memberi diskon dan harga coret tampil otomatis.
- Sebagai owner/admin, saya ingin reset password dan memulihkan username lewat Gmail yang terdaftar.
- Sebagai owner, saya ingin menambah dan menonaktifkan akun admin.

## 6. Fitur

### MVP (wajib)
| ID | Fitur | Catatan |
|---|---|---|
| F1 | Beranda | Hero, produk unggulan, kategori, bagian "Hubungi Kami" (WhatsApp) |
| F2 | Halaman katalog | Grid, filter kategori (tas/sepatu/sandal), pencarian nama, urut (terbaru/harga), pagination 24 per halaman |
| F3 | Halaman detail produk | Galeri foto, nama, harga (+ coret & diskon), pilihan warna, ukuran, stok per varian, tombol Shopee/TikTok Shop |
| F4 | Ganti bahasa | ID default, EN lewat switch, pilihan tersimpan |
| F5 | Login staf | Username atau email + password, sesi aman |
| F6 | Dashboard admin | Daftar produk, cari, filter, status (publish/draft), stok menipis |
| F7 | Form produk | Nama, kategori, deskripsi, harga, diskon, foto banyak, varian (warna × ukuran) + stok, link Shopee/TikTok |
| F8 | Upload & kelola foto | Urutkan, pilih foto sampul, hapus, resize otomatis sebelum upload |
| F9 | Diskon | Persen; tampil harga coret + harga akhir; tanggal berakhir opsional |
| F10 | Manajemen akun | Owner tambah/nonaktifkan admin; ubah password; lupa password; lupa username |
| F11 | Pengaturan situs | Owner ubah nomor WA, teks beranda, daftar ukuran |
| F12 | Validasi link marketplace | Lihat aturan bisnis §7 |

### Versi 1.1 (saran)
- Produk terkait ("mungkin kamu suka").
- Tombol bagikan produk (salin link).
- Panduan ukuran (tabel EU ↔ cm).
- Ekspor/impor produk via CSV (membantu ratusan produk).
- Statistik klik tombol marketplace (produk paling diminati).
- Mode koleksi / label "Baru", "Terlaris".

### Nanti
- Kategori tambahan, banyak bahasa lain, PWA.

## 7. Aturan Bisnis
1. **Kategori:** Tas, Sepatu, Sandal.
2. **Varian & stok:** stok dihitung **per varian**. Tas = warna. Sepatu/sandal = warna × ukuran.
3. **Ukuran:** standar EU untuk kaki wanita Indonesia, default **35–41**, dapat diubah owner di pengaturan. Panduan perkiraan panjang kaki (konfirmasi owner dengan cetakan sepatu Muhun):

   | EU | 35 | 36 | 37 | 38 | 39 | 40 | 41 |
   |---|---|---|---|---|---|---|---|
   | cm | 22.5 | 23 | 23.5 | 24 | 24.5 | 25 | 25.5 |
4. **Harga:** rupiah, bilangan bulat, tampil `Rp 249.000`.
5. **Diskon:** persen 0–90. Jika aktif: harga asli dicoret, di sampingnya harga akhir + badge `-20%`. Jika ada tanggal berakhir, diskon mati otomatis setelahnya.
6. **Stok tampil:** angka kuantitas + label: `Tersedia` (>3), `Terbatas` (1–3), `Habis` (0). Varian habis tetap terlihat tapi tidak bisa dipilih. Beri catatan kecil: "Stok dapat berubah, cek marketplace untuk info terbaru."
7. **Link marketplace:**
   - Produk hanya bisa **dipublish** jika punya minimal 1 link (Shopee atau TikTok Shop).
   - Link wajib `https`, domain harus ada di daftar putih (Shopee, TikTok Shop; daftar bisa diatur owner).
   - Tombol "Cek link" di form admin. Sistem mencoba membuka link; marketplace sering memblokir pengecekan otomatis, jadi hasil bisa "tidak pasti". Karena itu staf juga mencentang "Saya sudah buka link ini dan benar". Tanggal verifikasi disimpan.
   - Link dibuka di tab baru dengan `rel="noopener noreferrer"`.
8. **WhatsApp:** hanya muncul di **beranda**. Tidak ada tombol melayang di halaman lain.
9. **Bahasa:** field produk punya versi ID (wajib) dan EN (opsional, jika kosong tampil ID).
10. **Hapus:** admin hanya bisa menyembunyikan (unpublish/arsip). Owner bisa hapus permanen.

## 8. Kebutuhan Non-Fungsional
- **Performa:** halaman katalog muat < 2,5 dtk di 4G; gambar lazy-load, ada thumbnail.
- **Responsif:** prioritas HP (mayoritas pengguna Indonesia di mobile).
- **Keamanan:** RLS di semua tabel; publik hanya baca produk terpublish; signup publik dimatikan; password minimal 10 karakter; kunci `service_role` tidak pernah di frontend.
- **Aksesibilitas:** kontras teks ≥ 4.5:1, navigasi keyboard, alt text foto.
- **SEO dasar:** judul/meta per produk, Open Graph agar rapi saat dibagikan, sitemap.
- **Skala:** ratusan produk, tiap produk ≤ 8 foto.

## 9. Kriteria Penerimaan (ringkas)
- Pengunjung bisa dari beranda → katalog → detail → klik ke Shopee/TikTok Shop dalam ≤ 3 ketukan.
- Owner membuat produk lengkap (foto, varian, stok, link, diskon) tanpa menyentuh kode atau database.
- Diskon tampil benar (coret + harga akhir) dan hilang otomatis setelah tanggal berakhir.
- Admin tidak bisa membuka halaman manajemen akun; pengunjung anonim tidak bisa menulis data (diuji lewat percobaan API langsung).
- Lupa password dan lupa username berhasil lewat email terdaftar.
- Ganti bahasa mengubah seluruh teks antarmuka tanpa reload penuh.

## 10. Risiko & Catatan
| Risiko | Penanganan |
|---|---|
| Supabase paket gratis menghentikan proyek yang tidak aktif ~7 hari | Pantau, buat ping berkala, atau naik ke paket berbayar bila trafik rendah |
| Email bawaan Supabase dibatasi jumlahnya | Pasang SMTP sendiri (mis. Resend / SMTP Gmail) sebelum produksi |
| Stok di katalog beda dengan marketplace | Disclaimer di UI; marketplace dianggap sumber kebenaran |
| Link marketplace berubah/mati | Tanggal verifikasi, dashboard "link perlu dicek" (> 30 hari) |
| Vercel paket Hobby dibatasi untuk penggunaan non-komersial | Cek ketentuan terbaru; alternatif Cloudflare Pages / Netlify / Vercel Pro |
| Foto logo masih mentah dengan watermark | Agent membuat ulang sebagai SVG (lihat design.md) |

## 11. Pertanyaan Terbuka
- Nomor WhatsApp resmi dan template pesan pembuka.
- Link Shopee/TikTok Shop toko (untuk tombol di beranda/footer).
- Daftar ukuran final dan apakah sandal memakai rentang yang sama.
- Hosting final (Vercel vs lainnya) dan domain.
- Email Gmail owner dan admin untuk pemulihan akun.
