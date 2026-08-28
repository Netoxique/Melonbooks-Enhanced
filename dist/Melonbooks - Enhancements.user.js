// ==UserScript==
// @name         Melonbooks - Enhancements
// @namespace    https://github.com/Netoxic/melonbooks-enhancements
// @version      0.1.0
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
  __publicField(ScriptInfo, "version", "0.1.0");
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

  // src/main.js
  var modules = [];
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
