// Muhun Leather — Product Detail Page Script
import { fetchProduct } from '../api/products.js';
import { initGallery } from '../ui/gallery.js';
import { initVariantPicker } from '../ui/variant-picker.js';
import { $, $$, clearChildren, el, getUrlParam } from '../ui/dom.js';
import { initI18n, t, formatPrice, getCurrentLang, setLang } from '../i18n.js';

export async function initProductPage() {
  await initI18n();
  initHeader();

  const slug = getUrlParam('slug');
  if (!slug) {
    showError();
    return;
  }

  await loadProduct(slug);
}

function initHeader() {
  const hamburger = $('.hamburger');
  const mobileMenu = $('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  const langBtns = $$('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const lang = btn.dataset.lang;
      await setLang(lang);
      langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
      const slug = getUrlParam('slug');
      if (slug) await loadProduct(slug);
    });
  });
}

async function loadProduct(slug) {
  const container = $('#product-detail');
  const loading = $('#product-loading');
  const errorBox = $('#product-error');
  const breadcrumb = $('#breadcrumb-product');

  if (loading) loading.style.display = 'block';
  if (errorBox) errorBox.style.display = 'none';

  try {
    const product = await fetchProduct(slug);

    if (loading) loading.style.display = 'none';

    // Page metadata & breadcrumb
    const lang = getCurrentLang();
    const name = (lang === 'en' && product.name_en) ? product.name_en : product.name_id;
    document.title = `${name} — Muhun Leather`;

    if (breadcrumb) {
      breadcrumb.textContent = name;
    }

    renderProduct(product, container);
    setupStickyButtons(product);
  } catch (err) {
    console.error('Failed to load product:', err);
    if (loading) loading.style.display = 'none';
    showError();
  }
}

function renderProduct(product, container) {
  clearChildren(container);

  const lang = getCurrentLang();
  const name = (lang === 'en' && product.name_en) ? product.name_en : product.name_id;
  const description = (lang === 'en' && product.description_en) ? product.description_en : (product.description_id || '');

  // 1. Gallery (Left side)
  const galleryContainer = el('div', { className: 'gallery' });
  const images = (product.product_images && product.product_images.length > 0)
    ? product.product_images
    : [{ path_large: 'https://placehold.co/1200x1500/FFE9CE/3B2A26?text=Muhun+Leather', path_thumb: 'https://placehold.co/480x600/FFE9CE/3B2A26?text=Muhun+Leather', sort_order: 0 }];

  initGallery(images, galleryContainer);

  // 2. Product Info (Right side)
  const infoContainer = el('div', { className: 'product-info' });

  // Category
  const categoryLabel = t(`category.${product.category}`);
  infoContainer.appendChild(el('span', { className: 'product-category-label', textContent: categoryLabel }));

  // Title
  infoContainer.appendChild(el('h1', { className: 'product-name', textContent: name }));

  // Price
  const priceWrap = el('div', { className: 'product-price-wrap' });
  if (product.discount_active) {
    priceWrap.appendChild(el('span', { className: 'product-price-original', textContent: formatPrice(product.price_idr) }));
    priceWrap.appendChild(el('span', { className: 'product-price-final', textContent: formatPrice(product.final_price) }));
    priceWrap.appendChild(el('span', { className: 'badge badge-discount', textContent: `-${product.discount_percent}%` }));
  } else {
    priceWrap.appendChild(el('span', { className: 'product-price-final', textContent: formatPrice(product.price_idr) }));
  }
  infoContainer.appendChild(priceWrap);

  // Color picker section
  const colorWrap = el('div', { className: 'variant-section' });
  colorWrap.appendChild(el('h3', { className: 'variant-label', textContent: t('product.color') }));
  const colorContainer = el('div', { className: 'variant-colors' });
  colorWrap.appendChild(colorContainer);
  infoContainer.appendChild(colorWrap);

  // Size picker section (for shoes and sandals only)
  const sizeWrap = el('div', { className: 'variant-section' });
  const sizeContainer = el('div', { className: 'variant-sizes' });
  if (product.category !== 'tas') {
    sizeWrap.appendChild(el('h3', { className: 'variant-label', textContent: t('product.size') }));
    sizeWrap.appendChild(sizeContainer);
    infoContainer.appendChild(sizeWrap);
  }

  // Stock status
  const stockContainer = el('div', { className: 'stock-display' });
  infoContainer.appendChild(stockContainer);

  // Variant picker logic
  const picker = initVariantPicker(product.product_variants || [], product.category, {
    onColorChange: (color) => {
      picker.renderSizePicker(sizeContainer);
    },
    onVariantSelect: (variant) => {
      picker.renderStockDisplay(stockContainer, variant);
    }
  });

  picker.renderColorPicker(colorContainer);
  picker.renderSizePicker(sizeContainer);

  // Auto-select first variant
  if (product.product_variants && product.product_variants.length > 0) {
    const firstAvailable = product.product_variants.find(v => v.stock > 0) || product.product_variants[0];
    picker.renderStockDisplay(stockContainer, firstAvailable);
  }

  // Description
  if (description) {
    infoContainer.appendChild(el('div', { className: 'product-description' }, [
      el('h3', { textContent: t('product.description') }),
      el('p', { textContent: description })
    ]));
  }

  // Marketplace CTAs (No Cart, Only Direct Marketplace Links)
  const btnWrap = el('div', { className: 'marketplace-buttons' });

  if (product.shopee_url) {
    btnWrap.appendChild(el('a', {
      className: 'btn btn-marketplace btn-shopee',
      href: product.shopee_url,
      target: '_blank',
      rel: 'noopener noreferrer'
    }, [
      el('span', { textContent: '🛒 ' + t('cta.buy_shopee') })
    ]));
  }

  if (product.tiktok_url) {
    btnWrap.appendChild(el('a', {
      className: 'btn btn-marketplace btn-tiktok',
      href: product.tiktok_url,
      target: '_blank',
      rel: 'noopener noreferrer'
    }, [
      el('span', { textContent: '🎵 ' + t('cta.buy_tiktok') })
    ]));
  }

  infoContainer.appendChild(btnWrap);

  // Append gallery and info to container
  container.appendChild(galleryContainer);
  container.appendChild(infoContainer);
}

function setupStickyButtons(product) {
  const stickyBar = $('#marketplace-sticky');
  const stickyShopee = $('#sticky-shopee');
  const stickyTiktok = $('#sticky-tiktok');

  if (!stickyBar) return;

  let hasLinks = false;

  if (product.shopee_url && stickyShopee) {
    stickyShopee.href = product.shopee_url;
    stickyShopee.style.display = 'inline-flex';
    hasLinks = true;
  } else if (stickyShopee) {
    stickyShopee.style.display = 'none';
  }

  if (product.tiktok_url && stickyTiktok) {
    stickyTiktok.href = product.tiktok_url;
    stickyTiktok.style.display = 'inline-flex';
    hasLinks = true;
  } else if (stickyTiktok) {
    stickyTiktok.style.display = 'none';
  }

  if (hasLinks) {
    stickyBar.style.display = 'flex';
  }
}

function showError() {
  const errorBox = $('#product-error');
  if (errorBox) errorBox.style.display = 'block';
}

// Auto-run
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProductPage);
} else {
  initProductPage();
}
