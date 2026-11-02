import { guardAdmin } from './guard.js';
import { signOut } from '../api/auth.js';
import { deleteProduct, fetchAdminProducts } from '../api/admin-products.js';
import { formatPrice } from '../i18n.js';
import { $, el, clearChildren } from '../ui/dom.js';

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
  if (new URL(location.href).searchParams.get('saved') === '1') $('#products-message').style.display = 'block';
  await loadProducts(profile.role === 'owner');
}

async function loadProducts(isOwner) {
  const tbody = $('#products-table-body');
  try {
    const products = await fetchAdminProducts();
    clearChildren(tbody);
    if (!products.length) {
      tbody.appendChild(el('tr', {}, [el('td', {
        colSpan: 8, style: { textAlign: 'center', padding: '32px' }, textContent: 'Belum ada produk.'
      })]));
      return;
    }

    products.forEach(product => {
      const cover = product.product_images?.find(i => i.is_cover)?.path_thumb
        || product.product_images?.[0]?.path_thumb
        || 'https://placehold.co/80x100/FFE9CE/3B2A26?text=Foto';
      const stock = (product.product_variants || []).reduce((sum, variant) => sum + (variant.stock || 0), 0);
      const actions = [
        el('a', { className: 'btn btn-sm btn-outline', href: `../product.html?slug=${encodeURIComponent(product.slug)}`, target: '_blank', rel: 'noopener noreferrer', textContent: 'Lihat' }),
        el('a', { className: 'btn btn-sm btn-primary', href: `product-form.html?id=${encodeURIComponent(product.id)}`, textContent: 'Edit' })
      ];
      if (isOwner) actions.push(el('button', {
        className: 'btn btn-sm btn-outline', type: 'button', textContent: 'Hapus',
        onClick: () => removeProduct(product)
      }));

      tbody.appendChild(el('tr', {}, [
        el('td', {}, [el('img', { src: cover, alt: `Foto ${product.name_id}`, width: 48, height: 60, loading: 'lazy', style: { objectFit: 'cover', borderRadius: '4px' } })]),
        el('td', { style: { fontWeight: '500' } }, [el('span', { textContent: product.name_id }), el('br'), el('small', { style: { color: '#888' }, textContent: `/${product.slug}` })]),
        el('td', { style: { textTransform: 'capitalize' }, textContent: product.category }),
        el('td', { textContent: formatPrice(product.price_idr) }),
        el('td', { textContent: product.discount_percent > 0 ? `-${product.discount_percent}%` : '-' }),
        el('td', { className: 'stock-total', textContent: String(stock) }),
        el('td', {}, [el('span', { className: `badge ${product.is_published ? 'badge-new' : 'badge-out'}`, textContent: product.is_published ? 'Terbit' : 'Draf' })]),
        el('td', {}, [el('div', { className: 'table-actions' }, actions)])
      ]));
    });
  } catch (error) {
    console.error('Gagal memuat daftar produk:', error);
    clearChildren(tbody);
    tbody.appendChild(el('tr', {}, [el('td', {
      colSpan: 8, style: { color: 'red', textAlign: 'center' }, textContent: 'Gagal memuat produk.'
    })]));
  }
}

async function removeProduct(product) {
  if (!window.confirm(`Hapus permanen “${product.name_id}”? Foto dan varian produk juga akan dihapus.`)) return;
  try {
    const warning = await deleteProduct(product.id);
    if (warning) window.alert(warning);
    window.location.reload();
  } catch (error) {
    console.error('Gagal menghapus produk:', error);
    window.alert(`Produk gagal dihapus: ${error.message || 'Terjadi kesalahan.'}`);
  }
}

init();
