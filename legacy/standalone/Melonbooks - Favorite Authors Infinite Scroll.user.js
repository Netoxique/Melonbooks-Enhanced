// ==UserScript==
// @name         Melonbooks - Favorite Authors Infinite Scroll
// @namespace    https://www.melonbooks.co.jp/
// @version      1.0.1
// @description  Automatically loads every remaining Favorite Authors page and places the favorite and mail controls beside each author name.
// @author       Netoxique
// @match        https://www.melonbooks.co.jp/mypage/favorite_author.php*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
    "use strict";

    class MelonbooksFavoriteAuthorsInfiniteScroll {
        static version = "1.0.1";
        static pageDelayMs = 100;
        static maxRequestAttempts = 2;

        static selectors = Object.freeze({
            page: ".my-circle-page",
            list: ".my-circle-page .circle-list",
            card: ".circle-content",
            row: ".circle-upper",
            name: "h2.page-single-arr-anchor",
            actions: ".btns",
            pagination: ".my-circle-page .pagenavi",
            form: "#form1",
            transactionId: "#form1 input[name='transactionid']"
        });

        static async init() {
            this.pageElement = document.querySelector(this.selectors.page);
            this.listElement = document.querySelector(this.selectors.list);

            if (!this.pageElement || !this.listElement) {
                return;
            }

            this.formElement = document.querySelector(this.selectors.form);
            this.paginationElement = document.querySelector(
                this.selectors.pagination
            );

            this.injectStyles();
            this.formatCards(this.listElement);

            this.loadedAuthorKeys = new Set();

            for (const card of this.getDirectCards(this.listElement)) {
                this.loadedAuthorKeys.add(this.getAuthorKey(card));
            }

            this.loadedAuthorCount = this.loadedAuthorKeys.size;
            this.currentPage = this.getCurrentPage(document);

            this.totalPages = Math.max(
                this.currentPage,
                this.getHighestKnownPage(document)
            );

            document.documentElement.dataset
                .mbFavoriteAuthorsInfiniteScrollVersion = this.version;

            if (
                !this.paginationElement ||
                this.totalPages <= this.currentPage
            ) {
                return;
            }

            this.statusElement = this.createStatusElement();

            this.paginationElement.classList.add(
                "mb-fa-pagination-hidden"
            );

            await this.loadRemainingPages();
        }

        static injectStyles() {
            if (
                document.getElementById(
                    "mb-fa-infinite-scroll-styles"
                )
            ) {
                return;
            }

            const style = document.createElement("style");
            style.id = "mb-fa-infinite-scroll-styles";

            style.textContent = `
                .my-circle-page
                .circle-list
                .circle-content
                .circle-upper.mb-fa-author-row {
                    display: grid !important;
                    grid-template-columns: 25% minmax(0, 75%) !important;
                    align-items: center !important;
                    column-gap: 0 !important;
                    row-gap: 0 !important;
                }

                .my-circle-page
                .circle-list
                .circle-content
                .mb-fa-author-name {
                    grid-column: 1 !important;
                    box-sizing: border-box !important;
                    width: 100% !important;
                    min-width: 0 !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding-right: 12px !important;
                    overflow-wrap: anywhere !important;
                }

                .my-circle-page
                .circle-list
                .circle-content
                .mb-fa-author-actions {
                    grid-column: 2 !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: flex-start !important;
                    flex-wrap: wrap !important;
                    float: none !important;
                    position: static !important;
                    inset: auto !important;
                    transform: none !important;
                    box-sizing: border-box !important;
                    width: 100% !important;
                    min-width: 0 !important;
                    margin: 0 !important;
                    gap: 6px 8px !important;
                }

                .my-circle-page
                .circle-list
                .circle-content
                .mb-fa-author-actions > p {
                    display: block !important;
                    float: none !important;
                    position: static !important;
                    inset: auto !important;
                    transform: none !important;
                    width: auto !important;
                    margin: 0 !important;
                }

                .my-circle-page
                .circle-list
                .circle-content
                .mb-fa-author-actions > p > a {
                    display: inline-flex !important;
                    align-items: center !important;
                    width: auto !important;
                    min-height: 0 !important;
                    white-space: nowrap !important;
                }

                .my-circle-page .mb-fa-pagination-hidden {
                    display: none !important;
                }

                #mb-fa-load-status {
                    box-sizing: border-box;
                    width: 100%;
                    margin: 14px 0 0;
                    padding: 10px 12px;
                    border: 1px solid rgba(127, 127, 127, 0.35);
                    border-radius: 4px;
                    background: rgba(127, 127, 127, 0.08);
                    color: inherit;
                    line-height: 1.5;
                }

                #mb-fa-load-status.mb-fa-loading::before {
                    content: "";
                    display: inline-block;
                    box-sizing: border-box;
                    width: 0.9em;
                    height: 0.9em;
                    margin-right: 0.55em;
                    border: 2px solid currentColor;
                    border-right-color: transparent;
                    border-radius: 50%;
                    vertical-align: -0.08em;
                    animation: mb-fa-spin 0.8s linear infinite;
                }

                #mb-fa-load-status.mb-fa-error {
                    font-weight: 600;
                }

                @keyframes mb-fa-spin {
                    to {
                        transform: rotate(360deg);
                    }
                }
            `;

            document.head.appendChild(style);
        }

        static formatCards(root) {
            const cards = root.matches?.(this.selectors.card)
                ? [root]
                : Array.from(
                    root.querySelectorAll(this.selectors.card)
                );

            for (const card of cards) {
                const row = card.querySelector(
                    this.selectors.row
                );

                const authorName = row?.querySelector(
                    this.selectors.name
                );

                const actions = row?.querySelector(
                    this.selectors.actions
                );

                if (!row || !authorName || !actions) {
                    continue;
                }

                row.classList.add("mb-fa-author-row");
                authorName.classList.add("mb-fa-author-name");
                actions.classList.add("mb-fa-author-actions");

                if (
                    authorName.nextElementSibling !== actions
                ) {
                    authorName.insertAdjacentElement(
                        "afterend",
                        actions
                    );
                }
            }
        }

        static getDirectCards(list) {
            if (!list) {
                return [];
            }

            return Array.from(list.children).filter((child) =>
                child.matches(this.selectors.card)
            );
        }

        static getAuthorKey(card) {
            const action =
                card
                    .querySelector(
                        ".favorite a[onclick*='author_id']"
                    )
                    ?.getAttribute("onclick") || "";

            const idMatch = action.match(
                /["']author_id["']\s*,\s*["'](\d+)["']/i
            );

            if (idMatch) {
                return `id:${idMatch[1]}`;
            }

            const authorLink = card.querySelector(
                `${this.selectors.name} a`
            );

            const href = authorLink?.getAttribute("href");

            if (href) {
                return `href:${
                    new URL(href, location.href).href
                }`;
            }

            const name =
                authorLink?.textContent.trim() ||
                card.textContent.trim();

            return `name:${name}`;
        }

        static getCurrentPage(sourceDocument) {
            const currentLink = sourceDocument.querySelector(
                `${this.selectors.pagination} a.current`
            );

            const currentFromLink =
                this.toPositiveInteger(
                    currentLink?.getAttribute("title") ||
                    currentLink?.textContent
                );

            if (currentFromLink) {
                return currentFromLink;
            }

            const hiddenPage = sourceDocument.querySelector(
                `${this.selectors.form} input[name='pageno']`
            );

            return (
                this.toPositiveInteger(hiddenPage?.value) || 1
            );
        }

        static getHighestKnownPage(sourceDocument) {
            let highestPage =
                this.getCurrentPage(sourceDocument);

            const pagination = sourceDocument.querySelector(
                this.selectors.pagination
            );

            if (!pagination) {
                return highestPage;
            }

            for (
                const element of pagination.querySelectorAll(
                    "a, [onclick]"
                )
            ) {
                const onclick =
                    element.getAttribute("onclick") || "";

                const movePageMatch = onclick.match(
                    /movePage\s*\(\s*["']?(\d+)/i
                );

                if (movePageMatch) {
                    highestPage = Math.max(
                        highestPage,
                        Number(movePageMatch[1])
                    );
                }

                const titlePage =
                    this.toPositiveInteger(
                        element.getAttribute("title")
                    );

                if (titlePage) {
                    highestPage = Math.max(
                        highestPage,
                        titlePage
                    );
                }

                const href = element.getAttribute("href");

                if (href && href !== "#") {
                    try {
                        const hrefPage =
                            this.toPositiveInteger(
                                new URL(
                                    href,
                                    location.href
                                ).searchParams.get("pageno")
                            );

                        if (hrefPage) {
                            highestPage = Math.max(
                                highestPage,
                                hrefPage
                            );
                        }
                    } catch (error) {
                        console.debug(
                            "[Melonbooks Favorite Authors] " +
                            "Ignored invalid pagination URL.",
                            error
                        );
                    }
                }
            }

            return highestPage;
        }

        static toPositiveInteger(value) {
            const number = Number.parseInt(
                String(value || "").trim(),
                10
            );

            return (
                Number.isInteger(number) && number > 0
                    ? number
                    : 0
            );
        }

        static createStatusElement() {
            const existingStatus =
                document.getElementById(
                    "mb-fa-load-status"
                );

            if (existingStatus) {
                return existingStatus;
            }

            const status = document.createElement("div");
            status.id = "mb-fa-load-status";
            status.className = "mb-fa-loading";
            status.setAttribute("role", "status");
            status.setAttribute("aria-live", "polite");

            this.listElement.insertAdjacentElement(
                "afterend",
                status
            );

            return status;
        }

        static setStatus(
            message,
            state = "loading"
        ) {
            if (!this.statusElement) {
                return;
            }

            this.statusElement.classList.toggle(
                "mb-fa-loading",
                state === "loading"
            );

            this.statusElement.classList.toggle(
                "mb-fa-error",
                state === "error"
            );

            this.statusElement.textContent = message;
        }

        static async loadRemainingPages() {
            let pageNumber = this.currentPage + 1;
            let loadedPageCount = 1;

            while (pageNumber <= this.totalPages) {
                this.setStatus(
                    `Loading favorite authors page ` +
                    `${pageNumber} of ${this.totalPages}. ` +
                    `${this.loadedAuthorCount} authors loaded.`
                );

                let pageDocument;

                try {
                    pageDocument =
                        await this.fetchPageDocument(
                            pageNumber
                        );
                } catch (error) {
                    console.error(
                        "[Melonbooks Favorite Authors] " +
                        `Could not load page ${pageNumber}.`,
                        error
                    );

                    this.paginationElement?.classList.remove(
                        "mb-fa-pagination-hidden"
                    );

                    this.setStatus(
                        `Automatic loading stopped at page ` +
                        `${pageNumber}. ` +
                        `${this.loadedAuthorCount} authors ` +
                        `were loaded. ` +
                        "The original page controls have " +
                        "been restored.",
                        "error"
                    );

                    return;
                }

                this.updateTransactionId(pageDocument);

                this.totalPages = Math.max(
                    this.totalPages,
                    this.getHighestKnownPage(pageDocument)
                );

                const pageList =
                    pageDocument.querySelector(
                        this.selectors.list
                    );

                const fragment =
                    document.createDocumentFragment();

                let addedOnThisPage = 0;

                for (
                    const sourceCard of
                    this.getDirectCards(pageList)
                ) {
                    const card = document.importNode(
                        sourceCard,
                        true
                    );

                    const authorKey =
                        this.getAuthorKey(card);

                    if (
                        this.loadedAuthorKeys.has(authorKey)
                    ) {
                        continue;
                    }

                    this.loadedAuthorKeys.add(authorKey);

                    card.dataset.mbFaSourcePage =
                        String(pageNumber);

                    this.formatCards(card);
                    fragment.appendChild(card);

                    addedOnThisPage += 1;
                }

                this.listElement.appendChild(fragment);
                this.loadedAuthorCount += addedOnThisPage;
                loadedPageCount += 1;
                pageNumber += 1;

                if (pageNumber <= this.totalPages) {
                    await this.delay(
                        this.pageDelayMs
                    );
                }
            }

            this.setStatus(
                `All ${this.loadedAuthorCount} favorite ` +
                `authors were loaded from ` +
                `${loadedPageCount} pages.`,
                "complete"
            );
        }

        static async fetchPageDocument(pageNumber) {
            let postError = null;

            if (this.formElement) {
                try {
                    const postDocument =
                        await this.requestPageByPost(
                            pageNumber
                        );

                    this.assertExpectedPage(
                        postDocument,
                        pageNumber
                    );

                    return postDocument;
                } catch (error) {
                    postError = error;

                    console.warn(
                        "[Melonbooks Favorite Authors] " +
                        `POST loading failed for page ` +
                        `${pageNumber}. Trying GET.`,
                        error
                    );
                }
            }

            try {
                const getDocument =
                    await this.requestPageByGet(
                        pageNumber
                    );

                this.assertExpectedPage(
                    getDocument,
                    pageNumber
                );

                return getDocument;
            } catch (getError) {
                const combinedError = new Error(
                    `Both POST and GET failed for ` +
                    `favorite authors page ${pageNumber}.`
                );

                combinedError.cause = {
                    postError,
                    getError
                };

                throw combinedError;
            }
        }

        static async requestPageByPost(pageNumber) {
            const action =
                this.formElement.getAttribute("action") ||
                location.href;

            const requestUrl = new URL(
                action,
                location.href
            );

            const body = new URLSearchParams();

            for (
                const [name, value] of
                new FormData(this.formElement).entries()
            ) {
                body.append(name, String(value));
            }

            body.set("mode", "");
            body.set("author_id", "");
            body.set("pageno", String(pageNumber));

            return this.fetchHtmlDocument(
                requestUrl,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/x-www-form-urlencoded;" +
                            "charset=UTF-8"
                    },
                    body: body.toString()
                }
            );
        }

        static async requestPageByGet(pageNumber) {
            const requestUrl = new URL(location.href);

            requestUrl.searchParams.set(
                "pageno",
                String(pageNumber)
            );

            return this.fetchHtmlDocument(
                requestUrl,
                {
                    method: "GET"
                }
            );
        }

        static async fetchHtmlDocument(
            requestUrl,
            options
        ) {
            let lastError = null;

            for (
                let attempt = 1;
                attempt <= this.maxRequestAttempts;
                attempt += 1
            ) {
                try {
                    const response = await fetch(
                        requestUrl.href,
                        {
                            ...options,
                            credentials: "same-origin",
                            cache: "no-store",
                            redirect: "follow",
                            headers: {
                                Accept:
                                    "text/html," +
                                    "application/xhtml+xml",
                                ...(options.headers || {})
                            }
                        }
                    );

                    if (!response.ok) {
                        throw new Error(
                            `HTTP ${response.status} ` +
                            response.statusText
                        );
                    }

                    const html = await response.text();

                    const pageDocument =
                        new DOMParser().parseFromString(
                            html,
                            "text/html"
                        );

                    if (
                        !pageDocument.querySelector(
                            this.selectors.list
                        )
                    ) {
                        throw new Error(
                            "The response did not contain " +
                            "the Favorite Authors list."
                        );
                    }

                    return pageDocument;
                } catch (error) {
                    lastError = error;

                    if (
                        attempt <
                        this.maxRequestAttempts
                    ) {
                        await this.delay(
                            350 * attempt
                        );
                    }
                }
            }

            throw (
                lastError ||
                new Error(
                    "Unknown page-loading error."
                )
            );
        }

        static assertExpectedPage(
            pageDocument,
            expectedPage
        ) {
            const actualPage =
                this.getCurrentPage(pageDocument);

            if (actualPage !== expectedPage) {
                throw new Error(
                    `Requested page ${expectedPage}, ` +
                    `but the server returned page ` +
                    `${actualPage}.`
                );
            }
        }

        static updateTransactionId(pageDocument) {
            const nextTransactionId =
                pageDocument.querySelector(
                    this.selectors.transactionId
                )?.value;

            const currentTransactionId =
                document.querySelector(
                    this.selectors.transactionId
                );

            if (
                nextTransactionId &&
                currentTransactionId
            ) {
                currentTransactionId.value =
                    nextTransactionId;
            }
        }

        static delay(milliseconds) {
            return new Promise((resolve) =>
                window.setTimeout(
                    resolve,
                    milliseconds
                )
            );
        }
    }

    MelonbooksFavoriteAuthorsInfiniteScroll
        .init()
        .catch((error) => {
            console.error(
                "[Melonbooks Favorite Authors] " +
                "Initialization failed.",
                error
            );
        });
})();