import { injectStyle } from '../core/styles.js';

/**
 * Module: Favorite Author Toggle
 * Allows author heart buttons on Melonbooks product pages to add or remove authors from favorites with status notifications.
 */

const BUTTON_SELECTOR = 'a.favorite_author.fav-button-short__icon';
const FAVORITE_AUTHOR_PAGE_PATH = '/mypage/favorite_author.php';
const MAX_SCAN_PAGES = 50;
const PAGE_FETCH_BATCH_SIZE = 4;
const REQUEST_TIMEOUT_MS = 15000;
const BUSY_ATTR = 'data-mb-author-favorite-busy';
const BUSY_CLASS = 'mb-author-favorite-busy';
const TOAST_ID = 'mb-author-favorite-toast';

const AUTHOR_TOGGLE_CSS = `
  .${BUSY_CLASS} {
    opacity: 0.55 !important;
    cursor: wait !important;
    pointer-events: none !important;
  }

  #${TOAST_ID} {
    position: fixed;
    right: 18px;
    bottom: 18px;
    z-index: 2147483647;
    max-width: 320px;
    padding: 10px 14px;
    border-radius: 8px;
    background: #222;
    color: #fff;
    font-size: 13px;
    line-height: 1.4;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    opacity: 0;
    transform: translateY(8px);
    transition:
      opacity 160ms ease,
      transform 160ms ease;
    pointer-events: none;
  }

  #${TOAST_ID}.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  #${TOAST_ID}.is-error {
    background: #9f1d1d;
  }
`;

export const FavoriteAuthorToggleModule = {
  id: 'favorite-author-toggle',
  name: 'Favorite Author Toggle',
  lifecycle: 'document-start',

  matches(context) {
    return context.route === 'melonbooks-product' || context.location.pathname.startsWith('/detail/');
  },

  init(context) {
    injectStyle('favorite-author-toggle', AUTHOR_TOGGLE_CSS);

    const authorCache = new Map();
    let toastTimer = null;

    function isProductDetailPage() {
      return context.location.pathname.startsWith('/detail/');
    }

    function isFavorited(button) {
      if (button.classList.contains('fav-button-short__icon--not-done')) {
        return false;
      }
      return button.classList.contains('favorited') || button.classList.contains('fav-button-short__icon--done');
    }

    function getAuthorName(button) {
      const directName = button.dataset.authorname || button.getAttribute('data-authorname') || button.getAttribute('data-authorName');
      if (directName?.trim()) return directName.trim();

      const infoCell = button.closest('.product_info, td, tr');
      const authorLink = infoCell?.querySelector('a[href*="text_type=author"]');
      return authorLink?.textContent?.trim() || '';
    }

    function getProductId() {
      const queryProductId = new URL(context.location.href).searchParams.get('product_id');
      if (queryProductId?.trim()) return queryProductId.trim();

      const input = document.querySelector('input[name="product_id"]');
      return input?.value?.trim() || '';
    }

    function getProductTransactionId() {
      const selectors = [
        '#form_product input[name="transactionid"]',
        'form[data-page="detail"] input[name="transactionid"]',
        'input[name="transactionid"]'
      ];
      for (const selector of selectors) {
        const value = document.querySelector(selector)?.value?.trim();
        if (value) return value;
      }

      const pageHtml = document.documentElement?.innerHTML || '';
      const match = pageHtml.match(/\btransactionid\s*=\s*['"]([^'"]+)['"]/);
      return match?.[1]?.trim() || '';
    }

    function normalizeName(value) {
      return String(value || '').replace(/\s+/g, ' ').trim();
    }

    function getMatchingAuthorButtons(authorName) {
      const normalizedAuthorName = normalizeName(authorName);
      return Array.from(document.querySelectorAll(BUTTON_SELECTOR)).filter((button) => {
        return normalizeName(getAuthorName(button)) === normalizedAuthorName;
      });
    }

    function setBusy(button) {
      button.setAttribute(BUSY_ATTR, '1');
      button.classList.add(BUSY_CLASS);
      button.setAttribute('aria-busy', 'true');
    }

    function resetBusy(button) {
      button.removeAttribute(BUSY_ATTR);
      button.classList.remove(BUSY_CLASS);
      button.removeAttribute('aria-busy');
    }

    function setAuthorButtonsBusy(authorName, isBusy) {
      getMatchingAuthorButtons(authorName).forEach((button) => {
        if (isBusy) setBusy(button);
        else resetBusy(button);
      });
    }

    function markAuthorAsFavorited(authorName) {
      getMatchingAuthorButtons(authorName).forEach((button) => {
        button.classList.remove('favorite', 'fa-regular', 'fav-button-short--done', 'fav-button-short__icon--not-done');
        button.classList.add(
          'favorited',
          'fa-solid',
          'fa-heart',
          'favorite_author',
          'fav-button-short__icon',
          'fav-button-short__icon--done'
        );
        if (!button.hasAttribute('href')) button.setAttribute('href', '#');
        button.setAttribute('aria-hidden', 'true');
        button.setAttribute('aria-pressed', 'true');
        button.setAttribute('title', 'お気に入り作家から解除');
        resetBusy(button);
      });
    }

    function markAuthorAsNotFavorited(authorName) {
      getMatchingAuthorButtons(authorName).forEach((button) => {
        button.classList.remove('favorite', 'favorited', 'fa-regular', 'fav-button-short--done', 'fav-button-short__icon--done');
        button.classList.add(
          'fa-solid',
          'fa-heart',
          'favorite_author',
          'fav-button-short__icon',
          'fav-button-short__icon--not-done'
        );
        if (!button.hasAttribute('href')) button.setAttribute('href', '#');
        button.setAttribute('aria-hidden', 'true');
        button.setAttribute('aria-pressed', 'false');
        button.setAttribute('title', 'お気に入り作家に追加');
        resetBusy(button);
      });
    }

    function markButtons() {
      document.querySelectorAll(BUTTON_SELECTOR).forEach((button) => {
        const favorited = isFavorited(button);
        button.setAttribute('aria-pressed', String(favorited));
        button.setAttribute('title', favorited ? 'お気に入り作家から解除' : 'お気に入り作家に追加');
      });
    }

    function looksLikeLoginPage(responseText) {
      return (
        responseText.includes('ログイン') &&
        (responseText.includes('name="login_email"') ||
          responseText.includes('name="login_pass"') ||
          responseText.includes('パスワード'))
      );
    }

    function redirectToLogin() {
      const returnUrl = `${context.location.origin}${context.location.pathname}${context.location.search}`;
      context.location.href = `/mypage/?ru=${encodeURIComponent(returnUrl)}`;
    }

    async function fetchText(url, options) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status} while requesting ${url}`);
        return await response.text();
      } finally {
        clearTimeout(timeoutId);
      }
    }

    function showToast(message, isError = false, durationMs = 2200) {
      let toast = document.getElementById(TOAST_ID);
      if (!toast) {
        toast = document.createElement('div');
        toast.id = TOAST_ID;
        document.documentElement.appendChild(toast);
      }
      toast.textContent = message;
      toast.classList.toggle('is-error', Boolean(isError));
      toast.classList.add('is-visible');

      clearTimeout(toastTimer);
      if (durationMs > 0) {
        toastTimer = setTimeout(() => {
          toast.classList.remove('is-visible');
        }, durationMs);
      }
    }

    function isSuccessfulStatus(status) {
      return status === true || status === 1 || status === '1' || status === 'true';
    }

    async function submitAddFavoriteAuthor(authorName) {
      const productId = getProductId();
      const transactionId = getProductTransactionId();

      if (!productId) throw new Error('Could not find the product ID on the product page.');
      if (!transactionId) throw new Error('Could not find the product-page transaction ID.');

      const body = new URLSearchParams();
      body.set('favorite_author_name', authorName);
      body.set('product_id', productId);
      body.set('mode', 'regist_author_ajax');
      body.set('transactionid', transactionId);

      const url = new URL(context.location.pathname, context.location.origin);
      url.searchParams.set('product_id', productId);

      const responseText = await fetchText(url.toString(), {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: body.toString()
      });

      if (looksLikeLoginPage(responseText)) {
        redirectToLogin();
        throw new Error('The add request was redirected to login.');
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText.trim());
      } catch {
        throw new Error('Melonbooks returned an invalid response while adding the author.');
      }

      if (!isSuccessfulStatus(responseData?.status)) {
        const message = String(responseData?.message || '').trim();
        if (message.includes('ログイン')) {
          redirectToLogin();
        }
        throw new Error(message || 'Melonbooks did not confirm the author favorite.');
      }
    }

    async function fetchFavoriteAuthorPage(pageNumber) {
      const url = new URL(FAVORITE_AUTHOR_PAGE_PATH, context.location.origin);
      if (pageNumber > 1) {
        url.searchParams.set('pageno', String(pageNumber));
      }
      const text = await fetchText(url.toString(), {
        method: 'GET',
        credentials: 'same-origin'
      });
      if (looksLikeLoginPage(text)) {
        redirectToLogin();
        throw new Error('The favorite-author page request was redirected to login.');
      }
      return new DOMParser().parseFromString(text, 'text/html');
    }

    function parseFavoriteAuthorPage(doc, authorName) {
      const normalizedAuthorName = normalizeName(authorName);
      const transactionId =
        doc.querySelector('form#form1 input[name="transactionid"]')?.value ||
        doc.querySelector('input[name="transactionid"]')?.value ||
        '';

      const entries = doc.querySelectorAll('.circle-content');
      for (const entry of entries) {
        const nameLink = entry.querySelector('.page-single-arr-anchor a, h2 a');
        const entryAuthorName = normalizeName(nameLink?.textContent || '');

        if (entryAuthorName !== normalizedAuthorName) continue;

        const deleteLink = entry.querySelector('a[onclick*="delete_favorite_author"]');
        const onclick = deleteLink?.getAttribute('onclick') || '';
        const authorIdMatch = onclick.match(
          /setModeAndSubmit\(\s*['"]delete_favorite_author['"]\s*,\s*['"]author_id['"]\s*,\s*['"]([^'"]+)['"]\s*\)/
        );

        if (!authorIdMatch) return null;

        return {
          authorName: entryAuthorName,
          authorId: authorIdMatch[1],
          transactionId
        };
      }
      return null;
    }

    function getMaxPage(doc) {
      let maxPage = 1;
      doc.querySelectorAll('.pagenavi a').forEach((link) => {
        const values = [
          link.getAttribute('title'),
          link.getAttribute('href'),
          link.getAttribute('onclick'),
          link.textContent
        ];
        values.forEach((value) => {
          const matches = String(value || '').match(/\d+/g);
          if (!matches) return;
          matches.forEach((match) => {
            const num = Number(match);
            if (Number.isFinite(num) && num > maxPage) maxPage = num;
          });
        });
      });
      return maxPage;
    }

    async function findFavoriteAuthorData(authorName) {
      const normalizedAuthorName = normalizeName(authorName);
      if (authorCache.has(normalizedAuthorName)) {
        return authorCache.get(normalizedAuthorName);
      }

      const firstPageDoc = await fetchFavoriteAuthorPage(1);
      const firstPageMatch = parseFavoriteAuthorPage(firstPageDoc, authorName);
      if (firstPageMatch) {
        authorCache.set(normalizedAuthorName, firstPageMatch);
        return firstPageMatch;
      }

      const maxPage = Math.min(getMaxPage(firstPageDoc), MAX_SCAN_PAGES);

      for (let startPage = 2; startPage <= maxPage; startPage += PAGE_FETCH_BATCH_SIZE) {
        const pages = [];
        for (let page = startPage; page <= maxPage && page < startPage + PAGE_FETCH_BATCH_SIZE; page += 1) {
          pages.push(page);
        }

        const results = await Promise.all(
          pages.map(async (page) => {
            try {
              const doc = await fetchFavoriteAuthorPage(page);
              return parseFavoriteAuthorPage(doc, authorName);
            } catch (err) {
              console.warn(`[Melonbooks Favorite Author Remover] Failed to scan page ${page}:`, err);
              return null;
            }
          })
        );

        const match = results.find(Boolean);
        if (match) {
          authorCache.set(normalizedAuthorName, match);
          return match;
        }
      }
      return null;
    }

    async function submitDeleteFavoriteAuthor(favoriteData) {
      const body = new URLSearchParams();
      body.set('transactionid', favoriteData.transactionId);
      body.set('mode', 'delete_favorite_author');
      body.set('author_id', favoriteData.authorId);
      body.set('orderby', '');
      body.set('disp_number', '');
      body.set('pageno', '1');

      const responseText = await fetchText(
        new URL(FAVORITE_AUTHOR_PAGE_PATH, context.location.origin).toString(),
        {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          body: body.toString()
        }
      );

      if (looksLikeLoginPage(responseText)) {
        redirectToLogin();
        throw new Error('The delete request was redirected to login.');
      }
    }

    async function setFavoriteAuthor(button, suppliedAuthorName, shouldAdd) {
      const authorName = suppliedAuthorName || getAuthorName(button);
      if (!authorName) {
        throw new Error('Could not read author name from button.');
      }

      setAuthorButtonsBusy(authorName, true);
      showToast(
        shouldAdd ? `Adding ${authorName} to favorites...` : `Removing ${authorName} from favorites...`,
        false,
        0
      );

      try {
        if (shouldAdd) {
          await submitAddFavoriteAuthor(authorName);
          markAuthorAsFavorited(authorName);
          authorCache.delete(normalizeName(authorName));
          showToast('Author added to favorites.', false);
          return;
        }

        const favoriteData = await findFavoriteAuthorData(authorName);
        if (!favoriteData?.authorId || !favoriteData.transactionId) {
          throw new Error(`Could not find author_id for "${authorName}" on favorite authors page.`);
        }

        await submitDeleteFavoriteAuthor(favoriteData);
        markAuthorAsNotFavorited(authorName);
        authorCache.delete(normalizeName(authorName));
        showToast('Author removed from favorites.', false);
      } finally {
        setAuthorButtonsBusy(authorName, false);
      }
    }

    function handleClick(event) {
      const target = event.target instanceof Element ? event.target : null;
      const button = target?.closest(BUTTON_SELECTOR);

      if (!button || !isProductDetailPage()) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (button.getAttribute(BUSY_ATTR) === '1') return;

      const authorName = getAuthorName(button);
      const shouldAdd = !isFavorited(button);

      setFavoriteAuthor(button, authorName, shouldAdd).catch((error) => {
        console.error('[Melonbooks Favorite Author Remover]', error);
        if (authorName) {
          setAuthorButtonsBusy(authorName, false);
        } else {
          resetBusy(button);
        }
        showToast(
          shouldAdd ? 'Could not add author to favorites.' : 'Could not remove author from favorites.',
          true
        );
      });
    }

    document.addEventListener('click', handleClick, true);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', markButtons, { once: true });
    } else {
      markButtons();
    }
  }
};
