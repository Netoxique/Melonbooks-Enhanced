// ==UserScript==
// @name         Open Melonbooks links via VPN tab
// @namespace    local.melonbooks.outlook.vpn
// @version      2.0.3
// @description  Clean Melonbooks links in Outlook Web and retry them after the VPN tab initializes.
// @match        https://outlook.office.com/*
// @match        https://outlook.live.com/*
// @match        https://www.melonbooks.co.jp/*
// @grant        GM_openInTab
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  class ScriptInfo {
    static version = "2.0.3";
  }

  const MELONBOOKS_HOST = "www.melonbooks.co.jp";
  const PRODUCT_PATH = "/detail/detail.php";
  const RETRY_FRAGMENT = "outlook-vpn-retry";
  const RETRY_DELAY_MS = 500;

  function unwrapSafeLink(rawUrl) {
    let currentUrl = rawUrl;

    // Allow for nested Microsoft Safe Links.
    for (let attempt = 0; attempt < 3; attempt += 1) {
      let parsedUrl;

      try {
        parsedUrl = new URL(currentUrl);
      } catch {
        return currentUrl;
      }

      if (
        !parsedUrl.hostname.endsWith(
          "safelinks.protection.outlook.com"
        )
      ) {
        return currentUrl;
      }

      const wrappedUrl = parsedUrl.searchParams.get("url");

      if (!wrappedUrl) {
        return currentUrl;
      }

      /*
       * URLSearchParams.get() already performs the required
       * URL-decoding pass.
       */
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

    const productId = parsedUrl.searchParams.get("product_id");

    if (!productId) {
      return null;
    }

    const cleanUrl = new URL(
      `https://${MELONBOOKS_HOST}${PRODUCT_PATH}`
    );

    cleanUrl.searchParams.set("product_id", productId);

    return cleanUrl.toString();
  }

  function createRetryUrl(targetUrl) {
    const retryUrl = new URL(targetUrl);

    /*
     * Fragments are not included in the HTTP request.
     * Melonbooks receives the normal product URL.
     */
    retryUrl.hash = RETRY_FRAGMENT;

    return retryUrl.toString();
  }

  function handleMelonbooksRetry() {
    if (location.hostname !== MELONBOOKS_HOST) {
      return false;
    }

    if (location.hash !== `#${RETRY_FRAGMENT}`) {
      return true;
    }

    /*
     * Hide the first response so that the temporary 404 page
     * does not flash before the automatic retry.
     */
    const hidingStyle = document.createElement("style");

    hidingStyle.textContent = `
      html {
        visibility: hidden !important;
      }
    `;

    (document.documentElement || document).appendChild(hidingStyle);

    const cleanTarget =
      location.origin +
      location.pathname +
      location.search;

    /*
     * Remove the marker from the address bar before reloading.
     * location.reload() is necessary because removing only a
     * fragment would otherwise be treated as same-page navigation.
     */
    history.replaceState(null, "", cleanTarget);

    let retryStarted = false;

    function retryProductPage() {
      if (retryStarted) {
        return;
      }

      retryStarted = true;

      window.setTimeout(function () {
        location.reload();
      }, RETRY_DELAY_MS);
    }

    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        retryProductPage,
        { once: true }
      );

      /*
       * Fallback in case the error document does not dispatch
       * DOMContentLoaded normally.
       */
      window.setTimeout(retryProductPage, 2000);
    } else {
      retryProductPage();
    }

    return true;
  }

  function openMelonbooksLink(event) {
    const isLeftClick =
      event.type === "click" &&
      event.button === 0;

    const isMiddleClick =
      event.type === "auxclick" &&
      event.button === 1;

    if (!isLeftClick && !isMiddleClick) {
      return;
    }

    const eventTarget = event.target;

    if (!(eventTarget instanceof Element)) {
      return;
    }

    const link = eventTarget.closest("a[href]");

    if (!link) {
      return;
    }

    const cleanUrl = cleanMelonbooksUrl(link.href);

    if (!cleanUrl) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    GM_openInTab(createRetryUrl(cleanUrl), {
      // Left-click focuses the new tab.
      // Middle-click opens it in the background.
      active: isLeftClick,
      insert: true,
      setParent: false
    });
  }

  if (handleMelonbooksRetry()) {
    return;
  }

  document.addEventListener(
    "click",
    openMelonbooksLink,
    true
  );

  document.addEventListener(
    "auxclick",
    openMelonbooksLink,
    true
  );

  void ScriptInfo.version;
})();