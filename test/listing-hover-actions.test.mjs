import test from 'node:test';
import assert from 'node:assert/strict';
import { buildActionRow } from '../src/modules/listing-hover.js';

function makeElement(tagName) {
  const listeners = new Map();
  const extraClasses = new Set();
  const element = {
    tagName: tagName.toUpperCase(),
    className: '',
    children: [],
    classList: {
      contains(token) {
        return extraClasses.has(token) || element.className.split(/\s+/).includes(token);
      },
      add(token) {
        extraClasses.add(token);
      }
    },
    appendChild(child) {
      this.children.push(child);
      child.parentElement = this;
      return child;
    },
    addEventListener(eventType, listener) {
      listeners.set(eventType, listener);
    },
    dispatchClick(event) {
      listeners.get('click')?.(event);
    }
  };
  return element;
}

test('Listing Hover forwards preorder, cart, and resale actions to native links', () => {
  const priorDocument = globalThis.document;
  globalThis.document = { createElement: makeElement };

  try {
    for (const [name, classes, expectedProxyClass] of [
      ['preorder', ['to_cart', 'reserve'], 'reserve'],
      ['cart', ['to_cart', 'cart'], null],
      ['resale', ['to_request', 'resale_request'], 'mb-hover-resale-proxy']
    ]) {
      let nativeClicks = 0;
      let prevented = 0;
      let stopped = 0;
      const nativeContainer = { className: 'search-item-detail-btn-list' };
      const nativeLink = {
        classList: { contains: (token) => classes.includes(token) },
        innerHTML: '<i class="fa fa-shopping-cart"></i> ' + name,
        parentElement: nativeContainer,
        click() {
          nativeClicks += 1;
        }
      };
      const meta = {
        querySelector: () => null,
        querySelectorAll: () => [nativeLink]
      };

      const row = buildActionRow(meta);
      const visibleButton = row.children[0].children[0];

      assert.equal(nativeLink.parentElement, nativeContainer, name + ' original must stay in its native container');
      assert.equal(visibleButton.tagName, 'BUTTON');
      assert.equal(visibleButton.type, 'button');
      assert.equal(visibleButton.innerHTML, nativeLink.innerHTML);
      assert.ok(visibleButton.classList.contains('mb-hover-action-proxy'));
      assert.equal(visibleButton.classList.contains('to_cart'), false);
      assert.equal(visibleButton.classList.contains('to_request'), false);
      if (expectedProxyClass) assert.ok(visibleButton.classList.contains(expectedProxyClass));

      visibleButton.dispatchClick({
        preventDefault() { prevented += 1; },
        stopPropagation() { stopped += 1; }
      });

      assert.equal(nativeClicks, 1, name + ' click must reach the original link once');
      assert.equal(prevented, 1);
      assert.equal(stopped, 1);
    }
  } finally {
    globalThis.document = priorDocument;
  }
});
