import { observeElements } from '../core/dom.js';

/**
 * Module: Force Detail Thumbnails
 * Replaces Melonbooks detail-page now_printing.jpeg placeholders with their data-src image URLs.
 */

const THUMBNAIL_SELECTOR = 'img[src*="now_printing.jpeg"][data-src]';

export const ForceDetailThumbnailsModule = {
  id: 'force-detail-thumbnails',
  name: 'Force Detail Thumbnails',
  lifecycle: 'document-start',

  matches(context) {
    return context.route === 'melonbooks-product' || /^\/(?:detail\/|products\/detail\.php)/.test(context.location.pathname);
  },

  init() {
    observeElements(THUMBNAIL_SELECTOR, (img) => {
      if (!(img instanceof HTMLImageElement)) return;
      const originalSrc = img.getAttribute('data-src');
      if (!originalSrc) return;
      img.setAttribute('src', originalSrc);
    });
  }
};
