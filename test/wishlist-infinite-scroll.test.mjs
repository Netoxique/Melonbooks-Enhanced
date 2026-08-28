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
