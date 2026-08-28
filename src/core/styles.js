/**
 * Safe style injection with deduplication and early document-start support.
 */

export function injectStyle(id, cssText) {
  const styleId = `mbe-style-${id}`;
  let styleEl = document.getElementById(styleId);

  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.type = 'text/css';

    const target = document.head || document.documentElement;
    if (target) {
      target.appendChild(styleEl);
    } else {
      // Very early document-start before documentElement is ready
      const observer = new MutationObserver(() => {
        const root = document.head || document.documentElement;
        if (root) {
          observer.disconnect();
          root.appendChild(styleEl);
        }
      });
      observer.observe(document, { childList: true, subtree: true });
    }
  }

  styleEl.textContent = cssText;
  return styleEl;
}

export function removeStyle(id) {
  const styleId = `mbe-style-${id}`;
  const styleEl = document.getElementById(styleId);
  if (styleEl && styleEl.parentNode) {
    styleEl.parentNode.removeChild(styleEl);
  }
}
