import { injectStyle } from '../core/styles.js';

/**
 * Module: Favorite Authors Infinite Scroll
 * Automatically loads every remaining Favorite Authors page and places the favorite and mail controls beside each author name.
 */

const SELECTORS = Object.freeze({
  page: '.my-circle-page',
  list: '.my-circle-page .circle-list',
  card: '.circle-content',
  row: '.circle-upper',
  name: 'h2.page-single-arr-anchor',
  actions: '.btns',
  pagination: '.my-circle-page .pagenavi',
  form: '#form1',
  transactionId: "#form1 input[name='transactionid']"
});

const PAGE_DELAY_MS = 100;
const MAX_REQUEST_ATTEMPTS = 2;

const FA_STYLES = `
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

export const FavoriteAuthorsInfiniteScrollModule = {
  id: 'favorite-authors-infinite-scroll',
  name: 'Favorite Authors Infinite Scroll',
  lifecycle: 'document-idle',

  matches(context) {
    return context.route === 'melonbooks-favorite-authors' || context.location.pathname.includes('favorite_author.php');
  },

  async init(context) {
    const pageElement = document.querySelector(SELECTORS.page);
    const listElement = document.querySelector(SELECTORS.list);

    if (!pageElement || !listElement) {
      return;
    }

    const formElement = document.querySelector(SELECTORS.form);
    const paginationElement = document.querySelector(SELECTORS.pagination);

    injectStyle('favorite-authors-infinite-scroll', FA_STYLES);

    function formatCards(root) {
      const cards = root.matches?.(SELECTORS.card) ? [root] : Array.from(root.querySelectorAll(SELECTORS.card));

      for (const card of cards) {
        const row = card.querySelector(SELECTORS.row);
        const authorName = row?.querySelector(SELECTORS.name);
        const actions = row?.querySelector(SELECTORS.actions);

        if (!row || !authorName || !actions) continue;

        row.classList.add('mb-fa-author-row');
        authorName.classList.add('mb-fa-author-name');
        actions.classList.add('mb-fa-author-actions');

        if (authorName.nextElementSibling !== actions) {
          authorName.insertAdjacentElement('afterend', actions);
        }
      }
    }

    function getDirectCards(list) {
      if (!list) return [];
      return Array.from(list.children).filter((child) => child.matches(SELECTORS.card));
    }

    function getAuthorKey(card) {
      const action = card.querySelector(".favorite a[onclick*='author_id']")?.getAttribute('onclick') || '';
      const idMatch = action.match(/["']author_id["']\s*,\s*["'](\d+)["']/i);
      if (idMatch) return `id:${idMatch[1]}`;

      const authorLink = card.querySelector(`${SELECTORS.name} a`);
      const href = authorLink?.getAttribute('href');
      if (href) return `href:${new URL(href, context.location.href).href}`;

      const name = authorLink?.textContent.trim() || card.textContent.trim();
      return `name:${name}`;
    }

    function toPositiveInteger(value) {
      const num = Number.parseInt(String(value || '').trim(), 10);
      return Number.isInteger(num) && num > 0 ? num : 0;
    }

    function getCurrentPage(sourceDoc) {
      const currentLink = sourceDoc.querySelector(`${SELECTORS.pagination} a.current`);
      const currentFromLink = toPositiveInteger(currentLink?.getAttribute('title') || currentLink?.textContent);
      if (currentFromLink) return currentFromLink;

      const hiddenPage = sourceDoc.querySelector(`${SELECTORS.form} input[name='pageno']`);
      return toPositiveInteger(hiddenPage?.value) || 1;
    }

    function getHighestKnownPage(sourceDoc) {
      let highestPage = getCurrentPage(sourceDoc);
      const pagination = sourceDoc.querySelector(SELECTORS.pagination);
      if (!pagination) return highestPage;

      for (const el of pagination.querySelectorAll('a, [onclick]')) {
        const onclick = el.getAttribute('onclick') || '';
        const movePageMatch = onclick.match(/movePage\s*\(\s*["']?(\d+)/i);
        if (movePageMatch) {
          highestPage = Math.max(highestPage, Number(movePageMatch[1]));
        }

        const titlePage = toPositiveInteger(el.getAttribute('title'));
        if (titlePage) highestPage = Math.max(highestPage, titlePage);

        const href = el.getAttribute('href');
        if (href && href !== '#') {
          try {
            const hrefPage = toPositiveInteger(new URL(href, context.location.href).searchParams.get('pageno'));
            if (hrefPage) highestPage = Math.max(highestPage, hrefPage);
          } catch {}
        }
      }

      return highestPage;
    }

    function createStatusElement() {
      const existing = document.getElementById('mb-fa-load-status');
      if (existing) return existing;

      const status = document.createElement('div');
      status.id = 'mb-fa-load-status';
      status.className = 'mb-fa-loading';
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      listElement.insertAdjacentElement('afterend', status);
      return status;
    }

    function setStatus(statusElement, message, state = 'loading') {
      if (!statusElement) return;
      statusElement.classList.toggle('mb-fa-loading', state === 'loading');
      statusElement.classList.toggle('mb-fa-error', state === 'error');
      statusElement.textContent = message;
    }

    function delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function fetchHtmlDocument(requestUrl, options) {
      let lastError = null;

      for (let attempt = 1; attempt <= MAX_REQUEST_ATTEMPTS; attempt += 1) {
        try {
          const response = await fetch(requestUrl.href, {
            ...options,
            credentials: 'same-origin',
            cache: 'no-store',
            redirect: 'follow',
            headers: {
              Accept: 'text/html,application/xhtml+xml',
              ...(options.headers || {})
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
          }

          const html = await response.text();
          const pageDoc = new DOMParser().parseFromString(html, 'text/html');

          if (!pageDoc.querySelector(SELECTORS.list)) {
            throw new Error('The response did not contain the Favorite Authors list.');
          }

          return pageDoc;
        } catch (err) {
          lastError = err;
          if (attempt < MAX_REQUEST_ATTEMPTS) {
            await delay(350 * attempt);
          }
        }
      }

      throw lastError || new Error('Unknown page-loading error.');
    }

    function assertExpectedPage(pageDoc, expectedPage) {
      const actualPage = getCurrentPage(pageDoc);
      if (actualPage !== expectedPage) {
        throw new Error(`Requested page ${expectedPage}, but the server returned page ${actualPage}.`);
      }
    }

    async function requestPageByPost(pageNumber) {
      const action = formElement.getAttribute('action') || context.location.href;
      const requestUrl = new URL(action, context.location.href);
      const body = new URLSearchParams();

      for (const [name, value] of new FormData(formElement).entries()) {
        body.append(name, String(value));
      }

      body.set('mode', '');
      body.set('author_id', '');
      body.set('pageno', String(pageNumber));

      return fetchHtmlDocument(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: body.toString()
      });
    }

    async function requestPageByGet(pageNumber) {
      const requestUrl = new URL(context.location.href);
      requestUrl.searchParams.set('pageno', String(pageNumber));
      return fetchHtmlDocument(requestUrl, { method: 'GET' });
    }

    async function fetchPageDocument(pageNumber) {
      let postError = null;

      if (formElement) {
        try {
          const postDoc = await requestPageByPost(pageNumber);
          assertExpectedPage(postDoc, pageNumber);
          return postDoc;
        } catch (err) {
          postError = err;
          console.warn(`[Melonbooks Favorite Authors] POST loading failed for page ${pageNumber}. Trying GET.`, err);
        }
      }

      try {
        const getDoc = await requestPageByGet(pageNumber);
        assertExpectedPage(getDoc, pageNumber);
        return getDoc;
      } catch (getErr) {
        const combined = new Error(`Both POST and GET failed for favorite authors page ${pageNumber}.`);
        combined.cause = { postError, getErr };
        throw combined;
      }
    }

    function updateTransactionId(pageDoc) {
      const nextTransactionId = pageDoc.querySelector(SELECTORS.transactionId)?.value;
      const currentTransactionId = document.querySelector(SELECTORS.transactionId);
      if (nextTransactionId && currentTransactionId) {
        currentTransactionId.value = nextTransactionId;
      }
    }

    formatCards(listElement);

    const loadedAuthorKeys = new Set();
    for (const card of getDirectCards(listElement)) {
      loadedAuthorKeys.add(getAuthorKey(card));
    }

    let loadedAuthorCount = loadedAuthorKeys.size;
    const currentPage = getCurrentPage(document);
    let totalPages = Math.max(currentPage, getHighestKnownPage(document));

    if (!paginationElement || totalPages <= currentPage) {
      return;
    }

    const statusElement = createStatusElement();
    paginationElement.classList.add('mb-fa-pagination-hidden');

    let pageNumber = currentPage + 1;
    let loadedPageCount = 1;

    while (pageNumber <= totalPages) {
      setStatus(
        statusElement,
        `Loading favorite authors page ${pageNumber} of ${totalPages}. ${loadedAuthorCount} authors loaded.`
      );

      let pageDoc;
      try {
        pageDoc = await fetchPageDocument(pageNumber);
      } catch (err) {
        console.error(`[Melonbooks Favorite Authors] Could not load page ${pageNumber}.`, err);
        paginationElement.classList.remove('mb-fa-pagination-hidden');
        setStatus(
          statusElement,
          `Automatic loading stopped at page ${pageNumber}. ${loadedAuthorCount} authors were loaded. The original page controls have been restored.`,
          'error'
        );
        return;
      }

      updateTransactionId(pageDoc);
      totalPages = Math.max(totalPages, getHighestKnownPage(pageDoc));

      const pageList = pageDoc.querySelector(SELECTORS.list);
      const fragment = document.createDocumentFragment();
      let addedOnThisPage = 0;

      for (const sourceCard of getDirectCards(pageList)) {
        const card = document.importNode(sourceCard, true);
        const authorKey = getAuthorKey(card);

        if (loadedAuthorKeys.has(authorKey)) continue;

        loadedAuthorKeys.add(authorKey);
        card.dataset.mbFaSourcePage = String(pageNumber);
        formatCards(card);
        fragment.appendChild(card);
        addedOnThisPage += 1;
      }

      listElement.appendChild(fragment);
      loadedAuthorCount += addedOnThisPage;
      loadedPageCount += 1;
      pageNumber += 1;

      if (pageNumber <= totalPages) {
        await delay(PAGE_DELAY_MS);
      }
    }

    setStatus(statusElement, `All ${loadedAuthorCount} favorite authors were loaded from ${loadedPageCount} pages.`, 'complete');
  }
};
