/**
 * Module: Wishlist Infinite Scroll
 * Automatically loads additional wishlist pages into the current item list.
 */

const PRELOAD_DISTANCE = 1200;

export const WishlistInfiniteScrollModule = {
  id: 'wishlist-infinite-scroll',
  name: 'Wishlist Infinite Scroll',
  lifecycle: 'document-idle',

  matches(context) {
    return context.route === 'melonbooks-wishlist' || context.location.pathname.includes('favorite.php');
  },

  init(context) {
    const itemList =
      document.querySelector('.my-page.my-circle-page > .item-list > ul') ||
      document.querySelector('.my-page .item-list > ul');
    const pageForm = document.querySelector('#form1');
    const paginator = document.querySelector('.pagenavi');

    if (!itemList || !pageForm) {
      return;
    }

    function isProductItem(item) {
      if (
        !item ||
        item.nodeType !== Node.ELEMENT_NODE ||
        item.tagName !== 'LI' ||
        item.classList.contains('item-list__placeholder')
      ) {
        return false;
      }

      return (
        [...item.classList].some((name) => /^product_\d+$/.test(name)) ||
        Boolean(item.querySelector('input[name="product_id"]')) ||
        Boolean(item.querySelector('a[href*="product_id="]'))
      );
    }

    function getCurrentPage(doc) {
      const formPage = doc.querySelector('#form1 input[name="pageno"]')?.value;
      const currentLink = doc.querySelector('.pagenavi a.current');
      const currentLinkPage =
        currentLink?.getAttribute('title') ||
        currentLink?.textContent?.trim();
      const page = Number.parseInt(formPage || currentLinkPage || '1', 10);

      return Number.isFinite(page) && page > 0 ? page : 1;
    }

    function getMaxPage(doc) {
      const pages = [getCurrentPage(doc)];

      for (const link of doc.querySelectorAll('.pagenavi a')) {
        const titlePage = Number.parseInt(link.getAttribute('title') || '', 10);

        if (Number.isFinite(titlePage)) {
          pages.push(titlePage);
        }

        const onclick = link.getAttribute('onclick') || '';
        const match = onclick.match(/movePage\s*\(\s*['"]?(\d+)/i);

        if (match) {
          pages.push(Number.parseInt(match[1], 10));
        }
      }

      return Math.max(...pages);
    }

    function getItemKey(item) {
      const productClass = [...item.classList].find((name) => /^product_\d+$/.test(name));

      if (productClass) {
        return productClass;
      }

      const productInput = item.querySelector('input[name="product_id"]');

      if (productInput?.value) {
        return `product_${productInput.value}`;
      }

      const productLink = item.querySelector('a[href*="product_id="]');

      if (!productLink) {
        return null;
      }

      try {
        const url = new URL(productLink.getAttribute('href'), context.location.href);
        const productId = url.searchParams.get('product_id');
        return productId ? `product_${productId}` : null;
      } catch {
        return null;
      }
    }

    let currentPage = getCurrentPage(document);
    let maxPage = getMaxPage(document);
    let loading = false;
    let finished = currentPage >= maxPage;
    let retryBlocked = false;
    let observer = null;

    const loadedPages = new Set([currentPage]);
    const itemKeys = new Set(
      [...itemList.children]
        .filter((item) => isProductItem(item))
        .map((item) => getItemKey(item))
        .filter(Boolean)
    );

    const status = document.createElement('div');
    status.id = 'mb-wishlist-infinite-scroll-status';
    status.setAttribute('aria-live', 'polite');
    status.style.cssText =
      'text-align:center;padding:14px 8px;font-size:12px;opacity:.75;min-height:16px';

    itemList.closest('.item-list')?.after(status);

    function setStatus(message) {
      status.textContent = message;
    }

    function finish() {
      finished = true;
      loading = false;
      observer?.disconnect();

      if (paginator) {
        paginator.hidden = true;
      }

      status.onclick = null;
      status.style.cursor = '';
      setStatus('All wishlist items loaded.');
    }

    if (finished) {
      finish();
      return;
    }

    if (paginator) {
      paginator.hidden = true;
    }

    function serializePageForm(page) {
      const params = new URLSearchParams();

      for (const control of pageForm.elements) {
        if (!control.name || control.disabled) {
          continue;
        }

        if (
          (control.type === 'checkbox' || control.type === 'radio') &&
          !control.checked
        ) {
          continue;
        }

        params.append(control.name, control.value);
      }

      params.set('pageno', String(page));
      return params;
    }

    async function fetchPage(page) {
      const action = new URL(
        pageForm.getAttribute('action') || context.location.href,
        context.location.href
      );
      const response = await fetch(action.href, {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: serializePageForm(page).toString()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return new DOMParser().parseFromString(await response.text(), 'text/html');
    }

    function syncTransactionId(doc) {
      const newToken = doc.querySelector('#form1 input[name="transactionid"]')?.value;
      const currentToken = pageForm.querySelector('input[name="transactionid"]');

      if (newToken && currentToken) {
        currentToken.value = newToken;
      }
    }

    function prepareImportedItem(item, page, index) {
      const suffix = `mbis_${page}_${index}`;
      item.dataset.mbInfinitePage = String(page);

      /*
       * Every fetched Melonbooks page restarts its product form numbers at
       * form_1_product. Rename them to prevent duplicate IDs and names.
       */
      for (const form of item.querySelectorAll('form')) {
        form.id = `${suffix}_form`;
        form.name = `${suffix}_form`;

        const modeInput = form.querySelector('input[name="mode"]');

        if (modeInput) {
          modeInput.id = `${suffix}_mode`;
        }
      }

      /*
       * Rebind the remove-from-wishlist button because its original inline
       * handler references the old form ID and form name.
       */
      for (const link of item.querySelectorAll('a[title="リストから削除"]')) {
        link.removeAttribute('onclick');
        link.addEventListener('click', (event) => {
          event.preventDefault();

          const form = link.closest('form');
          const modeInput = form?.querySelector('input[name="mode"]');

          if (!form || !modeInput) {
            return;
          }

          modeInput.value = 'delete_favorite';
          form.action = '?';
          form.submit();
        });
      }

      /* Rebind the individual purchase button. */
      for (const link of item.querySelectorAll('a.cart_in_button')) {
        link.removeAttribute('onclick');
        link.addEventListener('click', (event) => {
          event.preventDefault();
          link.closest('form')?.submit();
        });
      }

      /*
       * Melonbooks binds this handler only to elements that existed when the
       * original page loaded.
       */
      for (const button of item.querySelectorAll('a.cart_select_button')) {
        button.addEventListener('click', (event) => {
          event.preventDefault();

          const wrapper = button.closest('p.favorite.cart_select');
          const input = wrapper?.querySelector('input.chProductId');

          if (!wrapper || !input) {
            return;
          }

          if (input.checked) {
            wrapper.classList.add('select');
            wrapper.classList.remove('selected');
          } else {
            wrapper.classList.add('selected');
            wrapper.classList.remove('select');
          }

          input.click();
        });
      }

      /* DOMParser does not run Melonbooks' lazy-loader for fetched documents. */
      for (const image of item.querySelectorAll('img[data-src]')) {
        if (image.dataset.src) {
          image.src = image.dataset.src;
        }
      }
    }

    function getPlaceholderInsertionPoint() {
      /*
       * Melonbooks places invisible placeholder LI elements after the original
       * page's products to pad and align the final flex row. Real products must
       * always be inserted before them.
       */
      return itemList.querySelector(':scope > li.item-list__placeholder');
    }

    function appendItems(doc, page) {
      const incomingList =
        doc.querySelector('.my-page.my-circle-page > .item-list > ul') ||
        doc.querySelector('.my-page .item-list > ul');

      if (!incomingList) {
        return 0;
      }

      const fragment = document.createDocumentFragment();
      let added = 0;

      [...incomingList.children].forEach((sourceItem, index) => {
        /* Do not copy Melonbooks' item-list__placeholder elements. */
        if (!isProductItem(sourceItem)) {
          return;
        }

        const key = getItemKey(sourceItem);

        if (key && itemKeys.has(key)) {
          return;
        }

        const item = document.importNode(sourceItem, true);
        prepareImportedItem(item, page, index + 1);
        fragment.appendChild(item);

        if (key) {
          itemKeys.add(key);
        }

        added += 1;
      });

      if (added === 0) {
        return 0;
      }

      /*
       * Inserting with appendChild would place new products after Melonbooks'
       * invisible placeholders, making each fetched page start on a new row.
       */
      const insertionPoint = getPlaceholderInsertionPoint();
      itemList.insertBefore(fragment, insertionPoint);
      return added;
    }

    function maybeLoadMore() {
      if (loading || finished || retryBlocked) {
        return;
      }

      const preloadBottom = window.innerHeight + PRELOAD_DISTANCE;

      if (status.getBoundingClientRect().top <= preloadBottom) {
        loadNextPage();
      }
    }

    async function loadNextPage() {
      if (loading || finished || retryBlocked) {
        return;
      }

      const nextPage = currentPage + 1;

      if (nextPage > maxPage || loadedPages.has(nextPage)) {
        finish();
        return;
      }

      loading = true;
      setStatus(`Loading wishlist page ${nextPage}...`);

      try {
        const doc = await fetchPage(nextPage);
        const added = appendItems(doc, nextPage);

        if (added === 0) {
          finish();
          return;
        }

        syncTransactionId(doc);
        loadedPages.add(nextPage);
        currentPage = nextPage;
        maxPage = Math.max(maxPage, getMaxPage(doc));

        if (currentPage >= maxPage) {
          finish();
          return;
        }

        setStatus('');
      } catch (error) {
        console.error('[Melonbooks Wishlist Infinite Scroll]', error);
        retryBlocked = true;
        setStatus(`Failed to load wishlist page ${nextPage}. Click here to retry.`);
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

        if (!finished) {
          requestAnimationFrame(() => maybeLoadMore());
        }
      }
    }

    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadNextPage();
        }
      },
      {
        root: null,
        rootMargin: `${PRELOAD_DISTANCE}px 0px`,
        threshold: 0
      }
    );

    observer.observe(status);
    maybeLoadMore();
  }
};
