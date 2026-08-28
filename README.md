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
| **VPN Link Handler** | Cleans Melonbooks product links in Outlook Web, unwraps Microsoft Safe Links, opens them in a dedicated tab via `GM_openInTab`, and retries on Melonbooks to prevent 404 errors. | Outlook Web / Melonbooks |

---

## Installation

1. Install a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/) in your browser.
2. **[Click here to install Melonbooks - Enhancements](https://raw.githubusercontent.com/Netoxique/Melonbooks-Enhanced/main/dist/Melonbooks%20-%20Enhancements.user.js)**.

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
