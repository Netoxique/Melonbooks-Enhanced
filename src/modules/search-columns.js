import { injectStyle } from '../core/styles.js';
import { escapeHtml } from '../core/dom.js';

/**
 * Module: Search Columns
 * Expand Melonbooks search results, set custom column count, and edit layout values from the page.
 */

const STORAGE_KEYS = {
  columnCount: 'mb_column_adjuster_column_count',
  sidePadding: 'mb_column_adjuster_side_padding'
};

const DEFAULTS = {
  columnCount: 12,
  sidePadding: '16px',
  maxThumbWidth: '180px'
};

const PANEL_ID = 'mb-column-adjuster-panel';
const BUTTON_ID = 'mb-column-adjuster-button';

const UI_CSS = `
  #${BUTTON_ID} {
      position: fixed !important;
      left: 16px !important;
      bottom: 16px !important;
      z-index: 2147483647 !important;
      border: 1px solid #999 !important;
      border-radius: 9999px !important;
      padding: 10px 14px !important;
      font-size: 14px !important;
      line-height: 1 !important;
      cursor: pointer !important;
      background: #fff !important;
      color: #222 !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
  }

  #${BUTTON_ID}:hover {
      filter: brightness(0.97) !important;
  }

  #${PANEL_ID} {
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483647 !important;
  }

  #mb-column-adjuster-backdrop {
      position: absolute !important;
      inset: 0 !important;
      background: rgba(0, 0, 0, 0.35) !important;
  }

  #mb-column-adjuster-dialog {
      position: absolute !important;
      left: 16px !important;
      bottom: 64px !important;
      width: 320px !important;
      max-width: calc(100vw - 32px) !important;
      background: #fff !important;
      color: #222 !important;
      border: 1px solid #bbb !important;
      border-radius: 12px !important;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25) !important;
      padding: 14px !important;
      font-size: 14px !important;
      box-sizing: border-box !important;
  }

  #mb-column-adjuster-header {
      display: flex !important;
      align-items: center !important;
      justify-content: space-between !important;
      gap: 8px !important;
      margin-bottom: 12px !important;
  }

  #mb-column-adjuster-close {
      border: 1px solid #bbb !important;
      background: #fff !important;
      color: #222 !important;
      border-radius: 8px !important;
      width: 32px !important;
      height: 32px !important;
      cursor: pointer !important;
      font-size: 20px !important;
      line-height: 1 !important;
  }

  .mb-column-adjuster-field {
      display: block !important;
      margin-bottom: 12px !important;
  }

  .mb-column-adjuster-field > span {
      display: block !important;
      margin-bottom: 6px !important;
      font-weight: 600 !important;
  }

  .mb-column-adjuster-field > input {
      width: 100% !important;
      box-sizing: border-box !important;
      border: 1px solid #bbb !important;
      border-radius: 8px !important;
      padding: 8px 10px !important;
      font-size: 14px !important;
      background: #fff !important;
      color: #222 !important;
  }

  #mb-column-adjuster-help {
      font-size: 12px !important;
      color: #555 !important;
      margin-bottom: 12px !important;
  }

  #mb-column-adjuster-help code {
      background: #f3f3f3 !important;
      padding: 1px 4px !important;
      border-radius: 4px !important;
  }

  #mb-column-adjuster-actions {
      display: flex !important;
      justify-content: flex-end !important;
      gap: 8px !important;
  }

  #mb-column-adjuster-actions > button {
      border: 1px solid #bbb !important;
      background: #fff !important;
      color: #222 !important;
      border-radius: 8px !important;
      padding: 8px 12px !important;
      cursor: pointer !important;
      font-size: 14px !important;
  }
`;

function getSavedColumnCount() {
  const raw = localStorage.getItem(STORAGE_KEYS.columnCount);
  const parsed = Number.parseInt(raw || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULTS.columnCount;
}

function getSavedSidePadding() {
  const raw = (localStorage.getItem(STORAGE_KEYS.sidePadding) || '').trim();
  return raw || DEFAULTS.sidePadding;
}

function buildCss(columnCount, sidePadding) {
  return `
    /* Remove page-width caps from the outer wrappers */
    html, body,
    #container,
    .container_otherpage,
    .utBReFvXjp-wrap,
    .utBReFvXjp-wrap_otherpage,
    .utBReFvXjp-column-main,
    #contents,
    .search-page,
    .item-list {
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
        margin-left: 0 !important;
        margin-right: 0 !important;
    }

    /* Break centered layout padding */
    #container,
    .container_otherpage,
    .utBReFvXjp-wrap,
    .utBReFvXjp-wrap_otherpage {
        padding-left: 0 !important;
        padding-right: 0 !important;
        box-sizing: border-box !important;
    }

    /* Hide sidebar */
    .utBReFvXjp-column-navi {
        display: none !important;
        width: 0 !important;
        max-width: 0 !important;
        flex: 0 0 0 !important;
    }

    /* Add side breathing room */
    .utBReFvXjp-column-main,
    #contents,
    .search-page,
    .item-list {
        box-sizing: border-box !important;
        padding-left: ${sidePadding} !important;
        padding-right: ${sidePadding} !important;
    }

    /* Grid layout */
    .item-list > ul {
        display: grid !important;
        grid-template-columns: repeat(${columnCount}, minmax(0, 1fr)) !important;
        width: 100% !important;
        max-width: none !important;
        padding: 0 !important;
        margin: 0 !important;
        justify-items: center !important;
    }

    .item-list > ul > li {
        width: 100% !important;
        max-width: none !important;
        min-width: 0 !important;
        margin: 0 !important;
        box-sizing: border-box !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
    }

    .item-list > ul > li.item-list__placeholder {
        display: none !important;
    }

    /* Prevent thumbnail stretching */
    .item-list .item-image,
    .item-list .item-thumbnail {
        width: 100% !important;
        max-width: ${DEFAULTS.maxThumbWidth} !important;
        margin-left: auto !important;
        margin-right: auto !important;
    }

    .item-list .item-thumbnail img,
    .item-list .item-image img {
        width: 100% !important;
        height: auto !important;
        max-width: ${DEFAULTS.maxThumbWidth} !important;
        object-fit: contain !important;
    }

    .item-list .item-meta {
        width: 100% !important;
        max-width: ${DEFAULTS.maxThumbWidth} !important;
    }
  `;
}

function applyDynamicStyle() {
  const columnCount = getSavedColumnCount();
  const sidePadding = getSavedSidePadding();
  const css = buildCss(columnCount, sidePadding);
  injectStyle('search-columns-dynamic', css);
}

function closePanel() {
  const panel = document.getElementById(PANEL_ID);
  if (panel) panel.remove();
}

function openPanel() {
  closePanel();

  const currentColumns = getSavedColumnCount();
  const currentPadding = getSavedSidePadding();

  const panel = document.createElement('div');
  panel.id = PANEL_ID;
  panel.innerHTML = `
      <div id="mb-column-adjuster-backdrop"></div>
      <div id="mb-column-adjuster-dialog" role="dialog" aria-modal="true" aria-label="Melonbooks layout settings">
          <div id="mb-column-adjuster-header">
              <strong>Melonbooks Layout</strong>
              <button type="button" id="mb-column-adjuster-close" aria-label="Close">×</button>
          </div>

          <label class="mb-column-adjuster-field">
              <span>Column count</span>
              <input id="mb-column-adjuster-columns" type="number" min="1" step="1" value="${escapeHtml(currentColumns)}">
          </label>

          <label class="mb-column-adjuster-field">
              <span>Side padding</span>
              <input id="mb-column-adjuster-padding" type="text" value="${escapeHtml(currentPadding)}" placeholder="16px">
          </label>

          <div id="mb-column-adjuster-help">
              Side padding accepts CSS units like <code>16px</code>, <code>1rem</code>, or <code>2vw</code>.
          </div>

          <div id="mb-column-adjuster-actions">
              <button type="button" id="mb-column-adjuster-reset">Reset</button>
              <button type="button" id="mb-column-adjuster-save">Save</button>
          </div>
      </div>
  `;

  document.body.appendChild(panel);

  const backdrop = panel.querySelector('#mb-column-adjuster-backdrop');
  const closeBtn = panel.querySelector('#mb-column-adjuster-close');
  const saveBtn = panel.querySelector('#mb-column-adjuster-save');
  const resetBtn = panel.querySelector('#mb-column-adjuster-reset');
  const columnsInput = panel.querySelector('#mb-column-adjuster-columns');
  const paddingInput = panel.querySelector('#mb-column-adjuster-padding');

  function saveSettings() {
    const parsedColumns = Number.parseInt(columnsInput.value, 10);
    const safeColumns = Number.isFinite(parsedColumns) && parsedColumns > 0
      ? parsedColumns
      : DEFAULTS.columnCount;

    const safePadding = paddingInput.value.trim() || DEFAULTS.sidePadding;

    localStorage.setItem(STORAGE_KEYS.columnCount, String(safeColumns));
    localStorage.setItem(STORAGE_KEYS.sidePadding, safePadding);

    applyDynamicStyle();
    closePanel();
  }

  function resetSettings() {
    localStorage.removeItem(STORAGE_KEYS.columnCount);
    localStorage.removeItem(STORAGE_KEYS.sidePadding);

    applyDynamicStyle();
    closePanel();
  }

  backdrop.addEventListener('click', closePanel);
  closeBtn.addEventListener('click', closePanel);
  saveBtn.addEventListener('click', saveSettings);
  resetBtn.addEventListener('click', resetSettings);

  panel.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closePanel();
    }
  });

  columnsInput.focus();
  columnsInput.select();
}

function addControlButton() {
  if (document.getElementById(BUTTON_ID)) return;

  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.textContent = 'Layout';
  button.addEventListener('click', openPanel);
  document.body.appendChild(button);
}

export const SearchColumnsModule = {
  id: 'search-columns',
  name: 'Search Columns',
  lifecycle: 'dom-ready',

  matches(context) {
    return context.route === 'melonbooks-search' || context.location.pathname.startsWith('/search/') || context.location.pathname.includes('search.php');
  },

  init() {
    injectStyle('search-columns-ui', UI_CSS);

    const hasResults = () => !!document.querySelector('.item-list > ul, .item-list');

    if (hasResults()) {
      applyDynamicStyle();
      addControlButton();
    } else {
      const observer = new MutationObserver(() => {
        if (hasResults()) {
          observer.disconnect();
          applyDynamicStyle();
          addControlButton();
        }
      });
      observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
    }
  }
};
