// Muhun Leather — Internationalization (i18n)
// Handles language switching, translation loading, and text formatting.
import { DEFAULT_LANG } from './config.js';

// In-memory translation cache
let translations = {};

/**
 * Get the current language from localStorage, falling back to DEFAULT_LANG.
 * @returns {string} Language code ('id' or 'en')
 */
export function getCurrentLang() {
  return localStorage.getItem('muhun-lang') || DEFAULT_LANG;
}

/**
 * Set the active language: persist to localStorage, update <html lang>,
 * load the translation file, and apply translations to the DOM.
 * @param {string} lang - Language code ('id' or 'en')
 */
export async function setLang(lang) {
  localStorage.setItem('muhun-lang', lang);
  document.documentElement.lang = lang;
  await loadTranslations(lang);
  applyTranslations();
}

/**
 * Fetch the JSON translation file for the given language.
 * @param {string} lang - Language code
 */
async function loadTranslations(lang) {
  try {
    // Resolve path relative to the current module URL
    const url = new URL(`./i18n/${lang}.json`, import.meta.url).href;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    translations = await resp.json();
  } catch (err) {
    console.error(`[i18n] Failed to load ${lang}.json:`, err);
    translations = {};
  }
}

/**
 * Walk the DOM and set textContent for every element with [data-i18n].
 * Also handles [data-i18n-placeholder] for input placeholders.
 */
export function applyTranslations() {
  // Regular text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const value = t(key);
    el.textContent = value;
  });

  // Placeholder attributes (for <input> / <textarea>)
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = t(key);
  });
}

/**
 * Return the translated string for a key, falling back to the key itself.
 * @param {string} key - Dot-notation translation key (e.g. "nav.home")
 * @returns {string}
 */
export function t(key) {
  return translations[key] || key;
}

/**
 * Format a price in IDR using the Indonesian locale.
 * @param {number} amountIDR - Price in Rupiah
 * @returns {string} Formatted price string (e.g. "Rp150.000")
 */
export function formatPrice(amountIDR) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(amountIDR);
}

/**
 * Initialize i18n: load the current language and apply to the DOM.
 */
export async function initI18n() {
  const lang = getCurrentLang();
  document.documentElement.lang = lang;
  await loadTranslations(lang);
  applyTranslations();
}
