# Design — Katalog Muhun Leather

Gaya: **minimalis namun mewah**. Banyak ruang kosong, tipografi elegan, warna hangat kulit, foto produk jadi bintang utama.

## 1. Brand

### Logo
- Sumber: foto papan nama 3D emas di dinding (`assets/logo-original.jpg`, file yang dikirim pemilik). Foto ini punya latar gelap dan **coretan watermark/overlay** (lengkungan oranye, bentuk magenta, huruf samar) yang bukan bagian logo.
- Tugas agent: **gambar ulang sebagai SVG bersih** (`assets/logo.svg`) yang hanya berisi:
  1. Monogram kubus heksagonal "M" bergaris emas (bentuk geometris bersiku).
  2. Tulisan script "Muhun Leather" melengkung di bawahnya.
- Buat 3 varian: `logo-full.svg` (monogram + tulisan), `logo-mark.svg` (monogram saja, untuk favicon & header kecil), `logo-mono-dark.svg` (satu warna cokelat tua untuk latar terang).
- Jangan menyalin watermark atau latar foto. Jika tulisan script sulit ditiru akurat, gunakan font script serupa dan beri tahu pemilik. Minta file logo asli (vektor/PNG transparan) bila ada.
- Zona aman logo: minimal setengah tinggi monogram di semua sisi. Tinggi minimum di header: 36 px (mark) / 48 px (full).
- Favicon: `logo-mark.svg` + PNG 32/180/512.

### Palet (dari pemilik)
| Token | Hex | Peran |
|---|---|---|
| `--color-primary` | `#FFBE86` | Warna dasar brand, tombol utama, sorotan |
| `--color-surface` | `#FFE9CE` | Latar terang, kartu, bagian bergantian |
| `--color-accent` | `#D7816A` | Aksen hangat: hover, badge, link, ikon aktif |
| `--color-neutral` | `#A37871` | Teks sekunder, garis, elemen pendukung |

### Warna tambahan (usulan, perlu persetujuan)
`#A37871` di atas `#FFE9CE` kontrasnya sekitar 3,3:1, kurang untuk teks kecil. Karena itu:
| Token | Hex | Peran |
|---|---|---|
| `--color-ink` | `#3B2A26` | Teks utama & judul |
| `--color-neutral-strong` | `#6F4F49` | Teks sekunder ukuran kecil (kontras ≥ 4.5:1 di latar terang) |
| `--color-bg` | `#FFFAF4` | Latar halaman (putih hangat) |
| `--color-gold` | `#C9A66B` | Garis tipis/hiasan mewah (opsional, hemat) |
| `--color-danger` | `#B3412F` | Error, stok habis |
| `--color-success` | `#4C7A4F` | Berhasil |

Aturan: `#A37871` boleh untuk teks ≥ 18 px atau garis/ikon; teks kecil pakai `--color-neutral-strong`. Jangan taruh teks putih di atas `#FFBE86` (kontras rendah), pakai `--color-ink`.

## 2. Tipografi
- Judul: **Cormorant Garamond** (serif elegan), 500–600.
- Isi/UI: **Jost** atau **Inter**, 400/500.
- Harga & angka: font isi, `font-variant-numeric: tabular-nums`.
- Skala (mobile → desktop): H1 32→56, H2 24→36, H3 20→24, body 16, kecil 14. Line-height isi 1.6.
- Judul huruf besar kecil dengan `letter-spacing: .02em`; hindari semua-kapital kecuali label kecil.

## 3. Tata Letak & Spasi
- Grid 4 kolom (desktop ≥1024), 3 (tablet), 2 (HP) untuk kartu produk.
- Kontainer maks 1200 px, padding sisi 16 px (HP) / 32 px (desktop).
- Skala spasi: 4, 8, 12, 16, 24, 32, 48, 72, 96. Antar-seksi 72–96 px (kesan lapang).
- Radius: 4 px (kecil, tegas) untuk kartu/tombol; foto tanpa radius atau 2 px. Bayangan sangat halus: `0 6px 24px rgba(59,42,38,.08)`.
- Garis: 1 px `rgba(163,120,113,.35)`.

## 4. Komponen
- **Header:** logo kiri, menu (Beranda, Katalog), switch bahasa `ID | EN`, tanpa ikon keranjang. Lengket (sticky), latar `--color-bg` dengan garis bawah tipis. Di HP: menu hamburger.
- **Kartu produk:** foto rasio 4:5, nama (1–2 baris), harga. Jika diskon: harga coret abu + harga akhir `--color-accent` tebal + badge `-20%`. Label "Habis" jika semua varian 0. Hover: foto kedua (jika ada) muncul halus.
- **Filter katalog:** tab/chip kategori (Semua, Tas, Sepatu, Sandal), kolom cari, urutan.
- **Tombol:** utama = latar `#FFBE86`, teks `--color-ink`; hover `#D7816A`. Sekunder = garis 1 px. Tinggi min 44 px.
- **Badge:** diskon (aksen), Baru, Terbatas, Habis.
- **Pemilih warna:** bulatan 32 px dengan nama saat hover/fokus; terpilih = cincin `--color-accent`.
- **Pemilih ukuran:** kotak 44×44, ukuran habis dicoret dan nonaktif.
- **Galeri detail:** foto besar + thumbnail; geser (swipe) di HP; zoom saat diketuk.
- **Form admin:** label di atas input, error di bawah input, tombol Simpan lengket di bawah (HP).
- **Toast:** konfirmasi simpan/gagal, hilang 4 dtk.

## 5. Halaman

### 5.1 Beranda (`/`)
1. Hero: foto lifestyle besar atau monogram besar di latar `#FFE9CE`, judul "Kulit pilihan, langkah percaya diri" (contoh), tombol "Lihat Katalog".
2. Tiga kartu kategori besar (Tas · Sepatu · Sandal).
3. Produk unggulan (4–8).
4. Tentang singkat (2–3 kalimat) + tautan toko Shopee / TikTok Shop.
5. **Hubungi Kami:** teks "Butuh bantuan memilih?" + tombol WhatsApp (buka `wa.me/<nomor>?text=<pesan>`). **Hanya di sini.**
6. Footer: logo, tautan toko, hak cipta.

### 5.2 Katalog (`/catalog`)
Judul + jumlah produk, filter/cari, grid, pagination atau "Muat lebih banyak". URL menyimpan filter (`?category=sepatu&q=...&page=2`) agar bisa dibagikan.

### 5.3 Detail Produk (`/product?slug=...`)
Kiri: galeri. Kanan: nama, harga (+ coret & badge), pilih warna, pilih ukuran (sepatu/sandal), tabel stok varian terpilih ("Stok: 7 pasang"), deskripsi, tombol **"Beli di Shopee"** dan **"Beli di TikTok Shop"** (hanya yang ada link-nya; buka tab baru), catatan kecil soal stok. Di HP tombol marketplace lengket di bawah layar. Tidak ada tombol WhatsApp di sini.
Teks tombol memakai satuan: tas = "pcs", sepatu/sandal = "pasang".

### 5.4 Login (`/admin/login`)
Kartu tengah, logo, kolom "Username atau email", password (tombol lihat), "Lupa password?", "Lupa username?".

### 5.5 Admin
- **Dashboard:** ringkasan (jumlah produk, draft, stok menipis, link > 30 hari belum dicek).
- **Produk:** tabel (foto kecil, nama, kategori, harga, diskon, total stok, status, aksi), cari + filter.
- **Form produk:** bagian berurutan: Info dasar → Foto → Harga & diskon → Varian & stok (tabel warna × ukuran dengan input angka cepat) → Link marketplace (+ Cek link) → Publikasi.
- **Akun (owner saja):** daftar admin, tambah, nonaktifkan, kirim reset.
- **Pengaturan (owner saja):** nomor WA, pesan pembuka WA, tautan toko, teks beranda, daftar ukuran, bahasa default.
- **Profil:** ubah password, ganti email pemulihan.
Tampilan admin lebih fungsional (padat), tetap memakai palet yang sama.

## 6. Gambar Produk
- Rasio 4:5, latar polos terang/netral, cahaya lembut, minimal 3 foto (depan, samping, detail kulit); tas tambahkan foto bagian dalam.
- Sistem membuat 2 ukuran sebelum upload: **1200 px** (detail) dan **480 px** (kartu), format WebP kualitas ~80.
- Alt text otomatis dari nama produk + warna.

## 7. Gerak
Halus dan jarang: fade/slide 200–300 ms, hover kartu naik 2 px. Hormati `prefers-reduced-motion`.

## 8. Aksesibilitas
Kontras ≥ 4.5:1, fokus terlihat (cincin 2 px `--color-accent`), target sentuh ≥ 44 px, `alt` pada semua foto, label form, `lang` mengikuti bahasa aktif, tidak mengandalkan warna saja (stok habis juga ada teks).

## 9. Contoh Teks (i18n)
| Kunci | ID | EN |
|---|---|---|
| `nav.catalog` | Katalog | Catalog |
| `cta.buy_shopee` | Beli di Shopee | Buy on Shopee |
| `cta.buy_tiktok` | Beli di TikTok Shop | Buy on TikTok Shop |
| `stock.available` | Tersedia | In stock |
| `stock.low` | Terbatas | Low stock |
| `stock.out` | Habis | Sold out |
| `stock.note` | Stok dapat berubah, cek marketplace untuk info terbaru. | Stock may change, check the marketplace for the latest. |
| `home.contact.title` | Butuh bantuan memilih? | Need help choosing? |
| `home.contact.cta` | Hubungi via WhatsApp | Chat on WhatsApp |

## 10. CSS Token (acuan)
```css
:root{
  --color-primary:#FFBE86; --color-surface:#FFE9CE;
  --color-accent:#D7816A;  --color-neutral:#A37871;
  --color-ink:#3B2A26; --color-neutral-strong:#6F4F49;
  --color-bg:#FFFAF4; --color-gold:#C9A66B;
  --color-danger:#B3412F; --color-success:#4C7A4F;
  --font-heading:"Cormorant Garamond",serif;
  --font-body:"Jost",system-ui,sans-serif;
  --radius:4px; --shadow:0 6px 24px rgba(59,42,38,.08);
}
```
