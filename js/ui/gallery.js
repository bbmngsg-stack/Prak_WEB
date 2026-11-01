// Muhun Leather — Product Image Gallery
// Main image display with clickable thumbnail strip.
import { el, $ } from './dom.js';

/**
 * Initialise the image gallery inside the given container.
 * @param {Object[]} images - Array of { path_large, path_thumb, sort_order, is_cover }
 * @param {HTMLElement} container - DOM element to render into
 */
export function initGallery(images, container) {
  // No images — show placeholder
  if (!images || images.length === 0) {
    container.innerHTML = '';
    const placeholder = el('div', { className: 'gallery-main' }, [
      el('img', { src: 'https://placehold.co/1200x1500/FFE9CE/3B2A26?text=No+Image', alt: 'No image' })
    ]);
    container.appendChild(placeholder);
    return;
  }

  // Sort images by sort_order
  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  // Main (large) image
  const mainImg = el('img', {
    className: 'gallery-main-img',
    src: sorted[0].path_large || sorted[0].path_thumb,
    alt: 'Product image'
  });
  const mainWrap = el('div', { className: 'gallery-main' }, [mainImg]);

  // Thumbnail strip
  const thumbsWrap = el('div', { className: 'gallery-thumbs' });

  sorted.forEach((img, index) => {
    const thumb = el('button', {
      className: `gallery-thumb ${index === 0 ? 'active' : ''}`,
      onClick: () => {
        // Swap main image
        mainImg.src = img.path_large || img.path_thumb;
        // Update active state
        thumbsWrap.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      }
    }, [
      el('img', {
        src: img.path_thumb,
        alt: `Thumbnail ${index + 1}`,
        loading: 'lazy'
      })
    ]);
    thumbsWrap.appendChild(thumb);
  });

  // Clear container and build layout
  container.textContent = '';
  container.appendChild(mainWrap);
  if (sorted.length > 1) {
    container.appendChild(thumbsWrap);
  }
}
