import { injectStyle } from '../core/styles.js';

/**
 * Module: Wishlist Toggle
 * Makes the product-page wishlist button add or remove the current product.
 */

const BUTTON_SELECTOR = '.fav-button--wishlist.add_wish';
const TOAST_ID = 'mb-wishlist-toggle-toast';
const MAXIMUM_PAGES_TO_CHECK = 100;

const WISHLIST_TOGGLE_CSS = `
  .mb-wishlist-toggle-busy {
    opacity: 0.55 !important;
    cursor: wait !important;
    pointer-events: none !important;
  }

  #${TOAST_ID} {
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

export const WishlistToggleModule = {
  id: 'wishlist-toggle',
  name: 'Wishlist Toggle',
  lifecycle: 'document-end',

  matches(context) {
    return context.route === 'melonbooks-product' || context.location.pathname.startsWith('/detail/') || context.location.pathname.includes('detail.php');
  },

  init(context) {
    injectStyle('wishlist-toggle', WISHLIST_TOGGLE_CSS);

    const wishlistUrl = new URL('/mypage/favorite.php', context.location.origin);
    const busyButtons = new WeakSet();
    const addWatchers = new WeakMap();
    let toastTimer = null;

    function isActive(button) {
      return button.classList.contains('__active');
    }

    function renderButton(button, active) {
      const iconContainer = button.querySelector('.fav-button__icon');
      const icon = iconContainer?.querySelector('i');
      const text = button.querySelector('.fav-button__text');

      if (iconContainer) {
        iconContainer.classList.add('fav-button__icon--wishlist');
        iconContainer.classList.toggle('fav-button__icon--done', active);
        iconContainer.classList.toggle('fav-button__icon--not-done', !active);
      }

      if (icon) {
        icon.classList.remove('fa-regular', 'far');
        icon.classList.add('fa-solid', 'fa-bookmark');
        icon.classList.toggle('favorited', active);
      }

      button.setAttribute('aria-pressed', active ? 'true' : 'false');
      button.setAttribute('title', active ? 'ほしいものリストから削除' : 'ほしいものリストに追加');

      if (text) {
        const firstLine = 'ほしいもの';
        const secondLine = active ? 'リストから削除' : 'リストに追加';
        const desiredText = firstLine + secondLine;
        const currentText = text.textContent?.replace(/\s+/g, '') || '';

        if (currentText !== desiredText) {
          const lineBreak = document.createElement('br');
          lineBreak.setAttribute('role', 'none');
          text.replaceChildren(
            document.createTextNode(firstLine),
            lineBreak,
            document.createTextNode(secondLine)
          );
        }
      }
    }

    function showToast(message, isError = false) {
      let toast = document.getElementById(TOAST_ID);
      if (!toast) {
        toast = document.createElement('div');
        toast.id = TOAST_ID;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
      }

      toast.textContent = message;
      toast.classList.toggle('is-error', isError);
      toast.classList.remove('is-visible');

      requestAnimationFrame(() => {
        toast.classList.add('is-visible');
      });

      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
      }, 3000);
    }

    function getProductId() {
      const urlProductId = new URL(context.location.href).searchParams.get('product_id');
      if (urlProductId && /^\d+$/.test(urlProductId)) {
        return urlProductId;
      }

      const input = document.querySelector('#form_product input[name="product_id"], input[name="product_id"]');
      const inputProductId = input instanceof HTMLInputElement ? input.value : '';
      return /^\d+$/.test(inputProductId) ? inputProductId : null;
    }

    function formToUrlSearchParams(form) {
      const params = new URLSearchParams();
      const formData = new FormData(form);
      for (const [name, value] of formData.entries()) {
        if (typeof value === 'string') {
          params.append(name, value);
        }
      }
      return params;
    }

    async function requestDocument(url, options = {}) {
      const response = await fetch(url, {
        credentials: 'same-origin',
        cache: 'no-store',
        redirect: 'follow',
        ...options,
        headers: {
          Accept: 'text/html,application/xhtml+xml',
          ...(options.headers || {})
        }
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(`The request returned HTTP ${response.status}.`);
      }

      const parsedDocument = new DOMParser().parseFromString(text, 'text/html');
      return { document: parsedDocument, response };
    }

    function assertWishlistDocument(parsedDocument, response) {
      const responsePath = response.url ? new URL(response.url).pathname : '';
      const title = parsedDocument.title || '';
      const hasPasswordField = Boolean(parsedDocument.querySelector('input[type="password"]'));

      if (
        /ログイン|login/i.test(title) ||
        hasPasswordField ||
        (responsePath.includes('/mypage/') && !responsePath.endsWith('/favorite.php'))
      ) {
        throw new Error('You must be logged in to Melonbooks.');
      }

      if (!parsedDocument.querySelector('.my-page.my-circle-page')) {
        throw new Error('Could not load the wishlist page.');
      }
    }

    function findProductForm(parsedDocument, productId) {
      const forms = parsedDocument.querySelectorAll('.my-page.my-circle-page .item-list form');
      for (const form of forms) {
        const deleteControl = form.querySelector('a[title="リストから削除"], a[onclick*="delete_favorite"]');
        if (!deleteControl) continue;

        const hasProduct = Array.from(form.querySelectorAll('input[name="product_id"]')).some(
          (input) => input.value === productId
        );

        if (hasProduct) return form;
      }
      return null;
    }

    function getWishlistProductIds(parsedDocument) {
      const productIds = new Set();
      const forms = parsedDocument.querySelectorAll('.my-page.my-circle-page .item-list form');

      for (const form of forms) {
        const deleteControl = form.querySelector('a[title="リストから削除"], a[onclick*="delete_favorite"]');
        if (!deleteControl) continue;

        const inputs = form.querySelectorAll('input[name="product_id"]');
        for (const input of inputs) {
          if (/^\d+$/.test(input.value)) {
            productIds.add(input.value);
          }
        }
      }
      return Array.from(productIds);
    }

    async function requestWishlistPage(previousDocument, pageNumber) {
      const navigationForm = previousDocument?.querySelector('form#form1');
      if (!(navigationForm instanceof HTMLFormElement)) {
        throw new Error('Could not read the wishlist pagination form.');
      }

      const body = formToUrlSearchParams(navigationForm);
      body.set('mode', '');
      body.set('group', '');
      body.set('pageno', String(pageNumber));

      return requestDocument(wishlistUrl, {
        method: 'POST',
        body
      });
    }

    async function findWishlistEntry(productId) {
      const seenPageSignatures = new Set();
      let navigationDocument = null;

      for (let pageNumber = 1; pageNumber <= MAXIMUM_PAGES_TO_CHECK; pageNumber += 1) {
        const page =
          pageNumber === 1
            ? await requestDocument(wishlistUrl)
            : await requestWishlistPage(navigationDocument, pageNumber);

        assertWishlistDocument(page.document, page.response);

        const form = findProductForm(page.document, productId);
        if (form) {
          return { form, pageNumber };
        }

        const productIds = getWishlistProductIds(page.document);
        if (productIds.length === 0) break;

        const signature = productIds.join(',');
        if (seenPageSignatures.has(signature)) break;
        seenPageSignatures.add(signature);

        navigationDocument = page.document;
      }

      throw new Error('The product was not found in the wishlist.');
    }

    async function submitDelete(entry, productId) {
      const body = formToUrlSearchParams(entry.form);
      body.set('mode', 'delete_favorite');
      body.set('product_id', productId);
      if (!body.has('quantity')) body.set('quantity', '1');
      if (!body.has('pageno')) body.set('pageno', String(entry.pageNumber));

      const result = await requestDocument(wishlistUrl, {
        method: 'POST',
        body
      });

      assertWishlistDocument(result.document, result.response);

      if (findProductForm(result.document, productId)) {
        throw new Error('Melonbooks returned the item without removing it.');
      }
    }

    async function removeFromWishlist(button) {
      const productId = getProductId();
      if (!productId) {
        showToast('Could not determine the product ID.', true);
        return;
      }

      busyButtons.add(button);
      button.classList.add('mb-wishlist-toggle-busy');
      button.setAttribute('aria-busy', 'true');

      try {
        const wishlistEntry = await findWishlistEntry(productId);
        await submitDelete(wishlistEntry, productId);

        button.classList.remove('__active');
        renderButton(button, false);
        showToast('Removed from the wishlist.');
      } catch (error) {
        console.error('[Melonbooks - Wishlist Toggle]', error);
        const message = error instanceof Error ? error.message : String(error);
        showToast(`Could not remove the item from the wishlist. ${message}`, true);
      } finally {
        busyButtons.delete(button);
        button.classList.remove('mb-wishlist-toggle-busy');
        button.removeAttribute('aria-busy');
      }
    }

    function watchForNativeAddition(button) {
      if (addWatchers.has(button)) return;

      const delay = 100;
      const maximumAttempts = 50;
      let attempts = 0;

      const check = () => {
        attempts += 1;
        if (isActive(button)) {
          addWatchers.delete(button);
          renderButton(button, true);
          showToast('Added to the wishlist.');
          return;
        }

        if (attempts >= maximumAttempts || !button.isConnected) {
          addWatchers.delete(button);
          return;
        }

        const timer = setTimeout(check, delay);
        addWatchers.set(button, timer);
      };

      const timer = setTimeout(check, delay);
      addWatchers.set(button, timer);
    }

    function handleClick(event) {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest(BUTTON_SELECTOR);
      if (!(button instanceof HTMLElement)) return;

      if (!isActive(button)) {
        watchForNativeAddition(button);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      if (busyButtons.has(button)) return;

      removeFromWishlist(button);
    }

    document.querySelectorAll(BUTTON_SELECTOR).forEach((button) => {
      if (button instanceof HTMLElement) {
        renderButton(button, isActive(button));
      }
    });

    document.addEventListener('click', handleClick, true);
  }
};
