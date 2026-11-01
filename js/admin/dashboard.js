// Muhun Leather — Admin Dashboard Script
import { guardAdmin } from './guard.js';
import { supabase } from '../supabase-client.js';
import { $, el, clearChildren } from '../ui/dom.js';
import { initI18n } from '../i18n.js';
import { signOut } from '../api/auth.js';

export async function initDashboard() {
  await initI18n();

  const profile = await guardAdmin();
  if (!profile) return; // guardAdmin handles redirect

  // Reveal admin interface, hide loading guard
  const loading = $('#auth-loading');
  const app = $('#admin-app');
  if (loading) loading.style.display = 'none';
  if (app) app.style.display = 'block';

  // Display user info
  const userDisplay = $('#admin-user-name');
  if (userDisplay) {
    userDisplay.textContent = profile.full_name || profile.username || 'Admin';
  }

  // Logout handler
  const logoutBtn = $('#logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await signOut();
      window.location.replace('login.html');
    });
  }

  await loadStats();
}

async function loadStats() {
  try {
    // 1. Total products
    const { count: totalCount, error: totalErr } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true });

    // 2. Published products
    const { count: publishedCount, error: pubErr } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', true);

    // 3. Draft products
    const { count: draftCount, error: draftErr } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', false);

    // 4. Low stock variants (stock <= 3)
    const { data: lowStockVariants, error: stockErr } = await supabase
      .from('product_variants')
      .select('id')
      .lte('stock', 3);

    updateStat('#stat-total', totalCount !== null ? totalCount : 0);
    updateStat('#stat-published', publishedCount !== null ? publishedCount : 0);
    updateStat('#stat-drafts', draftCount !== null ? draftCount : 0);
    updateStat('#stat-low-stock', lowStockVariants ? lowStockVariants.length : 0);
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
}

function updateStat(selector, value) {
  const elem = $(selector);
  if (elem) elem.textContent = String(value);
}

// Auto-run
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDashboard);
} else {
  initDashboard();
}
