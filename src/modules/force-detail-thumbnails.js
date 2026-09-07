/**
 * Module: Force Detail Thumbnails
 * Replaces Melonbooks detail-page now_printing.jpeg placeholders with their data-src image URLs.
 */

const THUMBNAIL_SELECTOR = 'img[src*="now_printing.jpeg"][data-src]';

export const ForceDetailThumbnailsModule = {
  id: 'force-detail-thumbnails',
  name: 'Force Detail Thumbnails',
  lifecycle: 'dom-ready',

  matches(context) {
    return context.route === 'melonbooks-product' || /^\/(?:detail\/|products\/detail\.php)/.test(context.location.pathname);
  },

  init() {
    function processImage(img) {
      if (!(img instanceof HTMLImageElement)) return;
      const originalSrc = img.getAttribute('data-src');
      if (!originalSrc) return;
      img.setAttribute('src', originalSrc);
    }

    function processRoot(root) {
      if (!(root instanceof Element) && !(root instanceof Document)) return;

      if (root instanceof Element && root.matches(THUMBNAIL_SELECTOR)) {
        processImage(root);
      }

      root.querySelectorAll?.(THUMBNAIL_SELECTOR).forEach(processImage);
    }

    processRoot(document);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            processRoot(node);
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
};
