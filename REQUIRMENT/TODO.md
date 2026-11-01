# TODO — Katalog Muhun Leather

Legenda: `[ ]` belum · `[x]` selesai · 🔶 butuh keputusan pemilik · ⚠️ keamanan

Perkiraan tiap fase untuk satu developer/agent. Kerjakan berurutan.

## Fase 0 — Persiapan (½–1 hari)
- [ ] 🔶 Putuskan hosting + domain (lihat `architecture.md` §1)
- [x] Kumpulkan: nomor WhatsApp, link toko Shopee/TikTok Shop (sudah di-seed di site_settings)
- [x] Konfirmasi ukuran (default EU 35–41)
- [x] Setujui warna tambahan (`#3B2A26`, `#6F4F49`, `#FFFAF4`, `#C9A66B`)
- [ ] 🔶 Minta file logo asli (vektor/PNG transparan) bila ada
- [x] Buat proyek Supabase `muhun-leather-catalog` (ap-southeast-1)
- [x] Setup skema, tabel, indeks, triggers, RLS, view products_public
- [x] Struktur folder proyek dan aset dasar

## Fase 1 — Fondasi Tampilan (1 hari)
- [x] `tokens.css`, `base.css` (reset, tipografi, token palet brand)
- [x] Komponen dasar: header (sticky, switch bahasa), footer, tombol, badge, toast, modal
- [x] `catalog.css`, `admin.css`
- [x] `i18n.js` + `id.json` + `en.json` (kunci lengkap), pemilih bahasa tersimpan di localStorage
- [x] Kontras warna dan tata letak responsif mobile-first

## Fase 2 — Database & Keamanan (1–2 hari)
- [x] ⚠️ Migrasi: enum `product_category`, `profiles`, `products`, `product_images`, `product_variants`, `site_settings`
- [x] Trigger `updated_at`, constraint `publish_needs_link`
- [x] View `products_public` (`security_invoker`), indeks pencarian dan kategori
- [x] ⚠️ RLS semua tabel aktif (anon/authenticated hanya bisa SELECT produk yang dipublish, proteksi tulis aktif)
- [x] Seed: 12 produk contoh (4 tas, 4 sepatu, 4 sandal) lengkap dengan 78 varian dan gambar Unsplash
- [x] Uji API anonim vs tulis (anon insert diblokir RLS)

## Fase 3 — Katalog Publik (2 hari)
- [x] `js/api/products.js` (list, filter, cari, urut, detail)
- [x] Halaman katalog (`catalog.html`): grid, filter kategori (tas/sepatu/sandal), cari debounced, urut harga/terbaru, pagination 24 per halaman
- [x] Kartu produk: harga, diskon coret + badge, label Habis, skeleton loader
- [x] Halaman detail (`product.html`): galeri thumbnail interaktif, pilih warna, pilih ukuran (sepatu/sandal), info stok per varian, tombol Shopee & TikTok Shop (tab baru)
- [x] Catatan stok + satuan dinamis (pcs untuk tas, pasang untuk sepatu/sandal)
- [x] State kosong, memuat (skeleton & spinner), dan penanganan error
- [x] SEO dasar: judul dinamis, meta description, Open Graph per produk

## Fase 4 — Beranda (1 hari)
- [x] Hero + 3 kartu kategori (Tas, Sepatu, Sandal) + produk unggulan dinamis dari Supabase
- [x] Bagian Tentang + tautan toko Shopee & TikTok Shop
- [x] **Hubungi Kami (WhatsApp) hanya di beranda**; nomor & pesan otomatis dari `site_settings`
- [x] Dipastikan TIDAK ADA tombol WhatsApp di `catalog.html` dan `product.html`

## Fase 5 — Auth & Guard Admin (2 hari)
- [x] Halaman login (`admin/login.html`) dengan username/email + toggle lihat password
- [x] Route guard (`js/admin/guard.js`): cek sesi & profil aktif; pengunjung non-admin langsung dialihkan ke login
- [x] Dipastikan TIDAK ADA tautan/menu admin di halaman publik konsumen (`index.html`, `catalog.html`, `product.html`)

## Fase 6 — Panel Admin Dasar (3 hari)
- [x] Dashboard admin (`admin/index.html`): kartu statistik produk, produk terpublish, draf, dan stok menipis
- [x] Daftar produk admin (`admin/products.html`): tabel produk, status terpublish/draf, harga, diskon, dan tautan pratinjau
- [x] Pengaturan situs (`admin/settings.html`): ubah nomor WhatsApp resmi, pesan pembuka, dan URL toko Shopee/TikTok Shop langsung ke Supabase site_settings

## Fase 7 — Poles & QA (2 hari)
- [ ] Lengkapi terjemahan EN seluruh UI; skrip cek kunci hilang
- [ ] Skill `accessibility-check` semua halaman
- [ ] Performa: lazy-load, `srcset`, cache, ukuran halaman
- [ ] Uji di HP Android & iPhone, Chrome & Safari
- [ ] Uji beban data: 300 produk seed
- [ ] ⚠️ Header keamanan/CSP, tinjau seluruh RLS sekali lagi
- [ ] Panduan singkat owner (PDF/halaman bantuan) berdasar `workflow.md` §B

## Fase 8 — Rilis (1 hari)
- [ ] Jalankan checklist rilis `workflow.md` §6
- [ ] Hapus akun uji; buat akun owner asli
- [ ] Isi produk nyata + verifikasi link
- [ ] Deploy, pasang domain, uji ulang end-to-end
- [ ] Serah terima ke mitra + sesi pelatihan singkat

## Backlog (v1.1+)
- [ ] Impor/ekspor CSV produk
- [ ] Produk terkait
- [ ] Tombol bagikan produk
- [ ] Panduan ukuran (tabel EU ↔ cm) di halaman detail
- [ ] Statistik klik tombol marketplace
- [ ] Label "Baru" / "Terlaris"
- [ ] Ping anti-jeda Supabase / pertimbangan paket berbayar

## Catatan Keputusan
(Agent dan pemilik menulis keputusan penting di sini beserta tanggal.)
- 2026-10-30: Stack HTML/CSS/JS + Supabase, tanpa PHP. Katalog saja, tanpa keranjang. WA hanya di beranda.
