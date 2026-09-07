/**
 * DOM manipulation and observation helpers.
 */

const documentElementSubscriptions = new Set();
let documentElementObserver = null;

function collectMatchesFromNode(node, selector, matches) {
  if (!(node instanceof Element)) return;

  if (node.matches(selector)) {
    matches.add(node);
  }

  node.querySelectorAll(selector).forEach((el) => matches.add(el));
}

function ensureDocumentElementObserver() {
  if (documentElementObserver) return;

  documentElementObserver = new MutationObserver((mutations) => {
    for (const subscription of [...documentElementSubscriptions]) {
      const matches = new Set();

      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          collectMatchesFromNode(node, subscription.selector, matches);
        }
      }

      for (const element of matches) {
        if (subscription.seen.has(element)) continue;
        subscription.seen.add(element);
        subscription.callback(element);

        if (subscription.once) {
          subscription.disconnect();
          break;
        }
      }
    }
  });

  documentElementObserver.observe(document, {
    childList: true,
    subtree: true
  });
}

/**
 * Observe matching elements as soon as they are inserted.
 * Document-level subscriptions share a single MutationObserver so modules do not
 * each scan the entire page independently while Melonbooks is constructing it.
 */
export function observeElements(selector, callback, options = {}) {
  const {
    root = document,
    once = false,
    includeExisting = true
  } = options;

  const seen = new WeakSet();
  let disconnected = false;
  let localObserver = null;

  const subscription = {
    selector,
    callback,
    once,
    seen,
    disconnect() {
      if (disconnected) return;
      disconnected = true;
      documentElementSubscriptions.delete(subscription);
      if (localObserver) {
        localObserver.disconnect();
        localObserver = null;
      }
    }
  };

  function processElement(element) {
    if (!(element instanceof Element) || seen.has(element)) return false;
    seen.add(element);
    callback(element);
    if (once) {
      subscription.disconnect();
    }
    return true;
  }

  if (includeExisting && root.querySelectorAll) {
    const existing = Array.from(root.querySelectorAll(selector));
    for (const element of existing) {
      processElement(element);
      if (once && disconnected) break;
    }
  }

  if (!disconnected) {
    if (root === document) {
      documentElementSubscriptions.add(subscription);
      ensureDocumentElementObserver();
    } else if (root instanceof Element || root instanceof DocumentFragment) {
      localObserver = new MutationObserver((mutations) => {
        const matches = new Set();
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            collectMatchesFromNode(node, selector, matches);
          }
        }
        for (const element of matches) {
          processElement(element);
          if (once && disconnected) break;
        }
      });
      localObserver.observe(root, { childList: true, subtree: true });
    }
  }

  return subscription.disconnect;
}

export function waitForElement(selector, root = document, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const existing = root.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    let timeoutId = null;
    const disconnect = observeElements(selector, (element) => {
      if (timeoutId) clearTimeout(timeoutId);
      resolve(element);
    }, { root, once: true, includeExisting: false });

    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        disconnect();
        reject(new Error(`Timeout waiting for selector: ${selector}`));
      }, timeout);
    }
  });
}

export function waitForElements(selectors, root = document, timeout = 10000) {
  const entries = Object.entries(selectors);

  return Promise.all(
    entries.map(async ([key, selector]) => {
      const element = await waitForElement(selector, root, timeout);
      return [key, element];
    })
  ).then((resolved) => Object.fromEntries(resolved));
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
