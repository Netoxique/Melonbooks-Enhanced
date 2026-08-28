import { injectStyle } from '../core/styles.js';

/**
 * Module: Cart Duplicate Warning
 * Show a red warning banner and outline problematic MelonBooks cart items.
 */

const BANNER_ID = 'mb-duplicate-cart-warning-banner';
const HIGHLIGHT_CLASS = 'mb-duplicate-cart-warning-highlight';

const BANNER_CSS = `
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

export const CartDuplicateWarningModule = {
  id: 'cart-duplicate-warning',
  name: 'Cart Duplicate Warning',
  lifecycle: 'document-idle',

  matches(context) {
    return context.route === 'melonbooks-cart' || context.location.pathname.includes('/clipboard');
  },

  init() {
    function getCartItems() {
      return Array.from(document.querySelectorAll('.clip-item-cover'));
    }

    function getItemQuantity(item) {
      const qtyInput = item.querySelector('.clip-item-control .select input');
      if (!qtyInput) return 1;

      const qty = Number.parseInt(qtyInput.value, 10);
      return Number.isFinite(qty) ? qty : 1;
    }

    function isAlreadyPurchased(item) {
      if (item.querySelector('.already-buy')) return true;
      return item.textContent.includes('ご購入済み');
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

      const banner = document.createElement('div');
      banner.id = BANNER_ID;
      banner.setAttribute('role', 'alert');

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

      injectStyle('cart-duplicate-warning', BANNER_CSS);
      highlightProblemItems(problemItems);

      const banner = createBanner(problemItems);
      document.body.insertBefore(banner, document.body.firstChild);
    }

    insertBanner();

    // Re-check if the cart updates dynamically
    let debounceTimer = null;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(insertBanner, 150);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['value', 'class']
    });
  }
};
