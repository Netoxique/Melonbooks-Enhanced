// ==UserScript==
// @name         Melonbooks - Wishlist Infinite Scroll
// @namespace    https://www.melonbooks.co.jp/
// @version      1.0.1
// @description  Automatically loads additional wishlist pages into the current item list.
// @match        https://www.melonbooks.co.jp/mypage/favorite.php*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    class MelonbooksWishlistInfiniteScroll {
        static version = '1.0.1';
        static preloadDistance = 1200;

        constructor() {
            this.list = document.querySelector('.item-list > ul');
            this.form = document.querySelector('#form1');
            this.paginator = document.querySelector('.pagenavi');

            if (!this.list || !this.form) {
                return;
            }

            /*
             * Melonbooks can leave row-clearing behavior on the
             * products that were present when the page first loaded.
             *
             * That causes page 2 to begin on a new row instead of
             * continuing directly after the final item from page 1.
             */
            this.installContinuousLayoutFix();
            this.removeTrailingClearElements();

            this.currentPage = this.readCurrentPage(document);
            this.maxPage = this.readMaxPage(document);

            this.loading = false;
            this.finished = this.currentPage >= this.maxPage;
            this.retryBlocked = false;

            this.loadedPages = new Set([
                this.currentPage
            ]);

            this.productKeys = new Set(
                [...this.list.children]
                    .filter((element) => element.tagName === 'LI')
                    .map((li) => this.productKey(li))
                    .filter(Boolean)
            );

            this.status = document.createElement('div');

            this.status.id =
                'mb-wishlist-infinite-scroll-status';

            this.status.setAttribute(
                'aria-live',
                'polite'
            );

            this.status.style.cssText = [
                'text-align:center',
                'padding:14px 8px',
                'font-size:12px',
                'opacity:.75',
                'min-height:16px'
            ].join(';');

            document
                .querySelector('.item-list')
                .after(this.status);

            if (this.finished) {
                this.finish();
                return;
            }

            if (this.paginator) {
                this.paginator.hidden = true;
            }

            this.observer =
                new IntersectionObserver(
                    (entries) => {
                        if (
                            entries.some(
                                (entry) =>
                                    entry.isIntersecting
                            )
                        ) {
                            this.loadNextPage();
                        }
                    },
                    {
                        rootMargin:
                            `${MelonbooksWishlistInfiniteScroll.preloadDistance}px 0px`,
                        threshold: 0
                    }
                );

            this.observer.observe(
                this.status
            );

            this.maybeLoadMore();
        }

        installContinuousLayoutFix() {
            if (
                document.getElementById(
                    'mb-wishlist-infinite-layout-style'
                )
            ) {
                return;
            }

            const style =
                document.createElement('style');

            style.id =
                'mb-wishlist-infinite-layout-style';

            style.textContent = `
                /*
                 * Do not allow individual products to force a new
                 * float row. All wishlist pages should behave as
                 * one continuous list.
                 */
                .item-list > ul > li {
                    clear: none !important;
                }

                /*
                 * Some Melonbooks layout scripts may insert an
                 * explicit clearing element after the original list.
                 */
                .item-list > ul > br[clear],
                .item-list > ul > .clear,
                .item-list > ul > .clearfix,
                .item-list > ul > .clearboth,
                .item-list > ul > .clear-both {
                    display: none !important;
                    clear: none !important;
                    width: 0 !important;
                    height: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
            `;

            document.head.appendChild(
                style
            );
        }

        removeTrailingClearElements() {
            for (
                const child of
                [...this.list.children]
            ) {
                if (
                    child.tagName === 'LI'
                ) {
                    continue;
                }

                const style =
                    getComputedStyle(child);

                const looksLikeClear =
                    child.matches(
                        'br[clear], .clear, .clearfix, .clearboth, .clear-both'
                    ) ||
                    style.clear === 'both' ||
                    style.clear === 'left' ||
                    style.clear === 'right';

                if (looksLikeClear) {
                    child.remove();
                }
            }
        }

        readCurrentPage(doc) {
            const formPage =
                doc.querySelector(
                    '#form1 input[name="pageno"]'
                )?.value;

            const current =
                doc.querySelector(
                    '.pagenavi a.current'
                );

            const visiblePage =
                current?.getAttribute('title') ||
                current?.textContent?.trim();

            return Math.max(
                1,
                Number.parseInt(
                    formPage ||
                    visiblePage ||
                    '1',
                    10
                ) || 1
            );
        }

        readMaxPage(doc) {
            const pages = [
                this.readCurrentPage(doc)
            ];

            for (
                const link of
                doc.querySelectorAll(
                    '.pagenavi a'
                )
            ) {
                const title =
                    Number.parseInt(
                        link.getAttribute(
                            'title'
                        ) || '',
                        10
                    );

                if (
                    Number.isFinite(title)
                ) {
                    pages.push(title);
                }

                const match =
                    (
                        link.getAttribute(
                            'onclick'
                        ) || ''
                    ).match(
                        /movePage\s*\(\s*['"]?(\d+)/i
                    );

                if (match) {
                    pages.push(
                        Number.parseInt(
                            match[1],
                            10
                        )
                    );
                }
            }

            return Math.max(...pages);
        }

        productKey(li) {
            const className =
                [...li.classList].find(
                    (name) =>
                        /^product_\d+$/.test(
                            name
                        )
                );

            if (className) {
                return className;
            }

            const link =
                li.querySelector(
                    'a[href*="product_id="]'
                );

            if (!link) {
                return null;
            }

            try {
                const id =
                    new URL(
                        link.getAttribute(
                            'href'
                        ),
                        location.href
                    ).searchParams.get(
                        'product_id'
                    );

                return id
                    ? `product_${id}`
                    : null;
            } catch {
                return null;
            }
        }

        requestBody(page) {
            const params =
                new URLSearchParams();

            for (
                const control of
                this.form.elements
            ) {
                if (
                    !control.name ||
                    control.disabled
                ) {
                    continue;
                }

                if (
                    (
                        control.type ===
                            'checkbox' ||
                        control.type ===
                            'radio'
                    ) &&
                    !control.checked
                ) {
                    continue;
                }

                params.append(
                    control.name,
                    control.value
                );
            }

            params.set(
                'pageno',
                String(page)
            );

            return params.toString();
        }

        async fetchPage(page) {
            const action =
                new URL(
                    this.form.getAttribute(
                        'action'
                    ) ||
                    location.href,
                    location.href
                );

            const response =
                await fetch(
                    action.href,
                    {
                        method: 'POST',
                        credentials:
                            'same-origin',
                        cache: 'no-store',

                        headers: {
                            'Content-Type':
                                'application/x-www-form-urlencoded; charset=UTF-8'
                        },

                        body:
                            this.requestBody(
                                page
                            )
                    }
                );

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}`
                );
            }

            return new DOMParser()
                .parseFromString(
                    await response.text(),
                    'text/html'
                );
        }

        prepareItem(
            li,
            page,
            index
        ) {
            const suffix =
                `mbis_${page}_${index}`;

            /*
             * Every Melonbooks page starts its product
             * form numbering from 1 again.
             *
             * Rename imported forms so they cannot collide
             * with forms already present on the page.
             */
            for (
                const form of
                li.querySelectorAll('form')
            ) {
                form.id =
                    `${suffix}_form`;

                form.name =
                    `${suffix}_form`;

                const mode =
                    form.querySelector(
                        'input[name="mode"]'
                    );

                if (mode) {
                    mode.id =
                        `${suffix}_mode`;
                }
            }

            /*
             * Rebind "Remove from list".
             */
            for (
                const link of
                li.querySelectorAll(
                    'a[title="リストから削除"]'
                )
            ) {
                link.removeAttribute(
                    'onclick'
                );

                link.addEventListener(
                    'click',
                    (event) => {
                        event.preventDefault();

                        const form =
                            link.closest(
                                'form'
                            );

                        const mode =
                            form?.querySelector(
                                'input[name="mode"]'
                            );

                        if (
                            !form ||
                            !mode
                        ) {
                            return;
                        }

                        mode.value =
                            'delete_favorite';

                        form.action = '?';

                        form.submit();
                    }
                );
            }

            /*
             * Rebind "Buy now".
             */
            for (
                const link of
                li.querySelectorAll(
                    'a.cart_in_button'
                )
            ) {
                link.removeAttribute(
                    'onclick'
                );

                link.addEventListener(
                    'click',
                    (event) => {
                        event.preventDefault();

                        link
                            .closest('form')
                            ?.submit();
                    }
                );
            }

            /*
             * Rebind purchase-selection buttons because
             * Melonbooks only binds its handler to buttons
             * that existed during the initial page load.
             */
            for (
                const button of
                li.querySelectorAll(
                    'a.cart_select_button'
                )
            ) {
                button.addEventListener(
                    'click',
                    (event) => {
                        event.preventDefault();

                        const wrapper =
                            button.closest(
                                'p.favorite.cart_select'
                            );

                        const checkbox =
                            wrapper?.querySelector(
                                'input.chProductId'
                            );

                        if (
                            !wrapper ||
                            !checkbox
                        ) {
                            return;
                        }

                        if (
                            checkbox.checked
                        ) {
                            wrapper.classList.add(
                                'select'
                            );

                            wrapper.classList.remove(
                                'selected'
                            );
                        } else {
                            wrapper.classList.add(
                                'selected'
                            );

                            wrapper.classList.remove(
                                'select'
                            );
                        }

                        checkbox.click();
                    }
                );
            }

            /*
             * The imported page has not executed
             * Melonbooks' lazy-loading Javascript.
             */
            for (
                const image of
                li.querySelectorAll(
                    'img[data-src]'
                )
            ) {
                if (image.dataset.src) {
                    image.src =
                        image.dataset.src;
                }
            }

            /*
             * Explicitly remove any row clear that may
             * have been copied onto an imported product.
             */
            li.style.setProperty(
                'clear',
                'none',
                'important'
            );
        }

        getInsertionPoint() {
            /*
             * Imported products must remain before any
             * layout element Melonbooks placed at the end
             * of the original <ul>.
             */
            for (
                const child of
                this.list.children
            ) {
                if (
                    child.tagName !== 'LI'
                ) {
                    return child;
                }
            }

            return null;
        }

        appendPage(
            doc,
            page
        ) {
            const incoming =
                doc.querySelector(
                    '.item-list > ul'
                );

            if (!incoming) {
                return 0;
            }

            const fragment =
                document.createDocumentFragment();

            let added = 0;

            [...incoming.children]
                .forEach(
                    (
                        source,
                        index
                    ) => {
                        if (
                            source.tagName !==
                            'LI'
                        ) {
                            return;
                        }

                        const key =
                            this.productKey(
                                source
                            );

                        if (
                            key &&
                            this.productKeys.has(
                                key
                            )
                        ) {
                            return;
                        }

                        const li =
                            document.importNode(
                                source,
                                true
                            );

                        this.prepareItem(
                            li,
                            page,
                            index + 1
                        );

                        fragment.appendChild(
                            li
                        );

                        if (key) {
                            this.productKeys.add(
                                key
                            );
                        }

                        added++;
                    }
                );

            /*
             * Insert before any original trailing clearing
             * element instead of blindly appending after it.
             */
            const insertionPoint =
                this.getInsertionPoint();

            this.list.insertBefore(
                fragment,
                insertionPoint
            );

            this.removeTrailingClearElements();

            return added;
        }

        syncToken(doc) {
            const nextToken =
                doc.querySelector(
                    '#form1 input[name="transactionid"]'
                )?.value;

            const currentToken =
                this.form.querySelector(
                    'input[name="transactionid"]'
                );

            if (
                nextToken &&
                currentToken
            ) {
                currentToken.value =
                    nextToken;
            }
        }

        async loadNextPage() {
            if (
                this.loading ||
                this.finished ||
                this.retryBlocked
            ) {
                return;
            }

            const nextPage =
                this.currentPage + 1;

            if (
                nextPage >
                    this.maxPage ||
                this.loadedPages.has(
                    nextPage
                )
            ) {
                this.finish();
                return;
            }

            this.loading = true;

            this.status.textContent =
                `Loading wishlist page ${nextPage}...`;

            try {
                const doc =
                    await this.fetchPage(
                        nextPage
                    );

                const added =
                    this.appendPage(
                        doc,
                        nextPage
                    );

                if (!added) {
                    this.finish();
                    return;
                }

                this.syncToken(doc);

                this.loadedPages.add(
                    nextPage
                );

                this.currentPage =
                    nextPage;

                this.maxPage =
                    Math.max(
                        this.maxPage,
                        this.readMaxPage(
                            doc
                        )
                    );

                this.status.textContent =
                    '';

                if (
                    this.currentPage >=
                    this.maxPage
                ) {
                    this.finish();
                    return;
                }
            } catch (error) {
                console.error(
                    `[Melonbooks Wishlist Infinite Scroll ${MelonbooksWishlistInfiniteScroll.version}]`,
                    error
                );

                this.retryBlocked =
                    true;

                this.status.textContent =
                    `Failed to load wishlist page ${nextPage}. Click here to retry.`;

                this.status.style.cursor =
                    'pointer';

                this.status.onclick =
                    () => {
                        this.status.onclick =
                            null;

                        this.status.style.cursor =
                            '';

                        this.retryBlocked =
                            false;

                        this.loadNextPage();
                    };

                if (this.paginator) {
                    this.paginator.hidden =
                        false;
                }
            } finally {
                this.loading = false;

                requestAnimationFrame(
                    () =>
                        this.maybeLoadMore()
                );
            }
        }

        maybeLoadMore() {
            if (
                this.loading ||
                this.finished ||
                this.retryBlocked
            ) {
                return;
            }

            const bottom =
                window.innerHeight +
                MelonbooksWishlistInfiniteScroll
                    .preloadDistance;

            if (
                this.status
                    .getBoundingClientRect()
                    .top <= bottom
            ) {
                this.loadNextPage();
            }
        }

        finish() {
            this.finished = true;
            this.loading = false;

            this.observer?.disconnect();

            if (this.paginator) {
                this.paginator.hidden =
                    true;
            }

            this.status.onclick = null;
            this.status.style.cursor = '';

            this.status.textContent =
                'All wishlist items loaded.';
        }
    }

    new MelonbooksWishlistInfiniteScroll();
})();