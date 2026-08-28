# Changelog

All notable changes to **Melonbooks Enhanced** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-28

### Consolidated Release
- Successfully merged 15 standalone userscripts (representing 14 distinct feature areas) into a unified master userscript bundled with `esbuild`.
- Introduced modular architecture with shared `src/core/` (lifecycle, routing, error isolation, DOM utilities, styles, and storage).
- Complete preservation of legacy script baselines in `legacy/standalone/` verified by SHA-256 integrity tests.

### Features
- **Force Detail Thumbnails** (`force-detail-thumbnails.js`): Unhides and expands product sample images on product detail pages.
- **Cart Duplicate Warning** (`cart-duplicate-warning.js`): Displays clear warning headers and item highlighting when viewing items already in cart or clipboard.
- **English Heading Translator** (`heading-translator.js`): Reconciled English translation dictionary across all Melonbooks page headings.
- **Product Info Layout** (`product-info-layout.js`): Repositions product specifications below cart actions and supports tag expansion.
- **Search Columns Adjuster** (`search-columns.js`): Dynamic column count (2–12) and padding controls for catalog searches.
- **Force Listing Images** (`force-listing-images.js`): Eager lazy-load thumbnail resolution on search results and product listings.
- **Listing Hover & Badges** (`listing-hover.js`): Floating hover metadata cards and clean top-left age badge repositioning.
- **Orders Grid & Infinite Scroll** (`orders-grid-infinite-scroll.js`): Full-width order history view, customizable columns/spacing, default 1-year filter, and infinite scrolling.
- **Favorite Circle Toggle** (`favorite-circle-toggle.js`): In-place add/remove circle favorite buttons with status feedback.
- **Favorite Author Toggle** (`favorite-author-toggle.js`): In-place add/remove author favorite buttons with status feedback.
- **Wishlist Toggle** (`wishlist-toggle.js`): In-place add/remove wishlist items with bookmark state management.
- **Favorite Authors Infinite Scroll** (`favorite-authors-infinite-scroll.js`): Automatically loads and formats all favorite author pages.
- **Wishlist Infinite Scroll** (`wishlist-infinite-scroll.js`): Seamless infinite scrolling on wishlist pages with action re-binding and float clear fixes.
- **VPN Link Handler** (`vpn-link-handler.js`): Outlook Web Safe Link unwrapping, `GM_openInTab` tab launcher, and Melonbooks VPN retry handler.

### Build & Quality
- Added build system `tools/build.mjs` with `--check` verification for CI.
- Added comprehensive unit test suite in `test/`.
- Added GitHub Actions workflow `.github/workflows/build.yml`.
- Added complete architectural and testing documentation in `docs/`.

---

## [0.1.0] – [0.15.0] - 2026-08-28

### Incremental Migration Milestones
- `0.1.0`: Project scaffold, build pipeline, and core utilities.
- `0.2.0`: Migrated Force Detail Thumbnails.
- `0.3.0`: Migrated Cart Duplicate Warning.
- `0.4.0`: Migrated English Heading Translator.
- `0.5.0`: Migrated Product Info Layout.
- `0.6.0`: Migrated Search Columns Adjuster.
- `0.7.0`: Migrated Force Listing Images.
- `0.8.0`: Migrated Listing Hover.
- `0.9.0`: Migrated Orders Grid & Infinite Scroll.
- `0.10.0`: Migrated Favorite Circle Toggle.
- `0.11.0`: Migrated Favorite Author Toggle.
- `0.12.0`: Migrated Wishlist Toggle.
- `0.13.0`: Migrated Favorite Authors Infinite Scroll.
- `0.14.0`: Migrated Wishlist Infinite Scroll.
- `0.15.0`: Migrated VPN Link Handler.
