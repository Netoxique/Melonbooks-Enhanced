// ==UserScript==
// @name         Melonbooks - Force Loads Details Page Thumbnails
// @namespace    https://www.melonbooks.co.jp/
// @version      1.0.1
// @description  Replaces Melonbooks detail-page now_printing.jpeg placeholders with their data-src image URLs.
// @match        https://www.melonbooks.co.jp/detail/*
// @match        https://melonbooks.co.jp/detail/*
// @match        https://www.melonbooks.co.jp/products/detail.php*
// @match        https://melonbooks.co.jp/products/detail.php*
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const DETAIL_PAGE_RE = /^\/(?:detail\/|products\/detail\.php)/;
    const PLACEHOLDER_RE = /now_printing\.jpeg/i;

    if (!DETAIL_PAGE_RE.test(location.pathname)) {
        return;
    }

    function forceCurrentThumbnails() {
        const images = document.querySelectorAll('img[src*="now_printing.jpeg"][data-src]');

        for (const img of images) {
            const originalSrc = img.getAttribute('data-src');

            if (!originalSrc) {
                continue;
            }

            img.setAttribute('src', originalSrc);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', forceCurrentThumbnails, { once: true });
    } else {
        forceCurrentThumbnails();
    }
})();