// ==UserScript==
// @name         Melonbooks - Force Load Listing Images
// @namespace    https://www.melonbooks.co.jp/
// @version      1.0.2
// @description  Forces Melonbooks listing thumbnails to load immediately instead of waiting for viewport lazy-loading.
// @match      https://*.melonbooks.co.jp/detail/*
// @match      https://*.melonbooks.co.jp/search/*
// @match      https://*.melonbooks.co.jp/mypage/*
// @match      https://*.melonbooks.co.jp/tags/*
// @match      https://*.melonbooks.co.jp/circle/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    /*
     * Set this to true if you also want hidden sample images to load.
     * Keeping it false avoids loading many extra images per product.
     */
    const LOAD_SAMPLE_IMAGES = false;

    /*
     * Limits how many Image() preload requests run at once.
     * The actual <img> elements are still updated immediately.
     */
    const PRELOAD_CONCURRENCY = 6;

    const PLACEHOLDER_PATTERNS = [
        'now_printing.jpeg',
        'now_printing.jpg',
        'noimage',
    ];

    const pendingPreloads = [];
    let activePreloads = 0;

    function isListingPage() {
        if (location.pathname.startsWith('/detail/')) return false;

        return Boolean(
            document.querySelector('.item-list, .search-page, .ranking, .item-thumbnail, #rtoaster-template')
        );
    }

    function toAbsoluteUrl(url) {
        if (!url) return '';

        const decoded = decodeHtmlEntities(url.trim());

        if (decoded.startsWith('//')) {
            return location.protocol + decoded;
        }

        try {
            return new URL(decoded, location.href).href;
        } catch {
            return decoded;
        }
    }

    function decodeHtmlEntities(value) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = value;
        return textarea.value;
    }

    function looksLikePlaceholder(url) {
        if (!url) return false;
        return PLACEHOLDER_PATTERNS.some(pattern => url.includes(pattern));
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

    function queuePreload(src) {
        if (!src) return;
        if (pendingPreloads.includes(src)) return;

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

    function forceImages(root = document) {
        if (!isListingPage()) return;

        const selector = LOAD_SAMPLE_IMAGES
            ? 'img[data-src], img[data-srcset], source[data-srcset]'
            : '.item-thumbnail img[data-src], img.lazyload_product[data-src]';

        root.querySelectorAll(selector).forEach(node => {
            if (node instanceof HTMLImageElement) {
                forceImage(node);
            }
        });
    }

    function watchForNewImages() {
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (!(node instanceof Element)) continue;

                    if (node.matches && node.matches('img[data-src]')) {
                        forceImage(node);
                    }

                    forceImages(node);
                }
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true,
        });
    }

    function start() {
        forceImages();
        watchForNewImages();

        /*
         * Some site scripts may re-add lazyload attributes after page scripts run.
         * These follow-up passes catch that without constantly polling.
         */
        setTimeout(forceImages, 250);
        setTimeout(forceImages, 1000);
        setTimeout(forceImages, 2500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
})();