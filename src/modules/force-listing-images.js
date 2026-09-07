import { observeElements } from '../core/dom.js';

/**
 * Module: Force Load Listing Images
 * Forces Melonbooks listing thumbnails to load immediately instead of waiting for viewport lazy-loading.
 */

const LOAD_SAMPLE_IMAGES = false;
const PRELOAD_CONCURRENCY = 6;

const PLACEHOLDER_PATTERNS = [
  'now_printing.jpeg',
  'now_printing.jpg',
  'noimage'
];

const LISTING_IMAGE_SELECTOR = LOAD_SAMPLE_IMAGES
  ? 'img[data-src], img[data-srcset], source[data-srcset]'
  : '.item-thumbnail img[data-src], img.lazyload_product[data-src]';

export const ForceListingImagesModule = {
  id: 'force-listing-images',
  name: 'Force Load Listing Images',
  lifecycle: 'document-start',

  matches(context) {
    return context.isMelonbooks && !context.location.pathname.startsWith('/detail/');
  },

  init(context) {
    const pendingPreloads = [];
    let activePreloads = 0;

    function decodeHtmlEntities(value) {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = value;
      return textarea.value;
    }

    function toAbsoluteUrl(url) {
      if (!url) return '';
      const decoded = decodeHtmlEntities(url.trim());
      if (decoded.startsWith('//')) {
        return context.location.protocol + decoded;
      }
      try {
        return new URL(decoded, context.location.href).href;
      } catch {
        return decoded;
      }
    }

    function looksLikePlaceholder(url) {
      if (!url) return false;
      return PLACEHOLDER_PATTERNS.some((pattern) => url.includes(pattern));
    }

    function shouldProcessImage(img) {
      if (!(img instanceof HTMLImageElement)) return false;

      const realSrc = img.getAttribute('data-src') || img.dataset.src;
      if (!realSrc) return false;

      if (LOAD_SAMPLE_IMAGES) return true;

      return Boolean(
        img.closest('.item-thumbnail') ||
        img.classList.contains('lazyload_product')
      );
    }

    function queuePreload(src) {
      if (!src || pendingPreloads.includes(src)) return;
      pendingPreloads.push(src);
      runPreloadQueue();
    }

    function runPreloadQueue() {
      while (activePreloads < PRELOAD_CONCURRENCY && pendingPreloads.length > 0) {
        const src = pendingPreloads.shift();
        activePreloads += 1;

        const image = new Image();
        image.decoding = 'async';
        image.loading = 'eager';
        image.onload = image.onerror = function () {
          activePreloads -= 1;
          runPreloadQueue();
        };
        image.src = src;
      }
    }

    function forceImage(img) {
      if (!shouldProcessImage(img)) return;

      const realSrc = toAbsoluteUrl(img.getAttribute('data-src') || img.dataset.src);
      if (!realSrc) return;

      img.loading = 'eager';
      img.decoding = 'async';
      img.fetchPriority = 'high';

      img.classList.remove('lazyload', 'lazyloading');
      img.classList.add('lazyloaded', 'melon-force-loaded');
      img.setAttribute('data-melon-force-src', realSrc);

      const currentSrc = img.getAttribute('src') || '';
      if (!currentSrc || looksLikePlaceholder(currentSrc) || currentSrc !== realSrc) {
        img.src = realSrc;
      }

      queuePreload(realSrc);
    }

    function forceImages(root = document) {
      root.querySelectorAll?.(LISTING_IMAGE_SELECTOR).forEach((node) => {
        if (node instanceof HTMLImageElement) {
          forceImage(node);
        }
      });
    }

    observeElements(LISTING_IMAGE_SELECTOR, (node) => {
      if (node instanceof HTMLImageElement) {
        forceImage(node);
      }
    });

    // Retain lightweight rescans for pages that assign data-src after insertion.
    setTimeout(forceImages, 250);
    setTimeout(forceImages, 1000);
    setTimeout(forceImages, 2500);
  }
};
