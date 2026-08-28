/**
 * DOM manipulation and observation helpers.
 */

export function waitForElement(selector, root = document, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const existing = root.querySelector(selector);
    if (existing) {
      return resolve(existing);
    }

    let timeoutId = null;
    const observer = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (el) {
        if (timeoutId) clearTimeout(timeoutId);
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(root === document ? (document.body || document.documentElement) : root, {
      childList: true,
      subtree: true
    });

    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Timeout waiting for selector: ${selector}`));
      }, timeout);
    }
  });
}

export function observeMutations(target, callback, options = { childList: true, subtree: true }) {
  if (!target) return null;
  const observer = new MutationObserver(callback);
  observer.observe(target, options);
  return observer;
}

export function markInitialized(element, moduleId) {
  if (element && element.setAttribute) {
    element.setAttribute(`data-mbe-${moduleId}`, 'initialized');
  }
}

export function isInitialized(element, moduleId) {
  if (!element || !element.getAttribute) return false;
  return element.getAttribute(`data-mbe-${moduleId}`) === 'initialized';
}

export function parseHtml(htmlText) {
  const parser = new DOMParser();
  return parser.parseFromString(htmlText, 'text/html');
}

export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
