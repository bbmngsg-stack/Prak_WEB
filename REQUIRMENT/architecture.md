# Architecture — Katalog Muhun Leather

## 1. Keputusan Stack

| Lapisan | Pilihan | Alasan |
|---|---|---|
| Frontend | HTML + CSS + JavaScript (ES modules, manipulasi DOM) | Sesuai permintaan, tanpa build step, mudah dirawat |
| Database | Supabase (PostgreSQL) | Sesuai permintaan |
| Auth | Supabase Auth | Login, reset password, sesi sudah ada |
| File foto | Supabase Storage | Satu platform, kebijakan akses lewat RLS |
| Logika server | Supabase Edge Functions (TypeScript/Deno) | Untuk hal yang tidak boleh di browser |
| Hosting | Static hosting (Vercel / Cloudflare Pages / Netlify) | Belum diputuskan |

**Soal PHP:** Supabase adalah PostgreSQL, bukan MySQL. PHP memang bisa konek lewat PDO `pgsql` atau REST API, tetapi tidak diperlukan di sini. Browser bicara langsung ke Supabase lewat `supabase-js`, keamanan dijaga RLS. Logika yang butuh hak tinggi memakai Edge Functions. Jika kelak perlu server sendiri (mis. webhook), pilihan terbaik: Node.js/TypeScript atau Python. PHP hanya bila ada alasan khusus.

**Catatan hosting:** Vercel paket Hobby dibatasi untuk penggunaan non-komersial (cek ketentuan terbaru). Untuk toko, pertimbangkan Cloudflare Pages / Netlify, atau Vercel Pro. Karena situs statis, pindah hosting mudah.

## 2. Diagram

```
Pengunjung / Owner / Admin (browser)
        │  HTML + CSS + JS (static, di CDN hosting)
        ▼
  supabase-js (anon key, publik)
        │
        ├── PostgREST  → tabel (dilindungi RLS)
        ├── Auth       → login / reset / sesi
        ├── Storage    → bucket product-images (baca publik)
        └── Edge Functions (service_role di server saja)
              ├── auth-login          (username/email → sesi)
              ├── forgot-username     (kirim username ke email)
              ├── admin-create-user   (owner membuat admin)
              ├── admin-set-active    (aktif/nonaktif)
              └── check-link          (uji link marketplace)
```

## 3. Struktur Folder

```
muhun-leather/
├─ index.html                  # beranda
├─ catalog.html
├─ product.html
├─ admin/
│  ├─ login.html
│  ├─ forgot.html              # lupa password / username
│  ├─ reset-password.html
│  ├─ index.html               # dashboard
│  ├─ products.html
│  ├─ product-form.html
│  ├─ users.html               # owner saja
│  ├─ settings.html            # owner saja
│  └─ profile.html
├─ assets/
│  ├─ logo-original.jpg
│  ├─ logo-full.svg  logo-mark.svg  logo-mono-dark.svg
│  └─ favicon/
├─ css/
│  ├─ tokens.css  base.css  components.css  catalog.css  admin.css
├─ js/
│  ├─ config.js                # SUPABASE_URL, SUPABASE_ANON_KEY (publik)
│  ├─ supabase-client.js
│  ├─ i18n.js  i18n/id.json  i18n/en.json
│  ├─ api/ products.js  auth.js  settings.js  storage.js
│  ├─ ui/  card.js  gallery.js  variant-picker.js  toast.js  dom.js
│  ├─ pages/ home.js  catalog.js  product.js
│  └─ admin/ guard.js  dashboard.js  product-form.js  users.js  settings.js
├─ supabase/
│  ├─ migrations/              # SQL berurutan
│  ├─ functions/ auth-login/ forgot-username/ admin-create-user/ admin-set-active/ check-link/
│  └─ seed.sql                 # data contoh (dev saja)
├─ docs/ (7 file .md proyek)
└─ vercel.json / _headers      # header keamanan & cache
```

Aturan: satu tanggung jawab per file; semua akses data lewat `js/api/*`; halaman tidak memanggil `supabase` langsung.

## 4. Skema Database

```sql
-- Enum
create type user_role as enum ('owner','admin');
create type product_category as enum ('tas','sepatu','sandal');

-- Profil staf (email login = Gmail pemulihan, disimpan di auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,30}$'),
  full_name text,
  role user_role not null default 'admin',
  is_active boolean not null default true,
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

create table products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category product_category not null,
  name_id text not null,
  name_en text,
  description_id text,
  description_en text,
  price_idr integer not null check (price_idr >= 0),
  discount_percent smallint not null default 0 check (discount_percent between 0 and 90),
  discount_ends_at timestamptz,
  shopee_url text,
  tiktok_url text,
  links_verified_at timestamptz,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint publish_needs_link
    check (not is_published or shopee_url is not null or tiktok_url is not null)
);

create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  path_large text not null,      -- 1200 px
  path_thumb text not null,      -- 480 px
  sort_order smallint not null default 0,
  is_cover boolean not null default false
);

create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  color_name text not null,
  color_hex text check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  size_eu smallint check (size_eu between 30 and 46),   -- NULL untuk tas
  stock integer not null default 0 check (stock >= 0),
  unique nulls not distinct (product_id, color_name, size_eu)
);
-- Trigger validate_variant(): kategori tas → size_eu harus NULL;
-- sepatu/sandal → size_eu wajib dan termasuk daftar ukuran di site_settings.

create table site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
-- key: whatsapp_number, whatsapp_message, shopee_store_url, tiktok_store_url,
--      shoe_sizes ([35..41]), link_domains_allowlist, hero_text_id/en, default_lang

create table audit_log (
  id bigint generated always as identity primary key,
  actor uuid references profiles(id),
  action text not null,         -- 'product.create', 'user.deactivate', ...
  target text,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- Indeks
create index on products (is_published, category, created_at desc);
create index on products using gin (to_tsvector('simple', name_id || ' ' || coalesce(name_en,'')));
create index on product_variants (product_id);
create index on product_images (product_id, sort_order);
```

Harga efektif dihitung di view:
```sql
create view products_public as
select p.*,
  case when p.discount_percent > 0
        and (p.discount_ends_at is null or p.discount_ends_at > now())
       then round(p.price_idr * (100 - p.discount_percent) / 100.0)::int
       else p.price_idr end as final_price_idr,
  (p.discount_percent > 0 and (p.discount_ends_at is null or p.discount_ends_at > now())) as discount_active
from products p
where p.is_published;
-- gunakan security_invoker = true agar RLS tabel dasar tetap berlaku
```

Trigger `updated_at` pada `products`. Trigger `audit` untuk aksi penting.

## 5. Keamanan (RLS)

```sql
create function public.is_staff() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and is_active) $$;

create function public.is_owner() returns boolean
language sql stable security definer set search_path = public as
$$ select exists (select 1 from profiles where id = auth.uid() and is_active and role='owner') $$;

alter table profiles, products, product_images, product_variants, site_settings, audit_log
  enable row level security;
```

| Tabel | Anonim | Admin | Owner |
|---|---|---|---|
| products | SELECT jika `is_published` | SELECT/INSERT/UPDATE semua | + DELETE |
| product_images, product_variants | SELECT jika produk terpublish | INSERT/UPDATE/DELETE | sama |
| site_settings | SELECT kunci publik (WA, tautan toko, ukuran) | SELECT | + UPDATE |
| profiles | — | SELECT milik sendiri | SELECT semua |
| audit_log | — | — | SELECT |

Ketentuan:
- **Tidak ada policy INSERT/UPDATE pada `profiles` dari klien.** Perubahan peran/aktif hanya lewat Edge Function (service role), jadi admin tidak bisa menaikkan dirinya jadi owner.
- Matikan **signup publik** (Auth → Providers → Email → "Allow new users to sign up" off).
- `service_role` key hanya di secret Edge Functions, tidak pernah di repo/frontend. `anon` key aman publik asalkan RLS benar.
- Storage bucket `product-images`: baca publik, tulis hanya `is_staff()`, batas ukuran 2 MB, hanya `image/webp|jpeg|png`.
- Validasi URL marketplace: `https`, host harus ada di allowlist; di UI dan di DB (CHECK/trigger).
- Render teks dengan `textContent` (bukan `innerHTML`) untuk data dari database, mencegah XSS.
- Header: `Content-Security-Policy` (izinkan hanya domain sendiri, Supabase, font), `X-Content-Type-Options`, `Referrer-Policy`.
- Rate limit pada `auth-login` dan `forgot-username` (mis. 5 percobaan/menit/IP); respons `forgot-username` selalu sama agar tidak membocorkan akun yang ada.

## 6. Alur Autentikasi

**Login:** form (username atau email + password) → Edge Function `auth-login` mencari email dari `profiles.username` (jika input bukan email), memanggil `signInWithPassword`, mengembalikan sesi → `supabase.auth.setSession`. Jika `must_change_password = true` → paksa ke halaman ganti password. Akun `is_active = false` ditolak.

**Lupa password:** halaman `forgot` → `supabase.auth.resetPasswordForEmail(email, {redirectTo: /admin/reset-password})` ke Gmail terdaftar → halaman `reset-password` → `supabase.auth.updateUser({password})`.

**Lupa username:** input email → Edge Function `forgot-username` mengirim email berisi username ke alamat tersebut (jika terdaftar). Respons ke pengguna selalu "Jika email terdaftar, kami telah mengirimkan petunjuk."

**Ubah password:** halaman profil, minta password lama (verifikasi ulang) lalu `updateUser`.

**Tambah admin (owner):** form (nama, username, email Gmail) → `admin-create-user` membuat user dengan password sementara acak (dikirim lewat email undangan/reset), `must_change_password = true`.

**Guard halaman admin:** `admin/guard.js` mengecek sesi + `profiles` (aktif, peran) sebelum menampilkan halaman; halaman owner-only mengalihkan admin ke dashboard. Penjagaan sebenarnya tetap di RLS/Edge Function, guard hanya untuk UX.

**Email:** layanan email bawaan Supabase sangat dibatasi. Pasang **SMTP kustom** (Resend atau SMTP Gmail dengan app password) sebelum produksi. Atur Site URL & Redirect URLs sesuai domain.

## 7. Data Akun Uji (HANYA DEV/STAGING)

Dibuat lewat `seed` / dashboard Supabase, **bukan** ditulis di kode frontend. Hapus atau ganti sebelum produksi.

| Peran | Username | Email (placeholder) | Password sementara |
|---|---|---|---|
| Owner | `owner_test` | `owner.test@example.com` | `OwnerTest#2026!` |
| Admin | `admin_test` | `admin.test@example.com` | `AdminTest#2026!` |

Keduanya `must_change_password = true`. Untuk menguji reset password/username, ganti email placeholder dengan Gmail milikmu sendiri. Di produksi, owner membuat akun dengan Gmail asli dan password kuat unik.

## 8. Foto & Storage

Alur upload di browser (tanpa server): pilih file → validasi tipe/ukuran → resize pakai `<canvas>` ke 1200 px dan 480 px → konversi WebP → upload ke `product-images/{product_id}/{uuid}-large.webp` dan `-thumb.webp` → simpan path di `product_images`. Alasan resize di klien: transformasi gambar Supabase hanya di paket berbayar. Hapus foto = hapus file + baris.

## 9. Internasionalisasi

- `i18n.js` memuat `i18n/id.json` / `en.json`; elemen memakai atribut `data-i18n="kunci"`.
- Bahasa disimpan di `localStorage` (`lang`), default `id`, `<html lang>` ikut berubah.
- Konten produk: pakai `name_en`/`description_en` jika bahasa EN dan terisi, kalau tidak jatuh ke ID.
- Format harga: `Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR', maximumFractionDigits:0})` di kedua bahasa.

## 10. Validasi Link Marketplace

- UI: cek `https`, host dalam allowlist (default: `shopee.co.id`, `s.shopee.co.id`, `shp.ee`, `tiktok.com` dan subdomain, `tokopedia.com`, `tk.tokopedia.com`; owner dapat menyesuaikan).
- Edge Function `check-link`: mengikuti redirect dan membaca status. Browser tidak bisa melakukan ini sendiri (CORS). Hasil: `ok` / `gagal` / `tidak pasti` (marketplace sering memblokir bot).
- Konfirmasi manual staf ("sudah saya buka dan benar") → set `links_verified_at`.
- Dashboard menandai produk dengan link belum diverifikasi > 30 hari.

## 11. Performa

- Query katalog: pilih kolom seperlunya, pagination `range()` 24 item, join thumbnail sampul.
- Gambar: `loading="lazy"`, `width/height` eksplisit (hindari lompatan tata letak), `srcset` thumb/large.
- Cache aset statis panjang dengan nama berversi; HTML cache pendek.
- Pencarian: `ilike` / full-text sederhana cukup untuk ratusan produk.

## 12. Deploy & Lingkungan

- Dua proyek Supabase: `dev` (atau branch) dan `prod`. `config.js` dibedakan per lingkungan.
- Migrasi SQL di `supabase/migrations`, diterapkan berurutan (Supabase CLI atau SQL editor), tidak pernah mengedit manual di prod tanpa migrasi.
- Hosting statis: root = repo, tanpa build. Atur `vercel.json` atau `_headers` untuk header keamanan.
- Cadangan: ekspor DB terjadwal (paket berbayar punya backup harian) + ekspor CSV produk berkala.
- Paket gratis Supabase menjeda proyek tidak aktif ~7 hari. Pantau, atau pakai ping berkala / paket berbayar.
