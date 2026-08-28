// ==UserScript==
// @name         Melonbooks - Move product info below cart buttons
// @namespace    https://example.com/
// @version      1.3.1
// @description  Display the original product info table (.table-wrapper) below the cart area and toggle tags
// @match        https://www.melonbooks.co.jp/detail/detail.php*
// @match        https://www.melonbooks.co.jp/products/detail.php*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    class ScriptInfo {
        static version = '1.3.1';
    }

    Object.freeze(ScriptInfo);

    const INSERTED_ID = 'mb-userscript-table-wrapper-below-cart';
    const CONTAINER_ID = INSERTED_ID + '-container';

    const EBOOK_INSERTED_ID = 'mb-userscript-ebook-table-wrapper-below-cart';
    const EBOOK_CONTAINER_ID = EBOOK_INSERTED_ID + '-container';

    const HASHTAG_TOGGLE_ID = 'mb-userscript-hashtag-toggle';

    function findOriginalTableWrapper() {
        return Array.from(document.querySelectorAll('.item-detail .table-wrapper, .table-wrapper'))
            .find(el =>
                el.id !== INSERTED_ID &&
                el.id !== EBOOK_INSERTED_ID &&
                !el.closest('#' + CONTAINER_ID) &&
                !el.closest('#' + EBOOK_CONTAINER_ID) &&
                !el.closest('#rtoaster-template')
            );
    }

    function placeTableWrapper() {
        const itemCart = document.querySelector('.item-cart');

        if (!itemCart) {
            return false;
        }

        if (document.getElementById(CONTAINER_ID)) {
            return true;
        }

        const originalTableWrapper = findOriginalTableWrapper();

        if (!originalTableWrapper) {
            return false;
        }

        const itemMetasWrap = itemCart.closest('.item-metas-wrap');

        if (!itemMetasWrap) {
            return false;
        }

        const originalItemDetail = originalTableWrapper.closest('.item-detail');

        const container = document.createElement('div');
        container.className = 'item-detail __light mt24';
        container.id = CONTAINER_ID;

        const heading = document.createElement('h3');
        heading.className = 'page-headline mb12';
        heading.textContent = '作品情報';

        originalTableWrapper.id = INSERTED_ID;

        container.appendChild(heading);

        /*
         * Move the original table instead of cloning it.
         * Cloning drops the page's jQuery click handlers.
         */
        container.appendChild(originalTableWrapper);

        itemCart.insertAdjacentElement('afterend', container);

        if (originalItemDetail && originalItemDetail !== container) {
            originalItemDetail.style.display = 'none';
        }

        document.querySelectorAll('.item-share.btn-share-group, .accordion-group, .author-name')
            .forEach(el => {
                el.style.display = 'none';
            });

        return true;
    }

    function placeEbookTableWrapper() {
        const itemMetasWrap = document.querySelector('.item-metas-wrap');
        const productForm = itemMetasWrap ? itemMetasWrap.querySelector('#form_product') : null;
        const ebookCartButtons = itemMetasWrap ? itemMetasWrap.querySelector('.btn-cart') : null;

        if (!itemMetasWrap || !productForm || !ebookCartButtons) {
            return false;
        }

        if (document.getElementById(EBOOK_CONTAINER_ID)) {
            return true;
        }

        /*
         * Electronic-book pages do not use .item-cart.
         * They use .btn-cart inside #form_product instead.
         */
        const isEbookLayout =
            document.querySelector('.item_detail_matrix_dl') ||
            document.querySelector('.dl_notice') ||
            itemMetasWrap.querySelector('.ebook-accordion') ||
            itemMetasWrap.querySelector('.dl_cart_button') ||
            Array.from(document.querySelectorAll('.item-notes'))
                .some(el => el.textContent.trim().includes('電子書籍'));

        if (!isEbookLayout) {
            return false;
        }

        const originalTableWrapper = findOriginalTableWrapper();

        if (!originalTableWrapper) {
            return false;
        }

        const originalItemDetail = originalTableWrapper.closest('.item-detail');

        const container = document.createElement('div');
        container.className = 'item-detail __light mt24';
        container.id = EBOOK_CONTAINER_ID;

        const heading = document.createElement('h3');
        heading.className = 'page-headline mb12';
        heading.textContent = '作品情報';

        originalTableWrapper.id = EBOOK_INSERTED_ID;

        container.appendChild(heading);

        /*
         * Keep the original node so .favorite_author and
         * .favorite_circle_short retain their site handlers.
         */
        container.appendChild(originalTableWrapper);

        /*
         * Keep the moved block contained inside .item-metas-wrap.
         * Insert it after the whole product form so it appears below
         * the e-book purchase/cart buttons.
         */
        productForm.insertAdjacentElement('afterend', container);

        if (originalItemDetail && originalItemDetail !== container) {
            originalItemDetail.style.display = 'none';
        }

        document.querySelectorAll('.item-share.btn-share-group, .accordion-group, .author-name')
            .forEach(el => {
                el.style.display = 'none';
            });

        return true;
    }

    function setupTagToggle() {
        const itemDetail2 = document.querySelector('.item-detail2');

        if (!itemDetail2) {
            return false;
        }

        if (document.getElementById(HASHTAG_TOGGLE_ID)) {
            return true;
        }

        itemDetail2.style.display = 'none';

        const button = document.createElement('button');
        button.id = HASHTAG_TOGGLE_ID;
        button.type = 'button';
        button.textContent = 'Tags ▽';

        button.style.display = 'block';
        button.style.width = 'auto';
        button.style.minWidth = '120px';
        button.style.margin = '16px auto 8px';
        button.style.padding = '8px 16px';
        button.style.border = '1px solid #ccc';
        button.style.borderRadius = '4px';
        button.style.background = '#fff';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.textAlign = 'center';

        button.addEventListener('click', () => {
            const isHidden = itemDetail2.style.display === 'none';

            itemDetail2.style.display = isHidden ? '' : 'none';
            button.textContent = isHidden ? 'Tags △' : 'Tags ▽';
        });

        itemDetail2.insertAdjacentElement('beforebegin', button);

        return true;
    }

    function placeProductInfoTable() {
        /*
         * Existing normal-product logic runs first.
         * The e-book layout logic only runs if that branch cannot place the table.
         */
        return placeTableWrapper() || placeEbookTableWrapper();
    }

    function init() {
        let tableReady = placeProductInfoTable();
        let tagToggleReady = setupTagToggle();

        if (tableReady && tagToggleReady) {
            return;
        }

        const observer = new MutationObserver(() => {
            if (!tableReady) {
                tableReady = placeProductInfoTable();
            }

            if (!tagToggleReady) {
                tagToggleReady = setupTagToggle();
            }

            if (tableReady && tagToggleReady) {
                observer.disconnect();
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        setTimeout(() => observer.disconnect(), 10000);
    }

    init();
})();