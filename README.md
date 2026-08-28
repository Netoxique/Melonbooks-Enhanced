# Melonbooks Enhanced

A unified, modular, high-performance userscript that consolidates standalone enhancements for browsing, searching, ordering, and managing products on [Melonbooks](https://www.melonbooks.co.jp).

---

## Features

| Feature / Module | Description | Scope |
|---|---|---|
| **Force Detail Thumbnails** | Unhides product sample thumbnail strips on product detail pages. | `/detail/*` |
| **Cart Duplicate Warning** | Displays a warning banner and highlights items already in your cart or clipboard. | `/detail/*` |
| **English Heading Translator** | Automatically translates Japanese section titles and headings across Melonbooks to English with reconciled terminology. | All Melonbooks pages |
| **Product Info Layout** | Repositions product metadata tables below the cart action buttons and handles tag list expansion. | `/detail/*` |
| **Search Columns Adjuster** | Customizes the search results product grid column count (2–12) and side padding with an in-page settings panel. | `/search/*` |
| **Force Listing Images** | Eagerly resolves and swaps lazy-loaded thumbnails across search and catalog listings. | Catalog / Search listings |
| **Listing Hover & Badges** | Repositions age badges to the top-left and displays an overlay panel on hover containing titles, circles, authors, descriptions, and price tags. | Catalog / Search listings |
| **Orders Grid & Infinite Scroll** | Expands order history to full width, provides column count (2–12) and spacing controls, defaults search range to 1 year, and seamlessly loads all order pages via infinite scroll. | `/mypage/history.php` |
| **Favorite Circle Toggle** | Enables in-place addition or removal of circle favorites with live status indicators without leaving the product page. | `/detail/*` |
| **Favorite Author Toggle** | Enables in-place addition or removal of author favorites with live status indicators without leaving the product page. | `/detail/*` |
| **Wishlist Toggle** | Enables in-place addition or removal of products to/from your wishlist directly from the product detail page. | `/detail/*` |
| **Favorite Authors Infinite Scroll** | Automatically loads all remaining pages of favorite authors and aligns favorite/mail controls beside each author name. | `/mypage/favorite_author.php` |
| **Wishlist Infinite Scroll** | Seamlessly loads subsequent wishlist pages as you scroll, re-binding action handlers and fixing row-clearing layout artifacts. | `/mypage/favorite.php` |
| **VPN Link Handler** | Cleans Melonbooks product links in Outlook Web, unwraps Microsoft Safe Links, opens them in a dedicated tab via `GM_openInTab`, and transparently retries on Melonbooks to prevent 404 errors during VPN initialization. | Outlook Web / Melonbooks |

---

## Installation

1. Install a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. Install the compiled master script:
   - File: `dist/Melonbooks - Enhancements.user.js`
3. If you have any older standalone Melonbooks userscripts installed, disable or uninstall them to prevent duplicate execution.

---

## Development & Build

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm

### Setup
```bash
npm install
```

### Build Scripts
- **Build**: Compiles `src/main.js` and all modules into `dist/Melonbooks - Enhancements.user.js` with metadata header:
  ```bash
  npm run build
  ```
- **Check (CI)**: Verifies that the committed `dist/` file matches a clean build:
  ```bash
  npm run check
  ```
- **Watch**: Rebuilds automatically on changes to `src/` or `tools/`:
  ```bash
  npm run watch
  ```
- **Test**: Runs the automated test suite with Node's native test runner:
  ```bash
  npm test
  ```

---

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── build.yml               # GitHub Actions CI verification
├── dist/
│   └── Melonbooks - Enhancements.user.js  # Compiled master userscript bundle
├── docs/
│   ├── ARCHITECTURE.md             # Runtime architecture and design principles
│   ├── FEATURE_MATRIX.md           # Migration feature parity matrix
│   ├── IMPORT_MANIFEST.md          # Baseline SHA-256 hashes of original 15 scripts
│   ├── IMPORT_NOTES.md             # Extraction and reconciliation documentation
│   ├── MIGRATION_STATUS.md         # Step-by-step migration tracking
│   └── TESTING.md                  # Test plan and validation guide
├── legacy/
│   └── standalone/                 # Exact unmodified legacy userscript files
├── src/
│   ├── core/
│   │   ├── dom.js                  # DOM query and mutation utilities
│   │   ├── errors.js               # Logger and error boundaries
│   │   ├── lifecycle.js            # Timing and execution schedulers
│   │   ├── routing.js              # URL/domain classification
│   │   ├── storage.js              # Persistent settings manager
│   │   └── styles.js               # Dynamic stylesheet injector
│   ├── modules/                    # 14 distinct feature modules
│   │   ├── cart-duplicate-warning.js
│   │   ├── favorite-author-toggle.js
│   │   ├── favorite-authors-infinite-scroll.js
│   │   ├── favorite-circle-toggle.js
│   │   ├── force-detail-thumbnails.js
│   │   ├── force-listing-images.js
│   │   ├── heading-translator.js
│   │   ├── listing-hover.js
│   │   ├── orders-grid-infinite-scroll.js
│   │   ├── product-info-layout.js
│   │   ├── search-columns.js
│   │   ├── vpn-link-handler.js
│   │   ├── wishlist-infinite-scroll.js
│   │   └── wishlist-toggle.js
│   ├── main.js                     # Master bootstrap and module dispatcher
│   └── script-info.js              # Metadata declaration
├── test/                           # Automated test suite
│   ├── heading-translator.test.mjs
│   ├── manifest.test.mjs
│   ├── metadata.test.mjs
│   └── routing.test.mjs
├── tools/
│   └── build.mjs                   # esbuild bundler and verification tool
├── package.json
└── README.md
```

---

## Configuration & Storage Keys

The script retains full backwards compatibility with all existing storage keys used by the standalone scripts:

| Key | Storage | Default | Purpose |
|---|---|---|---|
| `mb_column_adjuster_column_count` | `localStorage` | `12` | Search results column count |
| `mb_column_adjuster_side_padding` | `localStorage` | `'16px'` | Search results page side padding |
| `melonbooksOrdersColumnCount` | `localStorage` | `5` | Order history products per row |
| `melonbooksOrdersProductSpacingPx` | `localStorage` | `0` | Order history spacing between items |
| `melonbooksOrdersDefaultPeriodApplied:<path>` | `sessionStorage` | `'3'` | Records 1-year filter auto-apply per session |

---

## License

This project is licensed under the [MIT License](LICENSE).
