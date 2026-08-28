/**
 * Module: Force Detail Thumbnails
 * Replaces Melonbooks detail-page now_printing.jpeg placeholders with their data-src image URLs.
 */

export const ForceDetailThumbnailsModule = {
  id: 'force-detail-thumbnails',
  name: 'Force Detail Thumbnails',
  lifecycle: 'document-end',

  matches(context) {
    return context.route === 'melonbooks-product' || /^\/(?:detail\/|products\/detail\.php)/.test(context.location.pathname);
  },

  init() {
    const images = document.querySelectorAll('img[src*="now_printing.jpeg"][data-src]');
    for (const img of images) {
      const originalSrc = img.getAttribute('data-src');
      if (!originalSrc) continue;
      img.setAttribute('src', originalSrc);
    }
  }
};
