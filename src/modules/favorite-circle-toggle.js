import { injectStyle } from '../core/styles.js';

/**
 * Module: Favorite Circle Toggle
 * Allows circle favorite buttons on product pages to add or remove the circle from favorites in-place.
 */

const TARGET_SELECTOR = 'a.favorite_circle_short, a.favorite_circle';
const BUSY_CLASS = 'mb-circle-favorite-toggle-busy';
const TOAST_ID = 'mb-circle-favorite-toggle-toast';
const REQUEST_TIMEOUT_MS = 15000;

const CIRCLE_TOGGLE_CSS = `
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

export const FavoriteCircleToggleModule = {
  id: 'favorite-circle-toggle',
  name: 'Favorite Circle Toggle',
  lifecycle: 'document-start',

  matches(context) {
    return context.route === 'melonbooks-product' || context.location.pathname.startsWith('/detail/');
  },

  init(context) {
    injectStyle('favorite-circle-toggle', CIRCLE_TOGGLE_CSS);

    const busyCircleIds = new Set();
    let cachedTransactionId = '';

    function isProductDetailPage() {
      return context.location.pathname.startsWith('/detail/');
    }

    function isCircleFavorited(button) {
      if (button.classList.contains('favorite_circle_short')) {
        if (button.classList.contains('fav-button-short__icon--not-done')) {
          return false;
        }
        if (
          button.classList.contains('fav-button-short__icon--done') ||
          button.classList.contains('favorited')
        ) {
          return true;
        }
        return false;
      }

      if (button.classList.contains('favorite_circle')) {
        const iconBox = button.querySelector('.fav-button__icon');
        if (iconBox?.classList.contains('fav-button__icon--not-done')) {
          return false;
        }
        if (
          iconBox?.classList.contains('fav-button__icon--done') ||
          button.classList.contains('__active') ||
          button.classList.contains('favorited') ||
          Boolean(button.querySelector('.favorited')) ||
          button.textContent.includes('追加済')
        ) {
          return true;
        }
      }
      return false;
    }

    function getCircleId(button) {
      const directId = button.getAttribute('data-circleid');
      if (directId) return directId.trim();

      const nearbyCircleLink = button
        .closest('td, .item-favorite, .item-page, body')
        ?.querySelector('a[href*="/circle/index.php?circle_id="]');

      if (!nearbyCircleLink) return '';

      try {
        const url = new URL(nearbyCircleLink.href, context.location.href);
        return url.searchParams.get('circle_id') || '';
      } catch {
        return '';
      }
    }

    function getTransactionId() {
      if (cachedTransactionId) return cachedTransactionId;

      const input = document.querySelector('input[name="transactionid"]');
      if (input?.value) {
        cachedTransactionId = input.value.trim();
        return cachedTransactionId;
      }

      const pageHtml = document.documentElement?.innerHTML || '';
      const scriptMatch = pageHtml.match(/\btransactionid\s*=\s*['"]([^'"]+)['"]/);
      if (scriptMatch) {
        cachedTransactionId = scriptMatch[1].trim();
        return cachedTransactionId;
      }

      const inputMatch = pageHtml.match(/name=['"]transactionid['"][^>]*value=['"]([^'"]+)['"]/i);
      cachedTransactionId = inputMatch ? inputMatch[1].trim() : '';
      return cachedTransactionId;
    }

    function getReturnedTransactionId(responseText) {
      if (!responseText) return '';
      const doc = new DOMParser().parseFromString(responseText, 'text/html');
      return doc.querySelector('#form_circle_fav input[name="transactionid"]')?.getAttribute('value')?.trim() || '';
    }

    function getReturnedCircleFavoriteState(responseText, circleId) {
      if (!responseText) return null;
      const doc = new DOMParser().parseFromString(responseText, 'text/html');
      const form = doc.querySelector('#form_circle_fav');
      const returnedCircleId = form?.querySelector('input[name="circle_id"]')?.getAttribute('value')?.trim();
      const nextAction = form?.querySelector('input[name="act"]')?.getAttribute('value')?.trim();

      if (returnedCircleId && returnedCircleId !== circleId) return null;
      if (nextAction === 'remove_favorite') return true;
      if (nextAction === 'add_favorite') return false;
      return null;
    }

    function escapeAttributeSelectorValue(value) {
      if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return CSS.escape(String(value));
      }
      return String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    }

    function setShortCircleButtonState(button, isFavorited) {
      button.classList.toggle('favorited', isFavorited);
      button.classList.remove('favorite', 'fa-regular');
      button.classList.add('fa-solid', 'fa-heart', 'fav-button-short__icon');
      button.classList.toggle('fav-button-short__icon--done', isFavorited);
      button.classList.toggle('fav-button-short__icon--not-done', !isFavorited);

      if (!button.hasAttribute('href')) {
        button.setAttribute('href', '#');
      }
      button.setAttribute('aria-hidden', 'true');
      button.setAttribute('aria-pressed', String(isFavorited));
      button.removeAttribute('aria-busy');
      button.title = isFavorited ? 'Remove circle from favorites' : 'Add circle to favorites';
    }

    function setLargeCircleButtonState(button, isFavorited) {
      button.classList.toggle('__active', isFavorited);
      button.classList.remove('favorited', 'on');

      const iconBox = button.querySelector('.fav-button__icon');
      if (iconBox) {
        iconBox.classList.toggle('fav-button__icon--done', isFavorited);
        iconBox.classList.toggle('fav-button__icon--not-done', !isFavorited);
      }

      const icon = button.querySelector('i');
      if (icon) {
        icon.classList.toggle('favorited', isFavorited);
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid', 'fa-heart');
      }

      const text = button.querySelector('.fav-button__text, span');
      if (text) {
        text.innerHTML = isFavorited
          ? 'お気に入り<br role="none">サークルに追加済'
          : 'お気に入り<br role="none">サークルに追加';
      }

      button.setAttribute('aria-pressed', String(isFavorited));
      button.title = isFavorited ? 'Remove circle from favorites' : 'Add circle to favorites';
    }

    function setCircleFavoriteState(circleId, isFavorited) {
      const escaped = escapeAttributeSelectorValue(circleId);
      const selector = `[data-circleid="${escaped}"]`;

      document.querySelectorAll(`a.favorite_circle_short${selector}`).forEach((button) => {
        setShortCircleButtonState(button, isFavorited);
      });

      document.querySelectorAll(`a.favorite_circle${selector}`).forEach((button) => {
        setLargeCircleButtonState(button, isFavorited);
      });

      markButtons();
    }

    function setButtonsBusy(circleId, isBusy) {
      const escaped = escapeAttributeSelectorValue(circleId);
      const selector = `a[data-circleid="${escaped}"]`;

      document.querySelectorAll(selector).forEach((button) => {
        button.classList.toggle(BUSY_CLASS, isBusy);
        if (isBusy) {
          button.setAttribute('aria-busy', 'true');
        } else {
          button.removeAttribute('aria-busy');
        }
      });
    }

    function markButtons() {
      document.querySelectorAll(TARGET_SELECTOR).forEach((button) => {
        const isFavorited = isCircleFavorited(button);
        button.setAttribute('aria-pressed', String(isFavorited));
        button.title = isFavorited ? 'Remove circle from favorites' : 'Add circle to favorites';
      });
    }

    function looksLikeLoginPage(responseUrl, responseText) {
      const url = new URL(responseUrl || context.location.href, context.location.href);
      if (url.pathname.startsWith('/mypage/')) return true;
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

    let toastTimer = null;
    function showToast(message, isError) {
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
      toastTimer = setTimeout(() => {
        toast.classList.remove('is-visible');
      }, 2200);
    }

    async function setCircleFavorite(circleId, shouldAdd) {
      if (busyCircleIds.has(circleId)) return;

      const transactionId = getTransactionId();
      if (!transactionId) {
        showToast('Could not find transaction ID.', true);
        return;
      }

      busyCircleIds.add(circleId);
      setButtonsBusy(circleId, true);

      try {
        const body = new URLSearchParams();
        body.set('transactionid', transactionId);
        body.set('act', shouldAdd ? 'add_favorite' : 'remove_favorite');
        body.set('circle_id', circleId);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        let response;
        let responseText;

        try {
          response = await fetch(`/circle/index.php?circle_id=${encodeURIComponent(circleId)}`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              Accept: 'text/html,application/xhtml+xml'
            },
            body: body.toString(),
            signal: controller.signal,
            redirect: 'follow'
          });
          responseText = await response.text();
        } finally {
          clearTimeout(timeoutId);
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        if (looksLikeLoginPage(response.url, responseText)) {
          redirectToLogin();
          return;
        }

        const returnedTransactionId = getReturnedTransactionId(responseText);
        if (returnedTransactionId) {
          cachedTransactionId = returnedTransactionId;
        }

        const returnedState = getReturnedCircleFavoriteState(responseText, circleId);
        if (returnedState !== null && returnedState !== shouldAdd) {
          throw new Error(`Melonbooks returned an unexpected favorite state for circle ${circleId}.`);
        }

        setCircleFavoriteState(circleId, shouldAdd);
        showToast(
          shouldAdd ? 'Circle added to favorites.' : 'Circle removed from favorites.',
          false
        );
      } finally {
        setButtonsBusy(circleId, false);
        busyCircleIds.delete(circleId);
      }
    }

    function handleClickCapture(event) {
      const target = event.target instanceof Element ? event.target : null;
      const button = target?.closest(TARGET_SELECTOR);

      if (!button || !isProductDetailPage()) return;

      const circleId = getCircleId(button);
      if (!circleId) return;

      const shouldAdd = !isCircleFavorited(button);

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      setCircleFavorite(circleId, shouldAdd).catch((error) => {
        console.error('[Melonbooks Circle Favorite Toggle]', error);
        showToast(
          shouldAdd ? 'Could not add circle to favorites.' : 'Could not remove circle from favorites.',
          true
        );
      });
    }

    document.addEventListener('click', handleClickCapture, true);

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', markButtons, { once: true });
    } else {
      markButtons();
    }
  }
};
