# Testing & Quality Assurance Guide

This document describes the automated testing suite, manual test procedures, and verification protocols for **Melonbooks Enhanced**.

---

## 1. Automated Test Suite

Automated unit tests use Node.js's native test runner (`node --test`).

### Running Tests
```bash
npm test
```

### Test Coverage
- **`test/metadata.test.mjs`**: Validates metadata formatting, SemVer compatibility, and userscript grant/match definitions.
- **`test/manifest.test.mjs`**: Validates exact SHA-256 hashes of all 15 preserved legacy userscript files.
- **`test/routing.test.mjs`**: Validates URL classification logic across Melonbooks routes, Outlook Web endpoints, and external URLs.
- **`test/heading-translator.test.mjs`**: Validates translation dictionary integrity, whitespace normalization, and translation logic.

---

## 2. Build Verification (`npm run check`)

The build verification script (`tools/build.mjs --check`) ensures that the distributed userscript bundle in `dist/Melonbooks - Enhancements.user.js` is fully compiled, matches the declared version in `src/script-info.js`, and has no uncommitted build diffs.

---

## 3. Manual Verification Checklist

| Area / Page | Verification Steps | Expected Result |
|---|---|---|
| **Product Detail** (`/detail/*`) | 1. Open any product page with sample images.<br>2. Observe thumbnail strip below main preview.<br>3. Check position of product info table.<br>4. Test click on circle favorite button.<br>5. Test click on author favorite button.<br>6. Test click on wishlist bookmark button. | 1. Thumbnails are visible and enlarged.<br>2. Product info table appears below cart action box.<br>3. Circle & author favorites toggle in-place with status toast.<br>4. Wishlist bookmark toggles between added/removed without page reload. |
| **Search Catalog** (`/search/*`) | 1. Open search results page.<br>2. Click columns settings gear/panel.<br>3. Adjust columns slider (e.g. from 5 to 8).<br>4. Refresh page.<br>5. Hover over product cards. | 1. Grid columns dynamically resize.<br>2. Setting persists across refresh in `localStorage`.<br>3. Hover card displays metadata and age badges are pinned top-left. |
| **Order History** (`/mypage/history.php`) | 1. Open order history page.<br>2. Observe initial order date filter.<br>3. Adjust products per row and spacing buttons.<br>4. Scroll down to bottom of page. | 1. Automatically applies 1-year filter.<br>2. Products grid adapts per row spacing and persists.<br>3. Subsequent order pages load automatically without pagination click. |
| **Favorite Authors** (`/mypage/favorite_author.php`) | 1. Open favorite authors list.<br>2. Observe action buttons.<br>3. Scroll down or wait for automatic pagination. | 1. Actions appear aligned beside author names.<br>2. Status indicator shows progress and loads all pages. |
| **Wishlist** (`/mypage/favorite.php`) | 1. Open wishlist page.<br>2. Scroll down. | 1. Continuous product grid flow without line breaks.<br>2. Subsequent pages load seamlessly. |
