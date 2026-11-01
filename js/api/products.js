// Muhun Leather — Product API Layer
// All Supabase product queries are centralised here.
import { supabase } from '../supabase-client.js';
import { ITEMS_PER_PAGE } from '../config.js';

/**
 * Fetch published products with optional category, search, sort, and pagination.
 * @param {Object} opts
 * @param {string} opts.category - 'all' | 'tas' | 'sepatu' | 'sandal'
 * @param {string} opts.search   - Free-text search term
 * @param {string} opts.sort     - 'newest' | 'price_asc' | 'price_desc'
 * @param {number} opts.page     - 1-based page number
 * @returns {Promise<Object[]>} Products with final_price, discount_active, cover_image
 */
export async function fetchProducts({ category, search, sort, page }) {
  // Start query — only published products with their cover images
  let query = supabase
    .from('products')
    .select(`
      id, slug, category, name_id, name_en, price_idr, 
      discount_percent, discount_ends_at, is_featured,
      product_images(path_thumb, is_cover, sort_order)
    `)
    .eq('is_published', true);

  // Category filter
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  // Search by product name (both languages)
  if (search) {
    query = query.or(`name_id.ilike.%${search}%,name_en.ilike.%${search}%`);
  }

  // Sort order
  if (sort === 'price_asc') {
    query = query.order('price_idr', { ascending: true });
  } else if (sort === 'price_desc') {
    query = query.order('price_idr', { ascending: false });
  } else {
    // Default: newest first
    query = query.order('created_at', { ascending: false });
  }

  // Pagination
  const from = ((page || 1) - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  // Enrich each product with calculated fields
  return (data || []).map(p => ({
    ...p,
    final_price: calculateFinalPrice(p),
    discount_active: isDiscountActive(p),
    cover_image: getCoverImage(p.product_images)
  }));
}

/**
 * Fetch a single product by slug, including all images and variants.
 * @param {string} slug
 * @returns {Promise<Object>}
 */
export async function fetchProduct(slug) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      product_images(id, path_large, path_thumb, sort_order, is_cover),
      product_variants(id, color_name, color_hex, size_eu, stock)
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) throw error;

  // Sort images by sort_order
  data.product_images.sort((a, b) => a.sort_order - b.sort_order);

  // Calculate final price
  data.final_price = calculateFinalPrice(data);
  data.discount_active = isDiscountActive(data);

  return data;
}

/**
 * Fetch featured products for the homepage.
 * @param {number} limit - Max items to return (default 8)
 * @returns {Promise<Object[]>}
 */
export async function fetchFeaturedProducts(limit = 8) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, slug, category, name_id, name_en, price_idr, 
      discount_percent, discount_ends_at, is_featured,
      product_images(path_thumb, is_cover, sort_order)
    `)
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return (data || []).map(p => ({
    ...p,
    final_price: calculateFinalPrice(p),
    discount_active: isDiscountActive(p),
    cover_image: getCoverImage(p.product_images)
  }));
}

/**
 * Fetch total product count for pagination.
 * @param {Object} opts
 * @param {string} opts.category
 * @param {string} opts.search
 * @returns {Promise<number>}
 */
export async function fetchProductCount({ category, search }) {
  let query = supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('is_published', true);

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  if (search) {
    query = query.or(`name_id.ilike.%${search}%,name_en.ilike.%${search}%`);
  }

  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

/**
 * Fetch site settings (WhatsApp number, store URLs, etc.).
 * @returns {Promise<Object>} Key-value settings map
 */
export async function fetchSiteSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value');

  if (error) throw error;

  const settings = {};
  (data || []).forEach(row => { settings[row.key] = row.value; });
  return settings;
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Calculate the final price after discount (if active).
 * @param {Object} product
 * @returns {number}
 */
function calculateFinalPrice(product) {
  if (isDiscountActive(product)) {
    return Math.round(product.price_idr * (100 - product.discount_percent) / 100);
  }
  return product.price_idr;
}

/**
 * Check whether a product's discount is currently active.
 * @param {Object} product
 * @returns {boolean}
 */
function isDiscountActive(product) {
  if (!product.discount_percent || product.discount_percent === 0) return false;
  if (product.discount_ends_at && new Date(product.discount_ends_at) <= new Date()) return false;
  return true;
}

/**
 * Pick the cover image thumbnail from an array of product_images.
 * Prefers the image flagged is_cover, then falls back to lowest sort_order.
 * @param {Object[]} images
 * @returns {string|null}
 */
function getCoverImage(images) {
  if (!images || images.length === 0) return null;
  const cover = images.find(img => img.is_cover);
  if (cover) return cover.path_thumb;
  // Fallback: first by sort_order
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
  return sorted[0].path_thumb;
}
