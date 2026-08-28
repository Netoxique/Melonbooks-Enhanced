import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyRoute } from '../src/core/routing.js';

test('Routing - Melonbooks routes', () => {
  const topContext = classifyRoute('https://www.melonbooks.co.jp/');
  assert.equal(topContext.domain, 'melonbooks');
  assert.equal(topContext.route, 'melonbooks-general');
  assert.equal(topContext.isMelonbooks, true);
  assert.equal(topContext.isOutlook, false);

  const searchContext = classifyRoute('https://www.melonbooks.co.jp/search/search.php?mode=search');
  assert.equal(searchContext.route, 'melonbooks-search');

  const detailContext = classifyRoute('https://www.melonbooks.co.jp/detail/detail.php?product_id=123456');
  assert.equal(detailContext.route, 'melonbooks-product');

  const shortDetailContext = classifyRoute('https://www.melonbooks.co.jp/detail/123456');
  assert.equal(shortDetailContext.route, 'melonbooks-product');

  const cartContext = classifyRoute('https://www.melonbooks.co.jp/cart/index.php');
  assert.equal(cartContext.route, 'melonbooks-cart');

  const ordersContext = classifyRoute('https://www.melonbooks.co.jp/mypage/history.php');
  assert.equal(ordersContext.route, 'melonbooks-orders');

  const favAuthorContext = classifyRoute('https://www.melonbooks.co.jp/mypage/favorite_author.php');
  assert.equal(favAuthorContext.route, 'melonbooks-favorite-authors');

  const wishlistContext = classifyRoute('https://www.melonbooks.co.jp/mypage/favorite.php');
  assert.equal(wishlistContext.route, 'melonbooks-wishlist');
});

test('Routing - Outlook routes', () => {
  const officeContext = classifyRoute('https://outlook.office.com/mail/inbox');
  assert.equal(officeContext.domain, 'outlook');
  assert.equal(officeContext.route, 'outlook');
  assert.equal(officeContext.isOutlook, true);
  assert.equal(officeContext.isMelonbooks, false);

  const liveContext = classifyRoute('https://outlook.live.com/mail/0/');
  assert.equal(liveContext.domain, 'outlook');
  assert.equal(liveContext.route, 'outlook');
  assert.equal(liveContext.isOutlook, true);
});

test('Routing - Non-matching routes', () => {
  const otherContext = classifyRoute('https://www.google.com/');
  assert.equal(otherContext.domain, 'unknown');
  assert.equal(otherContext.route, 'unknown');
  assert.equal(otherContext.isMelonbooks, false);
  assert.equal(otherContext.isOutlook, false);
});
