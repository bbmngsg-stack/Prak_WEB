// Muhun Leather — Catalog Page Script
import { fetchProducts, fetchProductCount } from '../api/products.js';
import { createProductCard, createSkeletonCard } from '../ui/card.js';
import { $, $$, clearChildren, el, debounce, setUrlParams, getUrlParam } from '../ui/dom.js';
import { initI18n, t, setLang } from '../i18n.js';
import { ITEMS_PER_PAGE } from '../config.js';

let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'newest';
let currentPage = 1;
let totalProducts = 0;

export async function initCatalogPage() {
  await initI18n();
  initHeader();

  // Read URL params
  currentCategory = getUrlParam('category') || 'all';
  currentSearch = getUrlParam('q') || '';
  currentSort = getUrlParam('sort') || 'newest';
  currentPage = parseInt(getUrlParam('page')) || 1;

  initFilters();
  await loadProducts();
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
      await loadProducts();
    });
  });
}

function initFilters() {
  // Category chips
  const chips = $$('.chip');
  chips.forEach(chip => {
    const cat = chip.dataset.category;
    if (cat === currentCategory) {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    }
    chip.addEventListener('click', () => {
      currentCategory = chip.dataset.category;
      currentPage = 1;
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      updateUrlAndLoad();
    });
  });

  // Search input
  const searchInput = $('#search-input');
  if (searchInput) {
    searchInput.value = currentSearch;
    searchInput.addEventListener('input', debounce((e) => {
      currentSearch = e.target.value.trim();
      currentPage = 1;
      updateUrlAndLoad();
    }, 400));
  }

  // Sort select
  const sortSelect = $('#sort-select');
  if (sortSelect) {
    // Normalise sort value (both price-asc / price_asc handled)
    const normalizedSort = currentSort.replace('_', '-');
    sortSelect.value = normalizedSort;
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      currentPage = 1;
      updateUrlAndLoad();
    });
  }
}

function updateUrlAndLoad() {
  setUrlParams({
    category: currentCategory,
    q: currentSearch,
    sort: currentSort,
    page: currentPage > 1 ? currentPage : null
  });
  loadProducts();
}

async function loadProducts() {
  const grid = $('#product-grid');
  const countValue = $('#count-value');
  const emptyState = $('#empty-state');
  const paginationEl = $('#pagination');

  if (!grid) return;

  // Skeletons
  clearChildren(grid);
  if (emptyState) emptyState.style.display = 'none';

  for (let i = 0; i < 8; i++) {
    grid.appendChild(createSkeletonCard());
  }

  try {
    // Map sort parameter to match API expectations
    let apiSort = 'newest';
    if (currentSort === 'price-asc' || currentSort === 'price_asc') apiSort = 'price_asc';
    if (currentSort === 'price-desc' || currentSort === 'price_desc') apiSort = 'price_desc';

    const [products, count] = await Promise.all([
      fetchProducts({
        category: currentCategory,
        search: currentSearch,
        sort: apiSort,
        page: currentPage
      }),
      fetchProductCount({
        category: currentCategory,
        search: currentSearch
      })
    ]);

    totalProducts = count;

    if (countValue) {
      countValue.textContent = totalProducts;
    }

    clearChildren(grid);

    if (products.length === 0) {
      if (emptyState) {
        emptyState.style.display = 'block';
      } else {
        grid.appendChild(el('p', { className: 'empty-state', textContent: t('catalog.empty') }));
      }
    } else {
      if (emptyState) emptyState.style.display = 'none';
      products.forEach(product => {
        grid.appendChild(createProductCard(product));
      });
    }

    if (paginationEl) {
      renderPagination(paginationEl);
    }
  } catch (err) {
    console.error('Failed to load products:', err);
    clearChildren(grid);
    grid.appendChild(el('p', { className: 'error-state', textContent: t('catalog.error') }));
  }
}

function renderPagination(container) {
  clearChildren(container);

  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
  if (totalPages <= 1) return;

  // Previous
  if (currentPage > 1) {
    container.appendChild(
      el('button', {
        className: 'page-btn',
        textContent: '←',
        'aria-label': t('pagination.prev'),
        onClick: () => { currentPage--; updateUrlAndLoad(); }
      })
    );
  }

  // Page Numbers
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && Math.abs(i - currentPage) > 2 && i !== 1 && i !== totalPages) {
      if (i === currentPage - 3 || i === currentPage + 3) {
        container.appendChild(el('span', { className: 'page-ellipsis', textContent: '...' }));
      }
      continue;
    }

    container.appendChild(
      el('button', {
        className: `page-btn ${i === currentPage ? 'active' : ''}`,
        textContent: String(i),
        onClick: () => { currentPage = i; updateUrlAndLoad(); }
      })
    );
  }

  // Next
  if (currentPage < totalPages) {
    container.appendChild(
      el('button', {
        className: 'page-btn',
        textContent: '→',
        'aria-label': t('pagination.next'),
        onClick: () => { currentPage++; updateUrlAndLoad(); }
      })
    );
  }
}

// Auto-run
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCatalogPage);
} else {
  initCatalogPage();
}
