/**
 * Environment and Route classification for Melonbooks Enhanced.
 */

export function isOutlook(location = window.location) {
  const host = location.hostname.toLowerCase();
  return host === 'outlook.office.com' || host === 'outlook.live.com';
}

export function isMelonbooks(location = window.location) {
  const host = location.hostname.toLowerCase();
  return host === 'melonbooks.co.jp' || host.endsWith('.melonbooks.co.jp');
}

export function getRoute(location = window.location) {
  if (isOutlook(location)) {
    return 'outlook';
  }

  if (!isMelonbooks(location)) {
    return 'unknown';
  }

  const path = location.pathname.toLowerCase();

  // Search pages
  if (path.startsWith('/search/') || path.includes('search.php')) {
    return 'melonbooks-search';
  }

  // Product detail pages
  if (path.startsWith('/detail/') || path.includes('/products/detail.php') || path.includes('detail.php')) {
    return 'melonbooks-product';
  }

  // Cart / Clipboard pages
  if (path.startsWith('/clipboard/') || path.includes('clipboard.php') || path.includes('/cart/')) {
    return 'melonbooks-cart';
  }

  // My Orders
  if (path.includes('history.php')) {
    return 'melonbooks-orders';
  }

  // Favorite authors
  if (path.includes('favorite_author.php')) {
    return 'melonbooks-favorite-authors';
  }

  // Wishlist / Favorites
  if (path.includes('favorite.php')) {
    return 'melonbooks-wishlist';
  }

  // Circle page
  if (path.startsWith('/circle/')) {
    return 'melonbooks-circle';
  }

  // Tags page
  if (path.startsWith('/tags/')) {
    return 'melonbooks-tags';
  }

  // Top or general page
  return 'melonbooks-general';
}

export function createExecutionContext(location = window.location) {
  return {
    location,
    route: getRoute(location),
    isMelonbooks: isMelonbooks(location),
    isOutlook: isOutlook(location)
  };
}
