# skill.md — Kemampuan Terpakai Ulang untuk Agent

Kumpulan "skill" yang dipakai berulang selama proyek. Tiap skill: **kapan dipakai, masukan, langkah, pemeriksaan**. Di Antigravity, tiap skill bisa dipecah ke `.agent/skills/<nama>/SKILL.md` (sesuaikan dengan versimu); kepala berkas berisi `name` dan `description`.

---

## 1. `supabase-migration`
**Kapan:** setiap perubahan skema, RLS, fungsi, atau storage policy.
**Masukan:** deskripsi perubahan.
**Langkah:**
1. Buat file baru `supabase/migrations/NNNN_nama.sql` (nomor berurutan, jangan ubah migrasi lama).
2. Tulis SQL idempoten bila memungkinkan (`create ... if not exists`).
3. Untuk tabel baru: `enable row level security` + policy eksplisit (anonim / admin / owner).
4. Tambahkan indeks untuk kolom filter/join.
5. Perbarui `architecture.md` §4–5 bila skema berubah.
**Periksa:** migrasi jalan di proyek dev dari nol; policy diuji (lihat skill 2).

## 2. `rls-test`
**Kapan:** setelah migrasi atau perubahan policy.
**Langkah:** untuk tiap tabel uji 3 peran lewat API (`anon`, token admin, token owner):
- anonim: baca produk terpublish ✅, baca draft ❌, tulis apa pun ❌.
- admin: tambah/ubah produk ✅, hapus permanen ❌, ubah `profiles` ❌, baca `audit_log` ❌.
- owner: semua di atas sesuai tabel hak akses ✅.
**Keluaran:** tabel hasil lulus/gagal; berhenti dan perbaiki jika ada yang menyimpang.

## 3. `product-form`
**Kapan:** membangun/ubah form produk admin.
**Aturan:**
- Kategori mengubah form: tas → varian hanya warna; sepatu/sandal → warna × ukuran dari `site_settings.shoe_sizes`.
- Varian ditampilkan sebagai tabel; input stok angka ≥ 0; tombol "isi semua ukuran untuk warna ini".
- Diskon: persen 0–90 + tanggal berakhir opsional + pratinjau harga akhir.
- Publikasi diblokir tanpa link valid (pesan jelas).
- Simpan dalam satu alur: produk → varian → gambar; jika gagal di tengah, tampilkan error dan jangan tinggalkan data setengah jadi (gunakan RPC/transaksi bila perlu).
**Periksa:** edit produk lama memuat ulang semua nilai dengan benar.

## 4. `image-pipeline`
**Kapan:** upload foto produk.
**Langkah:** validasi tipe (jpeg/png/webp) dan ukuran (≤ 8 MB sumber) → resize canvas ke 1200 px & 480 px (sisi terpanjang) → WebP ~0,8 → upload dua file → simpan path → atur urutan/sampul → hapus berkas bila foto dihapus.
**Periksa:** tidak ada file yatim di Storage; EXIF orientasi benar; ukuran akhir ≤ 2 MB.

## 5. `marketplace-link`
**Kapan:** input atau cek link Shopee/TikTok Shop.
**Langkah:** normalisasi URL → cek `https` → cek host di allowlist → tombol "Cek link" memanggil Edge Function `check-link` → tampilkan `ok/gagal/tidak pasti` → centang konfirmasi manual → isi `links_verified_at`.
**Catatan:** hasil "tidak pasti" bukan error; marketplace sering memblokir pengecekan otomatis.

## 6. `i18n-string`
**Kapan:** menambah teks UI.
**Langkah:** tambah kunci di `id.json` **dan** `en.json` (nama kunci `area.elemen`), pakai `data-i18n`, jangan hardcode. Jalankan skrip pemeriksa kunci yang hilang antar dua file.
**Periksa:** ganti bahasa tidak meninggalkan teks campuran.

## 7. `price-discount`
**Kapan:** menampilkan harga.
**Aturan:** harga akhir selalu dari `final_price_idr` view (bukan hitungan klien). Tampil `Rp 249.000` via `Intl.NumberFormat('id-ID')`. Diskon aktif → harga asli dicoret (`<s>`, teks netral), harga akhir tebal aksen, badge `-N%`. Pastikan teks untuk pembaca layar menyebut "harga asli" dan "harga diskon".

## 8. `stock-display`
**Kapan:** menampilkan stok.
**Aturan:** angka + label (`>3` Tersedia, `1–3` Terbatas, `0` Habis); satuan "pcs" untuk tas, "pasang" untuk sepatu/sandal; varian 0 tidak bisa dipilih tetapi terlihat; catatan "stok dapat berubah".

## 9. `auth-flows`
**Kapan:** membangun login, lupa password/username, ganti password, buat admin.
**Aturan:** ikuti `architecture.md` §6. Edge Function memeriksa peran pemanggil, rate limit, dan tidak membocorkan keberadaan akun. Paksa ganti password saat `must_change_password`. Jangan simpan token di tempat selain penyimpanan sesi `supabase-js`.
**Periksa:** akun nonaktif tidak bisa login; admin tidak bisa memanggil fungsi owner.

## 10. `logo-cleanup`
**Kapan:** mengolah logo dari foto.
**Langkah:** amati foto → identifikasi elemen logo asli (monogram kubus-M heksagonal + tulisan script "Muhun Leather" melengkung) dan buang watermark/latar → gambar ulang SVG vektor (tiga varian, `design.md` §1) → uji di latar `#FFFAF4`, `#FFE9CE`, dan gelap, ukuran 32 px sampai 400 px → buat favicon.
**Keluaran:** SVG bersih + catatan bagian yang diperkirakan; minta file asli bila ada.

## 11. `accessibility-check`
**Kapan:** sebelum menyatakan halaman selesai.
**Langkah:** cek kontras pasangan warna, navigasi keyboard penuh, label & alt, urutan fokus, `prefers-reduced-motion`, zoom 200% tanpa kehilangan fungsi.

## 12. `release-check`
**Kapan:** sebelum deploy produksi. Lihat `workflow.md` §6.

## 13. `ask-owner`
**Kapan:** ambiguitas yang sulit diubah (skema, URL, aturan bisnis).
**Format:** 1 kalimat konteks → 2–3 opsi bernomor dengan akibat masing-masing → rekomendasi agent → tunggu jawaban. Jangan menanyakan hal yang sudah dijawab di `prd.md`.
