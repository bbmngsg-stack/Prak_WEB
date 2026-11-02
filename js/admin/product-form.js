import { guardAdmin } from './guard.js';
import { signOut } from '../api/auth.js';
import { fetchSiteSettings } from '../api/products.js';
import {
  createProductDraft, fetchAdminProduct, removeProductImages, saveProductImages,
  saveProductVariants, updateProduct
} from '../api/admin-products.js';
import { supabase } from '../supabase-client.js';
import { $, el, clearChildren } from '../ui/dom.js';

const form = $('#product-form');
const groupContainer = $('#variant-groups');
const imageContainer = $('#image-list');
const message = $('#form-message');
const categoryInput = $('#category');
let productId = new URL(location.href).searchParams.get('id');
let originalProduct = null;
let sizes = [35, 36, 37, 38, 39, 40, 41];
let groups = [];
let images = [];
let slugEdited = false;

async function init() {
  const profile = await guardAdmin();
  if (!profile) return;
  $('#auth-loading').style.display = 'none';
  $('#admin-app').style.display = 'block';
  $('#admin-user-name').textContent = profile.full_name || profile.username || 'Admin';
  $('#logout-btn').addEventListener('click', async () => {
    await signOut();
    window.location.replace('login.html');
  });

  try {
    const settings = await fetchSiteSettings();
    if (Array.isArray(settings.shoe_sizes) && settings.shoe_sizes.length) {
      sizes = [...new Set(settings.shoe_sizes.map(Number).filter(Number.isInteger))].sort((a, b) => a - b);
    }
  } catch (error) {
    console.warn('Memakai ukuran sepatu default:', error);
  }

  $('#add-color').addEventListener('click', () => {
    groups.push({ color_name: '', color_hex: '#3B2A26', stocks: {} });
    renderGroups();
  });
  categoryInput.addEventListener('change', changeCategory);
  $('#image-files').addEventListener('change', addFiles);
  $('#name-id').addEventListener('input', () => {
    if (!slugEdited) $('#slug').value = slugify($('#name-id').value);
  });
  $('#slug').addEventListener('input', () => { slugEdited = true; });
  form.addEventListener('submit', save);

  if (productId) await loadProduct();
  else {
    groups = [{ color_name: '', color_hex: '#3B2A26', stocks: {} }];
    renderGroups();
  }
}

async function loadProduct() {
  try {
    originalProduct = await fetchAdminProduct(productId);
    $('#form-title').textContent = 'Edit Produk';
    document.title = 'Edit Produk — Muhun Leather Admin';
    $('#name-id').value = originalProduct.name_id || '';
    $('#name-en').value = originalProduct.name_en || '';
    $('#slug').value = originalProduct.slug || '';
    slugEdited = true;
    categoryInput.value = originalProduct.category;
    $('#price').value = originalProduct.price_idr;
    $('#discount').value = originalProduct.discount_percent || 0;
    $('#discount-ends').value = toLocalDateTime(originalProduct.discount_ends_at);
    $('#description-id').value = originalProduct.description_id || '';
    $('#description-en').value = originalProduct.description_en || '';
    $('#shopee-url').value = originalProduct.shopee_url || '';
    $('#tiktok-url').value = originalProduct.tiktok_url || '';
    $('#featured').checked = !!originalProduct.is_featured;
    $('#status').value = String(!!originalProduct.is_published);

    const byColor = new Map();
    (originalProduct.product_variants || []).forEach(variant => {
      let group = byColor.get(variant.color_name);
      if (!group) {
        group = { color_name: variant.color_name, color_hex: variant.color_hex || '#3B2A26', stocks: {} };
        byColor.set(variant.color_name, group);
      }
      group.stocks[variant.size_eu ?? ''] = variant.stock;
      if (variant.size_eu && !sizes.includes(variant.size_eu)) sizes.push(variant.size_eu);
    });
    sizes.sort((a, b) => a - b);
    groups = [...byColor.values()];
    if (!groups.length) groups = [{ color_name: '', color_hex: '#3B2A26', stocks: {} }];
    renderGroups();

    images = (originalProduct.product_images || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(image => ({ ...image, file: null, preview: image.path_thumb }));
    renderImages();
  } catch (error) {
    showMessage(`Produk gagal dimuat: ${error.message || 'periksa koneksi dan hak akses.'}`, true);
  }
}

function changeCategory() {
  const nextCategory = categoryInput.value;
  const previousCategory = originalProduct?.category || (nextCategory === 'tas' ? 'sepatu' : 'tas');
  if ((previousCategory === 'tas') !== (nextCategory === 'tas') && groups.some(group => Object.keys(group.stocks).length)) {
    const accepted = window.confirm('Perubahan jenis akan mengubah susunan stok varian. Lanjutkan lalu periksa kembali stok setiap warna/ukuran?');
    if (!accepted) {
      categoryInput.value = previousCategory;
      return;
    }
    groups.forEach(group => {
      const values = Object.values(group.stocks).map(Number);
      group.stocks = nextCategory === 'tas'
        ? { '': values.reduce((sum, value) => sum + value, 0) }
        : { [sizes[0]]: values[0] || 0 };
    });
  }
  if (originalProduct) originalProduct.category = nextCategory;
  renderGroups();
}

function renderGroups() {
  clearChildren(groupContainer);
  groups.forEach((group, index) => {
    const name = el('input', { id: `color-name-${index}`, className: 'form-input', type: 'text', required: true, maxlength: '60', value: group.color_name, placeholder: 'Nama warna' });
    const hex = el('input', { id: `color-hex-${index}`, className: 'form-input', type: 'color', value: /^#[0-9a-f]{6}$/i.test(group.color_hex) ? group.color_hex : '#3B2A26', 'aria-label': 'Warna swatch' });
    name.addEventListener('input', () => { group.color_name = name.value.trim(); });
    hex.addEventListener('input', () => { group.color_hex = hex.value; });
    const remove = el('button', { className: 'btn btn-sm btn-outline remove-color', type: 'button', textContent: 'Hapus warna', onClick: () => { groups.splice(index, 1); renderGroups(); } });
    const colorFields = el('div', { className: 'variant-color-fields' }, [
      el('div', { className: 'form-group' }, [el('label', { htmlFor: name.id, textContent: 'Nama warna' }), name]),
      el('div', { className: 'form-group' }, [el('label', { htmlFor: hex.id, textContent: 'Swatch' }), hex]), remove
    ]);
    const stockGrid = el('div', { className: 'variant-stock-grid' });
    const keys = categoryInput.value === 'tas' ? [''] : sizes.map(String);
    keys.forEach(size => {
      const stockId = `stock-${index}-${size || 'pcs'}`;
      const stock = el('input', { id: stockId, className: 'form-input', type: 'number', min: '0', step: '1', required: true, value: group.stocks[size] ?? 0, 'aria-label': `Stok ${group.color_name || 'warna'} ${size ? `ukuran ${size}` : ''}` });
      stock.addEventListener('input', () => { group.stocks[size] = Number(stock.value); });
      stockGrid.appendChild(el('div', { className: 'form-group' }, [
        el('label', { htmlFor: stockId, textContent: size ? `EU ${size}` : 'Jumlah (pcs)' }), stock
      ]));
    });
    groupContainer.appendChild(el('div', { className: 'variant-group' }, [colorFields, stockGrid]));
  });
}

async function addFiles(event) {
  const files = [...event.target.files];
  event.target.value = '';
  for (const file of files) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      showMessage(`${file.name}: pilih JPG, PNG, atau WebP maksimal 8 MB.`, true);
      continue;
    }
    images.push({ file, preview: URL.createObjectURL(file), is_cover: images.length === 0 });
  }
  renderImages();
}

function renderImages() {
  clearChildren(imageContainer);
  images.forEach((image, index) => {
    const coverRadio = el('input', { type: 'radio', name: 'cover-image' });
    coverRadio.checked = !!image.is_cover;
    coverRadio.addEventListener('change', () => {
      images.forEach(item => { item.is_cover = false; });
      image.is_cover = true;
      renderImages();
    });
    const moveUp = el('button', { className: 'btn btn-sm btn-outline', type: 'button', textContent: '↑', 'aria-label': 'Naikkan urutan foto', onClick: () => moveImage(index, -1) });
    moveUp.disabled = index === 0;
    const moveDown = el('button', { className: 'btn btn-sm btn-outline', type: 'button', textContent: '↓', 'aria-label': 'Turunkan urutan foto', onClick: () => moveImage(index, 1) });
    moveDown.disabled = index === images.length - 1;
    const actions = el('div', { className: 'admin-image-actions' }, [
      el('label', {}, [
        coverRadio, document.createTextNode('Sampul')
      ]),
      el('span', { textContent: `${index + 1}/${images.length}` }),
      el('div', { className: 'table-actions' }, [
        moveUp, moveDown,
        el('button', { className: 'btn btn-sm btn-outline', type: 'button', textContent: 'Hapus', onClick: () => removeImage(index) })
      ])
    ]);
    imageContainer.appendChild(el('div', { className: 'admin-image-item' }, [
      el('img', { src: image.preview || image.path_thumb, alt: `Foto produk ${index + 1}` }), actions
    ]));
  });
  if (images.length && !images.some(i => i.is_cover)) images[0].is_cover = true;
}

function moveImage(index, direction) {
  [images[index], images[index + direction]] = [images[index + direction], images[index]];
  renderImages();
}

function removeImage(index) {
  const [removed] = images.splice(index, 1);
  if (removed.file) URL.revokeObjectURL(removed.preview);
  if (images.length && !images.some(i => i.is_cover)) images[0].is_cover = true;
  renderImages();
}

async function prepareImage(file, maxSide) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('Foto gagal diproses.')), 'image/webp', 0.8));
  if (blob.size > 2 * 1024 * 1024) throw new Error('Hasil foto melebihi batas 2 MB.');
  return blob;
}

async function uploadImage(productIdValue, file) {
  const largePath = `${productIdValue}/${crypto.randomUUID()}-large.webp`;
  const thumbPath = largePath.replace('-large.webp', '-thumb.webp');
  const bucket = supabase.storage.from('product-images');
  const large = await prepareImage(file, 1200);
  const thumb = await prepareImage(file, 480);
  const uploaded = [];
  try {
    const first = await bucket.upload(largePath, large, { contentType: 'image/webp', cacheControl: '3600', upsert: false });
    if (first.error) throw first.error;
    uploaded.push(largePath);
    const second = await bucket.upload(thumbPath, thumb, { contentType: 'image/webp', cacheControl: '3600', upsert: false });
    if (second.error) throw second.error;
    uploaded.push(thumbPath);
  } catch (error) {
    if (uploaded.length) await bucket.remove(uploaded);
    throw error;
  }
  return {
    path_large: bucket.getPublicUrl(largePath).data.publicUrl,
    path_thumb: bucket.getPublicUrl(thumbPath).data.publicUrl
  };
}

function collectFields() {
  const price = Number($('#price').value);
  const discount = Number($('#discount').value || 0);
  const shopee = $('#shopee-url').value.trim();
  const tiktok = $('#tiktok-url').value.trim();
  const published = $('#status').value === 'true';
  if (!Number.isInteger(price) || price < 1) throw new Error('Harga harus bilangan bulat di atas 0.');
  if (!Number.isInteger(discount) || discount < 0 || discount > 90) throw new Error('Diskon harus antara 0 dan 90 persen.');
  if (published && !shopee && !tiktok) throw new Error('Tambahkan URL Shopee atau TikTok sebelum menerbitkan produk.');
  [shopee, tiktok].filter(Boolean).forEach(value => {
    if (new URL(value).protocol !== 'https:') throw new Error('Tautan marketplace harus menggunakan HTTPS.');
  });

  return {
    slug: $('#slug').value.trim(),
    category: categoryInput.value,
    name_id: $('#name-id').value.trim(),
    name_en: $('#name-en').value.trim() || null,
    description_id: $('#description-id').value.trim() || null,
    description_en: $('#description-en').value.trim() || null,
    price_idr: price,
    discount_percent: discount,
    discount_ends_at: $('#discount-ends').value ? new Date($('#discount-ends').value).toISOString() : null,
    shopee_url: shopee || null,
    tiktok_url: tiktok || null,
    is_featured: $('#featured').checked,
    is_published: published
  };
}

function collectVariants() {
  if (!groups.length || groups.some(group => !group.color_name.trim())) throw new Error('Tambahkan setidaknya satu warna dan isi namanya.');
  const normalized = groups.map(group => group.color_name.trim().toLocaleLowerCase());
  if (new Set(normalized).size !== normalized.length) throw new Error('Nama warna tidak boleh duplikat.');
  const variants = [];
  groups.forEach(group => {
    const keys = categoryInput.value === 'tas' ? [''] : sizes.map(String);
    keys.forEach(size => {
      const stock = Number(group.stocks[size] ?? 0);
      if (!Number.isInteger(stock) || stock < 0) throw new Error('Stok harus bilangan bulat 0 atau lebih.');
      variants.push({ color_name: group.color_name.trim(), color_hex: group.color_hex, size_eu: size ? Number(size) : null, stock });
    });
  });
  return variants;
}

async function save(event) {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = $('#save-product');
  button.disabled = true;
  button.textContent = 'Menyimpan...';
  hideMessage();
  let cleanupWarning = false;

  try {
    const fields = collectFields();
    const variants = collectVariants();
    if (originalProduct && (fields.shopee_url !== originalProduct.shopee_url || fields.tiktok_url !== originalProduct.tiktok_url)) {
      fields.links_verified_at = null;
    }
    // shortcut: these PostgREST writes are separate requests and can partially save on network failure; use an RPC transaction when a database migration is deployed.
    if (!productId) {
      productId = await createProductDraft(fields);
      history.replaceState({}, '', `product-form.html?id=${encodeURIComponent(productId)}`);
      originalProduct = { category: fields.category, is_published: false };
      $('#form-title').textContent = 'Edit Produk';
    } else {
      await updateProduct(productId, { ...fields, is_published: originalProduct?.is_published ?? false });
    }

    await saveProductVariants(productId, variants);
    const uploaded = [];
    const newUploads = [];
    try {
      for (const image of images) {
        if (image.file) {
          const fresh = await uploadImage(productId, image.file);
          newUploads.push(fresh);
          uploaded.push({ ...fresh, is_cover: image.is_cover });
        }
        else uploaded.push(image);
      }
      const result = await saveProductImages(productId, uploaded);
      images = (result.savedImages || []).map(image => ({ ...image, file: null, preview: image.path_thumb }));
      if (result.removedUrls.length) {
        try { await removeProductImages(result.removedUrls); }
        catch (error) {
          cleanupWarning = true;
          console.warn('Foto lama tidak berhasil dibersihkan dari Storage:', error);
        }
      }
    } catch (error) {
      const urls = newUploads.flatMap(image => [image.path_large, image.path_thumb]);
      if (urls.length) {
        try { await removeProductImages(urls); }
        catch (cleanupError) { console.warn('Gagal membersihkan upload yang batal:', cleanupError); }
      }
      throw error;
    }

    await updateProduct(productId, { is_published: fields.is_published });
    originalProduct = { ...originalProduct, ...fields };
    if (cleanupWarning) {
      showMessage('Produk tersimpan, tetapi sebagian file foto lama gagal dihapus dari Storage.', true);
      return;
    }
    window.location.replace('products.html?saved=1');
  } catch (error) {
    console.error('Gagal menyimpan produk:', error);
    showMessage(`Penyimpanan belum tuntas: ${error.message || 'periksa koneksi dan hak akses.'}${productId ? ' Sebagian perubahan mungkin sudah tersimpan; produk baru tetap menjadi draf.' : ''}`, true);
  } finally {
    button.disabled = false;
    button.textContent = 'Simpan Produk';
  }
}

function showMessage(text, isError = false) {
  message.textContent = text;
  message.classList.toggle('error', isError);
  message.style.display = 'block';
}

function hideMessage() { message.style.display = 'none'; }
function slugify(value) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function toLocalDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

init();
