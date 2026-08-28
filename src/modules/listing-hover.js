import { injectStyle } from '../core/styles.js';

/**
 * Module: Listing Hover
 * Show .item-meta as an overlay on top of .item-image on Melonbooks listings,
 * with item states, popup info, privilege title, rank badge, and price/cart below the thumbnail.
 */

const PROCESSED_ATTR = 'data-mb-hover-meta-ready';
const RETRY_DELAYS_MS = [250, 1000, 2500];

const LISTING_HOVER_CSS = `
  .item-list li[${PROCESSED_ATTR}="1"] {
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    box-sizing: border-box !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .item-info {
    display: none !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .item-image {
    display: flex !important;
    position: relative !important;
    flex: 1 0 auto !important;
    align-items: flex-end !important;
    justify-content: center !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    line-height: 0 !important;
    overflow: visible !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .item-image > a:not(.pop_link) {
    display: flex !important;
    align-items: flex-end !important;
    justify-content: center !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: 100% !important;
    min-height: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    line-height: 0 !important;
    overflow: visible !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail {
    display: flex !important;
    position: relative !important;
    align-items: flex-end !important;
    justify-content: center !important;
    box-sizing: border-box !important;
    width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    margin-top: auto !important;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    line-height: 0 !important;
    overflow: visible !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail::before,
  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail::after {
    display: none !important;
    content: none !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail img {
    display: block !important;
    box-sizing: border-box !important;
    width: auto !important;
    height: auto !important;
    max-width: 100% !important;
    max-height: 100% !important;
    margin-top: 0 !important;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
    object-fit: contain !important;
    vertical-align: top !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail > .mb-hover-monopoly-label {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: auto !important;
    bottom: auto !important;
    z-index: 15 !important;
    display: block !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    line-height: normal !important;
    pointer-events: none !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail > .mb-hover-state-badges {
    position: absolute !important;
    top: 0 !important;
    right: 0 !important;
    z-index: 25 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: flex-end !important;
    gap: 2px !important;
    box-sizing: border-box !important;
    max-width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    line-height: normal !important;
    pointer-events: none !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail > .mb-hover-state-badges > .mb-hover-special-state {
    display: block !important;
    position: static !important;
    box-sizing: border-box !important;
    width: auto !important;
    min-width: max-content !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 2px 5px !important;
    background-color: #F8C771 !important;
    color: #fff !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    line-height: 1.15 !important;
    text-align: center !important;
    white-space: nowrap !important;
    overflow: visible !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail > .mb-hover-state-badges > .mb-hover-ranking-state {
    display: flex !important;
    position: static !important;
    box-sizing: border-box !important;
    width: auto !important;
    min-width: max-content !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 2px 5px !important;
    background-color: red !important;
    color: #fff !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    line-height: 1.15 !important;
    text-align: center !important;
    white-space: nowrap !important;
    overflow: visible !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail > .mb-hover-state-badges > .mb-hover-rank-badge {
    position: static !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    line-height: normal !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] .item-thumbnail > .mb-hover-privilege-title {
    position: absolute !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    top: auto !important;
    z-index: 18 !important;
    display: block !important;
    box-sizing: border-box !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 4px 6px !important;
    text-align: center !important;
    line-height: 1.25 !important;
    pointer-events: none !important;
  }

  .mb-hover-meta-overlay.mb-hover-meta-overlay-has-top-info {
    padding-top: 30px;
  }

  .mb-hover-meta-overlay.mb-hover-meta-overlay-has-top-info.mb-hover-meta-overlay-has-author-pop {
    padding-top: 56px;
  }

  .mb-hover-meta-overlay > .mb-hover-top-info {
    position: absolute !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
    bottom: auto !important;
    z-index: 1 !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: stretch !important;
    box-sizing: border-box !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    line-height: normal !important;
    overflow: hidden !important;
  }

  .mb-hover-meta-overlay > .mb-hover-top-info,
  .mb-hover-meta-overlay > .mb-hover-top-info * {
    margin-top: 0 !important;
    margin-bottom: 0 !important;
  }

  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-pop-link,
  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-author-pop {
    display: block !important;
    position: static !important;
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: none !important;
    padding: 0 6px !important;
    border: 0 !important;
    text-align: center !important;
    text-decoration: none !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    transform: none !important;
    transition: none !important;
    cursor: pointer !important;
  }

  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-pop-link:hover,
  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-pop-link:focus,
  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-author-pop:hover,
  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-author-pop:focus {
    text-decoration: none !important;
  }

  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-pop-link .item-ttl,
  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-pop-link .pop,
  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-author-pop .item-ttl,
  .mb-hover-meta-overlay > .mb-hover-top-info > .mb-hover-author-pop .pop {
    display: block !important;
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: none !important;
    padding: 0 !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    line-height: 1.35 !important;
    text-align: center !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  .mb-hover-meta-wrap {
    position: relative !important;
  }

  .mb-hover-meta-overlay {
    position: absolute;
    inset: 0;
    z-index: 60;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    overflow: hidden;
    box-sizing: border-box;
    padding: 10px;
    background: rgba(0, 0, 0, 0.68);
    color: #fff;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
    line-height: normal;
  }

  .mb-hover-meta-wrap:hover > .mb-hover-meta-overlay {
    opacity: 1;
    pointer-events: auto;
  }

  .mb-hover-meta-overlay > :not(.mb-hover-top-info) a {
    color: #fff !important;
    text-decoration: none;
  }

  .mb-hover-meta-overlay > :not(.mb-hover-top-info) a:hover {
    text-decoration: underline;
  }

  .mb-hover-meta-overlay > .item-meta {
    display: flex !important;
    flex: 1 1 auto !important;
    flex-direction: column !important;
    align-items: stretch !important;
    justify-content: flex-start !important;
    box-sizing: border-box !important;
    width: 100% !important;
    min-height: 0 !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  .mb-hover-meta-overlay > .item-meta > .mb-hover-product-title-wrap {
    display: block !important;
    flex: 1 0 57px !important;
    box-sizing: border-box !important;
    width: 100% !important;
    min-width: 0 !important;
    min-height: 57px !important;
    height: auto !important;
    max-height: none !important;
    margin: 0 0 8px !important;
    padding: 0 !important;
    overflow: hidden !important;
    white-space: normal !important;
  }

  .mb-hover-meta-overlay > .item-meta > .mb-hover-product-title-wrap > .mb-hover-product-title,
  .mb-hover-meta-overlay > .item-meta > .product_title,
  .mb-hover-meta-overlay > .item-meta > p.item-ttl.product_title {
    display: block !important;
    box-sizing: border-box !important;
    width: 100% !important;
    min-width: 0 !important;
    min-height: 57px !important;
    height: auto !important;
    max-height: none !important;
    margin: 0 !important;
    padding: 0 !important;
    color: #fff !important;
    font-size: 14px !important;
    font-weight: 700 !important;
    line-height: 19px !important;
    white-space: normal !important;
    word-break: break-word !important;
    overflow: visible !important;
    text-overflow: clip !important;
    -webkit-line-clamp: unset !important;
    line-clamp: unset !important;
    -webkit-box-orient: initial !important;
  }

  .mb-hover-meta-overlay > .item-meta > .mb-hover-product-title-wrap > .mb-hover-product-title a,
  .mb-hover-meta-overlay > .item-meta > .product_title a,
  .mb-hover-meta-overlay > .item-meta > p.item-ttl.product_title a {
    display: inline !important;
    width: auto !important;
    min-height: 0 !important;
    height: auto !important;
    max-height: none !important;
    line-height: inherit !important;
    white-space: normal !important;
    word-break: break-word !important;
    overflow: visible !important;
    text-overflow: clip !important;
    -webkit-line-clamp: unset !important;
    line-clamp: unset !important;
    -webkit-box-orient: initial !important;
  }

  .mb-hover-meta-overlay > .item-meta > .ancillary_info {
    display: block !important;
    flex: 0 0 auto !important;
    box-sizing: border-box !important;
    width: 100% !important;
    min-height: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 6px !important;
    overflow: visible !important;
  }

  .mb-hover-meta-overlay .item-ttl:not(.pop),
  .mb-hover-meta-overlay .product_title,
  .mb-hover-meta-overlay p.item-ttl.product_title {
    margin: 0 0 8px;
    color: #fff !important;
    font-size: 14px;
    line-height: 19px;
    font-weight: 700;
  }

  .mb-hover-meta-overlay p,
  .mb-hover-meta-overlay div {
    margin-top: 0;
    margin-bottom: 6px;
  }

  .mb-hover-meta-overlay .item-state-special,
  .mb-hover-meta-overlay .item-state-ranking,
  .mb-hover-meta-overlay .label-monopoly,
  .mb-hover-meta-overlay .privilege_title,
  .mb-hover-meta-overlay .rank {
    display: none !important;
  }

  .mb-hover-meta-overlay .coupling_info {
    display: block !important;
    max-width: 100% !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    line-height: 1.35 !important;
  }

  .mb-hover-meta-overlay .coupling_info a {
    display: inline !important;
    white-space: nowrap !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row {
    display: flex !important;
    flex: 0 0 auto !important;
    align-items: center;
    justify-content: space-between;
    clear: both !important;
    float: none !important;
    gap: 8px;
    box-sizing: border-box;
    width: 100%;
    margin: 4px 0 0;
    padding: 0 2px;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row.mb-hover-action-row-no-price {
    justify-content: stretch !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row .item-price {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
    white-space: nowrap;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row .item-price .mb-hover-discount-price {
    color: inherit;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row .mb-hover-cart-buttons {
    flex: 0 0 auto;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 6px;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row.mb-hover-action-row-no-price .mb-hover-cart-buttons {
    flex: 1 1 100%;
    width: 100%;
    justify-content: stretch;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row a.to_cart,
  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row a.to_request.resale_request {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    min-height: 26px;
    padding: 4px 8px;
    border-radius: 0 !important;
    background: #FFBB41 !important;
    color: #fff !important;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.2;
    text-decoration: none !important;
    white-space: nowrap;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row.mb-hover-action-row-no-price a.to_cart,
  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row.mb-hover-action-row-no-price a.to_request.resale_request {
    flex: 1 1 100%;
    width: 100%;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row a.to_cart.reserve {
    background: #11C3CC !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row a.to_request.resale_request {
    background: #d9534f !important;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row a.to_cart i,
  .item-list li[${PROCESSED_ATTR}="1"] > .mb-hover-action-row a.to_request.resale_request i {
    margin-right: 4px;
  }

  .item-list li[${PROCESSED_ATTR}="1"] > .item-meta {
    display: none !important;
  }
`;

function removeOverlayOnlyElements(metaClone) {
  const firstP = metaClone.querySelector('p[style*="opacity: 0"]');
  if (firstP) firstP.remove();

  metaClone.querySelectorAll(
    'a.open_sample, .item-price, .search-item-detail-btn-list, .item-state-special, .item-state-ranking, .label-monopoly, .privilege_title, .pop_link, .search-item-author-author.pop, .rank'
  ).forEach((node) => {
    node.remove();
  });
}

function markOverlayTitle(metaClone) {
  const productTitle = metaClone.querySelector('.product_title');
  if (!productTitle) return;

  productTitle.classList.add('mb-hover-product-title');

  const titleWrap = productTitle.closest('a');
  if (titleWrap && titleWrap.parentElement === metaClone) {
    titleWrap.classList.add('mb-hover-product-title-wrap');
  }
}

function prepareOverlayMetaClone(metaClone) {
  removeOverlayOnlyElements(metaClone);
  markOverlayTitle(metaClone);
}

function hasVisibleText(node) {
  return Boolean(node && node.textContent.replace(/\s|\u00a0/g, '').length > 0);
}

function getDiscountPriceSpan(price) {
  if (!price) return null;

  const directSpans = Array.from(price.children).filter((child) => {
    return child instanceof HTMLElement && child.tagName.toLowerCase() === 'span';
  });

  if (directSpans.length >= 2 && hasVisibleText(directSpans[1])) {
    return directSpans[1];
  }

  const fallbackSpan = price.querySelector('span:nth-of-type(2)');
  if (fallbackSpan && hasVisibleText(fallbackSpan)) {
    return fallbackSpan;
  }

  return null;
}

function prepareDisplayPrice(price) {
  if (!price) return;

  const discountSpan = getDiscountPriceSpan(price);
  if (!discountSpan) return;

  const computedColor = window.getComputedStyle(discountSpan).color;

  discountSpan.classList.add('mb-hover-discount-price');

  if (computedColor) {
    discountSpan.style.color = computedColor;
  }

  price.textContent = '';
  price.appendChild(discountSpan);
}

function removeItemInfo(item) {
  const itemInfo = item.querySelector(':scope > .item-info');
  if (itemInfo) {
    itemInfo.remove();
  }
}

function movePrivilegeTitle(item, thumbnail) {
  if (!thumbnail) return;

  const privilegeTitle = item.querySelector(':scope > .item-image .privilege_title');
  if (!privilegeTitle) return;

  privilegeTitle.classList.add('mb-hover-privilege-title');
  thumbnail.appendChild(privilegeTitle);
}

function movePopElementsToOverlay(item, overlay) {
  if (!overlay) return;

  const popLink = item.querySelector(':scope > .item-meta > .pop_link');
  const authorPop =
    item.querySelector(':scope > .item-meta > .search-item-author-author.pop') ||
    item.querySelector(':scope > .item-meta .search-item-author-author.pop');

  if (!popLink && !authorPop) return;

  const topInfo = document.createElement('div');
  topInfo.className = 'mb-hover-top-info';

  overlay.classList.add('mb-hover-meta-overlay-has-top-info');

  if (popLink) {
    popLink.classList.add('mb-hover-pop-link');
    topInfo.appendChild(popLink);
  }

  if (authorPop) {
    authorPop.classList.add('mb-hover-author-pop');
    overlay.classList.add('mb-hover-meta-overlay-has-author-pop');
    topInfo.appendChild(authorPop);
  }

  overlay.insertAdjacentElement('afterbegin', topInfo);
}

function moveMonopolyLabel(item, thumbnail) {
  if (!thumbnail) return;

  const monopolyLabel =
    item.querySelector(':scope > .item-image > a > span.label-monopoly') ||
    item.querySelector(':scope > .item-image > a > .item-thumbnail > .label-monopoly') ||
    item.querySelector(':scope > .item-image .label-monopoly');

  if (!monopolyLabel) return;

  monopolyLabel.classList.add('mb-hover-monopoly-label');
  thumbnail.insertAdjacentElement('afterbegin', monopolyLabel);
}

function getOrCreateStateBadgeContainer(thumbnail) {
  let container = thumbnail.querySelector(':scope > .mb-hover-state-badges');

  if (!container) {
    container = document.createElement('div');
    container.className = 'mb-hover-state-badges';
    thumbnail.insertAdjacentElement('afterbegin', container);
  }

  return container;
}

function findRankElement(item) {
  return (
    item.querySelector(':scope > .item-info > .rank') ||
    item.querySelector(':scope > .item-info .rank') ||
    item.querySelector(':scope > .item-image > .rank') ||
    item.querySelector(':scope > .item-image .rank') ||
    item.querySelector(':scope > .item-meta > .rank') ||
    item.querySelector(':scope > .item-meta .rank')
  );
}

function moveImageStateBadges(item, thumbnail) {
  if (!thumbnail) return;

  const badgeContainer = getOrCreateStateBadgeContainer(thumbnail);

  const rankingState = item.querySelector(':scope > .item-info > p.item-state.item-state-ranking');
  if (rankingState) {
    rankingState.classList.add('mb-hover-ranking-state');
    badgeContainer.appendChild(rankingState);
  }

  const specialState = item.querySelector(':scope > .item-info > p.item-state.item-state-special');
  if (specialState) {
    specialState.classList.add('mb-hover-special-state');
    badgeContainer.appendChild(specialState);
  }

  const rank = findRankElement(item);
  if (rank) {
    rank.classList.add('mb-hover-rank-badge');
    badgeContainer.appendChild(rank);
  }

  if (!badgeContainer.children.length) {
    badgeContainer.remove();
  }
}

function buildActionRow(meta) {
  const price = meta.querySelector(':scope > .item-price') || meta.querySelector('.item-price');
  const priceHasText = hasVisibleText(price);

  const actionButtons = Array.from(
    meta.querySelectorAll(
      '.search-item-detail-btn-list a.to_cart, .search-item-detail-btn-list a.to_request.resale_request'
    )
  );

  if (!priceHasText && actionButtons.length === 0) return null;

  const row = document.createElement('div');
  row.className = priceHasText
    ? 'mb-hover-action-row'
    : 'mb-hover-action-row mb-hover-action-row-no-price';

  if (priceHasText) {
    prepareDisplayPrice(price);
    row.appendChild(price);
  }

  if (actionButtons.length > 0) {
    const buttonWrap = document.createElement('div');
    buttonWrap.className = 'mb-hover-cart-buttons';

    actionButtons.forEach((button) => {
      buttonWrap.appendChild(button);
    });

    row.appendChild(buttonWrap);
  }

  return row;
}

function enhanceItem(item) {
  if (!(item instanceof HTMLElement)) return;
  if (item.getAttribute(PROCESSED_ATTR) === '1') return;

  const itemImage = item.querySelector(':scope > .item-image');
  const thumbnail = item.querySelector('.item-thumbnail');
  const meta = item.querySelector(':scope > .item-meta');

  if (!itemImage || !thumbnail || !meta) return;

  itemImage.classList.add('mb-hover-meta-wrap');

  moveMonopolyLabel(item, thumbnail);
  moveImageStateBadges(item, thumbnail);
  removeItemInfo(item);
  movePrivilegeTitle(item, thumbnail);

  const overlay = document.createElement('div');
  overlay.className = 'mb-hover-meta-overlay';

  movePopElementsToOverlay(item, overlay);

  const metaClone = meta.cloneNode(true);
  prepareOverlayMetaClone(metaClone);

  overlay.appendChild(metaClone);
  itemImage.appendChild(overlay);

  const actionRow = buildActionRow(meta);

  if (actionRow) {
    itemImage.insertAdjacentElement('afterend', actionRow);
  }

  item.setAttribute(PROCESSED_ATTR, '1');
}

function collectItemsFromNode(node, items) {
  if (!(node instanceof HTMLElement)) return;

  if (node.matches?.('.item-list li')) {
    items.add(node);
  }

  const closestItem = node.closest?.('.item-list li');
  if (closestItem) {
    items.add(closestItem);
  }

  node.querySelectorAll?.('.item-list li').forEach((item) => {
    items.add(item);
  });
}

export const ListingHoverModule = {
  id: 'listing-hover',
  name: 'Listing Hover',
  lifecycle: 'dom-ready',

  matches(context) {
    return context.isMelonbooks;
  },

  init() {
    injectStyle('listing-hover', LISTING_HOVER_CSS);

    const pendingItems = new Set();
    let queueScheduled = false;

    function flushEnhanceQueue() {
      queueScheduled = false;
      const items = Array.from(pendingItems);
      pendingItems.clear();
      items.forEach(enhanceItem);
    }

    function queueEnhanceItem(item) {
      if (!(item instanceof HTMLElement)) return;
      pendingItems.add(item);
      if (queueScheduled) return;
      queueScheduled = true;
      requestAnimationFrame(flushEnhanceQueue);
    }

    function queueEnhanceFromNode(node) {
      if (!(node instanceof HTMLElement)) return;
      const items = new Set();
      collectItemsFromNode(node, items);
      items.forEach(queueEnhanceItem);
    }

    function enhanceAll(root = document) {
      const items = new Set();
      if (root instanceof Document) {
        root.querySelectorAll('.item-list li').forEach((item) => {
          items.add(item);
        });
      } else {
        collectItemsFromNode(root, items);
      }
      items.forEach(enhanceItem);
    }

    enhanceAll();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.target instanceof HTMLElement) {
          queueEnhanceFromNode(mutation.target);
        }
        for (const node of mutation.addedNodes) {
          queueEnhanceFromNode(node);
        }
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });

    RETRY_DELAYS_MS.forEach((delay) => {
      setTimeout(() => {
        enhanceAll();
      }, delay);
    });
  }
};
