// Muhun Leather — Variant Picker (Color + Size)
// Renders interactive color swatches, size buttons, and stock indicators.
import { el, clearChildren } from './dom.js';
import { t, formatPrice, getCurrentLang } from '../i18n.js';

/**
 * Initialise a variant picker for a product.
 *
 * @param {Object[]} variants  - Array of { color_name, color_hex, size_eu, stock }
 * @param {string}   category  - 'tas' | 'sepatu' | 'sandal'
 * @param {Object}   callbacks - { onColorChange(color), onVariantSelect(variant) }
 * @returns {Object} Picker API with render* methods and getters
 */
export function initVariantPicker(variants, category, callbacks = {}) {
  // Group variants by colour
  const colorGroups = {};
  variants.forEach(v => {
    if (!colorGroups[v.color_name]) {
      colorGroups[v.color_name] = {
        color_name: v.color_name,
        color_hex: v.color_hex,
        sizes: []
      };
    }
    colorGroups[v.color_name].sizes.push({
      size_eu: v.size_eu,
      stock: v.stock
    });
  });

  const colors = Object.values(colorGroups);
  let selectedColor = colors[0]?.color_name || null;
  let selectedSize = null;

  return {
    colors,
    getSelectedColor: () => selectedColor,
    getSelectedSize: () => selectedSize,

    /**
     * Render colour swatches into the given container.
     * @param {HTMLElement} container
     */
    renderColorPicker(container) {
      clearChildren(container);

      colors.forEach(color => {
        const totalStock = color.sizes.reduce((sum, s) => sum + s.stock, 0);
        const swatch = el('button', {
          className: `color-swatch ${color.color_name === selectedColor ? 'active' : ''} ${totalStock === 0 ? 'out-of-stock' : ''}`,
          style: { backgroundColor: color.color_hex || '#ccc' },
          title: color.color_name,
          'aria-label': color.color_name,
          onClick: () => {
            selectedColor = color.color_name;
            selectedSize = null;
            this.renderColorPicker(container);
            if (callbacks.onColorChange) callbacks.onColorChange(color);
          }
        });
        container.appendChild(swatch);
      });

      // Colour name label
      const label = el('span', { className: 'color-label', textContent: selectedColor });
      container.appendChild(label);
    },

    /**
     * Render size buttons for the currently selected colour.
     * Hidden for bags (category === 'tas').
     * @param {HTMLElement} container
     */
    renderSizePicker(container) {
      clearChildren(container);

      // Bags have no size selection
      if (category === 'tas') {
        container.style.display = 'none';
        // Auto-select the bag variant for stock display
        const colorVariants = variants.filter(v => v.color_name === selectedColor);
        if (colorVariants.length > 0 && callbacks.onVariantSelect) {
          callbacks.onVariantSelect(colorVariants[0]);
        }
        return;
      }

      container.style.display = '';
      const colorGroup = colorGroups[selectedColor];
      if (!colorGroup) return;

      colorGroup.sizes
        .sort((a, b) => (a.size_eu || 0) - (b.size_eu || 0))
        .forEach(size => {
          const btn = el('button', {
            className: `size-btn ${size.size_eu === selectedSize ? 'active' : ''}`,
            disabled: size.stock === 0,
            textContent: size.size_eu || '-',
            onClick: () => {
              selectedSize = size.size_eu;
              this.renderSizePicker(container);
              if (callbacks.onVariantSelect) {
                const variant = variants.find(v =>
                  v.color_name === selectedColor && v.size_eu === selectedSize
                );
                callbacks.onVariantSelect(variant);
              }
            }
          });
          container.appendChild(btn);
        });
    },

    /**
     * Render stock availability for a specific variant.
     * @param {HTMLElement} container
     * @param {Object|null} variant
     */
    renderStockDisplay(container, variant) {
      clearChildren(container);
      if (!variant) return;

      const stock = variant.stock;
      const unit = category === 'tas' ? t('product.stock_unit.pcs') : t('product.stock_unit.pair');

      let statusClass, statusText;
      if (stock === 0) {
        statusClass = 'stock-out';
        statusText = t('stock.out');
      } else if (stock <= 3) {
        statusClass = 'stock-low';
        statusText = t('stock.low');
      } else {
        statusClass = 'stock-available';
        statusText = t('stock.available');
      }

      container.appendChild(
        el('div', { className: `stock-label ${statusClass}` }, [
          el('span', { className: 'stock-dot' }),
          el('span', { textContent: `${statusText} — ${stock} ${unit}` })
        ])
      );

      // Stock disclaimer note
      container.appendChild(
        el('p', { className: 'stock-note', dataset: { i18n: 'stock.note' }, textContent: t('stock.note') })
      );
    }
  };
}
