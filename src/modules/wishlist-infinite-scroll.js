import { injectStyle } from '../core/styles.js';

/**
 * Module: Wishlist Infinite Scroll
 * Automatically loads additional wishlist pages into the current item list.
 */

const PRELOAD_DISTANCE = 1200;

const WISHLIST_IS_CSS = `
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

export const WishlistInfiniteScrollModule = {
  id: 'wishlist-infinite-scroll',
  name: 'Wishlist Infinite Scroll',
  lifecycle: 'document-idle',

  matches(context) {
    return context.route === 'melonbooks-wishlist' || context.location.pathname.includes('favorite.php');
  },

  init(context) {
    const list = document.querySelector('.item-list > ul');
    const form = document.querySelector('#form1');
    const paginator = document.querySelector('.pagenavi');

    if (!list || !form) {
      return;
    }

    injectStyle('wishlist-infinite-layout', WISHLIST_IS_CSS);

    function removeTrailingClearElements() {
      for (const child of [...list.children]) {
        if (child.tagName === 'LI') continue;
        const style = getComputedStyle(child);
        const looksLikeClear =
          child.matches('br[clear], .clear, .clearfix, .clearboth, .clear-both') ||
          style.clear === 'both' ||
          style.clear === 'left' ||
          style.clear === 'right';

        if (looksLikeClear) {
          child.remove();
        }
      }
    }

    removeTrailingClearElements();

    function readCurrentPage(doc) {
      const formPage = doc.querySelector('#form1 input[name="pageno"]')?.value;
      const current = doc.querySelector('.pagenavi a.current');
      const visiblePage = current?.getAttribute('title') || current?.textContent?.trim();

      return Math.max(1, Number.parseInt(formPage || visiblePage || '1', 10) || 1);
    }

    function readMaxPage(doc) {
      const pages = [readCurrentPage(doc)];
      for (const link of doc.querySelectorAll('.pagenavi a')) {
        const title = Number.parseInt(link.getAttribute('title') || '', 10);
        if (Number.isFinite(title)) pages.push(title);

        const match = (link.getAttribute('onclick') || '').match(/movePage\s*\(\s*['"]?(\d+)/i);
        if (match) pages.push(Number.parseInt(match[1], 10));
      }
      return Math.max(...pages);
    }

    function productKey(li) {
      const className = [...li.classList].find((name) => /^product_\d+$/.test(name));
      if (className) return className;

      const link = li.querySelector('a[href*="product_id="]');
      if (!link) return null;

      try {
        const id = new URL(link.getAttribute('href'), context.location.href).searchParams.get('product_id');
        return id ? `product_${id}` : null;
      } catch {
        return null;
      }
    }

    let currentPage = readCurrentPage(document);
    let maxPage = readMaxPage(document);
    let loading = false;
    let finished = currentPage >= maxPage;
    let retryBlocked = false;

    const loadedPages = new Set([currentPage]);
    const productKeys = new Set(
      [...list.children]
        .filter((el) => el.tagName === 'LI')
        .map((li) => productKey(li))
        .filter(Boolean)
    );

    const status = document.createElement('div');
    status.id = 'mb-wishlist-infinite-scroll-status';
    status.setAttribute('aria-live', 'polite');
    status.style.cssText = 'text-align:center;padding:14px 8px;font-size:12px;opacity:.75;min-height:16px';

    document.querySelector('.item-list')?.after(status);

    let observer = null;

    function finish() {
      finished = true;
      loading = false;
      observer?.disconnect();

      if (paginator) {
        paginator.hidden = true;
      }

      status.onclick = null;
      status.style.cursor = '';
      status.textContent = 'All wishlist items loaded.';
    }

    if (finished) {
      finish();
      return;
    }

    if (paginator) {
      paginator.hidden = true;
    }

    function requestBody(page) {
      const params = new URLSearchParams();
      for (const control of form.elements) {
        if (!control.name || control.disabled) continue;
        if ((control.type === 'checkbox' || control.type === 'radio') && !control.checked) continue;
        params.append(control.name, control.value);
      }
      params.set('pageno', String(page));
      return params.toString();
    }

    async function fetchPage(page) {
      const action = new URL(form.getAttribute('action') || context.location.href, context.location.href);
      const response = await fetch(action.href, {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: requestBody(page)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return new DOMParser().parseFromString(await response.text(), 'text/html');
    }

    function prepareItem(li, page, index) {
      const suffix = `mbis_${page}_${index}`;

      for (const f of li.querySelectorAll('form')) {
        f.id = `${suffix}_form`;
        f.name = `${suffix}_form`;
        const mode = f.querySelector('input[name="mode"]');
        if (mode) mode.id = `${suffix}_mode`;
      }

      for (const link of li.querySelectorAll('a[title="リストから削除"]')) {
        link.removeAttribute('onclick');
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetForm = link.closest('form');
          const mode = targetForm?.querySelector('input[name="mode"]');
          if (!targetForm || !mode) return;
          mode.value = 'delete_favorite';
          targetForm.action = '?';
          targetForm.submit();
        });
      }

      for (const link of li.querySelectorAll('a.cart_in_button')) {
        link.removeAttribute('onclick');
        link.addEventListener('click', (e) => {
          e.preventDefault();
          link.closest('form')?.submit();
        });
      }

      for (const button of li.querySelectorAll('a.cart_select_button')) {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          const wrapper = button.closest('p.favorite.cart_select');
          const checkbox = wrapper?.querySelector('input.chProductId');
          if (!wrapper || !checkbox) return;

          if (checkbox.checked) {
            wrapper.classList.add('select');
            wrapper.classList.remove('selected');
          } else {
            wrapper.classList.add('selected');
            wrapper.classList.remove('select');
          }
          checkbox.click();
        });
      }

      for (const img of li.querySelectorAll('img[data-src]')) {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
      }

      li.style.setProperty('clear', 'none', 'important');
    }

    function getInsertionPoint() {
      for (const child of list.children) {
        if (child.tagName !== 'LI') return child;
      }
      return null;
    }

    function appendPage(doc, page) {
      const incoming = doc.querySelector('.item-list > ul');
      if (!incoming) return 0;

      const fragment = document.createDocumentFragment();
      let added = 0;

      [...incoming.children].forEach((source, index) => {
        if (source.tagName !== 'LI') return;

        const key = productKey(source);
        if (key && productKeys.has(key)) return;

        const li = document.importNode(source, true);
        prepareItem(li, page, index + 1);
        fragment.appendChild(li);

        if (key) productKeys.add(key);
        added++;
      });

      const insertionPoint = getInsertionPoint();
      list.insertBefore(fragment, insertionPoint);
      removeTrailingClearElements();

      return added;
    }

    function syncToken(doc) {
      const nextToken = doc.querySelector('#form1 input[name="transactionid"]')?.value;
      const currentToken = form.querySelector('input[name="transactionid"]');
      if (nextToken && currentToken) {
        currentToken.value = nextToken;
      }
    }

    function maybeLoadMore() {
      if (loading || finished || retryBlocked) return;
      const bottom = window.innerHeight + PRELOAD_DISTANCE;
      if (status.getBoundingClientRect().top <= bottom) {
        loadNextPage();
      }
    }

    async function loadNextPage() {
      if (loading || finished || retryBlocked) return;

      const nextPage = currentPage + 1;
      if (nextPage > maxPage || loadedPages.has(nextPage)) {
        finish();
        return;
      }

      loading = true;
      status.textContent = `Loading wishlist page ${nextPage}...`;

      try {
        const doc = await fetchPage(nextPage);
        const added = appendPage(doc, nextPage);

        if (!added) {
          finish();
          return;
        }

        syncToken(doc);
        loadedPages.add(nextPage);
        currentPage = nextPage;
        maxPage = Math.max(maxPage, readMaxPage(doc));

        status.textContent = '';

        if (currentPage >= maxPage) {
          finish();
          return;
        }
      } catch (error) {
        console.error('[Melonbooks Wishlist Infinite Scroll]', error);
        retryBlocked = true;
        status.textContent = `Failed to load wishlist page ${nextPage}. Click here to retry.`;
        status.style.cursor = 'pointer';

        status.onclick = () => {
          status.onclick = null;
          status.style.cursor = '';
          retryBlocked = false;
          loadNextPage();
        };

        if (paginator) {
          paginator.hidden = false;
        }
      } finally {
        loading = false;
        requestAnimationFrame(() => maybeLoadMore());
      }
    }

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          loadNextPage();
        }
      },
      {
        rootMargin: `${PRELOAD_DISTANCE}px 0px`,
        threshold: 0
      }
    );

    observer.observe(status);
    maybeLoadMore();
  }
};
