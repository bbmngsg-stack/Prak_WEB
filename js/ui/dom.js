// Muhun Leather — DOM Utility Helpers
// Provides safe element creation, query shortcuts, and common DOM operations.

/**
 * Create a DOM element with attributes and children.
 * Supports className, textContent, dataset, style objects, and on* event handlers.
 *
 * @param {string} tag - HTML tag name
 * @param {Object} attrs - Attribute map
 * @param {Array|Node|string} children - Child nodes or text
 * @returns {HTMLElement}
 */
export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') {
      el.className = value;
    } else if (key === 'textContent') {
      el.textContent = value;
    } else if (key.startsWith('on')) {
      // e.g. onClick → click
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'dataset') {
      for (const [dk, dv] of Object.entries(value)) {
        el.dataset[dk] = dv;
      }
    } else if (key === 'style' && typeof value === 'object') {
      Object.assign(el.style, value);
    } else {
      el.setAttribute(key, value);
    }
  }

  // Normalize children to an array
  const kids = Array.isArray(children) ? children : [children];
  for (const child of kids) {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  }

  return el;
}

/** Shorthand alias for createElement */
export const el = createElement;

/**
 * querySelector shorthand.
 * @param {string} selector
 * @param {Element|Document} parent
 * @returns {Element|null}
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * querySelectorAll shorthand — returns a real Array.
 * @param {string} selector
 * @param {Element|Document} parent
 * @returns {Element[]}
 */
export function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}

/**
 * Remove all child nodes from an element (safe, no innerHTML).
 * @param {Element} element
 */
export function clearChildren(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/** Show an element (remove hidden attribute and inline display:none). */
export function show(element) {
  element.style.display = '';
  element.removeAttribute('hidden');
}

/** Hide an element (set display:none and hidden attribute). */
export function hide(element) {
  element.style.display = 'none';
  element.setAttribute('hidden', '');
}

/** Toggle visibility based on a boolean flag. */
export function toggle(element, visible) {
  visible ? show(element) : hide(element);
}

/**
 * Debounce a function — useful for search input handlers.
 * @param {Function} fn
 * @param {number} ms - Delay in milliseconds (default 300)
 * @returns {Function}
 */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Update URL search params without triggering a page reload.
 * Params with null/undefined/empty/'all' values are removed.
 * @param {Object} params - Key-value pairs
 */
export function setUrlParams(params) {
  const url = new URL(window.location);
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '' || value === 'all') {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  }
  window.history.replaceState({}, '', url);
}

/**
 * Read a single URL search parameter.
 * @param {string} key
 * @returns {string|null}
 */
export function getUrlParam(key) {
  return new URL(window.location).searchParams.get(key);
}
