// Muhun Leather — Toast Notification System
// Displays temporary success/error/info messages at the bottom of the viewport.

/** @type {HTMLElement|null} Lazily-created container */
let container;

/**
 * Ensure the toast container exists in the DOM.
 * @returns {HTMLElement}
 */
function ensureContainer() {
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

/**
 * Show a toast notification.
 * @param {string} message - Text to display
 * @param {'success'|'error'|'info'} type - Visual style (default 'success')
 * @param {number} duration - Auto-dismiss delay in ms (default 4000)
 */
export function showToast(message, type = 'success', duration = 4000) {
  const c = ensureContainer();

  // Build toast element
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  // Close button
  const close = document.createElement('button');
  close.className = 'toast-close';
  close.textContent = '\u00D7'; // ×
  close.setAttribute('aria-label', 'Close');
  close.addEventListener('click', () => removeToast(toast));
  toast.appendChild(close);

  c.appendChild(toast);

  // Auto-remove after duration
  setTimeout(() => removeToast(toast), duration);

  // Trigger entrance animation on next frame
  requestAnimationFrame(() => toast.classList.add('toast-show'));
}

/**
 * Remove a toast with exit animation.
 * @param {HTMLElement} toast
 */
function removeToast(toast) {
  toast.classList.remove('toast-show');
  toast.classList.add('toast-hide');
  toast.addEventListener('animationend', () => toast.remove());
}
