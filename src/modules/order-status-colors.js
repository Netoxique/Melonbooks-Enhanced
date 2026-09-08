import { injectStyle } from '../core/styles.js';

/**
 * Module: Order Status Colors
 * Color-code the order status row on Melonbooks MY Orders pages.
 */

const STATUS_TONES = new Map([
  ['ご予約', 'reserved'],
  ['出荷準備を開始しました', 'preparing'],
  ['発送が完了しました', 'shipped'],
  ['受取済み', 'received']
]);

const STATUS_CSS = `
  tr[data-mb-order-status-tone] > th,
  tr[data-mb-order-status-tone] > td.status {
    font-weight: 700 !important;
  }

  tr[data-mb-order-status-tone] > td.status * {
    color: inherit !important;
    font-weight: inherit !important;
  }

  tr[data-mb-order-status-tone="reserved"] > th,
  tr[data-mb-order-status-tone="reserved"] > td.status {
    background-color: #ff9800 !important;
    color: #000000 !important;
  }

  tr[data-mb-order-status-tone="preparing"] > th,
  tr[data-mb-order-status-tone="preparing"] > td.status {
    background-color: #ffeb3b !important;
    color: #000000 !important;
  }

  tr[data-mb-order-status-tone="shipped"] > th,
  tr[data-mb-order-status-tone="shipped"] > td.status {
    background-color: #2196f3 !important;
    color: #ffffff !important;
  }

  tr[data-mb-order-status-tone="received"] > th,
  tr[data-mb-order-status-tone="received"] > td.status {
    background-color: #4caf50 !important;
    color: #000000 !important;
  }

  tr[data-mb-order-status-tone="other"] > th,
  tr[data-mb-order-status-tone="other"] > td.status {
    background-color: #f44336 !important;
    color: #ffffff !important;
  }
`;

export function normalizeOrderStatusText(text) {
  return String(text ?? '').replace(/\s+/g, '').trim();
}

export function getOrderStatusTone(text) {
  const status = normalizeOrderStatusText(text);
  if (!status) return null;
  return STATUS_TONES.get(status) || 'other';
}

function processStatusRow(row) {
  if (!row?.matches?.('tr')) return;

  const heading = row.querySelector(':scope > th');
  const statusCell = row.querySelector(':scope > td.status');

  if (!heading || !statusCell) return;
  if (normalizeOrderStatusText(heading.textContent) !== '注文状況') return;

  const tone = getOrderStatusTone(statusCell.textContent);
  if (!tone) {
    delete row.dataset.mbOrderStatusTone;
    return;
  }

  row.dataset.mbOrderStatusTone = tone;
}

function processStatuses(root = document) {
  if (root?.matches?.('tr')) {
    processStatusRow(root);
  }

  root?.querySelectorAll?.('tr').forEach(processStatusRow);
}

export const OrderStatusColorsModule = {
  id: 'order-status-colors',
  name: 'Order Status Colors',
  lifecycle: 'document-start',

  matches(context) {
    return context.route === 'melonbooks-orders' || context.location.pathname.includes('history.php');
  },

  init() {
    injectStyle('order-status-colors', STATUS_CSS);
    processStatuses();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const targetRow = mutation.target?.parentElement?.closest?.('tr')
          || mutation.target?.closest?.('tr');
        if (targetRow) processStatusRow(targetRow);

        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            processStatuses(node);
          }
        }
      }
    });

    observer.observe(document, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }
};
