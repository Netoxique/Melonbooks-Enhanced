// ==UserScript==
// @name         Melonbooks - Enhancements
// @namespace    https://github.com/Netoxic/melonbooks-enhancements
// @version      0.4.0
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
  __publicField(ScriptInfo, "version", "0.4.0");
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

  // src/main.js
  var modules = [
    ForceDetailThumbnailsModule,
    CartDuplicateWarningModule,
    HeadingTranslatorModule
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
