// ==UserScript==
// @name         Melonbooks - Wishlist Toggle
// @namespace    local.melonbooks.wishlist-toggle
// @version      1.0.2
// @description  Makes the product-page wishlist button add or remove the current product.
// @match        https://www.melonbooks.co.jp/detail/detail.php*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(() => {
    "use strict";

    class MelonbooksWishlistToggle {
        static version = "1.0.2";

        static buttonSelector = ".fav-button--wishlist.add_wish";
        static wishlistUrl = new URL(
            "/mypage/favorite.php",
            location.origin
        );

        static maximumPagesToCheck = 100;
        static busyButtons = new WeakSet();
        static addWatchers = new WeakMap();
        static toastTimer = null;

        static init() {
            this.injectStyles();

            /*
             * Normalize the initial state once.
             *
             * There is deliberately no MutationObserver here.
             * Melonbooks modifies the same classes after its AJAX add
             * succeeds, and observing those class changes caused 1.0.1
             * to repeatedly trigger itself.
             */
            document
                .querySelectorAll(this.buttonSelector)
                .forEach((button) => {
                    if (button instanceof HTMLElement) {
                        this.renderButton(
                            button,
                            this.isActive(button)
                        );
                    }
                });

            /*
             * Capture the click before Melonbooks' own handler.
             *
             * Active:
             *   Intercept the click and remove the item ourselves.
             *
             * Inactive:
             *   Do not interfere. Let Melonbooks' original AJAX handler
             *   add the item, then briefly check for its __active class.
             */
            document.addEventListener(
                "click",
                this.handleClick.bind(this),
                true
            );
        }

        static handleClick(event) {
            if (!(event.target instanceof Element)) {
                return;
            }

            const button =
                event.target.closest(
                    this.buttonSelector
                );

            if (!(button instanceof HTMLElement)) {
                return;
            }

            if (!this.isActive(button)) {
                /*
                 * Melonbooks will handle the addition normally.
                 * We only watch for the resulting __active state.
                 */
                this.watchForNativeAddition(button);
                return;
            }

            /*
             * Already added.
             * Block Melonbooks' add-only handler and remove it instead.
             */
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            if (this.busyButtons.has(button)) {
                return;
            }

            void this.removeFromWishlist(button);
        }

        static watchForNativeAddition(button) {
            if (this.addWatchers.has(button)) {
                return;
            }

            const delay = 100;
            const maximumAttempts = 50;
            let attempts = 0;

            const check = () => {
                attempts += 1;

                /*
                 * Melonbooks adds __active only after the server
                 * confirms that the wishlist addition succeeded.
                 */
                if (this.isActive(button)) {
                    this.addWatchers.delete(button);

                    this.renderButton(
                        button,
                        true
                    );

                    this.showToast(
                        "Added to the wishlist."
                    );

                    return;
                }

                if (
                    attempts >= maximumAttempts ||
                    !button.isConnected
                ) {
                    this.addWatchers.delete(button);
                    return;
                }

                const timer =
                    window.setTimeout(
                        check,
                        delay
                    );

                this.addWatchers.set(
                    button,
                    timer
                );
            };

            const timer =
                window.setTimeout(
                    check,
                    delay
                );

            this.addWatchers.set(
                button,
                timer
            );
        }

        static async removeFromWishlist(button) {
            const productId =
                this.getProductId();

            if (!productId) {
                this.showToast(
                    "Could not determine the product ID.",
                    true
                );
                return;
            }

            this.busyButtons.add(button);

            button.classList.add(
                "mb-wishlist-toggle-busy"
            );

            button.setAttribute(
                "aria-busy",
                "true"
            );

            try {
                /*
                 * The product detail page does not necessarily expose
                 * everything required by the wishlist deletion form.
                 *
                 * Load the wishlist and find Melonbooks' own form for
                 * this product.
                 */
                const wishlistEntry =
                    await this.findWishlistEntry(
                        productId
                    );

                await this.submitDelete(
                    wishlistEntry,
                    productId
                );

                button.classList.remove(
                    "__active"
                );

                this.renderButton(
                    button,
                    false
                );

                this.showToast(
                    "Removed from the wishlist."
                );
            } catch (error) {
                console.error(
                    "[Melonbooks - Wishlist Toggle]",
                    error
                );

                const message =
                    error instanceof Error
                        ? error.message
                        : String(error);

                this.showToast(
                    `Could not remove the item from the wishlist. ${message}`,
                    true
                );
            } finally {
                this.busyButtons.delete(button);

                button.classList.remove(
                    "mb-wishlist-toggle-busy"
                );

                button.removeAttribute(
                    "aria-busy"
                );
            }
        }

        static getProductId() {
            const urlProductId =
                new URL(
                    location.href
                ).searchParams.get(
                    "product_id"
                );

            if (
                urlProductId &&
                /^\d+$/.test(urlProductId)
            ) {
                return urlProductId;
            }

            const input =
                document.querySelector(
                    [
                        '#form_product input[name="product_id"]',
                        'input[name="product_id"]',
                    ].join(", ")
                );

            const inputProductId =
                input instanceof HTMLInputElement
                    ? input.value
                    : "";

            return /^\d+$/.test(inputProductId)
                ? inputProductId
                : null;
        }

        static async findWishlistEntry(
            productId
        ) {
            const seenPageSignatures =
                new Set();

            let navigationDocument = null;

            for (
                let pageNumber = 1;
                pageNumber <=
                    this.maximumPagesToCheck;
                pageNumber += 1
            ) {
                const page =
                    pageNumber === 1
                        ? await this.requestDocument(
                            this.wishlistUrl
                        )
                        : await this.requestWishlistPage(
                            navigationDocument,
                            pageNumber
                        );

                this.assertWishlistDocument(
                    page.document,
                    page.response
                );

                const form =
                    this.findProductForm(
                        page.document,
                        productId
                    );

                if (form) {
                    return {
                        form,
                        pageNumber,
                    };
                }

                const productIds =
                    this.getWishlistProductIds(
                        page.document
                    );

                if (
                    productIds.length === 0
                ) {
                    break;
                }

                /*
                 * Stop if Melonbooks starts returning the
                 * same page for out-of-range page numbers.
                 */
                const signature =
                    productIds.join(",");

                if (
                    seenPageSignatures.has(
                        signature
                    )
                ) {
                    break;
                }

                seenPageSignatures.add(
                    signature
                );

                navigationDocument =
                    page.document;
            }

            throw new Error(
                "The product was not found in the wishlist."
            );
        }

        static async requestWishlistPage(
            previousDocument,
            pageNumber
        ) {
            const navigationForm =
                previousDocument?.querySelector(
                    "form#form1"
                );

            if (
                !(
                    navigationForm instanceof
                    HTMLFormElement
                )
            ) {
                throw new Error(
                    "Could not read the wishlist pagination form."
                );
            }

            const body =
                this.formToUrlSearchParams(
                    navigationForm
                );

            body.set(
                "mode",
                ""
            );

            body.set(
                "group",
                ""
            );

            body.set(
                "pageno",
                String(pageNumber)
            );

            return this.requestDocument(
                this.wishlistUrl,
                {
                    method: "POST",
                    body,
                }
            );
        }

        static async submitDelete(
            entry,
            productId
        ) {
            const body =
                this.formToUrlSearchParams(
                    entry.form
                );

            body.set(
                "mode",
                "delete_favorite"
            );

            /*
             * Wishlist forms may contain product_id twice because
             * the purchase-selection checkbox also uses that name.
             */
            body.set(
                "product_id",
                productId
            );

            if (!body.has("quantity")) {
                body.set(
                    "quantity",
                    "1"
                );
            }

            if (!body.has("pageno")) {
                body.set(
                    "pageno",
                    String(
                        entry.pageNumber
                    )
                );
            }

            const result =
                await this.requestDocument(
                    this.wishlistUrl,
                    {
                        method: "POST",
                        body,
                    }
                );

            this.assertWishlistDocument(
                result.document,
                result.response
            );

            /*
             * If the product still exists on the returned page,
             * Melonbooks did not process the deletion.
             */
            if (
                this.findProductForm(
                    result.document,
                    productId
                )
            ) {
                throw new Error(
                    "Melonbooks returned the item without removing it."
                );
            }
        }

        static async requestDocument(
            url,
            options = {}
        ) {
            const response =
                await fetch(
                    url,
                    {
                        credentials:
                            "same-origin",
                        cache:
                            "no-store",
                        redirect:
                            "follow",
                        ...options,
                        headers: {
                            Accept:
                                "text/html,application/xhtml+xml",
                            ...(options.headers || {}),
                        },
                    }
                );

            const text =
                await response.text();

            if (!response.ok) {
                throw new Error(
                    `The request returned HTTP ${response.status}.`
                );
            }

            const parsedDocument =
                new DOMParser()
                    .parseFromString(
                        text,
                        "text/html"
                    );

            return {
                document:
                    parsedDocument,
                response,
            };
        }

        static assertWishlistDocument(
            parsedDocument,
            response
        ) {
            const responsePath =
                response.url
                    ? new URL(
                        response.url
                    ).pathname
                    : "";

            const title =
                parsedDocument.title ||
                "";

            const hasPasswordField =
                Boolean(
                    parsedDocument
                        .querySelector(
                            'input[type="password"]'
                        )
                );

            if (
                /ログイン|login/i.test(
                    title
                ) ||
                hasPasswordField ||
                (
                    responsePath.includes(
                        "/mypage/"
                    ) &&
                    !responsePath.endsWith(
                        "/favorite.php"
                    )
                )
            ) {
                throw new Error(
                    "You must be logged in to Melonbooks."
                );
            }

            if (
                !parsedDocument
                    .querySelector(
                        ".my-page.my-circle-page"
                    )
            ) {
                throw new Error(
                    "Could not load the wishlist page."
                );
            }
        }

        static findProductForm(
            parsedDocument,
            productId
        ) {
            const forms =
                parsedDocument
                    .querySelectorAll(
                        ".my-page.my-circle-page .item-list form"
                    );

            for (const form of forms) {
                const deleteControl =
                    form.querySelector(
                        [
                            'a[title="リストから削除"]',
                            'a[onclick*="delete_favorite"]',
                        ].join(", ")
                    );

                if (!deleteControl) {
                    continue;
                }

                const hasProduct =
                    Array.from(
                        form.querySelectorAll(
                            'input[name="product_id"]'
                        )
                    ).some(
                        (input) =>
                            input.value ===
                            productId
                    );

                if (hasProduct) {
                    return form;
                }
            }

            return null;
        }

        static getWishlistProductIds(
            parsedDocument
        ) {
            const productIds =
                new Set();

            const forms =
                parsedDocument
                    .querySelectorAll(
                        ".my-page.my-circle-page .item-list form"
                    );

            for (const form of forms) {
                const deleteControl =
                    form.querySelector(
                        [
                            'a[title="リストから削除"]',
                            'a[onclick*="delete_favorite"]',
                        ].join(", ")
                    );

                if (!deleteControl) {
                    continue;
                }

                const inputs =
                    form.querySelectorAll(
                        'input[name="product_id"]'
                    );

                for (
                    const input
                    of inputs
                ) {
                    if (
                        /^\d+$/.test(
                            input.value
                        )
                    ) {
                        productIds.add(
                            input.value
                        );
                    }
                }
            }

            return Array.from(
                productIds
            );
        }

        static formToUrlSearchParams(
            form
        ) {
            const params =
                new URLSearchParams();

            const formData =
                new FormData(form);

            for (
                const [name, value]
                of formData.entries()
            ) {
                if (
                    typeof value ===
                    "string"
                ) {
                    params.append(
                        name,
                        value
                    );
                }
            }

            return params;
        }

        static isActive(button) {
            return button
                .classList
                .contains(
                    "__active"
                );
        }

        static renderButton(
            button,
            active
        ) {
            const iconContainer =
                button.querySelector(
                    ".fav-button__icon"
                );

            const icon =
                iconContainer
                    ?.querySelector("i");

            const text =
                button.querySelector(
                    ".fav-button__text"
                );

            /*
             * Match Melonbooks' own markup exactly.
             *
             * Inactive:
             *   fa-solid fa-bookmark
             *   fav-button__icon--not-done
             *
             * Active:
             *   fa-solid fa-bookmark favorited
             *   fav-button__icon--done
             */
            if (iconContainer) {
                iconContainer
                    .classList
                    .add(
                        "fav-button__icon--wishlist"
                    );

                iconContainer
                    .classList
                    .toggle(
                        "fav-button__icon--done",
                        active
                    );

                iconContainer
                    .classList
                    .toggle(
                        "fav-button__icon--not-done",
                        !active
                    );
            }

            if (icon) {
                icon.classList.remove(
                    "fa-regular",
                    "far"
                );

                icon.classList.add(
                    "fa-solid",
                    "fa-bookmark"
                );

                icon.classList.toggle(
                    "favorited",
                    active
                );
            }

            button.setAttribute(
                "aria-pressed",
                active
                    ? "true"
                    : "false"
            );

            button.setAttribute(
                "title",
                active
                    ? "ほしいものリストから削除"
                    : "ほしいものリストに追加"
            );

            if (text) {
                const firstLine =
                    "ほしいもの";

                const secondLine =
                    active
                        ? "リストから削除"
                        : "リストに追加";

                const desiredText =
                    firstLine +
                    secondLine;

                const currentText =
                    text.textContent
                        ?.replace(
                            /\s+/g,
                            ""
                        ) || "";

                if (
                    currentText !==
                    desiredText
                ) {
                    const lineBreak =
                        document
                            .createElement(
                                "br"
                            );

                    lineBreak.setAttribute(
                        "role",
                        "none"
                    );

                    text.replaceChildren(
                        document
                            .createTextNode(
                                firstLine
                            ),
                        lineBreak,
                        document
                            .createTextNode(
                                secondLine
                            )
                    );
                }
            }
        }

        static injectStyles() {
            if (
                document.getElementById(
                    "mb-wishlist-toggle-style"
                )
            ) {
                return;
            }

            const style =
                document.createElement(
                    "style"
                );

            style.id =
                "mb-wishlist-toggle-style";

            style.textContent = `
                .mb-wishlist-toggle-busy {
                    opacity: 0.55 !important;
                    cursor: wait !important;
                    pointer-events: none !important;
                }

                #mb-wishlist-toggle-toast {
                    position: fixed;
                    right: 18px;
                    bottom: 18px;
                    z-index: 2147483647;
                    max-width: 360px;
                    padding: 10px 14px;
                    border-radius: 8px;
                    background: #222;
                    color: #fff;
                    font-size: 13px;
                    line-height: 1.4;
                    box-shadow:
                        0 4px 14px
                        rgba(0, 0, 0, 0.25);
                    opacity: 0;
                    transform: translateY(8px);
                    transition:
                        opacity 160ms ease,
                        transform 160ms ease;
                    pointer-events: none;
                }

                #mb-wishlist-toggle-toast.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                #mb-wishlist-toggle-toast.is-error {
                    background: #9f1d1d;
                }
            `;

            document.head.appendChild(
                style
            );
        }

        static showToast(
            message,
            isError = false
        ) {
            let toast =
                document.getElementById(
                    "mb-wishlist-toggle-toast"
                );

            if (!toast) {
                toast =
                    document.createElement(
                        "div"
                    );

                toast.id =
                    "mb-wishlist-toggle-toast";

                toast.setAttribute(
                    "role",
                    "status"
                );

                toast.setAttribute(
                    "aria-live",
                    "polite"
                );

                document.body.appendChild(
                    toast
                );
            }

            toast.textContent =
                message;

            toast.classList.toggle(
                "is-error",
                isError
            );

            toast.classList.remove(
                "is-visible"
            );

            requestAnimationFrame(
                () => {
                    toast.classList.add(
                        "is-visible"
                    );
                }
            );

            window.clearTimeout(
                this.toastTimer
            );

            this.toastTimer =
                window.setTimeout(
                    () => {
                        toast.classList.remove(
                            "is-visible"
                        );
                    },
                    3000
                );
        }
    }

    MelonbooksWishlistToggle.init();
})();