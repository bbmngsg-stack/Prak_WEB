// Muhun Leather — Product Card Component
// Creates product card DOM elements for grid display.
import { el } from './dom.js';
import { t, formatPrice, getCurrentLang } from '../i18n.js';

/**
 * Build a product card element (an <a> linking to the detail page).
 * @param {Object} product - Product object with cover_image, final_price, etc.
 * @returns {HTMLElement}
 */
export function createProductCard(product) {
  // Pick name based on current language
  const lang = getCurrentLang();
  const name = (lang === 'en' && product.name_en) ? product.name_en : product.name_id;

  // Cover image with placeholder fallback
  const imgSrc = product.cover_image || 'https://placehold.co/480x600/FFE9CE/3B2A26?text=No+Image';

  // --- Price display ---
  const priceChildren = [];
  if (product.discount_active) {
    priceChildren.push(
      el('span', { className: 'card-price-original' }, formatPrice(product.price_idr)),
      el('span', { className: 'card-price-final' }, formatPrice(product.final_price))
    );
  } else {
    priceChildren.push(
      el('span', { className: 'card-price-final' }, formatPrice(product.price_idr))
    );
  }

  // --- Badges ---
  const badges = [];
  if (product.discount_active) {
    badges.push(el('span', { className: 'badge badge-discount' }, `-${product.discount_percent}%`));
  }

  // --- Card structure ---
  const card = el('a', {
    className: 'product-card',
    href: `product.html?slug=${product.slug}`,
  }, [
    el('div', { className: 'card-image-wrap' }, [
      el('img', {
        className: 'card-image',
        src: imgSrc,
        alt: name,
        loading: 'lazy',
        width: '480',
        height: '600'
      }),
      ...badges
    ]),
    el('div', { className: 'card-body' }, [
      el('h3', { className: 'card-title', textContent: name }),
      el('div', { className: 'card-price' }, priceChildren)
    ])
  ]);

  return card;
}

/**
 * Create a skeleton placeholder card for loading states.
 * @returns {HTMLElement}
 */
export function createSkeletonCard() {
  return el('div', { className: 'product-card skeleton-card' }, [
    el('div', { className: 'card-image-wrap skeleton' }),
    el('div', { className: 'card-body' }, [
      el('div', { className: 'skeleton skeleton-text', style: { height: '20px', width: '80%' } }),
      el('div', { className: 'skeleton skeleton-text', style: { height: '18px', width: '50%', marginTop: '8px' } })
    ])
  ]);
}
