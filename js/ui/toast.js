/**
 * Toast Notification System
 * Modern, stackable, auto-dismissing notifications
 */

const TOAST_DURATION = 5000; // 5 seconds
const MAX_VISIBLE = 3;
const ANIMATION_DURATION = 400;

let toastContainer = null;

/**
 * Ensure the toast container exists in the DOM
 */
function ensureContainer() {
  if (toastContainer && document.body.contains(toastContainer)) return;

  toastContainer = document.createElement('div');
  toastContainer.id = 'toastContainer';
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {'success'|'error'|'warning'|'info'} [type='info'] - Toast type
 * @param {number} [duration=5000] - Auto-dismiss time in ms (0 = manual)
 */
export function showToast(message, type = 'info', duration = TOAST_DURATION) {
  ensureContainer();

  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  const toastEl = document.createElement('div');
  toastEl.className = `toast toast-${type}`;
  toastEl.innerHTML = `
    <div class="toast-body">
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Cerrar">\u00d7</button>
    </div>
    ${duration > 0 ? '<div class="toast-progress"><div class="toast-progress-bar"></div></div>' : ''}
  `;

  // Close button handler
  toastEl.querySelector('.toast-close').addEventListener('click', () => dismissToast(toastEl));

  // Add to container
  toastContainer.appendChild(toastEl);

  // Trigger entrance animation
  requestAnimationFrame(() => {
    toastEl.classList.add('toast-visible');
  });

  // Start progress bar animation
  if (duration > 0) {
    const bar = toastEl.querySelector('.toast-progress-bar');
    if (bar) {
      bar.style.transition = `width ${duration}ms linear`;
      requestAnimationFrame(() => {
        bar.style.width = '0%';
      });
    }

    // Auto-dismiss
    toastEl._timeout = setTimeout(() => dismissToast(toastEl), duration);
  }

  // Enforce max visible
  enforceMaxVisible();

  return toastEl;
}

/**
 * Dismiss a toast with exit animation
 */
function dismissToast(toastEl) {
  if (!toastEl || toastEl._dismissed) return;
  toastEl._dismissed = true;

  if (toastEl._timeout) clearTimeout(toastEl._timeout);

  toastEl.classList.remove('toast-visible');
  toastEl.classList.add('toast-exit');

  setTimeout(() => {
    if (toastEl.parentNode) {
      toastEl.parentNode.removeChild(toastEl);
    }
    enforceMaxVisible();
  }, ANIMATION_DURATION);
}

/**
 * Remove oldest toasts if we exceed max
 */
function enforceMaxVisible() {
  if (!toastContainer) return;
  const toasts = toastContainer.querySelectorAll('.toast:not(.toast-exit)');
  if (toasts.length > MAX_VISIBLE) {
    for (let i = 0; i < toasts.length - MAX_VISIBLE; i++) {
      dismissToast(toasts[i]);
    }
  }
}

// Convenience methods
export const toast = {
  success: (msg, duration) => showToast(msg, 'success', duration),
  error: (msg, duration) => showToast(msg, 'error', duration),
  warning: (msg, duration) => showToast(msg, 'warning', duration),
  info: (msg, duration) => showToast(msg, 'info', duration),
};
