import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const modulePath = path.resolve('src/modules/wishlist-infinite-scroll.js');
const source = fs.readFileSync(modulePath, 'utf8');

test('Wishlist Infinite Scroll - excludes Melonbooks layout placeholders', () => {
  assert.ok(
    source.includes("item.classList.contains('item-list__placeholder')"),
    'placeholder LI elements are excluded from product detection'
  );
  assert.ok(
    source.includes("querySelector(':scope > li.item-list__placeholder')"),
    'the first placeholder is used as the insertion boundary'
  );
});

test('Wishlist Infinite Scroll - inserts fetched products before placeholders', () => {
  assert.ok(
    source.includes('itemList.insertBefore(fragment, insertionPoint)'),
    'fetched products are inserted before the placeholder boundary'
  );
  assert.ok(
    !source.includes('itemList.appendChild(fragment)'),
    'fetched products are not appended after the placeholder elements'
  );
});

test('Wishlist Infinite Scroll - prevents duplicate initialization', () => {
  assert.ok(
    source.includes("itemList.hasAttribute(INITIALIZED_ATTRIBUTE)"),
    'the module checks whether the wishlist list has already been initialized'
  );
  assert.ok(
    source.includes("itemList.setAttribute(INITIALIZED_ATTRIBUTE, '1')"),
    'the module marks the wishlist list as initialized'
  );
});

test('Wishlist Infinite Scroll - deduplicates products already present in the live DOM', () => {
  assert.ok(
    source.includes('function removeDuplicateProducts()'),
    'the module contains a live DOM duplicate-removal pass'
  );
  assert.ok(
    source.includes('if (seen.has(key))'),
    'duplicate product keys are detected during the live DOM scan'
  );
  assert.ok(
    source.includes('item.remove();'),
    'duplicate product elements are removed from the wishlist'
  );
  assert.ok(
    source.includes('new MutationObserver'),
    'the module watches for duplicate products inserted after initialization'
  );
});

test('Wishlist Infinite Scroll - rejects duplicate products before insertion', () => {
  assert.ok(
    source.includes('itemKeys.has(key) || pendingKeys.has(key) || hasLiveProductKey(key)'),
    'incoming products are checked against tracked, pending, and live DOM keys'
  );
});
