import { injectStyle } from '../core/styles.js';

/**
 * Module: Orders Grid & Infinite Scroll
 * Expand Melonbooks order history to the full window width, add persistent grid controls,
 * default the order range to 1 year, and add infinite scroll.
 */

const ScriptConfig = {
  columnCount: 5,
  minColumnCount: 2,
  maxColumnCount: 12,
  columnCountStorageKey: 'melonbooksOrdersColumnCount',

  productSpacingPx: 0,
  minProductSpacingPx: 0,
  maxProductSpacingPx: 100,
  productSpacingStorageKey: 'melonbooksOrdersProductSpacingPx',

  fullWidthHorizontalPaddingPx: 12,
  productInfoRowSpacingPx: 1,

  productCardBackground: 'transparent',
  productCardBorderColor: 'rgba(128, 128, 128, 0.35)',

  defaultSearchSelectValue: '3',
  autoSubmitDefaultSearchPeriod: true,

  infiniteScrollEnabled: true,
  infiniteScrollRootMarginPx: 1200,
  hideOriginalPagination: false
};

const ORDERS_CSS = `
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

export const OrdersGridInfiniteScrollModule = {
  id: 'orders-grid-infinite-scroll',
  name: 'Orders Grid & Infinite Scroll',
  lifecycle: 'document-start',

  matches(context) {
    return context.route === 'melonbooks-orders' || context.location.pathname.includes('history.php');
  },

  init(context) {
    injectStyle('orders-grid', ORDERS_CSS);

    let activeColumnCount = loadStoredColumnCount();
    let activeProductSpacingPx = loadStoredProductSpacing();

    function saveColumnCount(value) {
      try {
        localStorage.setItem(ScriptConfig.columnCountStorageKey, String(value));
      } catch (e) {
        console.warn('[Melonbooks Orders Grid] Could not save column count:', e);
      }
    }

    function saveProductSpacing(value) {
      try {
        localStorage.setItem(ScriptConfig.productSpacingStorageKey, String(value));
      } catch (e) {
        console.warn('[Melonbooks Orders Grid] Could not save product spacing:', e);
      }
    }

    function updateColumnCountControl() {
      const decreaseButton = document.getElementById('mb-orders-column-decrease');
      const increaseButton = document.getElementById('mb-orders-column-increase');
      const valueOutput = document.getElementById('mb-orders-column-value');

      if (valueOutput) {
        valueOutput.value = String(activeColumnCount);
        valueOutput.textContent = String(activeColumnCount);
        valueOutput.setAttribute('aria-label', `${activeColumnCount} products per row`);
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
      const decreaseButton = document.getElementById('mb-orders-spacing-decrease');
      const increaseButton = document.getElementById('mb-orders-spacing-increase');
      const valueOutput = document.getElementById('mb-orders-spacing-value');

      if (valueOutput) {
        valueOutput.value = String(activeProductSpacingPx);
        valueOutput.textContent = `${activeProductSpacingPx} px`;
        valueOutput.setAttribute('aria-label', `${activeProductSpacingPx} pixels between products`);
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
        document.documentElement.style.setProperty('--mb-orders-column-count', String(activeColumnCount));
      }
      if (persist) {
        saveColumnCount(activeColumnCount);
      }
      updateColumnCountControl();
    }

    function applyProductSpacing(value, persist = true) {
      activeProductSpacingPx = clampProductSpacing(value);
      if (document.documentElement) {
        document.documentElement.style.setProperty('--mb-orders-product-spacing', `${activeProductSpacingPx}px`);
      }
      if (persist) {
        saveProductSpacing(activeProductSpacingPx);
      }
      updateProductSpacingControl();
    }

    function createSettingButton({ id, text, ariaLabel, onClick }) {
      const button = document.createElement('button');
      button.type = 'button';
      button.id = id;
      button.className = 'mb-orders-setting-button';
      button.textContent = text;
      button.setAttribute('aria-label', ariaLabel);
      button.addEventListener('click', onClick);
      return button;
    }

    function createProductsPerRowControl() {
      const row = document.createElement('div');
      row.className = 'mb-orders-setting-row';

      const label = document.createElement('span');
      label.className = 'mb-orders-setting-label';
      label.textContent = 'Products per row:';

      const decreaseButton = createSettingButton({
        id: 'mb-orders-column-decrease',
        text: '\u2212',
        ariaLabel: 'Decrease products per row',
        onClick: () => applyColumnCount(activeColumnCount - 1)
      });

      const valueOutput = document.createElement('output');
      valueOutput.id = 'mb-orders-column-value';
      valueOutput.className = 'mb-orders-setting-value';
      valueOutput.setAttribute('aria-live', 'polite');

      const increaseButton = createSettingButton({
        id: 'mb-orders-column-increase',
        text: '+',
        ariaLabel: 'Increase products per row',
        onClick: () => applyColumnCount(activeColumnCount + 1)
      });

      row.append(label, decreaseButton, valueOutput, increaseButton);
      return row;
    }

    function createProductSpacingControl() {
      const row = document.createElement('div');
      row.className = 'mb-orders-setting-row';

      const label = document.createElement('span');
      label.className = 'mb-orders-setting-label';
      label.textContent = 'Spacing:';

      const decreaseButton = createSettingButton({
        id: 'mb-orders-spacing-decrease',
        text: '\u2212',
        ariaLabel: 'Decrease product spacing',
        onClick: () => applyProductSpacing(activeProductSpacingPx - 1)
      });

      const valueOutput = document.createElement('output');
      valueOutput.id = 'mb-orders-spacing-value';
      valueOutput.className = 'mb-orders-setting-value';
      valueOutput.setAttribute('aria-live', 'polite');

      const increaseButton = createSettingButton({
        id: 'mb-orders-spacing-increase',
        text: '+',
        ariaLabel: 'Increase product spacing',
        onClick: () => applyProductSpacing(activeProductSpacingPx + 1)
      });

      row.append(label, decreaseButton, valueOutput, increaseButton);
      return row;
    }

    function initGridControls() {
      const myPage = document.querySelector('.my-page');
      if (!myPage || document.querySelector('.mb-orders-grid-controls')) {
        applyColumnCount(activeColumnCount, false);
        applyProductSpacing(activeProductSpacingPx, false);
        return;
      }

      const controls = document.createElement('div');
      controls.className = 'mb-orders-grid-controls';
      controls.setAttribute('aria-label', 'Product grid settings');

      controls.append(createProductsPerRowControl(), createProductSpacingControl());

      const pageHeader = myPage.querySelector(':scope > .page-header');
      if (pageHeader) {
        pageHeader.insertAdjacentElement('afterend', controls);
      } else {
        myPage.prepend(controls);
      }

      applyColumnCount(activeColumnCount, false);
      applyProductSpacing(activeProductSpacingPx, false);
    }

    function getSearchForm(root = document) {
      return root.querySelector('form#form1');
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
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }

      if (!ScriptConfig.autoSubmitDefaultSearchPeriod) return;

      const storageKey = `melonbooksOrdersDefaultPeriodApplied:${context.location.pathname}`;
      const hasAlreadyApplied = sessionStorage.getItem(storageKey) === desiredValue;
      const pageInput = form.querySelector('[name="pageno"]');
      const isFirstPage = !pageInput || !pageInput.value || pageInput.value === '1';

      if (hasAlreadyApplied || originalValue === desiredValue || !isFirstPage) {
        return;
      }

      sessionStorage.setItem(storageKey, desiredValue);
      if (pageInput) {
        pageInput.value = '1';
      }
      form.submit();
    }

    function getOrderListContainer(root = document) {
      const directContainers = Array.from(root.querySelectorAll('.my-page > div'));
      const directMatch = directContainers.find((el) => {
        return Array.from(el.children).some((child) => child.classList && child.classList.contains('history-detail'));
      });
      if (directMatch) return directMatch;

      const firstOrder = root.querySelector('.history-detail');
      return firstOrder ? firstOrder.parentElement : null;
    }

    function getPagination(root = document) {
      return root.querySelector('.pagenavi');
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
      const current = root.querySelector('.pagenavi .current');
      const fromTitle = extractPageNumber(current?.getAttribute('title'));
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

      const nextLink = pagination.querySelector('.pagenavi-next');
      if (nextLink) {
        return (
          extractPageNumber(nextLink.getAttribute('onclick')) ||
          extractPageNumber(nextLink.getAttribute('href')) ||
          extractPageNumber(nextLink.getAttribute('title')) ||
          extractPageNumber(nextLink.textContent)
        );
      }

      const currentPage = getCurrentPageNumber(root);
      const numericLinks = Array.from(pagination.querySelectorAll('a'))
        .map((link) => {
          return (
            extractPageNumber(link.getAttribute('title')) ||
            extractPageNumber(link.getAttribute('onclick')) ||
            extractPageNumber(link.getAttribute('href')) ||
            extractPageNumber(link.textContent)
          );
        })
        .filter((page) => Number.isFinite(page) && page > currentPage)
        .sort((a, b) => a - b);

      return numericLinks.length ? numericLinks[0] : null;
    }

    function getOrderKey(orderElement) {
      const rows = Array.from(orderElement.querySelectorAll('.history-detail__table tr'));
      for (const row of rows) {
        const th = row.querySelector('th');
        const td = row.querySelector('td');
        if (th && td && th.textContent.includes('注文番号')) {
          return td.textContent.trim();
        }
      }
      return orderElement.textContent.replace(/\s+/g, ' ').trim().slice(0, 200);
    }

    function buildLoadedOrderSet(orderListContainer) {
      const loaded = new Set();
      orderListContainer.querySelectorAll(':scope > .history-detail').forEach((el) => {
        loaded.add(getOrderKey(el));
      });
      return loaded;
    }

    function buildPageRequest(pageNumber) {
      const form = getSearchForm();
      if (!form) return null;

      const method = (form.method || 'post').toLowerCase();
      const action = new URL(form.getAttribute('action') || context.location.href, context.location.href);
      const formData = new FormData(form);

      formData.set('pageno', String(pageNumber));
      if (ScriptConfig.defaultSearchSelectValue) {
        formData.set('search_select', String(ScriptConfig.defaultSearchSelectValue));
      }
      formData.set('_mb_infinite_scroll', '1');

      if (method === 'get') {
        const url = new URL(action.href);
        for (const [key, value] of formData.entries()) {
          url.searchParams.set(key, value);
        }
        return {
          url: url.href,
          options: {
            method: 'GET',
            credentials: 'same-origin'
          }
        };
      }

      return {
        url: action.href,
        options: {
          method: 'POST',
          credentials: 'same-origin',
          body: new URLSearchParams(formData),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      };
    }

    function refreshLazyImages(container) {
      const images = Array.from(container.querySelectorAll('img.lazyload[data-src]'));
      if (window.lazySizes?.loader?.unveil) {
        images.forEach((img) => window.lazySizes.loader.unveil(img));
        return;
      }
      images.forEach((img) => {
        const src = img.getAttribute('src');
        if (!src || src.includes('now_printing')) {
          img.setAttribute('src', img.getAttribute('data-src'));
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
      const loadedPages = new Set([getCurrentPageNumber(document)]);
      let isLoading = false;
      let isFinished = false;

      const status = document.createElement('div');
      status.className = 'mb-orders-infinite-status';
      status.hidden = true;

      const sentinel = document.createElement('div');
      sentinel.className = 'mb-orders-infinite-sentinel';
      sentinel.setAttribute('aria-hidden', 'true');

      pagination.parentElement.insertBefore(sentinel, pagination);
      pagination.parentElement.insertBefore(status, pagination);

      if (ScriptConfig.hideOriginalPagination) {
        document.body.classList.add('mb-orders-hide-pagination');
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
          if (!request) throw new Error('Could not build the next-page request.');

          const response = await fetch(request.url, request.options);
          if (!response.ok) throw new Error(`Request failed with status ${response.status}.`);

          const html = await response.text();
          const nextDocument = new DOMParser().parseFromString(html, 'text/html');
          const nextOrderList = getOrderListContainer(nextDocument);

          if (!nextOrderList) {
            isFinished = true;
            setStatus('No more order pages found.');
            return;
          }

          const incomingOrders = Array.from(nextOrderList.querySelectorAll(':scope > .history-detail'));
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
            setStatus('', false);
          } else {
            nextPageNumber = null;
            isFinished = true;
            setStatus('All order pages loaded.');
          }
        } catch (error) {
          console.error('[Melonbooks Orders Grid] Infinite scroll failed:', error);
          setStatus('Could not load the next order page. Use the page numbers below as fallback.');
        } finally {
          isLoading = false;
        }
      }

      if ('IntersectionObserver' in window) {
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
        window.addEventListener('scroll', () => {
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

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady, { once: true });
    } else {
      onReady();
    }
  }
};
