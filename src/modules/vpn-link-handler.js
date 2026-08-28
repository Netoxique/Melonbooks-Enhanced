import { injectStyle } from '../core/styles.js';

/**
 * Module: VPN Link Handler (Outlook Safe Links & VPN Retry)
 * Clean Melonbooks links in Outlook Web and retry them after the VPN tab initializes.
 */

const MELONBOOKS_HOST = 'www.melonbooks.co.jp';
const PRODUCT_PATH = '/detail/detail.php';
const RETRY_FRAGMENT = 'outlook-vpn-retry';
const RETRY_DELAY_MS = 500;

function unwrapSafeLink(rawUrl) {
  let currentUrl = rawUrl;

  // Allow for nested Microsoft Safe Links
  for (let attempt = 0; attempt < 3; attempt += 1) {
    let parsedUrl;
    try {
      parsedUrl = new URL(currentUrl);
    } catch {
      return currentUrl;
    }

    if (!parsedUrl.hostname.endsWith('safelinks.protection.outlook.com')) {
      return currentUrl;
    }

    const wrappedUrl = parsedUrl.searchParams.get('url');
    if (!wrappedUrl) {
      return currentUrl;
    }

    currentUrl = wrappedUrl;
  }

  return currentUrl;
}

function cleanMelonbooksUrl(rawUrl) {
  const unwrappedUrl = unwrapSafeLink(rawUrl);

  let parsedUrl;
  try {
    parsedUrl = new URL(unwrappedUrl);
  } catch {
    return null;
  }

  if (parsedUrl.hostname !== MELONBOOKS_HOST) {
    return null;
  }

  if (parsedUrl.pathname !== PRODUCT_PATH) {
    return null;
  }

  const productId = parsedUrl.searchParams.get('product_id');
  if (!productId) {
    return null;
  }

  const cleanUrl = new URL(`https://${MELONBOOKS_HOST}${PRODUCT_PATH}`);
  cleanUrl.searchParams.set('product_id', productId);

  return cleanUrl.toString();
}

function createRetryUrl(targetUrl) {
  const retryUrl = new URL(targetUrl);
  retryUrl.hash = RETRY_FRAGMENT;
  return retryUrl.toString();
}

export const VpnLinkHandlerModule = {
  id: 'vpn-link-handler',
  name: 'VPN Link Handler',
  lifecycle: 'document-start',

  matches(context) {
    return (
      context.route === 'outlook' ||
      context.isOutlook ||
      (context.domain === 'melonbooks' && context.location.hash.includes(RETRY_FRAGMENT))
    );
  },

  init(context) {
    // 1. Handle Melonbooks retry flow
    if (context.location.hostname === MELONBOOKS_HOST && context.location.hash === `#${RETRY_FRAGMENT}`) {
      injectStyle(
        'vpn-retry-hiding',
        `html { visibility: hidden !important; }`
      );

      const cleanTarget = context.location.origin + context.location.pathname + context.location.search;
      history.replaceState(null, '', cleanTarget);

      let retryStarted = false;
      function retryProductPage() {
        if (retryStarted) return;
        retryStarted = true;
        setTimeout(() => {
          context.location.reload();
        }, RETRY_DELAY_MS);
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', retryProductPage, { once: true });
        setTimeout(retryProductPage, 2000);
      } else {
        retryProductPage();
      }
      return;
    }

    // 2. Handle Outlook link interception
    function openMelonbooksLink(event) {
      const isLeftClick = event.type === 'click' && event.button === 0;
      const isMiddleClick = event.type === 'auxclick' && event.button === 1;

      if (!isLeftClick && !isMiddleClick) return;

      const eventTarget = event.target;
      if (!(eventTarget instanceof Element)) return;

      const link = eventTarget.closest('a[href]');
      if (!link) return;

      const cleanUrl = cleanMelonbooksUrl(link.href);
      if (!cleanUrl) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const retryUrl = createRetryUrl(cleanUrl);

      if (typeof GM_openInTab === 'function') {
        GM_openInTab(retryUrl, {
          active: isLeftClick,
          insert: true,
          setParent: false
        });
      } else {
        window.open(retryUrl, '_blank', 'noopener,noreferrer');
      }
    }

    document.addEventListener('click', openMelonbooksLink, true);
    document.addEventListener('auxclick', openMelonbooksLink, true);
  }
};
