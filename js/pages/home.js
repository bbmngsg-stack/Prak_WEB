// Muhun Leather — Homepage Script
import { fetchFeaturedProducts, fetchSiteSettings } from '../api/products.js';
import { createProductCard } from '../ui/card.js';
import { $, $$, clearChildren, el } from '../ui/dom.js';
import { initI18n, t, setLang } from '../i18n.js';

export async function initHomePage() {
  await initI18n();
  initHeader();
  await Promise.all([
    loadFeaturedProducts(),
    loadSiteSettings()
  ]);
}

function initHeader() {
  // Mobile Hamburger Toggle
  const hamburger = $('.hamburger');
  const mobileMenu = $('.mobile-menu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('active', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Language Switching
  const langBtns = $$('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const lang = btn.dataset.lang;
      await setLang(lang);
      langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
      // Re-render dynamic content with updated language
      await loadFeaturedProducts();
    });
  });
}

async function loadFeaturedProducts() {
  const grid = $('#featured-grid');
  if (!grid) return;

  try {
    const products = await fetchFeaturedProducts(8);
    clearChildren(grid);

    if (products.length === 0) {
      grid.appendChild(el('p', { className: 'empty-state', textContent: t('catalog.empty') }));
      return;
    }

    products.forEach(product => {
      grid.appendChild(createProductCard(product));
    });
  } catch (err) {
    console.error('Failed to load featured products:', err);
    clearChildren(grid);
    grid.appendChild(el('p', { className: 'error-state', textContent: t('catalog.error') }));
  }
}

async function loadSiteSettings() {
  try {
    const settings = await fetchSiteSettings();

    // WhatsApp Button (Home only)
    const waBtn = $('#wa-button');
    if (waBtn && settings.whatsapp_number) {
      const msg = encodeURIComponent(settings.whatsapp_message || 'Halo Muhun Leather, saya ingin bertanya tentang produk.');
      waBtn.href = `https://wa.me/${settings.whatsapp_number}?text=${msg}`;
    }

    // Store Links
    const shopeeLink = $('#shopee-store-link');
    const footerShopee = $('#footer-shopee');
    if (settings.shopee_store_url) {
      if (shopeeLink) {
        shopeeLink.href = settings.shopee_store_url;
        shopeeLink.style.display = 'inline-flex';
      }
      if (footerShopee) {
        footerShopee.href = settings.shopee_store_url;
      }
    }

    const tiktokLink = $('#tiktok-store-link');
    const footerTiktok = $('#footer-tiktok');
    if (settings.tiktok_store_url) {
      if (tiktokLink) {
        tiktokLink.href = settings.tiktok_store_url;
        tiktokLink.style.display = 'inline-flex';
      }
      if (footerTiktok) {
        footerTiktok.href = settings.tiktok_store_url;
      }
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

// Auto-run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHomePage);
} else {
  initHomePage();
}
