/**
 * Storage manager for master settings and compatibility helpers.
 */

const SETTINGS_KEY = 'melonbooks_enhanced_settings';

const DEFAULT_SETTINGS = {
  debug: false,
  modules: {
    'force-detail-thumbnails': true,
    'cart-duplicate-warning': true,
    'heading-translator': true,
    'product-info-layout': true,
    'search-columns': true,
    'force-listing-images': true,
    'listing-hover': true,
    'orders-grid-infinite-scroll': true,
    'favorite-circle-toggle': true,
    'favorite-author-toggle': true,
    'wishlist-toggle': true,
    'favorite-authors-infinite-scroll': true,
    'wishlist-infinite-scroll': true,
    'vpn-link-handler': true
  }
};

export class Settings {
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
            ...(parsed.modules || {})
          }
        };
      }
    } catch {
      // Return defaults on parse or access error
    }
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  static save(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('[Melonbooks Enhancements] Failed to save settings to localStorage:', e);
    }
  }

  static isModuleEnabled(moduleId) {
    const settings = Settings.load();
    if (settings.modules && moduleId in settings.modules) {
      return Boolean(settings.modules[moduleId]);
    }
    return true;
  }

  static setModuleEnabled(moduleId, enabled) {
    const settings = Settings.load();
    settings.modules[moduleId] = Boolean(enabled);
    Settings.save(settings);
  }

  static isDebugEnabled() {
    const settings = Settings.load();
    return Boolean(settings.debug);
  }

  static setDebugEnabled(enabled) {
    const settings = Settings.load();
    settings.debug = Boolean(enabled);
    Settings.save(settings);
  }
}
