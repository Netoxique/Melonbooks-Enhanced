// ==UserScript==
// @name         Melonbooks - Enhancements
// @namespace    https://github.com/Netoxic/melonbooks-enhancements
// @version      0.14.0
// @description  Comprehensive enhancements for Melonbooks browsing, shopping, layout, and library management.
// @author       Netoxic
// @match        https://*.melonbooks.co.jp/*
// @match        https://melonbooks.co.jp/*
// @match        http://www.melonbooks.co.jp/mypage/history.php*
// @match        https://outlook.office.com/*
// @match        https://outlook.live.com/*
// @grant        GM_addStyle
// @grant        GM_openInTab
// @run-at       document-start
// @updateURL    https://raw.githubusercontent.com/Netoxic/melonbooks-enhancements/main/dist/Melonbooks%20-%20Enhancements.user.js
// @downloadURL  https://raw.githubusercontent.com/Netoxic/melonbooks-enhancements/main/dist/Melonbooks%20-%20Enhancements.user.js
// ==/UserScript==

// GENERATED FILE. DO NOT EDIT DIRECTLY.
// Edit files under src/ and run the build.

(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/script-info.js
  var ScriptInfo = class {
  };
  __publicField(ScriptInfo, "name", "Melonbooks - Enhancements");
  __publicField(ScriptInfo, "namespace", "https://github.com/Netoxic/melonbooks-enhancements");
  __publicField(ScriptInfo, "version", "0.14.0");
  __publicField(ScriptInfo, "description", "Comprehensive enhancements for Melonbooks browsing, shopping, layout, and library management.");
  __publicField(ScriptInfo, "author", "Netoxic");

  // src/core/errors.js
  var PREFIX = "[Melonbooks Enhancements]";
  var _Logger = class _Logger {
    static setDebug(enabled) {
      _Logger.debugMode = Boolean(enabled);
    }
    static log(...args) {
      console.log(PREFIX, ...args);
    }
    static info(...args) {
      console.info(PREFIX, ...args);
    }
    static warn(...args) {
      console.warn(PREFIX, ...args);
    }
    static error(...args) {
      console.error(PREFIX, ...args);
    }
    static debug(...args) {
      if (_Logger.debugMode) {
        console.debug(PREFIX, ...args);
      }
    }
    static moduleError(moduleId, message, error) {
      console.error(`${PREFIX}[${moduleId}] ${message}`, error);
    }
    static moduleWarn(moduleId, ...args) {
      console.warn(`${PREFIX}[${moduleId}]`, ...args);
    }
    static moduleDebug(moduleId, ...args) {
      if (_Logger.debugMode) {
        console.debug(`${PREFIX}[${moduleId}]`, ...args);
      }
    }
  };
  __publicField(_Logger, "debugMode", false);
  var Logger = _Logger;
  function withErrorBoundary(moduleId, fn) {
    return function wrapped(...args) {
      try {
        const result = fn.apply(this, args);
        if (result && typeof result.catch === "function") {
          return result.catch((err) => {
            Logger.moduleError(moduleId, "Unhandled promise rejection in module execution:", err);
          });
        }
        return result;
      } catch (err) {
        Logger.moduleError(moduleId, "Unhandled exception in module execution:", err);
      }
    };
  }

  // src/core/storage.js
  var SETTINGS_KEY = "melonbooks_enhanced_settings";
  var DEFAULT_SETTINGS = {
    debug: false,
    modules: {
      "force-detail-thumbnails": true,
      "cart-duplicate-warning": true,
      "heading-translator": true,
      "product-info-layout": true,
      "search-columns": true,
      "force-listing-images": true,
      "listing-hover": true,
      "orders-grid-infinite-scroll": true,
      "favorite-circle-toggle": true,
      "favorite-author-toggle": true,
      "wishlist-toggle": true,
      "favorite-authors-infinite-scroll": true,
      "wishlist-infinite-scroll": true,
      "vpn-link-handler": true
    }
  };
  var Settings = class _Settings {
    static load() {
      try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            modules: {
              ...DEFAULT_SETTINGS.modules,
              ...parsed.modules || {}
            }
          };
        }
      } catch {
      }
      return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
    static save(settings) {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      } catch (e) {
        console.warn("[Melonbooks Enhancements] Failed to save settings to localStorage:", e);
      }
    }
    static isModuleEnabled(moduleId) {
      const settings = _Settings.load();
      if (settings.modules && moduleId in settings.modules) {
        return Boolean(settings.modules[moduleId]);
      }
      return true;
    }
    static setModuleEnabled(moduleId, enabled) {
      const settings = _Settings.load();
      settings.modules[moduleId] = Boolean(enabled);
      _Settings.save(settings);
    }
    static isDebugEnabled() {
      const settings = _Settings.load();
      return Boolean(settings.debug);
    }
    static setDebugEnabled(enabled) {
      const settings = _Settings.load();
      settings.debug = Boolean(enabled);
      _Settings.save(settings);
    }
  };

  // src/core/routing.js
  function isOutlook(location = window.location) {
    const host = location.hostname.toLowerCase();
    return host === "outlook.office.com" || host === "outlook.live.com";
  }
  function isMelonbooks(location = window.location) {
    const host = location.hostname.toLowerCase();
    return host === "melonbooks.co.jp" || host.endsWith(".melonbooks.co.jp");
  }
  function getRoute(location = window.location) {
    if (isOutlook(location)) {
      return "outlook";
    }
    if (!isMelonbooks(location)) {
      return "unknown";
    }
    const path = location.pathname.toLowerCase();
    if (path.startsWith("/search/") || path.includes("search.php")) {
      return "melonbooks-search";
    }
    if (path.startsWith("/detail/") || path.includes("/products/detail.php") || path.includes("detail.php")) {
      return "melonbooks-product";
    }
    if (path.startsWith("/clipboard/") || path.includes("clipboard.php") || path.includes("/cart/")) {
      return "melonbooks-cart";
    }
    if (path.includes("history.php")) {
      return "melonbooks-orders";
    }
    if (path.includes("favorite_author.php")) {
      return "melonbooks-favorite-authors";
    }
    if (path.includes("favorite.php")) {
      return "melonbooks-wishlist";
    }
    if (path.startsWith("/circle/")) {
      return "melonbooks-circle";
    }
    if (path.startsWith("/tags/")) {
      return "melonbooks-tags";
    }
    return "melonbooks-general";
  }
  function createExecutionContext(location = window.location) {
    return {
      location,
      route: getRoute(location),
      isMelonbooks: isMelonbooks(location),
      isOutlook: isOutlook(location)
    };
  }

  // src/core/lifecycle.js
  function onDocumentStart(callback) {
    try {
      callback();
    } catch (error) {
      console.error("[Melonbooks Enhancements][lifecycle] Error in onDocumentStart callback:", error);
    }
  }
  function onDomReady(callback) {
    if (document.readyState === "interactive" || document.readyState === "complete") {
      queueMicrotask(() => {
        try {
          callback();
        } catch (error) {
          console.error("[Melonbooks Enhancements][lifecycle] Error in onDomReady callback:", error);
        }
      });
    } else {
      const handler = () => {
        document.removeEventListener("DOMContentLoaded", handler);
        try {
          callback();
        } catch (error) {
          console.error("[Melonbooks Enhancements][lifecycle] Error in onDomReady callback:", error);
        }
      };
      document.addEventListener("DOMContentLoaded", handler);
    }
  }
  function onDocumentEnd(callback) {
    onDomReady(callback);
  }
  function onDocumentIdle(callback) {
    const runIdle = () => {
      if (typeof window.requestIdleCallback === "function") {
        window.requestIdleCallback(() => {
          try {
            callback();
          } catch (error) {
            console.error("[Melonbooks Enhancements][lifecycle] Error in onDocumentIdle callback:", error);
          }
        }, { timeout: 1500 });
      } else {
        setTimeout(() => {
          try {
            callback();
          } catch (error) {
            console.error("[Melonbooks Enhancements][lifecycle] Error in onDocumentIdle callback:", error);
          }
        }, 50);
      }
    };
    if (document.readyState === "complete") {
      runIdle();
    } else {
      window.addEventListener("load", () => {
        runIdle();
      }, { once: true });
    }
  }
  function runAt(timing, callback) {
    switch (timing) {
      case "document-start":
        onDocumentStart(callback);
        break;
      case "document-end":
        onDocumentEnd(callback);
        break;
      case "document-idle":
      case "idle":
      case "default":
        onDocumentIdle(callback);
        break;
      case "dom-ready":
      default:
        onDomReady(callback);
        break;
    }
  }

  // src/modules/force-detail-thumbnails.js
  var ForceDetailThumbnailsModule = {
    id: "force-detail-thumbnails",
    name: "Force Detail Thumbnails",
    lifecycle: "document-end",
    matches(context) {
      return context.route === "melonbooks-product" || /^\/(?:detail\/|products\/detail\.php)/.test(context.location.pathname);
    },
    init() {
      const images = document.querySelectorAll('img[src*="now_printing.jpeg"][data-src]');
      for (const img of images) {
        const originalSrc = img.getAttribute("data-src");
        if (!originalSrc) continue;
        img.setAttribute("src", originalSrc);
      }
    }
  };

  // src/core/styles.js
  function injectStyle(id, cssText) {
    const styleId = `mbe-style-${id}`;
    let styleEl = document.getElementById(styleId);
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.type = "text/css";
      const target = document.head || document.documentElement;
      if (target) {
        target.appendChild(styleEl);
      } else {
        const observer = new MutationObserver(() => {
          const root = document.head || document.documentElement;
          if (root) {
            observer.disconnect();
            root.appendChild(styleEl);
          }
        });
        observer.observe(document, { childList: true, subtree: true });
      }
    }
    styleEl.textContent = cssText;
    return styleEl;
  }

  // src/modules/cart-duplicate-warning.js
  var BANNER_ID = "mb-duplicate-cart-warning-banner";
  var HIGHLIGHT_CLASS = "mb-duplicate-cart-warning-highlight";
  var BANNER_CSS = `
  #${BANNER_ID} {
      background: #c40000;
      color: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 16px;
      font-weight: 700;
      line-height: 1.45;
      padding: 14px 18px;
      border-bottom: 4px solid #7a0000;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      width: 100%;
      box-sizing: border-box;
      z-index: 999999;
  }

  #${BANNER_ID} .mb-duplicate-cart-warning-title {
      font-size: 18px;
      margin-bottom: 4px;
      text-transform: uppercase;
  }

  #${BANNER_ID} .mb-duplicate-cart-warning-summary {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 0;
  }

  #${BANNER_ID} .mb-duplicate-cart-warning-summary div {
      display: block;
      margin: 2px 0;
  }

  .${HIGHLIGHT_CLASS} {
      position: relative !important;
      z-index: 50 !important;
      border-radius: 6px !important;
      box-shadow:
          0 0 0 4px #c40000,
          0 0 0 8px rgba(196, 0, 0, 0.25) !important;
  }

  .${HIGHLIGHT_CLASS}::after {
      content: "";
      position: absolute;
      inset: 0;
      border: 4px solid #c40000;
      border-radius: 6px;
      pointer-events: none;
      z-index: 999999;
      box-sizing: border-box;
  }
`;
  var CartDuplicateWarningModule = {
    id: "cart-duplicate-warning",
    name: "Cart Duplicate Warning",
    lifecycle: "document-idle",
    matches(context) {
      return context.route === "melonbooks-cart" || context.location.pathname.includes("/clipboard");
    },
    init() {
      function getCartItems() {
        return Array.from(document.querySelectorAll(".clip-item-cover"));
      }
      function getItemQuantity(item) {
        const qtyInput = item.querySelector(".clip-item-control .select input");
        if (!qtyInput) return 1;
        const qty = Number.parseInt(qtyInput.value, 10);
        return Number.isFinite(qty) ? qty : 1;
      }
      function isAlreadyPurchased(item) {
        if (item.querySelector(".already-buy")) return true;
        return item.textContent.includes("\u3054\u8CFC\u5165\u6E08\u307F");
      }
      function findProblemItems() {
        return getCartItems().filter((item) => {
          return getItemQuantity(item) > 1 || isAlreadyPurchased(item);
        });
      }
      function removeExistingBanner() {
        const existingBanner = document.getElementById(BANNER_ID);
        if (existingBanner) existingBanner.remove();
      }
      function clearItemHighlights() {
        getCartItems().forEach((item) => {
          item.classList.remove(HIGHLIGHT_CLASS);
        });
      }
      function highlightProblemItems(problemItems) {
        clearItemHighlights();
        problemItems.forEach((item) => {
          item.classList.add(HIGHLIGHT_CLASS);
        });
      }
      function createBanner(problemItems) {
        const duplicateCount = problemItems.filter((item) => getItemQuantity(item) > 1).length;
        const alreadyPurchasedCount = problemItems.filter((item) => isAlreadyPurchased(item)).length;
        const banner = document.createElement("div");
        banner.id = BANNER_ID;
        banner.setAttribute("role", "alert");
        banner.innerHTML = `
          <div class="mb-duplicate-cart-warning-title">
              WARNING: Duplicate or already purchased cart items detected.
          </div>
          <div class="mb-duplicate-cart-warning-summary">
              <div>Items have a quantity greater than 1: ${duplicateCount}</div>
              <div>Item has already been purchased: ${alreadyPurchasedCount}</div>
          </div>
      `;
        return banner;
      }
      function insertBanner() {
        removeExistingBanner();
        const problemItems = findProblemItems();
        clearItemHighlights();
        if (problemItems.length === 0) return;
        injectStyle("cart-duplicate-warning", BANNER_CSS);
        highlightProblemItems(problemItems);
        const banner = createBanner(problemItems);
        document.body.insertBefore(banner, document.body.firstChild);
      }
      insertBanner();
      let debounceTimer = null;
      const observer = new MutationObserver(() => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(insertBanner, 150);
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["value", "class"]
      });
    }
  };

  // src/modules/heading-translator.js
  var HEADING_SELECTOR = ".section-find, .page-headline, .title-h2, h2.title";
  var TRANSLATIONS = /* @__PURE__ */ new Map([
    /* Product page headings */
    ["\u4F5C\u54C1\u60C5\u5831", "Product Information"],
    ["\u4F5C\u54C1\u8A73\u7D30", "Product Details"],
    ["\u7279\u5178\u60C5\u5831", "Bonus Information"],
    ["\u30B5\u30FC\u30AF\u30EB(\u5148\u751F)\u304B\u3089\u306E\u30B3\u30E1\u30F3\u30C8/\u4F5C\u54C1\u8A73\u7D30", "Circle/Creator Comments and Product Details"],
    ["\u30B9\u30BF\u30C3\u30D5\u306E\u30AA\u30B9\u30B9\u30E1\u30DD\u30A4\u30F3\u30C8", "Staff Recommendation"],
    ["\u3053\u306E\u30EC\u30FC\u30D9\u30EB\u306E\u4ED6\u306E\u4F5C\u54C1", "Other Works from This Label"],
    ["\u3053\u306E\u30B5\u30FC\u30AF\u30EB\u306E\u307B\u304B\u306E\u4F5C\u54C1", "Other Works from This Circle"],
    ["\u95A2\u9023\u4F5C\u54C1", "Related Works"],
    ["\u3088\u304F\u4E00\u7DD2\u306B\u8CB7\u308F\u308C\u3066\u3044\u308B\u5546\u54C1", "Frequently Bought Together"],
    ["\u307B\u304B\u306E\u4EBA\u306F\u3053\u3093\u306A\u5546\u54C1\u3082\u30C1\u30A7\u30C3\u30AF\u3057\u3066\u3044\u307E\u3059", "Other Customers Also Checked"],
    ["\u6700\u8FD1\u30C1\u30A7\u30C3\u30AF\u3057\u305F\u5546\u54C1", "Recently Viewed Items"],
    ["\u5E97\u8217\u5728\u5EAB", "Store Inventory"],
    ["\u5E97\u8217\u5728\u5EAB\u72B6\u6CC1", "Store Inventory Status"],
    /* Front page .section-find headings */
    ["\u30A4\u30F3\u30D5\u30A9\u30E1\u30FC\u30B7\u30E7\u30F3", "Information"],
    ["\u30D5\u30A7\u30A2\u30FB\u30A4\u30D9\u30F3\u30C8\u60C5\u5831", "Fair & Event Information"],
    ["\u30D4\u30C3\u30AF\u30A2\u30C3\u30D7", "Featured"],
    ["\u7DCF\u5408\u4E88\u7D04\u30E9\u30F3\u30AD\u30F3\u30B0", "Overall Preorder Ranking"],
    ["\u7DCF\u5408\u8CA9\u58F2\u30E9\u30F3\u30AD\u30F3\u30B0", "Overall Sales Ranking"],
    ["\u540C\u4EBA\u95A2\u9023\u60C5\u5831", "Doujin Information"],
    ["\u300E\u4E00\u822C\u540C\u4EBA\u8A8C\u300F\u30E9\u30F3\u30AD\u30F3\u30B0", "General Doujinshi Ranking"],
    ["\u300E\u30AA\u30EA\u30B8\u30CA\u30EB\u540C\u4EBA\u8A8C\u300F\u30E9\u30F3\u30AD\u30F3\u30B0", "Original Doujinshi Ranking"],
    ["\u300E\u30B5\u30D6\u30AB\u30EB\u540C\u4EBA\u8A8C\u300F\u30E9\u30F3\u30AD\u30F3\u30B0", "Subculture Doujinshi Ranking"],
    ["\u300E\u6210\u5E74\u540C\u4EBA\u8A8C\u300F\u30E9\u30F3\u30AD\u30F3\u30B0", "Adult Doujinshi Ranking"],
    ["\u300E\u540C\u4EBA\u8A8C\u300F\u65B0\u7740\u4F5C\u54C1", "New Doujinshi Releases"],
    ["\u300E\u540C\u4EBA\u30BD\u30D5\u30C8\u300F\u65B0\u7740\u4F5C\u54C1", "New Doujin Software Releases"],
    ["\u300E\u540C\u4EBA\u30A2\u30A4\u30C6\u30E0\u300F\u65B0\u7740\u4F5C\u54C1", "New Doujin Item Releases"],
    ["\u30B3\u30DF\u30C3\u30AF\u95A2\u9023\u60C5\u5831", "Comic Information"],
    ["\u300E\u30B3\u30DF\u30C3\u30AF\u300F\u30E9\u30F3\u30AD\u30F3\u30B0", "Comic Ranking"],
    ["\u300E\u30CE\u30D9\u30EB\u300F\u30E9\u30F3\u30AD\u30F3\u30B0", "Novel Ranking"],
    ["\u300E\u96D1\u8A8C\u30E0\u30C3\u30AF\u300F\u30E9\u30F3\u30AD\u30F3\u30B0", "Magazine/Mook Ranking"],
    ["\u300E\u6210\u5E74\u30B3\u30DF\u30C3\u30AF\u300F\u30E9\u30F3\u30AD\u30F3\u30B0", "Adult Comic Ranking"],
    ["\u300E\u30B3\u30DF\u30C3\u30AF\u300F\u65B0\u7740", "New Comics"],
    ["\u300E\u30CE\u30D9\u30EB\u300F\u65B0\u7740", "New Novels"],
    ["\u300E\u96D1\u8A8C\u30E0\u30C3\u30AF\u300F\u65B0\u7740", "New Magazines/Mooks"],
    ["\u300E\u6210\u5E74\u30B3\u30DF\u30C3\u30AF\u300F\u65B0\u7740", "New Adult Comics"],
    ["\u300E\u30B2\u30FC\u30E0\u300F\u30E9\u30F3\u30AD\u30F3\u30B0", "Game Ranking"],
    ["\u300E\u30B2\u30FC\u30E0\u300F\u65B0\u7740\u4F5C\u54C1", "New Game Releases"],
    ["\u30B0\u30C3\u30BA\u95A2\u9023\u60C5\u5831", "Goods Information"],
    ["\u300E\u30B0\u30C3\u30BA\u300F\u30E9\u30F3\u30AD\u30F3\u30B0", "Goods Ranking"],
    ["\u300E\u30B0\u30C3\u30BA\u300F\u65B0\u7740\u4F5C\u54C1", "New Goods Releases"],
    ["\u300E\u97F3\u697D\u300F\u30E9\u30F3\u30AD\u30F3\u30B0", "Music Ranking"],
    ["\u300E\u97F3\u697D\u300F\u65B0\u7740\u4F5C\u54C1", "New Music Releases"],
    ["\u300E\u6620\u50CF\u300F\u30E9\u30F3\u30AD\u30F3\u30B0", "Video Ranking"],
    ["\u300E\u6620\u50CF\u300F\u65B0\u7740\u4F5C\u54C1", "New Video Releases"],
    ["\u3046\u308A\u307C\u3046\u95A2\u9023\u60C5\u5831", "Uribou Information"],
    ["\u300E\u3046\u308A\u307C\u3046\u3056\u3063\u304B\u5E97\u300F\u30E9\u30F3\u30AD\u30F3\u30B0", "Uribou Zakka Shop Ranking"],
    ["\u300E\u3046\u308A\u307C\u3046\u3056\u3063\u304B\u5E97\u300F\u65B0\u7740\u4F5C\u54C1", "New Uribou Zakka Shop Releases"],
    ["\u96FB\u5B50\u66F8\u7C4D\u95A2\u9023\u60C5\u5831", "E-book Information"],
    ["\u300E\u540C\u4EBA\u8A8C(\u96FB\u5B50)\u300F\u65B0\u7740\u4F5C\u54C1", "New Doujinshi E-book Releases"],
    ["\u300E\u6210\u5E74\u30B3\u30DF\u30C3\u30AF(\u96FB\u5B50)\u300F\u65B0\u7740\u4F5C\u54C1", "New Adult Comic E-book Releases"],
    ["\u300E\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u300F\u65B0\u7740\u4F5C\u54C1", "New Download Releases"],
    ["\u300E\u96FB\u5B50\u66F8\u7C4D\u300F\u30E9\u30F3\u30AD\u30F3\u30B0", "E-book Ranking"],
    ["\u300E\u30C0\u30A6\u30F3\u30ED\u30FC\u30C9\u4F5C\u54C1\u300F\u30E9\u30F3\u30AD\u30F3\u30B0", "Download Works Ranking"],
    ["\u3042\u306A\u305F\u3078\u306E\u30AA\u30B9\u30B9\u30E1", "Recommendations for You"],
    ["\u304A\u77E5\u3089\u305B", "Notices"],
    ["\u3010\u30E9\u30F3\u30AD\u30F3\u30B0\u3011", "Ranking"],
    /* Front page .page-headline headings */
    ["\u6700\u65B0\u30E9\u30F3\u30AD\u30F3\u30B0\u60C5\u5831", "Latest Ranking Information"],
    ["\u4E88\u7D04\u958B\u59CB", "Preorders Open"],
    ["\u65B0\u5165\u8377", "New Arrivals"],
    ["\u4EBA\u6C17\u30AD\u30FC\u30EF\u30FC\u30C9", "Popular Keywords"],
    ["\u30B8\u30E3\u30F3\u30EB", "Genre"],
    ["\u30EC\u30FC\u30D9\u30EB\u3067\u63A2\u3059", "Search by Label"],
    ["\u30B5\u30FC\u30AF\u30EB\u3067\u63A2\u3059", "Search by Circle"],
    ["\u95A2\u9023\u30AD\u30FC\u30EF\u30FC\u30C9\u3067\u63A2\u3059", "Search by Related Keywords"],
    ["\u30B5\u30FC\u30AF\u30EB\u65B0\u7740\u6295\u7A3F\u753B\u50CF", "Latest Circle Posted Images"],
    ["\u30B5\u30FC\u30AF\u30EB\u65B0\u7740\u60C5\u5831", "Latest Circle News"],
    ["\u7279\u96C6\u60C5\u5831", "Feature Information"]
  ]);
  function normalizeText(text) {
    return String(text || "").replace(/\u00a0/g, " ").replace(/[ \t\r\n]+/g, " ").trim();
  }
  function getTextNodes(root) {
    const nodes = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node2) {
        const parent = node2.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tagName = parent.tagName.toLowerCase();
        if (tagName === "script" || tagName === "style" || tagName === "noscript") {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let node = walker.nextNode();
    while (node) {
      nodes.push(node);
      node = walker.nextNode();
    }
    return nodes;
  }
  function applyOriginalSpacing(originalText, replacementText) {
    const leadingSpace = String(originalText).match(/^\s*/)?.[0] || "";
    const trailingSpace = String(originalText).match(/\s*$/)?.[0] || "";
    return `${leadingSpace}${replacementText}${trailingSpace}`;
  }
  function replaceTextPreservingStructure(element, replacementText) {
    const textNodes = getTextNodes(element);
    const firstTextNode = textNodes.find((node) => normalizeText(node.nodeValue));
    if (!firstTextNode) {
      element.textContent = replacementText;
      return;
    }
    for (const node of textNodes) {
      if (node === firstTextNode) {
        node.nodeValue = applyOriginalSpacing(node.nodeValue, replacementText);
      } else if (normalizeText(node.nodeValue)) {
        node.nodeValue = "";
      }
    }
  }
  function translateElement(element) {
    if (!(element instanceof HTMLElement)) return;
    const japaneseText = normalizeText(element.textContent);
    if (!japaneseText) return;
    const englishText = TRANSLATIONS.get(japaneseText);
    if (!englishText || japaneseText === englishText) return;
    replaceTextPreservingStructure(element, englishText);
    element.dataset.melonbooksHeadingTranslatorOriginal = japaneseText;
  }
  function translateAll(root) {
    if (!root || !root.querySelectorAll) return;
    root.querySelectorAll(HEADING_SELECTOR).forEach((el) => translateElement(el));
  }
  var HeadingTranslatorModule = {
    id: "heading-translator",
    name: "Heading Translator",
    lifecycle: "document-start",
    matches(context) {
      return context.isMelonbooks;
    },
    init() {
      translateAll(document);
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          translateAll(document);
        }, { once: true });
      }
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement) {
              if (node.matches(HEADING_SELECTOR)) {
                translateElement(node);
              }
              translateAll(node);
            }
          }
          if (mutation.type === "characterData" && mutation.target && mutation.target.parentElement) {
            const heading = mutation.target.parentElement.closest(HEADING_SELECTOR);
            if (heading) {
              translateElement(heading);
            }
          }
        }
      });
      const startObserver = () => {
        const target = document.body || document.documentElement;
        if (target) {
          observer.observe(target, {
            childList: true,
            subtree: true,
            characterData: true
          });
        }
      };
      if (document.body || document.documentElement) {
        startObserver();
      } else {
        document.addEventListener("DOMContentLoaded", startObserver, { once: true });
      }
    }
  };

  // src/modules/product-info-layout.js
  var INSERTED_ID = "mb-userscript-table-wrapper-below-cart";
  var CONTAINER_ID = INSERTED_ID + "-container";
  var EBOOK_INSERTED_ID = "mb-userscript-ebook-table-wrapper-below-cart";
  var EBOOK_CONTAINER_ID = EBOOK_INSERTED_ID + "-container";
  var HASHTAG_TOGGLE_ID = "mb-userscript-hashtag-toggle";
  function findOriginalTableWrapper() {
    return Array.from(document.querySelectorAll(".item-detail .table-wrapper, .table-wrapper")).find(
      (el) => el.id !== INSERTED_ID && el.id !== EBOOK_INSERTED_ID && !el.closest("#" + CONTAINER_ID) && !el.closest("#" + EBOOK_CONTAINER_ID) && !el.closest("#rtoaster-template")
    );
  }
  function placeTableWrapper() {
    const itemCart = document.querySelector(".item-cart");
    if (!itemCart) return false;
    if (document.getElementById(CONTAINER_ID)) return true;
    const originalTableWrapper = findOriginalTableWrapper();
    if (!originalTableWrapper) return false;
    const itemMetasWrap = itemCart.closest(".item-metas-wrap");
    if (!itemMetasWrap) return false;
    const originalItemDetail = originalTableWrapper.closest(".item-detail");
    const container = document.createElement("div");
    container.className = "item-detail __light mt24";
    container.id = CONTAINER_ID;
    const heading = document.createElement("h3");
    heading.className = "page-headline mb12";
    heading.textContent = "\u4F5C\u54C1\u60C5\u5831";
    originalTableWrapper.id = INSERTED_ID;
    container.appendChild(heading);
    container.appendChild(originalTableWrapper);
    itemCart.insertAdjacentElement("afterend", container);
    if (originalItemDetail && originalItemDetail !== container) {
      originalItemDetail.style.display = "none";
    }
    document.querySelectorAll(".item-share.btn-share-group, .accordion-group, .author-name").forEach((el) => {
      el.style.display = "none";
    });
    return true;
  }
  function placeEbookTableWrapper() {
    const itemMetasWrap = document.querySelector(".item-metas-wrap");
    const productForm = itemMetasWrap ? itemMetasWrap.querySelector("#form_product") : null;
    const ebookCartButtons = itemMetasWrap ? itemMetasWrap.querySelector(".btn-cart") : null;
    if (!itemMetasWrap || !productForm || !ebookCartButtons) {
      return false;
    }
    if (document.getElementById(EBOOK_CONTAINER_ID)) {
      return true;
    }
    const isEbookLayout = document.querySelector(".item_detail_matrix_dl") || document.querySelector(".dl_notice") || itemMetasWrap.querySelector(".ebook-accordion") || itemMetasWrap.querySelector(".dl_cart_button") || Array.from(document.querySelectorAll(".item-notes")).some((el) => el.textContent.trim().includes("\u96FB\u5B50\u66F8\u7C4D"));
    if (!isEbookLayout) {
      return false;
    }
    const originalTableWrapper = findOriginalTableWrapper();
    if (!originalTableWrapper) {
      return false;
    }
    const originalItemDetail = originalTableWrapper.closest(".item-detail");
    const container = document.createElement("div");
    container.className = "item-detail __light mt24";
    container.id = EBOOK_CONTAINER_ID;
    const heading = document.createElement("h3");
    heading.className = "page-headline mb12";
    heading.textContent = "\u4F5C\u54C1\u60C5\u5831";
    originalTableWrapper.id = EBOOK_INSERTED_ID;
    container.appendChild(heading);
    container.appendChild(originalTableWrapper);
    productForm.insertAdjacentElement("afterend", container);
    if (originalItemDetail && originalItemDetail !== container) {
      originalItemDetail.style.display = "none";
    }
    document.querySelectorAll(".item-share.btn-share-group, .accordion-group, .author-name").forEach((el) => {
      el.style.display = "none";
    });
    return true;
  }
  function setupTagToggle() {
    const itemDetail2 = document.querySelector(".item-detail2");
    if (!itemDetail2) return false;
    if (document.getElementById(HASHTAG_TOGGLE_ID)) return true;
    itemDetail2.style.display = "none";
    const button = document.createElement("button");
    button.id = HASHTAG_TOGGLE_ID;
    button.type = "button";
    button.textContent = "Tags \u25BD";
    button.style.display = "block";
    button.style.width = "auto";
    button.style.minWidth = "120px";
    button.style.margin = "16px auto 8px";
    button.style.padding = "8px 16px";
    button.style.border = "1px solid #ccc";
    button.style.borderRadius = "4px";
    button.style.background = "#fff";
    button.style.cursor = "pointer";
    button.style.fontSize = "14px";
    button.style.textAlign = "center";
    button.addEventListener("click", () => {
      const isHidden = itemDetail2.style.display === "none";
      itemDetail2.style.display = isHidden ? "" : "none";
      button.textContent = isHidden ? "Tags \u25B3" : "Tags \u25BD";
    });
    itemDetail2.insertAdjacentElement("beforebegin", button);
    return true;
  }
  function placeProductInfoTable() {
    return placeTableWrapper() || placeEbookTableWrapper();
  }
  var ProductInfoLayoutModule = {
    id: "product-info-layout",
    name: "Product Info Layout",
    lifecycle: "document-idle",
    matches(context) {
      return context.route === "melonbooks-product" || /^\/(?:detail\/|products\/detail\.php)/.test(context.location.pathname);
    },
    init() {
      let tableReady = placeProductInfoTable();
      let tagToggleReady = setupTagToggle();
      if (tableReady && tagToggleReady) {
        return;
      }
      const observer = new MutationObserver(() => {
        if (!tableReady) {
          tableReady = placeProductInfoTable();
        }
        if (!tagToggleReady) {
          tagToggleReady = setupTagToggle();
        }
        if (tableReady && tagToggleReady) {
          observer.disconnect();
        }
      });
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true
      });
      setTimeout(() => observer.disconnect(), 1e4);
    }
  };

  // src/core/dom.js
  function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // src/modules/search-columns.js
  var STORAGE_KEYS = {
    columnCount: "mb_column_adjuster_column_count",
    sidePadding: "mb_column_adjuster_side_padding"
  };
  var DEFAULTS = {
    columnCount: 12,
    sidePadding: "16px",
    maxThumbWidth: "180px"
  };
  var PANEL_ID = "mb-column-adjuster-panel";
  var BUTTON_ID = "mb-column-adjuster-button";
  var UI_CSS = `
  #${BUTTON_ID} {
      position: fixed !important;
      left: 16px !important;
      bottom: 16px !important;
      z-index: 2147483647 !important;
      border: 1px solid #999 !important;
      border-radius: 9999px !important;
      padding: 10px 14px !important;
      font-size: 14px !important;
      line-height: 1 !important;
      cursor: pointer !important;
      background: #fff !important;
      color: #222 !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
  }

  #${BUTTON_ID}:hover {
      filter: brightness(0.97) !important;
  }

  #${PANEL_ID} {
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483647 !important;
  }

  #mb-column-adjuster-backdrop {
      position: absolute !important;
      inset: 0 !important;
      background: rgba(0, 0, 0, 0.35) !important;
  }

  #mb-column-adjuster-dialog {
      position: absolute !important;
      left: 16px !important;
      bottom: 64px !important;
      width: 320px !important;
      max-width: calc(100vw - 32px) !important;
      background: #fff !important;
      color: #222 !important;
      border: 1px solid #bbb !important;
      border-radius: 12px !important;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25) !important;
      padding: 14px !important;
      font-size: 14px !important;
      box-sizing: border-box !important;
  }

  #mb-column-adjuster-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 8px !important;
      margin-bottom: 12px !important;
  }

  #mb-column-adjuster-close {
      border: 1px solid #bbb !important;
      background: #fff !important;
      color: #222 !important;
      border-radius: 8px !important;
      width: 32px !important;
      height: 32px !important;
      cursor: pointer !important;
      font-size: 20px !important;
      line-height: 1 !important;
  }

  .mb-column-adjuster-field {
      display: block !important;
      margin-bottom: 12px !important;
  }

  .mb-column-adjuster-field > span {
      display: block !important;
      margin-bottom: 6px !important;
      font-weight: 600 !important;
  }

  .mb-column-adjuster-field > input {
      width: 100% !important;
      box-sizing: border-box !important;
      border: 1px solid #bbb !important;
      border-radius: 8px !important;
      padding: 8px 10px !important;
      font-size: 14px !important;
      background: #fff !important;
      color: #222 !important;
  }

  #mb-column-adjuster-help {
      font-size: 12px !important;
      color: #555 !important;
      margin-bottom: 12px !important;
  }

  #mb-column-adjuster-help code {
      background: #f3f3f3 !important;
      padding: 1px 4px !important;
      border-radius: 4px !important;
  }

  #mb-column-adjuster-actions {
      display: flex !important;
      justify-content: flex-end !important;
      gap: 8px !important;
  }

  #mb-column-adjuster-actions > button {
      border: 1px solid #bbb !important;
      background: #fff !important;
      color: #222 !important;
      border-radius: 8px !important;
      padding: 8px 12px !important;
      cursor: pointer !important;
      font-size: 14px !important;
  }
`;
  function getSavedColumnCount() {
    const raw = localStorage.getItem(STORAGE_KEYS.columnCount);
    const parsed = Number.parseInt(raw || "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULTS.columnCount;
  }
  function getSavedSidePadding() {
    const raw = (localStorage.getItem(STORAGE_KEYS.sidePadding) || "").trim();
    return raw || DEFAULTS.sidePadding;
  }
  function buildCss(columnCount, sidePadding) {
    return `
    /* Remove page-width caps from the outer wrappers */
    html, body,
    #container,
    .container_otherpage,
    .utBReFvXjp-wrap,
    .utBReFvXjp-wrap_otherpage,
    .utBReFvXjp-column-main,
    #contents,
    .search-page,
    .item-list {
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
    }

    /* Break centered layout padding */
    #container,
    .container_otherpage,
    .utBReFvXjp-wrap,
    .utBReFvXjp-wrap_otherpage {
        padding-left: 0 !important;
        padding-right: 0 !important;
        box-sizing: border-box !important;
    }

    /* Hide sidebar */
    .utBReFvXjp-column-navi {
        display: none !important;
        width: 0 !important;
        max-width: 0 !important;
        flex: 0 0 0 !important;
    }

    /* Add side breathing room */
    .utBReFvXjp-column-main,
    #contents,
    .search-page,
    .item-list {
        box-sizing: border-box !important;
        padding-left: ${sidePadding} !important;
        padding-right: ${sidePadding} !important;
    }

    /* Grid layout */
    .item-list > ul {
        display: grid !important;
        grid-template-columns: repeat(${columnCount}, minmax(0, 1fr)) !important;
        width: 100% !important;
        max-width: none !important;
        padding: 0 !important;
        margin: 0 !important;
        justify-items: center !important;
    }

    .item-list > ul > li {
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
    }

    .item-list > ul > li.item-list__placeholder {
        display: none !important;
    }

    /* Prevent thumbnail stretching */
    .item-list .item-image,
    .item-list .item-thumbnail {
        width: 100% !important;
        max-width: ${DEFAULTS.maxThumbWidth} !important;
        margin-left: auto !important;
        margin-right: auto !important;
    }

    .item-list .item-thumbnail img,
    .item-list .item-image img {
        width: 100% !important;
        height: auto !important;
        max-width: ${DEFAULTS.maxThumbWidth} !important;
        object-fit: contain !important;
    }

    .item-list .item-meta {
        width: 100% !important;
        max-width: ${DEFAULTS.maxThumbWidth} !important;
    }
  `;
  }
  function applyDynamicStyle() {
    const columnCount = getSavedColumnCount();
    const sidePadding = getSavedSidePadding();
    const css = buildCss(columnCount, sidePadding);
    injectStyle("search-columns-dynamic", css);
  }
  function closePanel() {
    const panel = document.getElementById(PANEL_ID);
    if (panel) panel.remove();
  }
  function openPanel() {
    closePanel();
    const currentColumns = getSavedColumnCount();
    const currentPadding = getSavedSidePadding();
    const panel = document.createElement("div");
    panel.id = PANEL_ID;
    panel.innerHTML = `
      <div id="mb-column-adjuster-backdrop"></div>
      <div id="mb-column-adjuster-dialog" role="dialog" aria-modal="true" aria-label="Melonbooks layout settings">
          <div id="mb-column-adjuster-header">
              <strong>Melonbooks Layout</strong>
              <button type="button" id="mb-column-adjuster-close" aria-label="Close">\xD7</button>
          </div>

          <label class="mb-column-adjuster-field">
              <span>Column count</span>
              <input id="mb-column-adjuster-columns" type="number" min="1" step="1" value="${escapeHtml(currentColumns)}">
          </label>

          <label class="mb-column-adjuster-field">
              <span>Side padding</span>
              <input id="mb-column-adjuster-padding" type="text" value="${escapeHtml(currentPadding)}" placeholder="16px">
          </label>

          <div id="mb-column-adjuster-help">
              Side padding accepts CSS units like <code>16px</code>, <code>1rem</code>, or <code>2vw</code>.
          </div>

          <div id="mb-column-adjuster-actions">
              <button type="button" id="mb-column-adjuster-reset">Reset</button>
              <button type="button" id="mb-column-adjuster-save">Save</button>
          </div>
      </div>
  `;
    document.body.appendChild(panel);
    const backdrop = panel.querySelector("#mb-column-adjuster-backdrop");
    const closeBtn = panel.querySelector("#mb-column-adjuster-close");
    const saveBtn = panel.querySelector("#mb-column-adjuster-save");
    const resetBtn = panel.querySelector("#mb-column-adjuster-reset");
    const columnsInput = panel.querySelector("#mb-column-adjuster-columns");
    const paddingInput = panel.querySelector("#mb-column-adjuster-padding");
    function saveSettings() {
      const parsedColumns = Number.parseInt(columnsInput.value, 10);
      const safeColumns = Number.isFinite(parsedColumns) && parsedColumns > 0 ? parsedColumns : DEFAULTS.columnCount;
      const safePadding = paddingInput.value.trim() || DEFAULTS.sidePadding;
      localStorage.setItem(STORAGE_KEYS.columnCount, String(safeColumns));
      localStorage.setItem(STORAGE_KEYS.sidePadding, safePadding);
      applyDynamicStyle();
      closePanel();
    }
    function resetSettings() {
      localStorage.removeItem(STORAGE_KEYS.columnCount);
      localStorage.removeItem(STORAGE_KEYS.sidePadding);
      applyDynamicStyle();
      closePanel();
    }
    backdrop.addEventListener("click", closePanel);
    closeBtn.addEventListener("click", closePanel);
    saveBtn.addEventListener("click", saveSettings);
    resetBtn.addEventListener("click", resetSettings);
    panel.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closePanel();
      }
    });
    columnsInput.focus();
    columnsInput.select();
  }
  function addControlButton() {
    if (document.getElementById(BUTTON_ID)) return;
    const button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.textContent = "Layout";
    button.addEventListener("click", openPanel);
    document.body.appendChild(button);
  }
  var SearchColumnsModule = {
    id: "search-columns",
    name: "Search Columns",
    lifecycle: "dom-ready",
    matches(context) {
      return context.route === "melonbooks-search" || context.location.pathname.startsWith("/search/") || context.location.pathname.includes("search.php");
    },
    init() {
      injectStyle("search-columns-ui", UI_CSS);
      const hasResults = () => !!document.querySelector(".item-list > ul, .item-list");
      if (hasResults()) {
        applyDynamicStyle();
        addControlButton();
      } else {
        const observer = new MutationObserver(() => {
          if (hasResults()) {
            observer.disconnect();
            applyDynamicStyle();
            addControlButton();
          }
        });
        observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
      }
    }
  };

  // src/modules/force-listing-images.js
  var LOAD_SAMPLE_IMAGES = false;
  var PRELOAD_CONCURRENCY = 6;
  var PLACEHOLDER_PATTERNS = [
    "now_printing.jpeg",
    "now_printing.jpg",
    "noimage"
  ];
  var ForceListingImagesModule = {
    id: "force-listing-images",
    name: "Force Load Listing Images",
    lifecycle: "document-start",
    matches(context) {
      return context.isMelonbooks && !context.location.pathname.startsWith("/detail/");
    },
    init(context) {
      const pendingPreloads = [];
      let activePreloads = 0;
      function isListingPage() {
        if (context.location.pathname.startsWith("/detail/")) return false;
        return Boolean(
          document.querySelector(".item-list, .search-page, .ranking, .item-thumbnail, #rtoaster-template")
        );
      }
      function decodeHtmlEntities(value) {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = value;
        return textarea.value;
      }
      function toAbsoluteUrl(url) {
        if (!url) return "";
        const decoded = decodeHtmlEntities(url.trim());
        if (decoded.startsWith("//")) {
          return context.location.protocol + decoded;
        }
        try {
          return new URL(decoded, context.location.href).href;
        } catch {
          return decoded;
        }
      }
      function looksLikePlaceholder(url) {
        if (!url) return false;
        return PLACEHOLDER_PATTERNS.some((pattern) => url.includes(pattern));
      }
      function shouldProcessImage(img) {
        if (!(img instanceof HTMLImageElement)) return false;
        const realSrc = img.getAttribute("data-src") || img.dataset.src;
        if (!realSrc) return false;
        if (LOAD_SAMPLE_IMAGES) return true;
        return Boolean(
          img.closest(".item-thumbnail") || img.classList.contains("lazyload_product")
        );
      }
      function queuePreload(src) {
        if (!src) return;
        if (pendingPreloads.includes(src)) return;
        pendingPreloads.push(src);
        runPreloadQueue();
      }
      function runPreloadQueue() {
        while (activePreloads < PRELOAD_CONCURRENCY && pendingPreloads.length > 0) {
          const src = pendingPreloads.shift();
          activePreloads += 1;
          const image = new Image();
          image.decoding = "async";
          image.loading = "eager";
          image.onload = image.onerror = function() {
            activePreloads -= 1;
            runPreloadQueue();
          };
          image.src = src;
        }
      }
      function forceImage(img) {
        if (!shouldProcessImage(img)) return;
        const realSrc = toAbsoluteUrl(img.getAttribute("data-src") || img.dataset.src);
        if (!realSrc) return;
        img.loading = "eager";
        img.decoding = "async";
        img.fetchPriority = "high";
        img.classList.remove("lazyload", "lazyloading");
        img.classList.add("lazyloaded", "melon-force-loaded");
        img.setAttribute("data-melon-force-src", realSrc);
        const currentSrc = img.getAttribute("src") || "";
        if (!currentSrc || looksLikePlaceholder(currentSrc) || currentSrc !== realSrc) {
          img.src = realSrc;
        }
        queuePreload(realSrc);
      }
      function forceImages(root = document) {
        if (!isListingPage()) return;
        const selector = LOAD_SAMPLE_IMAGES ? "img[data-src], img[data-srcset], source[data-srcset]" : ".item-thumbnail img[data-src], img.lazyload_product[data-src]";
        root.querySelectorAll(selector).forEach((node) => {
          if (node instanceof HTMLImageElement) {
            forceImage(node);
          }
        });
      }
      function watchForNewImages() {
        const observer = new MutationObserver((mutations) => {
          for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
              if (!(node instanceof Element)) continue;
              if (node.matches && node.matches("img[data-src]")) {
                forceImage(node);
              }
              forceImages(node);
            }
          }
        });
        observer.observe(document.documentElement, {
          childList: true,
          subtree: true
        });
      }
      function start() {
        forceImages();
        watchForNewImages();
        setTimeout(forceImages, 250);
        setTimeout(forceImages, 1e3);
        setTimeout(forceImages, 2500);
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
      } else {
        start();
      }
    }
  };

  // src/modules/listing-hover.js
  var PROCESSED_ATTR = "data-mb-hover-meta-ready";
  var RETRY_DELAYS_MS = [250, 1e3, 2500];
  var LISTING_HOVER_CSS = `
  .item-list li[${PROCESSED_ATTR}="1"] {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    box-sizing: border-box !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .item-info {
    display: none !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .item-image {
    display: flex !important;
    position: relative !important;
    flex: 1 0 auto !important;
    align-items: flex-end !important;
    justify-content: center !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    line-height: 0 !important;
    overflow: visible !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .item-image > a:not(.pop_link) {
    display: flex !important;
    align-items: flex-end !important;
    justify-content: center !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    line-height: 0 !important;
    overflow: visible !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail {
    display: flex !important;
    position: relative !important;
    align-items: flex-end !important;
    justify-content: center !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    margin-top: auto !important;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    line-height: 0 !important;
    overflow: visible !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail::before,
  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail::after {
    display: none !important;
    content: none !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail img {
    display: block !important;
    box-sizing: border-box !important;
    width: auto !important;
    height: auto !important;
    max-width: 100% !important;
    max-height: 100% !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    object-fit: contain !important;
    vertical-align: top !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail > .mb-hover-monopoly-label {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: auto !important;
    bottom: auto !important;
    z-index: 15 !important;
    display: block !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    line-height: normal !important;
    pointer-events: none !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail > .mb-hover-state-badges {
    position: absolute !important;
    top: 0 !important;
    right: 0 !important;
    z-index: 25 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-end !important;
    gap: 2px !important;
    box-sizing: border-box !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    line-height: normal !important;
    pointer-events: none !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail > .mb-hover-state-badges > .mb-hover-special-state {
    display: block !important;
    position: static !important;
    box-sizing: border-box !important;
    width: auto !important;
    min-width: max-content !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 2px 5px !important;
    background-color: #F8C771 !important;
    color: #fff !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    line-height: 1.15 !important;
    text-align: center !important;
    white-space: nowrap !important;
    overflow: visible !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail > .mb-hover-state-badges > .mb-hover-ranking-state {
    display: flex !important;
    position: static !important;
    box-sizing: border-box !important;
    width: auto !important;
    min-width: max-content !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 2px 5px !important;
    background-color: red !important;
    color: #fff !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    line-height: 1.15 !important;
    text-align: center !important;
    white-space: nowrap !important;
    overflow: visible !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail > .mb-hover-state-badges > .mb-hover-rank-badge {
    position: static !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    line-height: normal !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail > .mb-hover-privilege-title {
    position: absolute !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    top: auto !important;
    z-index: 18 !important;
    display: block !important;
    box-sizing: border-box !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 4px 6px !important;
    text-align: center !important;
    line-height: 1.25 !important;
    pointer-events: none !important;
  }

  .mb-hover-meta-overlay.mb-hover-meta-overlay-has-top-info {
    padding-top: 30px;
  }

  .mb-hover-meta-overlay.mb-hover-meta-overlay-has-top-info.mb-hover-meta-overlay-has-author-pop {
    padding-top: 56px;
  }

  .mb-hover-meta-overlay > .mb-hover-top-info {
    position: absolute !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
    bottom: auto !important;
    z-index: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    box-sizing: border-box !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    line-height: normal !important;
    overflow: hidden !important;
  }

  .mb-hover-meta-overlay > .mb-hover-top-info,
  .mb-hover-meta-overlay > .mb-hover-top-info * {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }

  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-pop-link,
  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-author-pop {
    display: block !important;
    position: static !important;
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: none !important;
    padding: 0 6px !important;
    border: 0 !important;
    text-align: center !important;
    text-decoration: none !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    transform: none !important;
    transition: none !important;
    cursor: pointer !important;
  }

  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-pop-link:hover,
  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-pop-link:focus,
  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-author-pop:hover,
  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-author-pop:focus {
    text-decoration: none !important;
  }

  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-pop-link .item-ttl,
  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-pop-link .pop,
  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-author-pop .item-ttl,
  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-author-pop .pop {
    display: block !important;
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: none !important;
    padding: 0 !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    line-height: 1.35 !important;
    text-align: center !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .mb-hover-meta-wrap {
    position: relative !important;
  }

  .mb-hover-meta-overlay {
    position: absolute;
    inset: 0;
    z-index: 60;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    overflow: hidden;
    box-sizing: border-box;
    padding: 10px;
    background: rgba(0, 0, 0, 0.68);
    color: #fff;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
    line-height: normal;
  }

  .mb-hover-meta-wrap:hover > .mb-hover-meta-overlay {
    opacity: 1;
    pointer-events: auto;
  }

  .mb-hover-meta-overlay > :not(.mb-hover-top-info) a {
    color: #fff !important;
    text-decoration: none;
  }

  .mb-hover-meta-overlay > :not(.mb-hover-top-info) a:hover {
    text-decoration: underline;
  }

  .mb-hover-meta-overlay > .item-meta {
    display: flex !important;
    flex: 1 1 auto !important;
    flex-direction: column !important;
    align-items: stretch !important;
    justify-content: flex-start !important;
    box-sizing: border-box !important;
    width: 100% !important;
    min-height: 0 !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  .mb-hover-meta-overlay > .item-meta > .mb-hover-product-title-wrap {
    display: block !important;
    flex: 1 0 57px !important;
    box-sizing: border-box !important;
    width: 100% !important;
    min-width: 0 !important;
    min-height: 57px !important;
    height: auto !important;
    max-height: none !important;
    margin: 0 0 8px !important;
    padding: 0 !important;
    overflow: hidden !important;
    white-space: normal !important;
  }

  .mb-hover-meta-overlay > .item-meta > .mb-hover-product-title-wrap > .mb-hover-product-title,
  .mb-hover-meta-overlay > .item-meta > .product_title,
  .mb-hover-meta-overlay > .item-meta > p.item-ttl.product_title {
    display: block !important;
    box-sizing: border-box !important;
    width: 100% !important;
    min-width: 0 !important;
    min-height: 57px !important;
    height: auto !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 0 !important;
    color: #fff !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    line-height: 19px !important;
    white-space: normal !important;
    word-break: break-word !important;
    overflow: visible !important;
    text-overflow: clip !important;
    -webkit-line-clamp: unset !important;
    line-clamp: unset !important;
    -webkit-box-orient: initial !important;
  }

  .mb-hover-meta-overlay > .item-meta > .mb-hover-product-title-wrap > .mb-hover-product-title a,
  .mb-hover-meta-overlay > .item-meta > .product_title a,
  .mb-hover-meta-overlay > .item-meta > p.item-ttl.product_title a {
    display: inline !important;
    width: auto !important;
    min-height: 0 !important;
    height: auto !important;
    max-height: none !important;
    line-height: inherit !important;
    white-space: normal !important;
    word-break: break-word !important;
    overflow: visible !important;
    text-overflow: clip !important;
    -webkit-line-clamp: unset !important;
    line-clamp: unset !important;
    -webkit-box-orient: initial !important;
  }

  .mb-hover-meta-overlay > .item-meta > .ancillary_info {
    display: block !important;
    flex: 0 0 auto !important;
    box-sizing: border-box !important;
    width: 100% !important;
    min-height: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 6px !important;
    overflow: visible !important;
  }

  .mb-hover-meta-overlay .item-ttl:not(.pop),
  .mb-hover-meta-overlay .product_title,
  .mb-hover-meta-overlay p.item-ttl.product_title {
    margin: 0 0 8px;
    color: #fff !important;
    font-size: 14px;
    line-height: 19px;
    font-weight: 700;
  }

  .mb-hover-meta-overlay p,
  .mb-hover-meta-overlay div {
    margin-top: 0;
    margin-bottom: 6px;
  }

  .mb-hover-meta-overlay .item-state-special,
  .mb-hover-meta-overlay .item-state-ranking,
  .mb-hover-meta-overlay .label-monopoly,
  .mb-hover-meta-overlay .privilege_title,
  .mb-hover-meta-overlay .rank {
    display: none !important;
  }

  .mb-hover-meta-overlay .coupling_info {
    display: block !important;
    max-width: 100% !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    line-height: 1.35 !important;
  }

  .mb-hover-meta-overlay .coupling_info a {
    display: inline !important;
    white-space: nowrap !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row {
    display: flex !important;
    flex: 0 0 auto !important;
    align-items: center;
    justify-content: space-between;
    clear: both !important;
    float: none !important;
    gap: 8px;
    box-sizing: border-box;
    width: 100%;
    margin: 4px 0 0;
    padding: 0 2px;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row.mb-hover-action-row-no-price {
    justify-content: stretch !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row .item-price {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row .item-price .mb-hover-discount-price {
    color: inherit;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row .mb-hover-cart-buttons {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row.mb-hover-action-row-no-price .mb-hover-cart-buttons {
    flex: 1 1 100%;
    width: 100%;
    justify-content: stretch;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row a.to_cart,
  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row a.to_request.resale_request {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-height: 26px;
    padding: 4px 8px;
    border-radius: 0 !important;
    background: #FFBB41 !important;
    color: #fff !important;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.2;
    text-decoration: none !important;
    white-space: nowrap;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row.mb-hover-action-row-no-price a.to_cart,
  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row.mb-hover-action-row-no-price a.to_request.resale_request {
    flex: 1 1 100%;
    width: 100%;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row a.to_cart.reserve {
    background: #11C3CC !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row a.to_request.resale_request {
    background: #d9534f !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row a.to_cart i,
  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row a.to_request.resale_request i {
    margin-right: 4px;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .item-meta {
    display: none !important;
  }
`;
  function removeOverlayOnlyElements(metaClone) {
    const firstP = metaClone.querySelector('p[style*="opacity: 0"]');
    if (firstP) firstP.remove();
    metaClone.querySelectorAll(
      "a.open_sample, .item-price, .search-item-detail-btn-list, .item-state-special, .item-state-ranking, .label-monopoly, .privilege_title, .pop_link, .search-item-author-author.pop, .rank"
    ).forEach((node) => {
      node.remove();
    });
  }
  function markOverlayTitle(metaClone) {
    const productTitle = metaClone.querySelector(".product_title");
    if (!productTitle) return;
    productTitle.classList.add("mb-hover-product-title");
    const titleWrap = productTitle.closest("a");
    if (titleWrap && titleWrap.parentElement === metaClone) {
      titleWrap.classList.add("mb-hover-product-title-wrap");
    }
  }
  function prepareOverlayMetaClone(metaClone) {
    removeOverlayOnlyElements(metaClone);
    markOverlayTitle(metaClone);
  }
  function hasVisibleText(node) {
    return Boolean(node && node.textContent.replace(/\s|\u00a0/g, "").length > 0);
  }
  function getDiscountPriceSpan(price) {
    if (!price) return null;
    const directSpans = Array.from(price.children).filter((child) => {
      return child instanceof HTMLElement && child.tagName.toLowerCase() === "span";
    });
    if (directSpans.length >= 2 && hasVisibleText(directSpans[1])) {
      return directSpans[1];
    }
    const fallbackSpan = price.querySelector("span:nth-of-type(2)");
    if (fallbackSpan && hasVisibleText(fallbackSpan)) {
      return fallbackSpan;
    }
    return null;
  }
  function prepareDisplayPrice(price) {
    if (!price) return;
    const discountSpan = getDiscountPriceSpan(price);
    if (!discountSpan) return;
    const computedColor = window.getComputedStyle(discountSpan).color;
    discountSpan.classList.add("mb-hover-discount-price");
    if (computedColor) {
      discountSpan.style.color = computedColor;
    }
    price.textContent = "";
    price.appendChild(discountSpan);
  }
  function removeItemInfo(item) {
    const itemInfo = item.querySelector(":scope > .item-info");
    if (itemInfo) {
      itemInfo.remove();
    }
  }
  function movePrivilegeTitle(item, thumbnail) {
    if (!thumbnail) return;
    const privilegeTitle = item.querySelector(":scope > .item-image .privilege_title");
    if (!privilegeTitle) return;
    privilegeTitle.classList.add("mb-hover-privilege-title");
    thumbnail.appendChild(privilegeTitle);
  }
  function movePopElementsToOverlay(item, overlay) {
    if (!overlay) return;
    const popLink = item.querySelector(":scope > .item-meta > .pop_link");
    const authorPop = item.querySelector(":scope > .item-meta > .search-item-author-author.pop") || item.querySelector(":scope > .item-meta .search-item-author-author.pop");
    if (!popLink && !authorPop) return;
    const topInfo = document.createElement("div");
    topInfo.className = "mb-hover-top-info";
    overlay.classList.add("mb-hover-meta-overlay-has-top-info");
    if (popLink) {
      popLink.classList.add("mb-hover-pop-link");
      topInfo.appendChild(popLink);
    }
    if (authorPop) {
      authorPop.classList.add("mb-hover-author-pop");
      overlay.classList.add("mb-hover-meta-overlay-has-author-pop");
      topInfo.appendChild(authorPop);
    }
    overlay.insertAdjacentElement("afterbegin", topInfo);
  }
  function moveMonopolyLabel(item, thumbnail) {
    if (!thumbnail) return;
    const monopolyLabel = item.querySelector(":scope > .item-image > a > span.label-monopoly") || item.querySelector(":scope > .item-image > a > .item-thumbnail > .label-monopoly") || item.querySelector(":scope > .item-image .label-monopoly");
    if (!monopolyLabel) return;
    monopolyLabel.classList.add("mb-hover-monopoly-label");
    thumbnail.insertAdjacentElement("afterbegin", monopolyLabel);
  }
  function getOrCreateStateBadgeContainer(thumbnail) {
    let container = thumbnail.querySelector(":scope > .mb-hover-state-badges");
    if (!container) {
      container = document.createElement("div");
      container.className = "mb-hover-state-badges";
      thumbnail.insertAdjacentElement("afterbegin", container);
    }
    return container;
  }
  function findRankElement(item) {
    return item.querySelector(":scope > .item-info > .rank") || item.querySelector(":scope > .item-info .rank") || item.querySelector(":scope > .item-image > .rank") || item.querySelector(":scope > .item-image .rank") || item.querySelector(":scope > .item-meta > .rank") || item.querySelector(":scope > .item-meta .rank");
  }
  function moveImageStateBadges(item, thumbnail) {
    if (!thumbnail) return;
    const badgeContainer = getOrCreateStateBadgeContainer(thumbnail);
    const rankingState = item.querySelector(":scope > .item-info > p.item-state.item-state-ranking");
    if (rankingState) {
      rankingState.classList.add("mb-hover-ranking-state");
      badgeContainer.appendChild(rankingState);
    }
    const specialState = item.querySelector(":scope > .item-info > p.item-state.item-state-special");
    if (specialState) {
      specialState.classList.add("mb-hover-special-state");
      badgeContainer.appendChild(specialState);
    }
    const rank = findRankElement(item);
    if (rank) {
      rank.classList.add("mb-hover-rank-badge");
      badgeContainer.appendChild(rank);
    }
    if (!badgeContainer.children.length) {
      badgeContainer.remove();
    }
  }
  function buildActionRow(meta) {
    const price = meta.querySelector(":scope > .item-price") || meta.querySelector(".item-price");
    const priceHasText = hasVisibleText(price);
    const actionButtons = Array.from(
      meta.querySelectorAll(
        ".search-item-detail-btn-list a.to_cart, .search-item-detail-btn-list a.to_request.resale_request"
      )
    );
    if (!priceHasText && actionButtons.length === 0) return null;
    const row = document.createElement("div");
    row.className = priceHasText ? "mb-hover-action-row" : "mb-hover-action-row mb-hover-action-row-no-price";
    if (priceHasText) {
      prepareDisplayPrice(price);
      row.appendChild(price);
    }
    if (actionButtons.length > 0) {
      const buttonWrap = document.createElement("div");
      buttonWrap.className = "mb-hover-cart-buttons";
      actionButtons.forEach((button) => {
        buttonWrap.appendChild(button);
      });
      row.appendChild(buttonWrap);
    }
    return row;
  }
  function enhanceItem(item) {
    if (!(item instanceof HTMLElement)) return;
    if (item.getAttribute(PROCESSED_ATTR) === "1") return;
    const itemImage = item.querySelector(":scope > .item-image");
    const thumbnail = item.querySelector(".item-thumbnail");
    const meta = item.querySelector(":scope > .item-meta");
    if (!itemImage || !thumbnail || !meta) return;
    itemImage.classList.add("mb-hover-meta-wrap");
    moveMonopolyLabel(item, thumbnail);
    moveImageStateBadges(item, thumbnail);
    removeItemInfo(item);
    movePrivilegeTitle(item, thumbnail);
    const overlay = document.createElement("div");
    overlay.className = "mb-hover-meta-overlay";
    movePopElementsToOverlay(item, overlay);
    const metaClone = meta.cloneNode(true);
    prepareOverlayMetaClone(metaClone);
    overlay.appendChild(metaClone);
    itemImage.appendChild(overlay);
    const actionRow = buildActionRow(meta);
    if (actionRow) {
      itemImage.insertAdjacentElement("afterend", actionRow);
    }
    item.setAttribute(PROCESSED_ATTR, "1");
  }
  function collectItemsFromNode(node, items) {
    if (!(node instanceof HTMLElement)) return;
    if (node.matches?.(".item-list li")) {
      items.add(node);
    }
    const closestItem = node.closest?.(".item-list li");
    if (closestItem) {
      items.add(closestItem);
    }
    node.querySelectorAll?.(".item-list li").forEach((item) => {
      items.add(item);
    });
  }
  var ListingHoverModule = {
    id: "listing-hover",
    name: "Listing Hover",
    lifecycle: "dom-ready",
    matches(context) {
      return context.isMelonbooks;
    },
    init() {
      injectStyle("listing-hover", LISTING_HOVER_CSS);
      const pendingItems = /* @__PURE__ */ new Set();
      let queueScheduled = false;
      function flushEnhanceQueue() {
        queueScheduled = false;
        const items = Array.from(pendingItems);
        pendingItems.clear();
        items.forEach(enhanceItem);
      }
      function queueEnhanceItem(item) {
        if (!(item instanceof HTMLElement)) return;
        pendingItems.add(item);
        if (queueScheduled) return;
        queueScheduled = true;
        requestAnimationFrame(flushEnhanceQueue);
      }
      function queueEnhanceFromNode(node) {
        if (!(node instanceof HTMLElement)) return;
        const items = /* @__PURE__ */ new Set();
        collectItemsFromNode(node, items);
        items.forEach(queueEnhanceItem);
      }
      function enhanceAll(root = document) {
        const items = /* @__PURE__ */ new Set();
        if (root instanceof Document) {
          root.querySelectorAll(".item-list li").forEach((item) => {
            items.add(item);
          });
        } else {
          collectItemsFromNode(root, items);
        }
        items.forEach(enhanceItem);
      }
      enhanceAll();
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.target instanceof HTMLElement) {
            queueEnhanceFromNode(mutation.target);
          }
          for (const node of mutation.addedNodes) {
            queueEnhanceFromNode(node);
          }
        }
      });
      observer.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
      });
      RETRY_DELAYS_MS.forEach((delay) => {
        setTimeout(() => {
          enhanceAll();
        }, delay);
      });
    }
  };

  // src/modules/orders-grid-infinite-scroll.js
  var ScriptConfig = {
    columnCount: 5,
    minColumnCount: 2,
    maxColumnCount: 12,
    columnCountStorageKey: "melonbooksOrdersColumnCount",
    productSpacingPx: 0,
    minProductSpacingPx: 0,
    maxProductSpacingPx: 100,
    productSpacingStorageKey: "melonbooksOrdersProductSpacingPx",
    fullWidthHorizontalPaddingPx: 12,
    productInfoRowSpacingPx: 1,
    productCardBackground: "transparent",
    productCardBorderColor: "rgba(128, 128, 128, 0.35)",
    defaultSearchSelectValue: "3",
    autoSubmitDefaultSearchPeriod: true,
    infiniteScrollEnabled: true,
    infiniteScrollRootMarginPx: 1200,
    hideOriginalPagination: false
  };
  var ORDERS_CSS = `
  :root {
    --mb-orders-column-count: ${ScriptConfig.columnCount};
    --mb-orders-product-spacing: ${ScriptConfig.productSpacingPx}px;
  }

  /* Remove fixed-width constraints */
  body #container.container_otherpage,
  body #container.container_otherpage > .utBReFvXjp-wrap,
  body #container.container_otherpage .utBReFvXjp-column-main,
  body #container.container_otherpage #contents,
  body #container.container_otherpage .my-page {
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
    box-sizing: border-box !important;
  }

  body #container.container_otherpage {
    padding-left: ${ScriptConfig.fullWidthHorizontalPaddingPx}px !important;
    padding-right: ${ScriptConfig.fullWidthHorizontalPaddingPx}px !important;
  }

  body #container.container_otherpage > .utBReFvXjp-wrap,
  body #container.container_otherpage .utBReFvXjp-column-main,
  body #container.container_otherpage #contents,
  body #container.container_otherpage .my-page {
    margin-left: 0 !important;
    margin-right: 0 !important;
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  body #container.container_otherpage .utBReFvXjp-column-main {
    float: none !important;
    flex: 1 1 100% !important;
  }

  body #container.container_otherpage .page-content-body,
  body #container.container_otherpage .page-content-body.history-detail {
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
    margin-left: 0 !important;
    margin-right: 0 !important;
    box-sizing: border-box !important;
  }

  /* Grid configuration controls */
  .mb-orders-grid-controls {
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-end !important;
    gap: 6px !important;
    width: 100% !important;
    margin: 0 0 16px 0 !important;
    padding: 8px 0 !important;
    box-sizing: border-box !important;
    color: inherit !important;
    background: transparent !important;
  }

  .mb-orders-setting-row {
    display: flex !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 8px !important;
    margin: 0 !important;
    padding: 0 !important;
    color: inherit !important;
    background: transparent !important;
  }

  .mb-orders-setting-label {
    display: inline-block !important;
    min-width: 120px !important;
    color: inherit !important;
    font: inherit !important;
    font-size: 13px !important;
    line-height: 1.2 !important;
    text-align: right !important;
  }

  .mb-orders-setting-value {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    min-width: 58px !important;
    min-height: 36px !important;
    padding: 0 8px !important;
    box-sizing: border-box !important;
    border: 1px solid ${ScriptConfig.productCardBorderColor} !important;
    border-radius: 4px !important;
    color: inherit !important;
    font: inherit !important;
    font-size: 13px !important;
    line-height: 1.2 !important;
    font-weight: 700 !important;
    text-align: center !important;
    background: transparent !important;
  }

  .mb-orders-setting-button {
    appearance: none !important;
    -webkit-appearance: none !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    width: 36px !important;
    min-width: 36px !important;
    height: 36px !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    border: 1px solid ${ScriptConfig.productCardBorderColor} !important;
    border-radius: 4px !important;
    background: transparent !important;
    color: inherit !important;
    font: inherit !important;
    font-size: 20px !important;
    font-weight: 700 !important;
    line-height: 1 !important;
    cursor: pointer !important;
    user-select: none !important;
  }

  .mb-orders-setting-button:hover:not(:disabled),
  .mb-orders-setting-button:focus-visible {
    outline: 2px solid currentColor !important;
    outline-offset: 2px !important;
  }

  .mb-orders-setting-button:active:not(:disabled) {
    transform: translateY(1px) !important;
  }

  .mb-orders-setting-button:disabled {
    cursor: not-allowed !important;
    opacity: 0.45 !important;
  }

  /* Container: one order's product list */
  div.history-detail__products {
    display: grid !important;
    grid-template-columns:
      repeat(
        var(--mb-orders-column-count, ${ScriptConfig.columnCount}),
        minmax(0, 1fr)
      ) !important;
    gap: var(
      --mb-orders-product-spacing,
      ${ScriptConfig.productSpacingPx}px
    ) !important;
    align-items: start !important;
    flex: 1 1 auto !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
    box-sizing: border-box !important;
    overflow: visible !important;
    color: inherit !important;
    background: transparent !important;
  }

  /* Product card */
  div.history-detail__products > div.history-detail__product {
    display: flex !important;
    flex-direction: column !important;
    width: auto !important;
    min-width: 0 !important;
    max-width: none !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    border: 0 !important;
    outline: none !important;
    box-shadow: none !important;
    background: ${ScriptConfig.productCardBackground} !important;
    color: inherit !important;
    position: static !important;
    overflow: visible !important;
  }

  div.history-detail__products > div.history-detail__product * {
    color: inherit !important;
  }

  div.history-detail__products > div.history-detail__product a {
    color: inherit !important;
    text-decoration-color: currentColor !important;
  }

  div.history-detail__products
    > div.history-detail__product
    > div.history-detail__product-image {
    display: block !important;
    flex: 0 0 auto !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    margin: 0 0 8px 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    text-align: center !important;
    position: static !important;
    overflow: visible !important;
    background: transparent !important;
    color: inherit !important;
  }

  div.history-detail__products
    > div.history-detail__product
    > div.history-detail__product-image a {
    display: block !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 0 !important;
    position: static !important;
    overflow: visible !important;
    background: transparent !important;
  }

  div.history-detail__products
    > div.history-detail__product
    > div.history-detail__product-image img {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    aspect-ratio: 1 / 1 !important;
    object-fit: contain !important;
    margin: 0 auto !important;
    padding: 0 !important;
    position: static !important;
    transform: none !important;
    background: transparent !important;
  }

  div.history-detail__products
    > div.history-detail__product
    > div.history-detail__product-info {
    display: block !important;
    flex: 0 0 auto !important;
    width: 100% !important;
    min-width: 0 !important;
    max-width: none !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    position: static !important;
    transform: none !important;
    clear: both !important;
    background: transparent !important;
    color: inherit !important;
  }

  div.history-detail__product-info table {
    width: 100% !important;
    table-layout: fixed !important;
    margin: 0 !important;
    border-collapse: collapse !important;
    border-spacing: 0 !important;
    font-size: 12px !important;
    line-height: 1.15 !important;
    background: transparent !important;
    color: inherit !important;
  }

  div.history-detail__product-info tr,
  div.history-detail__product-info th,
  div.history-detail__product-info td {
    box-sizing: border-box !important;
    line-height: 1.15 !important;
    background: transparent !important;
    color: inherit !important;
    border-color: ${ScriptConfig.productCardBorderColor} !important;
  }

  div.history-detail__product-info th {
    width: 5.25em !important;
    min-width: 5.25em !important;
    padding:
      ${ScriptConfig.productInfoRowSpacingPx}px
      4px
      ${ScriptConfig.productInfoRowSpacingPx}px
      0 !important;
    vertical-align: top !important;
    white-space: nowrap !important;
  }

  div.history-detail__product-info td {
    padding:
      ${ScriptConfig.productInfoRowSpacingPx}px
      0 !important;
    vertical-align: top !important;
    min-width: 0 !important;
  }

  div.history-detail__product-info a {
    overflow-wrap: anywhere !important;
    word-break: break-word !important;
    line-height: 1.15 !important;
    color: inherit !important;
  }

  div.history-detail {
    align-items: flex-start !important;
  }

  .mb-orders-infinite-status {
    display: block !important;
    width: 100% !important;
    margin: 20px 0 !important;
    padding: 10px 12px !important;
    box-sizing: border-box !important;
    border: 1px solid ${ScriptConfig.productCardBorderColor} !important;
    border-radius: 4px !important;
    background: transparent !important;
    color: inherit !important;
    text-align: center !important;
    font-size: 13px !important;
    line-height: 1.4 !important;
  }

  .mb-orders-infinite-sentinel {
    display: block !important;
    width: 100% !important;
    height: 1px !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  body.mb-orders-hide-pagination .pagenavi {
    display: none !important;
  }
`;
  function clampColumnCount(value) {
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed)) return ScriptConfig.columnCount;
    return Math.min(ScriptConfig.maxColumnCount, Math.max(ScriptConfig.minColumnCount, parsed));
  }
  function clampProductSpacing(value) {
    const parsed = Number.parseInt(String(value), 10);
    if (!Number.isFinite(parsed)) return ScriptConfig.productSpacingPx;
    return Math.min(ScriptConfig.maxProductSpacingPx, Math.max(ScriptConfig.minProductSpacingPx, parsed));
  }
  function loadStoredColumnCount() {
    try {
      const stored = localStorage.getItem(ScriptConfig.columnCountStorageKey);
      return stored === null ? ScriptConfig.columnCount : clampColumnCount(stored);
    } catch {
      return ScriptConfig.columnCount;
    }
  }
  function loadStoredProductSpacing() {
    try {
      const stored = localStorage.getItem(ScriptConfig.productSpacingStorageKey);
      return stored === null ? ScriptConfig.productSpacingPx : clampProductSpacing(stored);
    } catch {
      return ScriptConfig.productSpacingPx;
    }
  }
  var OrdersGridInfiniteScrollModule = {
    id: "orders-grid-infinite-scroll",
    name: "Orders Grid & Infinite Scroll",
    lifecycle: "document-start",
    matches(context) {
      return context.route === "melonbooks-orders" || context.location.pathname.includes("history.php");
    },
    init(context) {
      injectStyle("orders-grid", ORDERS_CSS);
      let activeColumnCount = loadStoredColumnCount();
      let activeProductSpacingPx = loadStoredProductSpacing();
      function saveColumnCount(value) {
        try {
          localStorage.setItem(ScriptConfig.columnCountStorageKey, String(value));
        } catch (e) {
          console.warn("[Melonbooks Orders Grid] Could not save column count:", e);
        }
      }
      function saveProductSpacing(value) {
        try {
          localStorage.setItem(ScriptConfig.productSpacingStorageKey, String(value));
        } catch (e) {
          console.warn("[Melonbooks Orders Grid] Could not save product spacing:", e);
        }
      }
      function updateColumnCountControl() {
        const decreaseButton = document.getElementById("mb-orders-column-decrease");
        const increaseButton = document.getElementById("mb-orders-column-increase");
        const valueOutput = document.getElementById("mb-orders-column-value");
        if (valueOutput) {
          valueOutput.value = String(activeColumnCount);
          valueOutput.textContent = String(activeColumnCount);
          valueOutput.setAttribute("aria-label", `${activeColumnCount} products per row`);
        }
        if (decreaseButton) {
          decreaseButton.disabled = activeColumnCount <= ScriptConfig.minColumnCount;
          decreaseButton.title = `Decrease products per row. Minimum: ${ScriptConfig.minColumnCount}.`;
        }
        if (increaseButton) {
          increaseButton.disabled = activeColumnCount >= ScriptConfig.maxColumnCount;
          increaseButton.title = `Increase products per row. Maximum: ${ScriptConfig.maxColumnCount}.`;
        }
      }
      function updateProductSpacingControl() {
        const decreaseButton = document.getElementById("mb-orders-spacing-decrease");
        const increaseButton = document.getElementById("mb-orders-spacing-increase");
        const valueOutput = document.getElementById("mb-orders-spacing-value");
        if (valueOutput) {
          valueOutput.value = String(activeProductSpacingPx);
          valueOutput.textContent = `${activeProductSpacingPx} px`;
          valueOutput.setAttribute("aria-label", `${activeProductSpacingPx} pixels between products`);
        }
        if (decreaseButton) {
          decreaseButton.disabled = activeProductSpacingPx <= ScriptConfig.minProductSpacingPx;
          decreaseButton.title = `Decrease product spacing. Minimum: ${ScriptConfig.minProductSpacingPx}px.`;
        }
        if (increaseButton) {
          increaseButton.disabled = activeProductSpacingPx >= ScriptConfig.maxProductSpacingPx;
          increaseButton.title = `Increase product spacing. Maximum: ${ScriptConfig.maxProductSpacingPx}px.`;
        }
      }
      function applyColumnCount(value, persist = true) {
        activeColumnCount = clampColumnCount(value);
        if (document.documentElement) {
          document.documentElement.style.setProperty("--mb-orders-column-count", String(activeColumnCount));
        }
        if (persist) {
          saveColumnCount(activeColumnCount);
        }
        updateColumnCountControl();
      }
      function applyProductSpacing(value, persist = true) {
        activeProductSpacingPx = clampProductSpacing(value);
        if (document.documentElement) {
          document.documentElement.style.setProperty("--mb-orders-product-spacing", `${activeProductSpacingPx}px`);
        }
        if (persist) {
          saveProductSpacing(activeProductSpacingPx);
        }
        updateProductSpacingControl();
      }
      function createSettingButton({ id, text, ariaLabel, onClick }) {
        const button = document.createElement("button");
        button.type = "button";
        button.id = id;
        button.className = "mb-orders-setting-button";
        button.textContent = text;
        button.setAttribute("aria-label", ariaLabel);
        button.addEventListener("click", onClick);
        return button;
      }
      function createProductsPerRowControl() {
        const row = document.createElement("div");
        row.className = "mb-orders-setting-row";
        const label = document.createElement("span");
        label.className = "mb-orders-setting-label";
        label.textContent = "Products per row:";
        const decreaseButton = createSettingButton({
          id: "mb-orders-column-decrease",
          text: "\u2212",
          ariaLabel: "Decrease products per row",
          onClick: () => applyColumnCount(activeColumnCount - 1)
        });
        const valueOutput = document.createElement("output");
        valueOutput.id = "mb-orders-column-value";
        valueOutput.className = "mb-orders-setting-value";
        valueOutput.setAttribute("aria-live", "polite");
        const increaseButton = createSettingButton({
          id: "mb-orders-column-increase",
          text: "+",
          ariaLabel: "Increase products per row",
          onClick: () => applyColumnCount(activeColumnCount + 1)
        });
        row.append(label, decreaseButton, valueOutput, increaseButton);
        return row;
      }
      function createProductSpacingControl() {
        const row = document.createElement("div");
        row.className = "mb-orders-setting-row";
        const label = document.createElement("span");
        label.className = "mb-orders-setting-label";
        label.textContent = "Spacing:";
        const decreaseButton = createSettingButton({
          id: "mb-orders-spacing-decrease",
          text: "\u2212",
          ariaLabel: "Decrease product spacing",
          onClick: () => applyProductSpacing(activeProductSpacingPx - 1)
        });
        const valueOutput = document.createElement("output");
        valueOutput.id = "mb-orders-spacing-value";
        valueOutput.className = "mb-orders-setting-value";
        valueOutput.setAttribute("aria-live", "polite");
        const increaseButton = createSettingButton({
          id: "mb-orders-spacing-increase",
          text: "+",
          ariaLabel: "Increase product spacing",
          onClick: () => applyProductSpacing(activeProductSpacingPx + 1)
        });
        row.append(label, decreaseButton, valueOutput, increaseButton);
        return row;
      }
      function initGridControls() {
        const myPage = document.querySelector(".my-page");
        if (!myPage || document.querySelector(".mb-orders-grid-controls")) {
          applyColumnCount(activeColumnCount, false);
          applyProductSpacing(activeProductSpacingPx, false);
          return;
        }
        const controls = document.createElement("div");
        controls.className = "mb-orders-grid-controls";
        controls.setAttribute("aria-label", "Product grid settings");
        controls.append(createProductsPerRowControl(), createProductSpacingControl());
        const pageHeader = myPage.querySelector(":scope > .page-header");
        if (pageHeader) {
          pageHeader.insertAdjacentElement("afterend", controls);
        } else {
          myPage.prepend(controls);
        }
        applyColumnCount(activeColumnCount, false);
        applyProductSpacing(activeProductSpacingPx, false);
      }
      function getSearchForm(root = document) {
        return root.querySelector("form#form1");
      }
      function getSearchSelect(root = document) {
        return root.querySelector('form#form1 select[name="search_select"]');
      }
      function setDefaultSearchPeriod() {
        const form = getSearchForm();
        const select = getSearchSelect();
        if (!form || !select) return;
        const desiredValue = String(ScriptConfig.defaultSearchSelectValue);
        const originalValue = select.value;
        if (select.value !== desiredValue && select.querySelector(`option[value="${CSS.escape(desiredValue)}"]`)) {
          select.value = desiredValue;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
        if (!ScriptConfig.autoSubmitDefaultSearchPeriod) return;
        const storageKey = `melonbooksOrdersDefaultPeriodApplied:${context.location.pathname}`;
        const hasAlreadyApplied = sessionStorage.getItem(storageKey) === desiredValue;
        const pageInput = form.querySelector('[name="pageno"]');
        const isFirstPage = !pageInput || !pageInput.value || pageInput.value === "1";
        if (hasAlreadyApplied || originalValue === desiredValue || !isFirstPage) {
          return;
        }
        sessionStorage.setItem(storageKey, desiredValue);
        if (pageInput) {
          pageInput.value = "1";
        }
        form.submit();
      }
      function getOrderListContainer(root = document) {
        const directContainers = Array.from(root.querySelectorAll(".my-page > div"));
        const directMatch = directContainers.find((el) => {
          return Array.from(el.children).some((child) => child.classList && child.classList.contains("history-detail"));
        });
        if (directMatch) return directMatch;
        const firstOrder = root.querySelector(".history-detail");
        return firstOrder ? firstOrder.parentElement : null;
      }
      function getPagination(root = document) {
        return root.querySelector(".pagenavi");
      }
      function extractPageNumber(value) {
        if (!value) return null;
        const patterns = [
          /movePage\s*\(\s*['"]?(\d+)['"]?\s*\)/i,
          /[?&]pageno=(\d+)/i,
          /(?:^|[^a-z])pageno=(\d+)/i,
          /^\s*(\d+)\s*$/
        ];
        for (const pattern of patterns) {
          const match = String(value).match(pattern);
          if (match) {
            const page = Number.parseInt(match[1], 10);
            if (Number.isFinite(page) && page > 0) return page;
          }
        }
        return null;
      }
      function getCurrentPageNumber(root = document) {
        const current = root.querySelector(".pagenavi .current");
        const fromTitle = extractPageNumber(current?.getAttribute("title"));
        if (fromTitle) return fromTitle;
        const fromText = extractPageNumber(current?.textContent);
        if (fromText) return fromText;
        const form = getSearchForm(root);
        const pageInput = form?.querySelector('[name="pageno"]');
        const fromInput = extractPageNumber(pageInput?.value);
        if (fromInput) return fromInput;
        return 1;
      }
      function getNextPageNumber(root = document) {
        const pagination = getPagination(root);
        if (!pagination) return null;
        const nextLink = pagination.querySelector(".pagenavi-next");
        if (nextLink) {
          return extractPageNumber(nextLink.getAttribute("onclick")) || extractPageNumber(nextLink.getAttribute("href")) || extractPageNumber(nextLink.getAttribute("title")) || extractPageNumber(nextLink.textContent);
        }
        const currentPage = getCurrentPageNumber(root);
        const numericLinks = Array.from(pagination.querySelectorAll("a")).map((link) => {
          return extractPageNumber(link.getAttribute("title")) || extractPageNumber(link.getAttribute("onclick")) || extractPageNumber(link.getAttribute("href")) || extractPageNumber(link.textContent);
        }).filter((page) => Number.isFinite(page) && page > currentPage).sort((a, b) => a - b);
        return numericLinks.length ? numericLinks[0] : null;
      }
      function getOrderKey(orderElement) {
        const rows = Array.from(orderElement.querySelectorAll(".history-detail__table tr"));
        for (const row of rows) {
          const th = row.querySelector("th");
          const td = row.querySelector("td");
          if (th && td && th.textContent.includes("\u6CE8\u6587\u756A\u53F7")) {
            return td.textContent.trim();
          }
        }
        return orderElement.textContent.replace(/\s+/g, " ").trim().slice(0, 200);
      }
      function buildLoadedOrderSet(orderListContainer) {
        const loaded = /* @__PURE__ */ new Set();
        orderListContainer.querySelectorAll(":scope > .history-detail").forEach((el) => {
          loaded.add(getOrderKey(el));
        });
        return loaded;
      }
      function buildPageRequest(pageNumber) {
        const form = getSearchForm();
        if (!form) return null;
        const method = (form.method || "post").toLowerCase();
        const action = new URL(form.getAttribute("action") || context.location.href, context.location.href);
        const formData = new FormData(form);
        formData.set("pageno", String(pageNumber));
        if (ScriptConfig.defaultSearchSelectValue) {
          formData.set("search_select", String(ScriptConfig.defaultSearchSelectValue));
        }
        formData.set("_mb_infinite_scroll", "1");
        if (method === "get") {
          const url = new URL(action.href);
          for (const [key, value] of formData.entries()) {
            url.searchParams.set(key, value);
          }
          return {
            url: url.href,
            options: {
              method: "GET",
              credentials: "same-origin"
            }
          };
        }
        return {
          url: action.href,
          options: {
            method: "POST",
            credentials: "same-origin",
            body: new URLSearchParams(formData),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
              "X-Requested-With": "XMLHttpRequest"
            }
          }
        };
      }
      function refreshLazyImages(container) {
        const images = Array.from(container.querySelectorAll("img.lazyload[data-src]"));
        if (window.lazySizes?.loader?.unveil) {
          images.forEach((img) => window.lazySizes.loader.unveil(img));
          return;
        }
        images.forEach((img) => {
          const src = img.getAttribute("src");
          if (!src || src.includes("now_printing")) {
            img.setAttribute("src", img.getAttribute("data-src"));
          }
        });
      }
      function initInfiniteScroll() {
        if (!ScriptConfig.infiniteScrollEnabled) return;
        const orderListContainer = getOrderListContainer();
        const pagination = getPagination();
        if (!orderListContainer || !pagination) return;
        let nextPageNumber = getNextPageNumber(document);
        if (!nextPageNumber) return;
        const loadedOrders = buildLoadedOrderSet(orderListContainer);
        const loadedPages = /* @__PURE__ */ new Set([getCurrentPageNumber(document)]);
        let isLoading = false;
        let isFinished = false;
        const status = document.createElement("div");
        status.className = "mb-orders-infinite-status";
        status.hidden = true;
        const sentinel = document.createElement("div");
        sentinel.className = "mb-orders-infinite-sentinel";
        sentinel.setAttribute("aria-hidden", "true");
        pagination.parentElement.insertBefore(sentinel, pagination);
        pagination.parentElement.insertBefore(status, pagination);
        if (ScriptConfig.hideOriginalPagination) {
          document.body.classList.add("mb-orders-hide-pagination");
        }
        function setStatus(message, visible = true) {
          status.textContent = message;
          status.hidden = !visible;
        }
        async function loadNextPage() {
          if (isLoading || isFinished || !nextPageNumber || loadedPages.has(nextPageNumber)) {
            return;
          }
          isLoading = true;
          setStatus(`Loading page ${nextPageNumber}...`);
          try {
            const request = buildPageRequest(nextPageNumber);
            if (!request) throw new Error("Could not build the next-page request.");
            const response = await fetch(request.url, request.options);
            if (!response.ok) throw new Error(`Request failed with status ${response.status}.`);
            const html = await response.text();
            const nextDocument = new DOMParser().parseFromString(html, "text/html");
            const nextOrderList = getOrderListContainer(nextDocument);
            if (!nextOrderList) {
              isFinished = true;
              setStatus("No more order pages found.");
              return;
            }
            const incomingOrders = Array.from(nextOrderList.querySelectorAll(":scope > .history-detail"));
            let appendedCount = 0;
            for (const incomingOrder of incomingOrders) {
              const key = getOrderKey(incomingOrder);
              if (loadedOrders.has(key)) continue;
              loadedOrders.add(key);
              orderListContainer.appendChild(document.importNode(incomingOrder, true));
              appendedCount += 1;
            }
            loadedPages.add(nextPageNumber);
            if (appendedCount > 0) {
              refreshLazyImages(orderListContainer);
            }
            const parsedNextPageNumber = getNextPageNumber(nextDocument);
            if (parsedNextPageNumber && !loadedPages.has(parsedNextPageNumber)) {
              nextPageNumber = parsedNextPageNumber;
              setStatus("", false);
            } else {
              nextPageNumber = null;
              isFinished = true;
              setStatus("All order pages loaded.");
            }
          } catch (error) {
            console.error("[Melonbooks Orders Grid] Infinite scroll failed:", error);
            setStatus("Could not load the next order page. Use the page numbers below as fallback.");
          } finally {
            isLoading = false;
          }
        }
        if ("IntersectionObserver" in window) {
          const observer = new IntersectionObserver(
            (entries) => {
              if (entries.some((e) => e.isIntersecting)) {
                loadNextPage();
              }
            },
            {
              root: null,
              rootMargin: `${ScriptConfig.infiniteScrollRootMarginPx}px 0px`,
              threshold: 0
            }
          );
          observer.observe(sentinel);
        } else {
          window.addEventListener("scroll", () => {
            if (isLoading || isFinished) return;
            const dist = document.documentElement.scrollHeight - window.scrollY - window.innerHeight;
            if (dist <= ScriptConfig.infiniteScrollRootMarginPx) {
              loadNextPage();
            }
          }, { passive: true });
        }
      }
      applyColumnCount(activeColumnCount, false);
      applyProductSpacing(activeProductSpacingPx, false);
      const onReady = () => {
        initGridControls();
        setDefaultSearchPeriod();
        initInfiniteScroll();
      };
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", onReady, { once: true });
      } else {
        onReady();
      }
    }
  };

  // src/modules/favorite-circle-toggle.js
  var TARGET_SELECTOR = "a.favorite_circle_short, a.favorite_circle";
  var BUSY_CLASS = "mb-circle-favorite-toggle-busy";
  var TOAST_ID = "mb-circle-favorite-toggle-toast";
  var REQUEST_TIMEOUT_MS = 15e3;
  var CIRCLE_TOGGLE_CSS = `
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
  var FavoriteCircleToggleModule = {
    id: "favorite-circle-toggle",
    name: "Favorite Circle Toggle",
    lifecycle: "document-start",
    matches(context) {
      return context.route === "melonbooks-product" || context.location.pathname.startsWith("/detail/");
    },
    init(context) {
      injectStyle("favorite-circle-toggle", CIRCLE_TOGGLE_CSS);
      const busyCircleIds = /* @__PURE__ */ new Set();
      let cachedTransactionId = "";
      function isProductDetailPage() {
        return context.location.pathname.startsWith("/detail/");
      }
      function isCircleFavorited(button) {
        if (button.classList.contains("favorite_circle_short")) {
          if (button.classList.contains("fav-button-short__icon--not-done")) {
            return false;
          }
          if (button.classList.contains("fav-button-short__icon--done") || button.classList.contains("favorited")) {
            return true;
          }
          return false;
        }
        if (button.classList.contains("favorite_circle")) {
          const iconBox = button.querySelector(".fav-button__icon");
          if (iconBox?.classList.contains("fav-button__icon--not-done")) {
            return false;
          }
          if (iconBox?.classList.contains("fav-button__icon--done") || button.classList.contains("__active") || button.classList.contains("favorited") || Boolean(button.querySelector(".favorited")) || button.textContent.includes("\u8FFD\u52A0\u6E08")) {
            return true;
          }
        }
        return false;
      }
      function getCircleId(button) {
        const directId = button.getAttribute("data-circleid");
        if (directId) return directId.trim();
        const nearbyCircleLink = button.closest("td, .item-favorite, .item-page, body")?.querySelector('a[href*="/circle/index.php?circle_id="]');
        if (!nearbyCircleLink) return "";
        try {
          const url = new URL(nearbyCircleLink.href, context.location.href);
          return url.searchParams.get("circle_id") || "";
        } catch {
          return "";
        }
      }
      function getTransactionId() {
        if (cachedTransactionId) return cachedTransactionId;
        const input = document.querySelector('input[name="transactionid"]');
        if (input?.value) {
          cachedTransactionId = input.value.trim();
          return cachedTransactionId;
        }
        const pageHtml = document.documentElement?.innerHTML || "";
        const scriptMatch = pageHtml.match(/\btransactionid\s*=\s*['"]([^'"]+)['"]/);
        if (scriptMatch) {
          cachedTransactionId = scriptMatch[1].trim();
          return cachedTransactionId;
        }
        const inputMatch = pageHtml.match(/name=['"]transactionid['"][^>]*value=['"]([^'"]+)['"]/i);
        cachedTransactionId = inputMatch ? inputMatch[1].trim() : "";
        return cachedTransactionId;
      }
      function getReturnedTransactionId(responseText) {
        if (!responseText) return "";
        const doc = new DOMParser().parseFromString(responseText, "text/html");
        return doc.querySelector('#form_circle_fav input[name="transactionid"]')?.getAttribute("value")?.trim() || "";
      }
      function getReturnedCircleFavoriteState(responseText, circleId) {
        if (!responseText) return null;
        const doc = new DOMParser().parseFromString(responseText, "text/html");
        const form = doc.querySelector("#form_circle_fav");
        const returnedCircleId = form?.querySelector('input[name="circle_id"]')?.getAttribute("value")?.trim();
        const nextAction = form?.querySelector('input[name="act"]')?.getAttribute("value")?.trim();
        if (returnedCircleId && returnedCircleId !== circleId) return null;
        if (nextAction === "remove_favorite") return true;
        if (nextAction === "add_favorite") return false;
        return null;
      }
      function escapeAttributeSelectorValue(value) {
        if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
          return CSS.escape(String(value));
        }
        return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      }
      function setShortCircleButtonState(button, isFavorited) {
        button.classList.toggle("favorited", isFavorited);
        button.classList.remove("favorite", "fa-regular");
        button.classList.add("fa-solid", "fa-heart", "fav-button-short__icon");
        button.classList.toggle("fav-button-short__icon--done", isFavorited);
        button.classList.toggle("fav-button-short__icon--not-done", !isFavorited);
        if (!button.hasAttribute("href")) {
          button.setAttribute("href", "#");
        }
        button.setAttribute("aria-hidden", "true");
        button.setAttribute("aria-pressed", String(isFavorited));
        button.removeAttribute("aria-busy");
        button.title = isFavorited ? "Remove circle from favorites" : "Add circle to favorites";
      }
      function setLargeCircleButtonState(button, isFavorited) {
        button.classList.toggle("__active", isFavorited);
        button.classList.remove("favorited", "on");
        const iconBox = button.querySelector(".fav-button__icon");
        if (iconBox) {
          iconBox.classList.toggle("fav-button__icon--done", isFavorited);
          iconBox.classList.toggle("fav-button__icon--not-done", !isFavorited);
        }
        const icon = button.querySelector("i");
        if (icon) {
          icon.classList.toggle("favorited", isFavorited);
          icon.classList.remove("fa-regular");
          icon.classList.add("fa-solid", "fa-heart");
        }
        const text = button.querySelector(".fav-button__text, span");
        if (text) {
          text.innerHTML = isFavorited ? '\u304A\u6C17\u306B\u5165\u308A<br role="none">\u30B5\u30FC\u30AF\u30EB\u306B\u8FFD\u52A0\u6E08' : '\u304A\u6C17\u306B\u5165\u308A<br role="none">\u30B5\u30FC\u30AF\u30EB\u306B\u8FFD\u52A0';
        }
        button.setAttribute("aria-pressed", String(isFavorited));
        button.title = isFavorited ? "Remove circle from favorites" : "Add circle to favorites";
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
            button.setAttribute("aria-busy", "true");
          } else {
            button.removeAttribute("aria-busy");
          }
        });
      }
      function markButtons() {
        document.querySelectorAll(TARGET_SELECTOR).forEach((button) => {
          const isFavorited = isCircleFavorited(button);
          button.setAttribute("aria-pressed", String(isFavorited));
          button.title = isFavorited ? "Remove circle from favorites" : "Add circle to favorites";
        });
      }
      function looksLikeLoginPage(responseUrl, responseText) {
        const url = new URL(responseUrl || context.location.href, context.location.href);
        if (url.pathname.startsWith("/mypage/")) return true;
        return responseText.includes("\u30ED\u30B0\u30A4\u30F3") && (responseText.includes('name="login_email"') || responseText.includes('name="login_pass"') || responseText.includes("\u30D1\u30B9\u30EF\u30FC\u30C9"));
      }
      function redirectToLogin() {
        const returnUrl = `${context.location.origin}${context.location.pathname}${context.location.search}`;
        context.location.href = `/mypage/?ru=${encodeURIComponent(returnUrl)}`;
      }
      let toastTimer = null;
      function showToast(message, isError) {
        let toast = document.getElementById(TOAST_ID);
        if (!toast) {
          toast = document.createElement("div");
          toast.id = TOAST_ID;
          document.documentElement.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.toggle("is-error", Boolean(isError));
        toast.classList.add("is-visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          toast.classList.remove("is-visible");
        }, 2200);
      }
      async function setCircleFavorite(circleId, shouldAdd) {
        if (busyCircleIds.has(circleId)) return;
        const transactionId = getTransactionId();
        if (!transactionId) {
          showToast("Could not find transaction ID.", true);
          return;
        }
        busyCircleIds.add(circleId);
        setButtonsBusy(circleId, true);
        try {
          const body = new URLSearchParams();
          body.set("transactionid", transactionId);
          body.set("act", shouldAdd ? "add_favorite" : "remove_favorite");
          body.set("circle_id", circleId);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
          let response;
          let responseText;
          try {
            response = await fetch(`/circle/index.php?circle_id=${encodeURIComponent(circleId)}`, {
              method: "POST",
              credentials: "same-origin",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                Accept: "text/html,application/xhtml+xml"
              },
              body: body.toString(),
              signal: controller.signal,
              redirect: "follow"
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
            shouldAdd ? "Circle added to favorites." : "Circle removed from favorites.",
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
          console.error("[Melonbooks Circle Favorite Toggle]", error);
          showToast(
            shouldAdd ? "Could not add circle to favorites." : "Could not remove circle from favorites.",
            true
          );
        });
      }
      document.addEventListener("click", handleClickCapture, true);
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", markButtons, { once: true });
      } else {
        markButtons();
      }
    }
  };

  // src/modules/favorite-author-toggle.js
  var BUTTON_SELECTOR = "a.favorite_author.fav-button-short__icon";
  var FAVORITE_AUTHOR_PAGE_PATH = "/mypage/favorite_author.php";
  var MAX_SCAN_PAGES = 50;
  var PAGE_FETCH_BATCH_SIZE = 4;
  var REQUEST_TIMEOUT_MS2 = 15e3;
  var BUSY_ATTR = "data-mb-author-favorite-busy";
  var BUSY_CLASS2 = "mb-author-favorite-busy";
  var TOAST_ID2 = "mb-author-favorite-toast";
  var AUTHOR_TOGGLE_CSS = `
  .${BUSY_CLASS2} {
    opacity: 0.55 !important;
    cursor: wait !important;
    pointer-events: none !important;
  }

  #${TOAST_ID2} {
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

  #${TOAST_ID2}.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  #${TOAST_ID2}.is-error {
    background: #9f1d1d;
  }
`;
  var FavoriteAuthorToggleModule = {
    id: "favorite-author-toggle",
    name: "Favorite Author Toggle",
    lifecycle: "document-start",
    matches(context) {
      return context.route === "melonbooks-product" || context.location.pathname.startsWith("/detail/");
    },
    init(context) {
      injectStyle("favorite-author-toggle", AUTHOR_TOGGLE_CSS);
      const authorCache = /* @__PURE__ */ new Map();
      let toastTimer = null;
      function isProductDetailPage() {
        return context.location.pathname.startsWith("/detail/");
      }
      function isFavorited(button) {
        if (button.classList.contains("fav-button-short__icon--not-done")) {
          return false;
        }
        return button.classList.contains("favorited") || button.classList.contains("fav-button-short__icon--done");
      }
      function getAuthorName(button) {
        const directName = button.dataset.authorname || button.getAttribute("data-authorname") || button.getAttribute("data-authorName");
        if (directName?.trim()) return directName.trim();
        const infoCell = button.closest(".product_info, td, tr");
        const authorLink = infoCell?.querySelector('a[href*="text_type=author"]');
        return authorLink?.textContent?.trim() || "";
      }
      function getProductId() {
        const queryProductId = new URL(context.location.href).searchParams.get("product_id");
        if (queryProductId?.trim()) return queryProductId.trim();
        const input = document.querySelector('input[name="product_id"]');
        return input?.value?.trim() || "";
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
        const pageHtml = document.documentElement?.innerHTML || "";
        const match = pageHtml.match(/\btransactionid\s*=\s*['"]([^'"]+)['"]/);
        return match?.[1]?.trim() || "";
      }
      function normalizeName(value) {
        return String(value || "").replace(/\s+/g, " ").trim();
      }
      function getMatchingAuthorButtons(authorName) {
        const normalizedAuthorName = normalizeName(authorName);
        return Array.from(document.querySelectorAll(BUTTON_SELECTOR)).filter((button) => {
          return normalizeName(getAuthorName(button)) === normalizedAuthorName;
        });
      }
      function setBusy(button) {
        button.setAttribute(BUSY_ATTR, "1");
        button.classList.add(BUSY_CLASS2);
        button.setAttribute("aria-busy", "true");
      }
      function resetBusy(button) {
        button.removeAttribute(BUSY_ATTR);
        button.classList.remove(BUSY_CLASS2);
        button.removeAttribute("aria-busy");
      }
      function setAuthorButtonsBusy(authorName, isBusy) {
        getMatchingAuthorButtons(authorName).forEach((button) => {
          if (isBusy) setBusy(button);
          else resetBusy(button);
        });
      }
      function markAuthorAsFavorited(authorName) {
        getMatchingAuthorButtons(authorName).forEach((button) => {
          button.classList.remove("favorite", "fa-regular", "fav-button-short--done", "fav-button-short__icon--not-done");
          button.classList.add(
            "favorited",
            "fa-solid",
            "fa-heart",
            "favorite_author",
            "fav-button-short__icon",
            "fav-button-short__icon--done"
          );
          if (!button.hasAttribute("href")) button.setAttribute("href", "#");
          button.setAttribute("aria-hidden", "true");
          button.setAttribute("aria-pressed", "true");
          button.setAttribute("title", "\u304A\u6C17\u306B\u5165\u308A\u4F5C\u5BB6\u304B\u3089\u89E3\u9664");
          resetBusy(button);
        });
      }
      function markAuthorAsNotFavorited(authorName) {
        getMatchingAuthorButtons(authorName).forEach((button) => {
          button.classList.remove("favorite", "favorited", "fa-regular", "fav-button-short--done", "fav-button-short__icon--done");
          button.classList.add(
            "fa-solid",
            "fa-heart",
            "favorite_author",
            "fav-button-short__icon",
            "fav-button-short__icon--not-done"
          );
          if (!button.hasAttribute("href")) button.setAttribute("href", "#");
          button.setAttribute("aria-hidden", "true");
          button.setAttribute("aria-pressed", "false");
          button.setAttribute("title", "\u304A\u6C17\u306B\u5165\u308A\u4F5C\u5BB6\u306B\u8FFD\u52A0");
          resetBusy(button);
        });
      }
      function markButtons() {
        document.querySelectorAll(BUTTON_SELECTOR).forEach((button) => {
          const favorited = isFavorited(button);
          button.setAttribute("aria-pressed", String(favorited));
          button.setAttribute("title", favorited ? "\u304A\u6C17\u306B\u5165\u308A\u4F5C\u5BB6\u304B\u3089\u89E3\u9664" : "\u304A\u6C17\u306B\u5165\u308A\u4F5C\u5BB6\u306B\u8FFD\u52A0");
        });
      }
      function looksLikeLoginPage(responseText) {
        return responseText.includes("\u30ED\u30B0\u30A4\u30F3") && (responseText.includes('name="login_email"') || responseText.includes('name="login_pass"') || responseText.includes("\u30D1\u30B9\u30EF\u30FC\u30C9"));
      }
      function redirectToLogin() {
        const returnUrl = `${context.location.origin}${context.location.pathname}${context.location.search}`;
        context.location.href = `/mypage/?ru=${encodeURIComponent(returnUrl)}`;
      }
      async function fetchText(url, options) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS2);
        try {
          const response = await fetch(url, { ...options, signal: controller.signal });
          if (!response.ok) throw new Error(`HTTP ${response.status} while requesting ${url}`);
          return await response.text();
        } finally {
          clearTimeout(timeoutId);
        }
      }
      function showToast(message, isError = false, durationMs = 2200) {
        let toast = document.getElementById(TOAST_ID2);
        if (!toast) {
          toast = document.createElement("div");
          toast.id = TOAST_ID2;
          document.documentElement.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.toggle("is-error", Boolean(isError));
        toast.classList.add("is-visible");
        clearTimeout(toastTimer);
        if (durationMs > 0) {
          toastTimer = setTimeout(() => {
            toast.classList.remove("is-visible");
          }, durationMs);
        }
      }
      function isSuccessfulStatus(status) {
        return status === true || status === 1 || status === "1" || status === "true";
      }
      async function submitAddFavoriteAuthor(authorName) {
        const productId = getProductId();
        const transactionId = getProductTransactionId();
        if (!productId) throw new Error("Could not find the product ID on the product page.");
        if (!transactionId) throw new Error("Could not find the product-page transaction ID.");
        const body = new URLSearchParams();
        body.set("favorite_author_name", authorName);
        body.set("product_id", productId);
        body.set("mode", "regist_author_ajax");
        body.set("transactionid", transactionId);
        const url = new URL(context.location.pathname, context.location.origin);
        url.searchParams.set("product_id", productId);
        const responseText = await fetchText(url.toString(), {
          method: "POST",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Accept: "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest"
          },
          body: body.toString()
        });
        if (looksLikeLoginPage(responseText)) {
          redirectToLogin();
          throw new Error("The add request was redirected to login.");
        }
        let responseData;
        try {
          responseData = JSON.parse(responseText.trim());
        } catch {
          throw new Error("Melonbooks returned an invalid response while adding the author.");
        }
        if (!isSuccessfulStatus(responseData?.status)) {
          const message = String(responseData?.message || "").trim();
          if (message.includes("\u30ED\u30B0\u30A4\u30F3")) {
            redirectToLogin();
          }
          throw new Error(message || "Melonbooks did not confirm the author favorite.");
        }
      }
      async function fetchFavoriteAuthorPage(pageNumber) {
        const url = new URL(FAVORITE_AUTHOR_PAGE_PATH, context.location.origin);
        if (pageNumber > 1) {
          url.searchParams.set("pageno", String(pageNumber));
        }
        const text = await fetchText(url.toString(), {
          method: "GET",
          credentials: "same-origin"
        });
        if (looksLikeLoginPage(text)) {
          redirectToLogin();
          throw new Error("The favorite-author page request was redirected to login.");
        }
        return new DOMParser().parseFromString(text, "text/html");
      }
      function parseFavoriteAuthorPage(doc, authorName) {
        const normalizedAuthorName = normalizeName(authorName);
        const transactionId = doc.querySelector('form#form1 input[name="transactionid"]')?.value || doc.querySelector('input[name="transactionid"]')?.value || "";
        const entries = doc.querySelectorAll(".circle-content");
        for (const entry of entries) {
          const nameLink = entry.querySelector(".page-single-arr-anchor a, h2 a");
          const entryAuthorName = normalizeName(nameLink?.textContent || "");
          if (entryAuthorName !== normalizedAuthorName) continue;
          const deleteLink = entry.querySelector('a[onclick*="delete_favorite_author"]');
          const onclick = deleteLink?.getAttribute("onclick") || "";
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
        doc.querySelectorAll(".pagenavi a").forEach((link) => {
          const values = [
            link.getAttribute("title"),
            link.getAttribute("href"),
            link.getAttribute("onclick"),
            link.textContent
          ];
          values.forEach((value) => {
            const matches = String(value || "").match(/\d+/g);
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
        body.set("transactionid", favoriteData.transactionId);
        body.set("mode", "delete_favorite_author");
        body.set("author_id", favoriteData.authorId);
        body.set("orderby", "");
        body.set("disp_number", "");
        body.set("pageno", "1");
        const responseText = await fetchText(
          new URL(FAVORITE_AUTHOR_PAGE_PATH, context.location.origin).toString(),
          {
            method: "POST",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: body.toString()
          }
        );
        if (looksLikeLoginPage(responseText)) {
          redirectToLogin();
          throw new Error("The delete request was redirected to login.");
        }
      }
      async function setFavoriteAuthor(button, suppliedAuthorName, shouldAdd) {
        const authorName = suppliedAuthorName || getAuthorName(button);
        if (!authorName) {
          throw new Error("Could not read author name from button.");
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
            showToast("Author added to favorites.", false);
            return;
          }
          const favoriteData = await findFavoriteAuthorData(authorName);
          if (!favoriteData?.authorId || !favoriteData.transactionId) {
            throw new Error(`Could not find author_id for "${authorName}" on favorite authors page.`);
          }
          await submitDeleteFavoriteAuthor(favoriteData);
          markAuthorAsNotFavorited(authorName);
          authorCache.delete(normalizeName(authorName));
          showToast("Author removed from favorites.", false);
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
        if (button.getAttribute(BUSY_ATTR) === "1") return;
        const authorName = getAuthorName(button);
        const shouldAdd = !isFavorited(button);
        setFavoriteAuthor(button, authorName, shouldAdd).catch((error) => {
          console.error("[Melonbooks Favorite Author Remover]", error);
          if (authorName) {
            setAuthorButtonsBusy(authorName, false);
          } else {
            resetBusy(button);
          }
          showToast(
            shouldAdd ? "Could not add author to favorites." : "Could not remove author from favorites.",
            true
          );
        });
      }
      document.addEventListener("click", handleClick, true);
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", markButtons, { once: true });
      } else {
        markButtons();
      }
    }
  };

  // src/modules/wishlist-toggle.js
  var BUTTON_SELECTOR2 = ".fav-button--wishlist.add_wish";
  var TOAST_ID3 = "mb-wishlist-toggle-toast";
  var MAXIMUM_PAGES_TO_CHECK = 100;
  var WISHLIST_TOGGLE_CSS = `
  .mb-wishlist-toggle-busy {
    opacity: 0.55 !important;
    cursor: wait !important;
    pointer-events: none !important;
  }

  #${TOAST_ID3} {
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

  #${TOAST_ID3}.is-visible {
    opacity: 1;
    transform: translateY(0);
  }

  #${TOAST_ID3}.is-error {
    background: #9f1d1d;
  }
`;
  var WishlistToggleModule = {
    id: "wishlist-toggle",
    name: "Wishlist Toggle",
    lifecycle: "document-end",
    matches(context) {
      return context.route === "melonbooks-product" || context.location.pathname.startsWith("/detail/") || context.location.pathname.includes("detail.php");
    },
    init(context) {
      injectStyle("wishlist-toggle", WISHLIST_TOGGLE_CSS);
      const wishlistUrl = new URL("/mypage/favorite.php", context.location.origin);
      const busyButtons = /* @__PURE__ */ new WeakSet();
      const addWatchers = /* @__PURE__ */ new WeakMap();
      let toastTimer = null;
      function isActive(button) {
        return button.classList.contains("__active");
      }
      function renderButton(button, active) {
        const iconContainer = button.querySelector(".fav-button__icon");
        const icon = iconContainer?.querySelector("i");
        const text = button.querySelector(".fav-button__text");
        if (iconContainer) {
          iconContainer.classList.add("fav-button__icon--wishlist");
          iconContainer.classList.toggle("fav-button__icon--done", active);
          iconContainer.classList.toggle("fav-button__icon--not-done", !active);
        }
        if (icon) {
          icon.classList.remove("fa-regular", "far");
          icon.classList.add("fa-solid", "fa-bookmark");
          icon.classList.toggle("favorited", active);
        }
        button.setAttribute("aria-pressed", active ? "true" : "false");
        button.setAttribute("title", active ? "\u307B\u3057\u3044\u3082\u306E\u30EA\u30B9\u30C8\u304B\u3089\u524A\u9664" : "\u307B\u3057\u3044\u3082\u306E\u30EA\u30B9\u30C8\u306B\u8FFD\u52A0");
        if (text) {
          const firstLine = "\u307B\u3057\u3044\u3082\u306E";
          const secondLine = active ? "\u30EA\u30B9\u30C8\u304B\u3089\u524A\u9664" : "\u30EA\u30B9\u30C8\u306B\u8FFD\u52A0";
          const desiredText = firstLine + secondLine;
          const currentText = text.textContent?.replace(/\s+/g, "") || "";
          if (currentText !== desiredText) {
            const lineBreak = document.createElement("br");
            lineBreak.setAttribute("role", "none");
            text.replaceChildren(
              document.createTextNode(firstLine),
              lineBreak,
              document.createTextNode(secondLine)
            );
          }
        }
      }
      function showToast(message, isError = false) {
        let toast = document.getElementById(TOAST_ID3);
        if (!toast) {
          toast = document.createElement("div");
          toast.id = TOAST_ID3;
          toast.setAttribute("role", "status");
          toast.setAttribute("aria-live", "polite");
          document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.toggle("is-error", isError);
        toast.classList.remove("is-visible");
        requestAnimationFrame(() => {
          toast.classList.add("is-visible");
        });
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          toast.classList.remove("is-visible");
        }, 3e3);
      }
      function getProductId() {
        const urlProductId = new URL(context.location.href).searchParams.get("product_id");
        if (urlProductId && /^\d+$/.test(urlProductId)) {
          return urlProductId;
        }
        const input = document.querySelector('#form_product input[name="product_id"], input[name="product_id"]');
        const inputProductId = input instanceof HTMLInputElement ? input.value : "";
        return /^\d+$/.test(inputProductId) ? inputProductId : null;
      }
      function formToUrlSearchParams(form) {
        const params = new URLSearchParams();
        const formData = new FormData(form);
        for (const [name, value] of formData.entries()) {
          if (typeof value === "string") {
            params.append(name, value);
          }
        }
        return params;
      }
      async function requestDocument(url, options = {}) {
        const response = await fetch(url, {
          credentials: "same-origin",
          cache: "no-store",
          redirect: "follow",
          ...options,
          headers: {
            Accept: "text/html,application/xhtml+xml",
            ...options.headers || {}
          }
        });
        const text = await response.text();
        if (!response.ok) {
          throw new Error(`The request returned HTTP ${response.status}.`);
        }
        const parsedDocument = new DOMParser().parseFromString(text, "text/html");
        return { document: parsedDocument, response };
      }
      function assertWishlistDocument(parsedDocument, response) {
        const responsePath = response.url ? new URL(response.url).pathname : "";
        const title = parsedDocument.title || "";
        const hasPasswordField = Boolean(parsedDocument.querySelector('input[type="password"]'));
        if (/ログイン|login/i.test(title) || hasPasswordField || responsePath.includes("/mypage/") && !responsePath.endsWith("/favorite.php")) {
          throw new Error("You must be logged in to Melonbooks.");
        }
        if (!parsedDocument.querySelector(".my-page.my-circle-page")) {
          throw new Error("Could not load the wishlist page.");
        }
      }
      function findProductForm(parsedDocument, productId) {
        const forms = parsedDocument.querySelectorAll(".my-page.my-circle-page .item-list form");
        for (const form of forms) {
          const deleteControl = form.querySelector('a[title="\u30EA\u30B9\u30C8\u304B\u3089\u524A\u9664"], a[onclick*="delete_favorite"]');
          if (!deleteControl) continue;
          const hasProduct = Array.from(form.querySelectorAll('input[name="product_id"]')).some(
            (input) => input.value === productId
          );
          if (hasProduct) return form;
        }
        return null;
      }
      function getWishlistProductIds(parsedDocument) {
        const productIds = /* @__PURE__ */ new Set();
        const forms = parsedDocument.querySelectorAll(".my-page.my-circle-page .item-list form");
        for (const form of forms) {
          const deleteControl = form.querySelector('a[title="\u30EA\u30B9\u30C8\u304B\u3089\u524A\u9664"], a[onclick*="delete_favorite"]');
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
        const navigationForm = previousDocument?.querySelector("form#form1");
        if (!(navigationForm instanceof HTMLFormElement)) {
          throw new Error("Could not read the wishlist pagination form.");
        }
        const body = formToUrlSearchParams(navigationForm);
        body.set("mode", "");
        body.set("group", "");
        body.set("pageno", String(pageNumber));
        return requestDocument(wishlistUrl, {
          method: "POST",
          body
        });
      }
      async function findWishlistEntry(productId) {
        const seenPageSignatures = /* @__PURE__ */ new Set();
        let navigationDocument = null;
        for (let pageNumber = 1; pageNumber <= MAXIMUM_PAGES_TO_CHECK; pageNumber += 1) {
          const page = pageNumber === 1 ? await requestDocument(wishlistUrl) : await requestWishlistPage(navigationDocument, pageNumber);
          assertWishlistDocument(page.document, page.response);
          const form = findProductForm(page.document, productId);
          if (form) {
            return { form, pageNumber };
          }
          const productIds = getWishlistProductIds(page.document);
          if (productIds.length === 0) break;
          const signature = productIds.join(",");
          if (seenPageSignatures.has(signature)) break;
          seenPageSignatures.add(signature);
          navigationDocument = page.document;
        }
        throw new Error("The product was not found in the wishlist.");
      }
      async function submitDelete(entry, productId) {
        const body = formToUrlSearchParams(entry.form);
        body.set("mode", "delete_favorite");
        body.set("product_id", productId);
        if (!body.has("quantity")) body.set("quantity", "1");
        if (!body.has("pageno")) body.set("pageno", String(entry.pageNumber));
        const result = await requestDocument(wishlistUrl, {
          method: "POST",
          body
        });
        assertWishlistDocument(result.document, result.response);
        if (findProductForm(result.document, productId)) {
          throw new Error("Melonbooks returned the item without removing it.");
        }
      }
      async function removeFromWishlist(button) {
        const productId = getProductId();
        if (!productId) {
          showToast("Could not determine the product ID.", true);
          return;
        }
        busyButtons.add(button);
        button.classList.add("mb-wishlist-toggle-busy");
        button.setAttribute("aria-busy", "true");
        try {
          const wishlistEntry = await findWishlistEntry(productId);
          await submitDelete(wishlistEntry, productId);
          button.classList.remove("__active");
          renderButton(button, false);
          showToast("Removed from the wishlist.");
        } catch (error) {
          console.error("[Melonbooks - Wishlist Toggle]", error);
          const message = error instanceof Error ? error.message : String(error);
          showToast(`Could not remove the item from the wishlist. ${message}`, true);
        } finally {
          busyButtons.delete(button);
          button.classList.remove("mb-wishlist-toggle-busy");
          button.removeAttribute("aria-busy");
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
            showToast("Added to the wishlist.");
            return;
          }
          if (attempts >= maximumAttempts || !button.isConnected) {
            addWatchers.delete(button);
            return;
          }
          const timer2 = setTimeout(check, delay);
          addWatchers.set(button, timer2);
        };
        const timer = setTimeout(check, delay);
        addWatchers.set(button, timer);
      }
      function handleClick(event) {
        if (!(event.target instanceof Element)) return;
        const button = event.target.closest(BUTTON_SELECTOR2);
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
      document.querySelectorAll(BUTTON_SELECTOR2).forEach((button) => {
        if (button instanceof HTMLElement) {
          renderButton(button, isActive(button));
        }
      });
      document.addEventListener("click", handleClick, true);
    }
  };

  // src/modules/favorite-authors-infinite-scroll.js
  var SELECTORS = Object.freeze({
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
  var PAGE_DELAY_MS = 100;
  var MAX_REQUEST_ATTEMPTS = 2;
  var FA_STYLES = `
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
  var FavoriteAuthorsInfiniteScrollModule = {
    id: "favorite-authors-infinite-scroll",
    name: "Favorite Authors Infinite Scroll",
    lifecycle: "document-idle",
    matches(context) {
      return context.route === "melonbooks-favorite-authors" || context.location.pathname.includes("favorite_author.php");
    },
    async init(context) {
      const pageElement = document.querySelector(SELECTORS.page);
      const listElement = document.querySelector(SELECTORS.list);
      if (!pageElement || !listElement) {
        return;
      }
      const formElement = document.querySelector(SELECTORS.form);
      const paginationElement = document.querySelector(SELECTORS.pagination);
      injectStyle("favorite-authors-infinite-scroll", FA_STYLES);
      function formatCards(root) {
        const cards = root.matches?.(SELECTORS.card) ? [root] : Array.from(root.querySelectorAll(SELECTORS.card));
        for (const card of cards) {
          const row = card.querySelector(SELECTORS.row);
          const authorName = row?.querySelector(SELECTORS.name);
          const actions = row?.querySelector(SELECTORS.actions);
          if (!row || !authorName || !actions) continue;
          row.classList.add("mb-fa-author-row");
          authorName.classList.add("mb-fa-author-name");
          actions.classList.add("mb-fa-author-actions");
          if (authorName.nextElementSibling !== actions) {
            authorName.insertAdjacentElement("afterend", actions);
          }
        }
      }
      function getDirectCards(list) {
        if (!list) return [];
        return Array.from(list.children).filter((child) => child.matches(SELECTORS.card));
      }
      function getAuthorKey(card) {
        const action = card.querySelector(".favorite a[onclick*='author_id']")?.getAttribute("onclick") || "";
        const idMatch = action.match(/["']author_id["']\s*,\s*["'](\d+)["']/i);
        if (idMatch) return `id:${idMatch[1]}`;
        const authorLink = card.querySelector(`${SELECTORS.name} a`);
        const href = authorLink?.getAttribute("href");
        if (href) return `href:${new URL(href, context.location.href).href}`;
        const name = authorLink?.textContent.trim() || card.textContent.trim();
        return `name:${name}`;
      }
      function toPositiveInteger(value) {
        const num = Number.parseInt(String(value || "").trim(), 10);
        return Number.isInteger(num) && num > 0 ? num : 0;
      }
      function getCurrentPage(sourceDoc) {
        const currentLink = sourceDoc.querySelector(`${SELECTORS.pagination} a.current`);
        const currentFromLink = toPositiveInteger(currentLink?.getAttribute("title") || currentLink?.textContent);
        if (currentFromLink) return currentFromLink;
        const hiddenPage = sourceDoc.querySelector(`${SELECTORS.form} input[name='pageno']`);
        return toPositiveInteger(hiddenPage?.value) || 1;
      }
      function getHighestKnownPage(sourceDoc) {
        let highestPage = getCurrentPage(sourceDoc);
        const pagination = sourceDoc.querySelector(SELECTORS.pagination);
        if (!pagination) return highestPage;
        for (const el of pagination.querySelectorAll("a, [onclick]")) {
          const onclick = el.getAttribute("onclick") || "";
          const movePageMatch = onclick.match(/movePage\s*\(\s*["']?(\d+)/i);
          if (movePageMatch) {
            highestPage = Math.max(highestPage, Number(movePageMatch[1]));
          }
          const titlePage = toPositiveInteger(el.getAttribute("title"));
          if (titlePage) highestPage = Math.max(highestPage, titlePage);
          const href = el.getAttribute("href");
          if (href && href !== "#") {
            try {
              const hrefPage = toPositiveInteger(new URL(href, context.location.href).searchParams.get("pageno"));
              if (hrefPage) highestPage = Math.max(highestPage, hrefPage);
            } catch {
            }
          }
        }
        return highestPage;
      }
      function createStatusElement() {
        const existing = document.getElementById("mb-fa-load-status");
        if (existing) return existing;
        const status = document.createElement("div");
        status.id = "mb-fa-load-status";
        status.className = "mb-fa-loading";
        status.setAttribute("role", "status");
        status.setAttribute("aria-live", "polite");
        listElement.insertAdjacentElement("afterend", status);
        return status;
      }
      function setStatus(statusElement2, message, state = "loading") {
        if (!statusElement2) return;
        statusElement2.classList.toggle("mb-fa-loading", state === "loading");
        statusElement2.classList.toggle("mb-fa-error", state === "error");
        statusElement2.textContent = message;
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
              credentials: "same-origin",
              cache: "no-store",
              redirect: "follow",
              headers: {
                Accept: "text/html,application/xhtml+xml",
                ...options.headers || {}
              }
            });
            if (!response.ok) {
              throw new Error(`HTTP ${response.status} ${response.statusText}`);
            }
            const html = await response.text();
            const pageDoc = new DOMParser().parseFromString(html, "text/html");
            if (!pageDoc.querySelector(SELECTORS.list)) {
              throw new Error("The response did not contain the Favorite Authors list.");
            }
            return pageDoc;
          } catch (err) {
            lastError = err;
            if (attempt < MAX_REQUEST_ATTEMPTS) {
              await delay(350 * attempt);
            }
          }
        }
        throw lastError || new Error("Unknown page-loading error.");
      }
      function assertExpectedPage(pageDoc, expectedPage) {
        const actualPage = getCurrentPage(pageDoc);
        if (actualPage !== expectedPage) {
          throw new Error(`Requested page ${expectedPage}, but the server returned page ${actualPage}.`);
        }
      }
      async function requestPageByPost(pageNumber2) {
        const action = formElement.getAttribute("action") || context.location.href;
        const requestUrl = new URL(action, context.location.href);
        const body = new URLSearchParams();
        for (const [name, value] of new FormData(formElement).entries()) {
          body.append(name, String(value));
        }
        body.set("mode", "");
        body.set("author_id", "");
        body.set("pageno", String(pageNumber2));
        return fetchHtmlDocument(requestUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
          },
          body: body.toString()
        });
      }
      async function requestPageByGet(pageNumber2) {
        const requestUrl = new URL(context.location.href);
        requestUrl.searchParams.set("pageno", String(pageNumber2));
        return fetchHtmlDocument(requestUrl, { method: "GET" });
      }
      async function fetchPageDocument(pageNumber2) {
        let postError = null;
        if (formElement) {
          try {
            const postDoc = await requestPageByPost(pageNumber2);
            assertExpectedPage(postDoc, pageNumber2);
            return postDoc;
          } catch (err) {
            postError = err;
            console.warn(`[Melonbooks Favorite Authors] POST loading failed for page ${pageNumber2}. Trying GET.`, err);
          }
        }
        try {
          const getDoc = await requestPageByGet(pageNumber2);
          assertExpectedPage(getDoc, pageNumber2);
          return getDoc;
        } catch (getErr) {
          const combined = new Error(`Both POST and GET failed for favorite authors page ${pageNumber2}.`);
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
      const loadedAuthorKeys = /* @__PURE__ */ new Set();
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
      paginationElement.classList.add("mb-fa-pagination-hidden");
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
          paginationElement.classList.remove("mb-fa-pagination-hidden");
          setStatus(
            statusElement,
            `Automatic loading stopped at page ${pageNumber}. ${loadedAuthorCount} authors were loaded. The original page controls have been restored.`,
            "error"
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
      setStatus(statusElement, `All ${loadedAuthorCount} favorite authors were loaded from ${loadedPageCount} pages.`, "complete");
    }
  };

  // src/modules/wishlist-infinite-scroll.js
  var PRELOAD_DISTANCE = 1200;
  var WISHLIST_IS_CSS = `
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
  var WishlistInfiniteScrollModule = {
    id: "wishlist-infinite-scroll",
    name: "Wishlist Infinite Scroll",
    lifecycle: "document-idle",
    matches(context) {
      return context.route === "melonbooks-wishlist" || context.location.pathname.includes("favorite.php");
    },
    init(context) {
      const list = document.querySelector(".item-list > ul");
      const form = document.querySelector("#form1");
      const paginator = document.querySelector(".pagenavi");
      if (!list || !form) {
        return;
      }
      injectStyle("wishlist-infinite-layout", WISHLIST_IS_CSS);
      function removeTrailingClearElements() {
        for (const child of [...list.children]) {
          if (child.tagName === "LI") continue;
          const style = getComputedStyle(child);
          const looksLikeClear = child.matches("br[clear], .clear, .clearfix, .clearboth, .clear-both") || style.clear === "both" || style.clear === "left" || style.clear === "right";
          if (looksLikeClear) {
            child.remove();
          }
        }
      }
      removeTrailingClearElements();
      function readCurrentPage(doc) {
        const formPage = doc.querySelector('#form1 input[name="pageno"]')?.value;
        const current = doc.querySelector(".pagenavi a.current");
        const visiblePage = current?.getAttribute("title") || current?.textContent?.trim();
        return Math.max(1, Number.parseInt(formPage || visiblePage || "1", 10) || 1);
      }
      function readMaxPage(doc) {
        const pages = [readCurrentPage(doc)];
        for (const link of doc.querySelectorAll(".pagenavi a")) {
          const title = Number.parseInt(link.getAttribute("title") || "", 10);
          if (Number.isFinite(title)) pages.push(title);
          const match = (link.getAttribute("onclick") || "").match(/movePage\s*\(\s*['"]?(\d+)/i);
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
          const id = new URL(link.getAttribute("href"), context.location.href).searchParams.get("product_id");
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
      const loadedPages = /* @__PURE__ */ new Set([currentPage]);
      const productKeys = new Set(
        [...list.children].filter((el) => el.tagName === "LI").map((li) => productKey(li)).filter(Boolean)
      );
      const status = document.createElement("div");
      status.id = "mb-wishlist-infinite-scroll-status";
      status.setAttribute("aria-live", "polite");
      status.style.cssText = "text-align:center;padding:14px 8px;font-size:12px;opacity:.75;min-height:16px";
      document.querySelector(".item-list")?.after(status);
      let observer = null;
      function finish() {
        finished = true;
        loading = false;
        observer?.disconnect();
        if (paginator) {
          paginator.hidden = true;
        }
        status.onclick = null;
        status.style.cursor = "";
        status.textContent = "All wishlist items loaded.";
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
          if ((control.type === "checkbox" || control.type === "radio") && !control.checked) continue;
          params.append(control.name, control.value);
        }
        params.set("pageno", String(page));
        return params.toString();
      }
      async function fetchPage(page) {
        const action = new URL(form.getAttribute("action") || context.location.href, context.location.href);
        const response = await fetch(action.href, {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
          },
          body: requestBody(page)
        });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        return new DOMParser().parseFromString(await response.text(), "text/html");
      }
      function prepareItem(li, page, index) {
        const suffix = `mbis_${page}_${index}`;
        for (const f of li.querySelectorAll("form")) {
          f.id = `${suffix}_form`;
          f.name = `${suffix}_form`;
          const mode = f.querySelector('input[name="mode"]');
          if (mode) mode.id = `${suffix}_mode`;
        }
        for (const link of li.querySelectorAll('a[title="\u30EA\u30B9\u30C8\u304B\u3089\u524A\u9664"]')) {
          link.removeAttribute("onclick");
          link.addEventListener("click", (e) => {
            e.preventDefault();
            const targetForm = link.closest("form");
            const mode = targetForm?.querySelector('input[name="mode"]');
            if (!targetForm || !mode) return;
            mode.value = "delete_favorite";
            targetForm.action = "?";
            targetForm.submit();
          });
        }
        for (const link of li.querySelectorAll("a.cart_in_button")) {
          link.removeAttribute("onclick");
          link.addEventListener("click", (e) => {
            e.preventDefault();
            link.closest("form")?.submit();
          });
        }
        for (const button of li.querySelectorAll("a.cart_select_button")) {
          button.addEventListener("click", (e) => {
            e.preventDefault();
            const wrapper = button.closest("p.favorite.cart_select");
            const checkbox = wrapper?.querySelector("input.chProductId");
            if (!wrapper || !checkbox) return;
            if (checkbox.checked) {
              wrapper.classList.add("select");
              wrapper.classList.remove("selected");
            } else {
              wrapper.classList.add("selected");
              wrapper.classList.remove("select");
            }
            checkbox.click();
          });
        }
        for (const img of li.querySelectorAll("img[data-src]")) {
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
        }
        li.style.setProperty("clear", "none", "important");
      }
      function getInsertionPoint() {
        for (const child of list.children) {
          if (child.tagName !== "LI") return child;
        }
        return null;
      }
      function appendPage(doc, page) {
        const incoming = doc.querySelector(".item-list > ul");
        if (!incoming) return 0;
        const fragment = document.createDocumentFragment();
        let added = 0;
        [...incoming.children].forEach((source, index) => {
          if (source.tagName !== "LI") return;
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
          status.textContent = "";
          if (currentPage >= maxPage) {
            finish();
            return;
          }
        } catch (error) {
          console.error("[Melonbooks Wishlist Infinite Scroll]", error);
          retryBlocked = true;
          status.textContent = `Failed to load wishlist page ${nextPage}. Click here to retry.`;
          status.style.cursor = "pointer";
          status.onclick = () => {
            status.onclick = null;
            status.style.cursor = "";
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

  // src/main.js
  var modules = [
    ForceDetailThumbnailsModule,
    CartDuplicateWarningModule,
    HeadingTranslatorModule,
    ProductInfoLayoutModule,
    SearchColumnsModule,
    ForceListingImagesModule,
    ListingHoverModule,
    OrdersGridInfiniteScrollModule,
    FavoriteCircleToggleModule,
    FavoriteAuthorToggleModule,
    WishlistToggleModule,
    FavoriteAuthorsInfiniteScrollModule,
    WishlistInfiniteScrollModule
  ];
  function bootstrap() {
    const context = createExecutionContext();
    const isDebug = Settings.isDebugEnabled();
    Logger.setDebug(isDebug);
    Logger.debug(`Initializing Melonbooks Enhanced v${ScriptInfo.version} on route: ${context.route}`);
    for (const mod of modules) {
      if (!Settings.isModuleEnabled(mod.id)) {
        Logger.debug(`Module ${mod.id} is disabled by settings.`);
        continue;
      }
      try {
        if (!mod.matches(context)) {
          Logger.debug(`Module ${mod.id} did not match route ${context.route}.`);
          continue;
        }
        const timing = mod.lifecycle || "document-start";
        Logger.debug(`Scheduling module ${mod.id} at lifecycle [${timing}].`);
        runAt(timing, withErrorBoundary(mod.id, () => {
          Logger.debug(`Executing module ${mod.id}...`);
          mod.init(context);
        }));
      } catch (err) {
        Logger.moduleError(mod.id, "Failed during module scheduling or match check:", err);
      }
    }
  }
  bootstrap();
})();
