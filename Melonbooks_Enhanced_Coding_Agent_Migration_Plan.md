# Melonbooks Enhanced
## Master Userscript Repository and Migration Plan for Coding Agent

> This document supersedes the earlier migration plan.
>
> Repository root:
>
> ```text
> C:\Users\Netoxic\PycharmProjects\Melonbooks Enhanced
> ```
>
> Source material reviewed for this plan:
>
> ```text
> tampermonkey_scripts.zip
> ```
>
> The reviewed archive contains 15 `.user.js` files plus matching Tampermonkey `.options.json` and `.storage.json` files. The 15 userscript files represent 14 distinct features because the English Heading Translator is present twice at version `1.0.4` with small source differences.

---

# 1. Goal

Create a maintainable GitHub repository that builds all current Melonbooks enhancements into one installable userscript:

```text
dist\Melonbooks - Enhancements.user.js
```

Users should eventually install only:

```text
Melonbooks - Enhancements
```

The source must remain modular. Each existing standalone feature should live in its own module or a clearly justified shared component.

The architecture should be:

```text
one installed userscript
        +
many independently maintained modules
        +
a small shared core
        +
one reproducible build process
        +
one versioned release
```

Do not create a single giant hand-maintained JavaScript file.

---

# 2. Repository Location

The Git repository and working project must be located at:

```text
C:\Users\Netoxic\PycharmProjects\Melonbooks Enhanced
```

Define this conceptually as:

```text
REPO_ROOT=C:\Users\Netoxic\PycharmProjects\Melonbooks Enhanced
```

All project-relative paths in this document are relative to `REPO_ROOT`.

Do not use the previously proposed path:

```text
E:\Netoxique\Downloads\Melonbooks userscripts
```

as the repository root.

If that old directory still exists, treat it only as an optional backup/source location. Never move or rewrite its files as part of repository setup.

---

# 3. Input Archive Handling

The source archive supplied for this migration is:

```text
tampermonkey_scripts.zip
```

The coding agent should place or copy the archive into a local import-only directory if it is available on the machine:

```text
C:\Users\Netoxic\PycharmProjects\Melonbooks Enhanced\_import\tampermonkey_scripts.zip
```

Recommended layout:

```text
Melonbooks Enhanced\
├─ _import\
│  └─ tampermonkey_scripts.zip
└─ ...
```

`_import\` is local source material and should normally be ignored by Git.

Do not depend on the ZIP being present after migration. The repository must contain preserved copies of the actual standalone `.user.js` sources under `legacy\standalone\`.

The Tampermonkey `.options.json` and `.storage.json` files are useful for migration analysis, but they are not runtime source code and do not need to be part of the published repository unless a specific reason is found.

---

# 4. What Was Found in the Supplied ZIP

The archive contains:

```text
15 userscript files
15 Tampermonkey options files
15 Tampermonkey storage files
45 total files
```

All 15 Tampermonkey exports are marked enabled.

The `.storage.json` files contain empty Tampermonkey storage data. They do not contain feature configuration that needs to be imported.

Two scripts use Melonbooks page `localStorage` directly and their keys must be preserved or migrated carefully:

```text
Melonbooks - Expand Search Columns
Melonbooks - My Orders Product Grid & Infinite Scroll
```

The English Heading Translator appears twice with the same userscript name and version. These are not byte-identical copies.

---

# 5. Concrete Source Inventory

The following inventory was derived directly from the supplied ZIP.

| # | Standalone script | Version | Run-at | Grants | Primary scope | Proposed module |
|---|---|---:|---|---|---|---|
| 1 | Melonbooks - Expand Search Columns | 1.7.2 | default/idle | `GM_addStyle` | Search pages | `search-columns.js` |
| 2 | Melonbooks - Move product info below cart buttons | 1.3.1 | document-idle | none | Product detail pages | `product-info-layout.js` |
| 3 | MelonBooks - Cart Duplicate Warning | 1.0.3 | document-idle | none | Clipboard/cart | `cart-duplicate-warning.js` |
| 4 | Melonbooks - Force Load Listing Images | 1.0.2 | document-start | none | Listings across multiple page families | `force-listing-images.js` |
| 5 | Melonbooks - Force Loads Details Page Thumbnails | 1.0.1 | document-end | none | Product detail pages | `force-detail-thumbnails.js` |
| 6 | Melonbooks - My Orders Product Grid & Infinite Scroll | 1.2.2 | document-start | `GM_addStyle` | Order history | `orders-grid-infinite-scroll.js` |
| 7 | Melonbooks - Product Page Circle Favorite Remover | 1.0.2 | document-start | none | Product detail pages | `favorite-circle-toggle.js` |
| 8 | Melonbooks - Product Page Favorite Author Remover | 1.0.3 | document-start | none | Product detail pages | `favorite-author-toggle.js` |
| 9 | Melonbooks - Listing hover | 1.3.13 | document-idle | none | Most Melonbooks pages | `listing-hover.js` |
| 10 | Melonbooks - English Heading Translator | 1.0.4 | document-start | none | Most Melonbooks pages | `heading-translator.js` candidate |
| 11 | Melonbooks - English Heading Translator (1) | 1.0.4 | document-start | none | Most Melonbooks pages | duplicate candidate, reconcile first |
| 12 | Open Melonbooks links via VPN tab | 2.0.3 | document-start | `GM_openInTab` | Outlook and Melonbooks | `vpn-link-handler.js` |
| 13 | Melonbooks - Favorite Authors Infinite Scroll | 1.0.1 | document-idle | none | Favorite authors page | `favorite-authors-infinite-scroll.js` |
| 14 | Melonbooks - Wishlist Toggle | 1.0.2 | document-end | none | Product detail page | `wishlist-toggle.js` |
| 15 | Melonbooks - Wishlist Infinite Scroll | 1.0.1 | document-idle | none | Wishlist page | `wishlist-infinite-scroll.js` |

The module names are recommendations. Change them only when there is a clear architectural reason.

---

# 6. Source Integrity Manifest

Before moving or modifying any standalone script, calculate a full SHA-256 hash for each source and save it to:

```text
docs\IMPORT_MANIFEST.md
```

The supplied archive produced the following SHA-256 prefixes during analysis:

| File | Version | SHA-256 prefix |
|---|---:|---|
| Melonbooks - Expand Search Columns.user.js | 1.7.2 | `6c572cd69149bcb1` |
| Melonbooks - Move product info below cart buttons.user.js | 1.3.1 | `8148c9486883676f` |
| MelonBooks - Cart Duplicate Warning.user.js | 1.0.3 | `1c39a1c012a090fc` |
| Melonbooks - Force Load Listing Images.user.js | 1.0.2 | `faa04065169f7a24` |
| Melonbooks - Force Loads Details Page Thumbnails.user.js | 1.0.1 | `49c3e472de7d7fa1` |
| Melonbooks - My Orders Product Grid & Infinite Scroll.user.js | 1.2.2 | `f2ee00f3ed71abb6` |
| Melonbooks - Product Page Circle Favorite Remover.user.js | 1.0.2 | `b431dd8bd2fa7306` |
| Melonbooks - Product Page Favorite Author Remover.user.js | 1.0.3 | `fc92f25f49f0d713` |
| Melonbooks - Listing hover.user.js | 1.3.13 | `73e2ee77a33a1373` |
| Melonbooks - English Heading Translator.user.js | 1.0.4 | `76d43eadd4f9d701` |
| Melonbooks - English Heading Translator (1).user.js | 1.0.4 | `cdcf2744c22d425e` |
| Open Melonbooks links via VPN tab.user.js | 2.0.3 | `0a8f2a837358161e` |
| Melonbooks - Favorite Authors Infinite Scroll.user.js | 1.0.1 | `fa5ee3dd0eed8d4b` |
| Melonbooks - Wishlist Toggle.user.js | 1.0.2 | `b3ec39a497c342b6` |
| Melonbooks - Wishlist Infinite Scroll.user.js | 1.0.1 | `9c60b29f8af68222` |

The coding agent must generate and record the complete 64-character SHA-256 values locally. The prefixes above are only a cross-check against the reviewed archive.

If a local source file does not match the archive hash, do not silently replace it. Record that the local copy differs and compare the two versions before choosing the migration baseline.

---

# 7. English Heading Translator Duplicate

There are two files:

```text
Melonbooks - English Heading Translator.user.js
Melonbooks - English Heading Translator (1).user.js
```

Both declare:

```text
@name       Melonbooks - English Heading Translator
@version    1.0.4
```

They are not identical.

Observed source differences include:

Original variant:

```text
"サークル(先生)からのコメント/作品詳細"
    -> "Circle (Creator) Comments / Product Details"
```

`(1)` variant:

```text
"サークル(先生)からのコメント/作品詳細"
    -> "Circle/Creator Comments and Product Details"
```

The original variant also contains:

```text
["【ランキング】", "Ranking"]
```

while the `(1)` copy does not.

The Tampermonkey options metadata indicates the `(1)` export was modified later, but both files kept version `1.0.4`.

Do not migrate both as independent modules.

Required reconciliation:

1. Preserve both files under `legacy\standalone\`.
2. Generate a source diff.
3. Save the diff or a summary in `docs\IMPORT_NOTES.md`.
4. Determine the intended translation table.
5. Create one `heading-translator.js` module.
6. Document which source variant was used as the base and what differences were intentionally retained.
7. Do not delete either legacy source.

Do not decide solely from the `(1)` filename.

---

# 8. Important Existing Persistent Settings

## 8.1 Search Columns

`Melonbooks - Expand Search Columns` currently uses:

```text
localStorage["mb_column_adjuster_column_count"]
localStorage["mb_column_adjuster_side_padding"]
```

Current defaults found in the source:

```text
columnCount = 12
sidePadding = 16px
```

Do not break these existing values during the first migration.

Preferred initial behavior:

```text
read existing key
    -> use existing value
    -> keep writing existing key
```

A later release may migrate them to a master namespace if desired.

## 8.2 Orders Grid

`Melonbooks - My Orders Product Grid & Infinite Scroll` currently uses:

```text
localStorage["melonbooksOrdersColumnCount"]
localStorage["melonbooksOrdersProductSpacingPx"]
```

Current defaults:

```text
products per row = 5
spacing = 0px
minimum columns = 2
maximum columns = 12
minimum spacing = 0px
maximum spacing = 100px
default order range = past 1 year
```

It also uses a per-tab `sessionStorage` key beginning with:

```text
melonbooksOrdersDefaultPeriodApplied:
```

Preserve these values and behavior during initial migration.

Do not force users to reconfigure products per row or spacing after installing the master script.

---

# 9. Existing Script Behaviors That Require Extra Caution

The following modules make requests or change account state. Treat them as high-risk migrations:

```text
favorite-circle-toggle.js
favorite-author-toggle.js
wishlist-toggle.js
favorite-authors-infinite-scroll.js
wishlist-infinite-scroll.js
orders-grid-infinite-scroll.js
```

Known request patterns found in the existing source include:

- same-origin `fetch`
- HTML form POSTs
- `application/x-www-form-urlencoded`
- transaction IDs
- product IDs
- circle IDs
- wishlist item removal forms
- HTML parsing with `DOMParser`
- same-origin credentials
- login-page detection
- retry logic
- request timeouts
- XHR-related logic in some modules

Do not replace working request flows with cleaner-looking endpoints during the first migration.

The standalone scripts are the behavioral specification.

---

# 10. Final Repository Structure

Create the project under:

```text
C:\Users\Netoxic\PycharmProjects\Melonbooks Enhanced
```

Recommended structure:

```text
Melonbooks Enhanced\
├─ .github\
│  └─ workflows\
│     └─ build.yml
│
├─ _import\
│  └─ tampermonkey_scripts.zip
│
├─ src\
│  ├─ main.js
│  ├─ script-info.js
│  │
│  ├─ core\
│  │  ├─ dom.js
│  │  ├─ errors.js
│  │  ├─ lifecycle.js
│  │  ├─ melonbooks.js
│  │  ├─ requests.js
│  │  ├─ routing.js
│  │  ├─ storage.js
│  │  ├─ styles.js
│  │  └─ toast.js
│  │
│  └─ modules\
│     ├─ search-columns.js
│     ├─ product-info-layout.js
│     ├─ cart-duplicate-warning.js
│     ├─ force-listing-images.js
│     ├─ force-detail-thumbnails.js
│     ├─ orders-grid-infinite-scroll.js
│     ├─ favorite-circle-toggle.js
│     ├─ favorite-author-toggle.js
│     ├─ listing-hover.js
│     ├─ heading-translator.js
│     ├─ vpn-link-handler.js
│     ├─ favorite-authors-infinite-scroll.js
│     ├─ wishlist-toggle.js
│     └─ wishlist-infinite-scroll.js
│
├─ legacy\
│  └─ standalone\
│     ├─ <all 15 original .user.js files>
│     └─ ...
│
├─ dist\
│  └─ Melonbooks - Enhancements.user.js
│
├─ docs\
│  ├─ ARCHITECTURE.md
│  ├─ FEATURE_MATRIX.md
│  ├─ IMPORT_MANIFEST.md
│  ├─ IMPORT_NOTES.md
│  ├─ MIGRATION_STATUS.md
│  └─ TESTING.md
│
├─ test\
│  └─ fixtures\
│
├─ tools\
│  └─ build.mjs
│
├─ .gitignore
├─ CHANGELOG.md
├─ LICENSE
├─ package.json
├─ package-lock.json
└─ README.md
```

Do not create empty architecture files merely to match this tree. Create a core file only if it has an actual responsibility.

---

# 11. Git Initialization

If `REPO_ROOT` is not already a Git repository:

```powershell
Set-Location 'C:\Users\Netoxic\PycharmProjects\Melonbooks Enhanced'
git init
git branch -M main
```

Before refactoring any source:

1. Extract or copy all 15 `.user.js` files into `legacy\standalone\`.
2. Verify their hashes.
3. Create the import manifest.
4. Commit them without edits.

Recommended first commit:

```text
chore: preserve standalone Melonbooks userscripts
```

This commit is the immutable behavioral baseline.

Do not reformat the legacy scripts.

Do not normalize line endings in a way that prevents hash verification before the initial commit.

---

# 12. Git Ignore

Recommended `.gitignore`:

```gitignore
node_modules/
_import/
*.log
.DS_Store
Thumbs.db
.idea/
```

Do not ignore:

```text
dist\
package-lock.json
legacy\standalone\
docs\IMPORT_MANIFEST.md
```

Whether `.idea\` is committed is optional, but the default recommendation is not to publish PyCharm-local project settings.

---

# 13. Master Script Name

The single installable userscript must be named:

```text
Melonbooks - Enhancements
```

The generated file must be:

```text
dist\Melonbooks - Enhancements.user.js
```

Do not rename the master userscript unless explicitly requested later.

---

# 14. Versioning

Use semantic versioning:

```text
MAJOR.MINOR.PATCH
```

Because the master userscript is a new product, development may begin with:

```text
0.1.0
```

Use `0.x` versions while modules are still being migrated.

Example:

```text
0.1.0  project scaffold
0.2.0  first migrated module
0.3.0  additional modules
0.3.1  migration bug fix
...
1.0.0  all accepted standalone functionality migrated or explicitly deferred
```

Every functional change to the generated userscript must increment the master version.

For JavaScript, store the version in a static class field:

```javascript
export class ScriptInfo {
    static version = "0.1.0";
}
```

The build must use this value to generate `@version`.

The build must fail if source and generated metadata versions disagree.

---

# 15. One Combined `@run-at`

The existing scripts use several lifecycle timings:

```text
document-start
document-end
document-idle
default idle behavior
```

A single userscript metadata block can have only one `@run-at`.

Set the master userscript to:

```text
@run-at document-start
```

Then preserve each module's original timing through an internal lifecycle helper.

Create:

```text
src\core\lifecycle.js
```

It should provide clear primitives such as:

```javascript
onDocumentStart(callback)
onDomReady(callback)
onDocumentEnd(callback)
onDocumentIdle(callback)
```

The naming may vary, but behavior must be deterministic.

Examples:

```text
Force Load Listing Images
    -> initialize immediately

Orders Grid
    -> initialize immediately, then perform DOM work at the appropriate stage

Wishlist Toggle
    -> wait until its document-end equivalent

Wishlist Infinite Scroll
    -> wait until document-idle equivalent
```

Do not simply run all modules at document-start.

---

# 16. Combined Metadata Scope

The final script needs to cover all current execution environments, including Outlook because one existing feature runs there.

Expected effective scope includes:

```text
https://*.melonbooks.co.jp/*
https://melonbooks.co.jp/*
http://www.melonbooks.co.jp/mypage/history.php*
https://outlook.office.com/*
https://outlook.live.com/*
```

The coding agent should generate the smallest correct metadata union from the legacy scripts.

Do not accidentally remove the Outlook matches.

The VPN module is part of the master even though it must execute outside Melonbooks.

---

# 17. Combined Grants

Existing grants are:

```text
GM_addStyle
GM_openInTab
none
```

The final metadata cannot use `@grant none` together with privileged grants.

Initial combined grants will likely be:

```text
@grant GM_addStyle
@grant GM_openInTab
```

There are no current `@connect` requirements in the reviewed source.

Important compatibility check:

Adding privileged grants changes the userscript execution sandbox compared with scripts that previously used `@grant none`.

Therefore, during migration:

1. test all modules that previously used `@grant none`
2. identify any reliance on page-context globals
3. use `unsafeWindow` only if actually required
4. do not add `unsafeWindow` preemptively
5. prefer DOM and standard browser APIs where possible

A later refactor may replace `GM_addStyle` with a native shared style helper, but do not make that change until parity is established.

---

# 18. Module Interface

Use one simple module contract.

Recommended structure:

```javascript
export const SearchColumnsModule = {
    id: "search-columns",
    name: "Search Columns",

    matches(context) {
        return false;
    },

    init(context) {
        // Initialize exactly once.
    }
};
```

Optional properties may include:

```javascript
lifecycle: "idle"
defaultEnabled: true
description: "..."
```

Do not create deep inheritance or a class hierarchy just to define modules.

---

# 19. Module Registry

Register modules in exactly one place.

Example:

```javascript
const modules = [
    SearchColumnsModule,
    ProductInfoLayoutModule,
    CartDuplicateWarningModule,
    ForceListingImagesModule,
    ForceDetailThumbnailsModule,
    OrdersGridInfiniteScrollModule,
    FavoriteCircleToggleModule,
    FavoriteAuthorToggleModule,
    ListingHoverModule,
    HeadingTranslatorModule,
    VpnLinkHandlerModule,
    FavoriteAuthorsInfiniteScrollModule,
    WishlistToggleModule,
    WishlistInfiniteScrollModule
];
```

Do not scatter module initialization across multiple files.

---

# 20. Main Bootstrap

`src\main.js` should remain small.

Responsibilities:

1. initialize core services
2. classify the current page/environment
3. load settings
4. determine which modules are eligible
5. schedule each module at its required lifecycle phase
6. isolate module errors
7. expose useful debug diagnostics

Conceptual behavior:

```javascript
for (const module of modules) {
    try {
        if (!settings.isEnabled(module.id)) {
            continue;
        }

        if (!module.matches(context)) {
            continue;
        }

        lifecycle.run(module.lifecycle, () => {
            try {
                module.init(context);
            } catch (error) {
                errors.report(module, error);
            }
        });
    } catch (error) {
        errors.report(module, error);
    }
}
```

One module failure must not prevent unrelated modules from loading.

---

# 21. Routing and Environment Detection

Create:

```text
src\core\routing.js
```

It must distinguish at least:

```text
outlook
melonbooks-search
melonbooks-product
melonbooks-cart
melonbooks-orders
melonbooks-favorite-authors
melonbooks-wishlist
melonbooks-listing
melonbooks-other
```

Use URL/path matching first.

Use DOM markers only when URL matching is insufficient.

Do not perform network requests merely to identify a route.

---

# 22. Proposed Migration Map

## 22.1 `search-columns.js`

Source:

```text
Melonbooks - Expand Search Columns.user.js
```

Preserve:

- search-only scope
- custom column count
- side padding control
- edit/settings interface
- default 12 columns
- default 16px side padding
- existing localStorage keys
- keyboard/close behavior
- current CSS layout behavior

Risk:

```text
Low to medium
```

This is a good early migration candidate.

---

## 22.2 `product-info-layout.js`

Source:

```text
Melonbooks - Move product info below cart buttons.user.js
```

Preserve:

- supported product detail URL variants
- moving the original product information table
- placement relative to cart controls
- tag toggling behavior
- MutationObserver behavior
- no cloning of information that would cause duplicate IDs or handlers

Risk:

```text
Medium
```

This is a good early architecture test because it is DOM-only.

---

## 22.3 `cart-duplicate-warning.js`

Source:

```text
MelonBooks - Cart Duplicate Warning.user.js
```

Preserve:

- clipboard/cart page scope
- `.already-buy` detection
- red warning banner
- problematic item outline
- MutationObserver support for dynamic changes

Risk:

```text
Low to medium
```

---

## 22.4 `force-listing-images.js`

Source:

```text
Melonbooks - Force Load Listing Images.user.js
```

Preserve:

- early execution
- `img[data-src]` behavior
- applicable listing containers
- MutationObserver behavior
- support for dynamically added listing items
- avoidance of unnecessary global image rewriting

Risk:

```text
Medium
```

This module starts early, so lifecycle behavior must be tested carefully.

---

## 22.5 `force-detail-thumbnails.js`

Source:

```text
Melonbooks - Force Loads Details Page Thumbnails.user.js
```

Preserve exact behavior targeting:

```text
img[src*="now_printing.jpeg"][data-src]
```

Do not automatically merge it into `force-listing-images.js` during the first migration.

After both modules pass parity tests, evaluate whether they can safely share an image-loading helper.

Risk:

```text
Low
```

---

## 22.6 `orders-grid-infinite-scroll.js`

Source:

```text
Melonbooks - My Orders Product Grid & Infinite Scroll.user.js
```

This is a large and high-value module. Keep it intact initially.

Preserve:

- full-width layout
- grid controls
- default products per row = 5
- spacing setting = 0px
- allowed column range
- allowed spacing range
- order range default = one year
- once-per-tab automatic order-range application
- infinite scroll
- pagination behavior
- dynamic lazy image handling
- current localStorage keys
- current sessionStorage key behavior
- original HTTP and HTTPS compatibility

Do not split it into multiple modules during the first migration.

Potential future split after parity:

```text
orders-layout
orders-controls
orders-infinite-scroll
```

Do not perform that split before the combined version is proven stable.

Risk:

```text
High
```

---

## 22.7 `favorite-circle-toggle.js`

Source:

```text
Melonbooks - Product Page Circle Favorite Remover.user.js
```

Preserve:

- initial active/inactive state
- native-looking favorite icon
- add behavior
- remove behavior
- transaction ID handling
- circle ID detection
- same-origin form POST
- request timeout
- login detection
- duplicate-click protection
- success/error status
- correct state after network failure

Observed request behavior includes a POST to a circle page with values conceptually equivalent to:

```text
transactionid
act=add_favorite or remove_favorite
circle_id
```

Do not replace this request flow without a specific reason.

Risk:

```text
High
```

---

## 22.8 `favorite-author-toggle.js`

Source:

```text
Melonbooks - Product Page Favorite Author Remover.user.js
```

Preserve:

- product-page author detection
- add favorite behavior
- remove favorite behavior
- correct initial gray/active heart appearance
- English status messages
- transaction ID behavior
- fallback product-page parsing
- login behavior
- request timeout behavior
- any existing XHR interception or page interaction needed for parity

Risk:

```text
High
```

---

## 22.9 `listing-hover.js`

Source:

```text
Melonbooks - Listing hover.user.js
```

Preserve:

- `.item-meta` overlay behavior
- `.item-image` integration
- item-state badges
- popup information
- privilege titles
- rank badges
- price/cart placement below thumbnail
- handling of dynamically added listing items
- listing compatibility across multiple page families

Because this script matches essentially the entire Melonbooks site, ensure it does not initialize against unrelated DOM fragments.

Risk:

```text
Medium to high
```

---

## 22.10 `heading-translator.js`

Sources:

```text
Melonbooks - English Heading Translator.user.js
Melonbooks - English Heading Translator (1).user.js
```

Reconcile the duplicate as described earlier.

Preserve:

- translation table behavior
- document-start timing
- mutation support
- version markers currently written to translated elements, if still useful
- exact translations chosen after reconciliation

Risk:

```text
Low
```

Do not leave two translator modules enabled.

---

## 22.11 `vpn-link-handler.js`

Source:

```text
Open Melonbooks links via VPN tab.user.js
```

This module is architecturally unusual because it runs on:

```text
Outlook Web
Melonbooks
```

Preserve:

- Outlook link interception
- Melonbooks URL cleanup
- SafeLink cleanup where currently implemented
- VPN initialization/retry behavior
- middle-click behavior
- focus behavior
- direct product target behavior
- `GM_openInTab` behavior
- no interference with unrelated Outlook links

This module means the master userscript must retain Outlook metadata matches.

Risk:

```text
High
```

Migrate it late, after the Melonbooks-only module framework is stable.

---

## 22.12 `favorite-authors-infinite-scroll.js`

Source:

```text
Melonbooks - Favorite Authors Infinite Scroll.user.js
```

Preserve:

- automatically loading all remaining favorite-author pages
- page number/form behavior
- author item extraction
- controls next to the author name
- approximately 25 percent author-name allocation where implemented
- no duplicate authors
- no duplicate controls
- final-page detection
- request retry behavior
- same-origin HTML parsing

Risk:

```text
High
```

---

## 22.13 `wishlist-toggle.js`

Source:

```text
Melonbooks - Wishlist Toggle.user.js
```

Preserve:

- product-page wishlist state detection
- add if not in wishlist
- remove if already in wishlist
- correct bookmark icon on initial page load
- correct bookmark icon after state change
- English toast/status message
- no page freeze
- login-page handling
- transaction/product ID handling
- request validation
- duplicate-click protection
- error recovery

Risk:

```text
High
```

This feature has had prior regressions involving initial icons and page freezing. Treat those as explicit regression tests.

---

## 22.14 `wishlist-infinite-scroll.js`

Source:

```text
Melonbooks - Wishlist Infinite Scroll.user.js
```

Preserve:

- additional pages loaded automatically
- POST form pagination behavior
- transaction ID handling
- insertion into `.item-list`
- one continuous item layout
- no artificial row boundaries
- first-page items and later-page items using the same layout context
- no duplicate products
- no skipped products
- no repeated page loads
- final-page detection
- loaded-image handling
- cart/select controls remaining functional

This feature has had a prior layout bug where the incomplete final row from page 1 did not fill with page 2 items.

Explicit acceptance test:

```text
If page 1 ends with a partially filled visual row,
items from page 2 must occupy the remaining visual columns
before beginning a new row.
```

Do not append fetched page-level row wrappers that isolate layouts.

Append the actual product item elements into the existing `.item-list` flow.

Risk:

```text
High
```

---

# 23. Feature Matrix

Create:

```text
docs\FEATURE_MATRIX.md
```

Start it with the 15 entries from the concrete inventory.

Required columns:

| Field | Purpose |
|---|---|
| Legacy filename | Exact import filename |
| Legacy version | Exact standalone version |
| SHA-256 | Full source hash |
| Current `@match` | Exact metadata |
| Current `@run-at` | Exact metadata/effective behavior |
| Current grants | Exact metadata |
| Page family | Route classification |
| Important selectors | DOM dependencies |
| Network behavior | GET/POST/fetch/XHR/form |
| Persistent keys | localStorage/sessionStorage |
| MutationObserver | Yes/No |
| Proposed module | New source path |
| Risk | Low/Medium/High |
| Migration state | Not started/In progress/Parity passed |
| Notes | Known regressions or special cases |

Do not mark a module migrated just because it compiles.

---

# 24. Shared Core Rules

Do not abstract first.

The correct sequence is:

```text
migrate feature faithfully
    -> prove parity
    -> identify repeated behavior
    -> extract shared helper
    -> rerun parity tests
```

Likely shared helpers include:

```text
DOM readiness
wait-for-element
DOMParser helpers
same-origin HTML fetch
request timeout
login-page detection
style injection
toast/status notifications
route classification
module error reporting
settings persistence
```

Do not merge favorite author, favorite circle, and wishlist request implementations just because all three are toggles.

They have different endpoints and state validation.

---

# 25. Core Files

## `core\dom.js`

Potential responsibilities:

```text
waitForElement
query helper
delegated event listener
safe insertion
idempotent initialization
```

## `core\lifecycle.js`

Required because the master uses one document-start metadata timing while modules have different original timings.

## `core\errors.js`

Use consistent diagnostic prefixes:

```text
[Melonbooks Enhancements]
[Melonbooks Enhancements][wishlist-toggle]
```

## `core\requests.js`

Only contain truly shared request mechanics.

Never hide endpoint-specific behavior inside a generic helper.

## `core\styles.js`

Central style injection.

Support module-specific style IDs to prevent duplicate injection.

## `core\toast.js`

Centralize only after comparing the existing toast/status implementations.

## `core\storage.js`

Provide master configuration storage without breaking the existing feature-specific localStorage keys.

## `core\routing.js`

Classify Melonbooks and Outlook routes.

## `core\melonbooks.js`

Only shared Melonbooks-specific parsing utilities used by at least two modules.

---

# 26. Settings

Every module should eventually have a master enable/disable switch.

Default all migrated features to:

```text
enabled = true
```

because the supplied Tampermonkey export shows all current scripts enabled.

Suggested master settings shape:

```javascript
{
    modules: {
        searchColumns: true,
        productInfoLayout: true,
        cartDuplicateWarning: true,
        forceListingImages: true,
        forceDetailThumbnails: true,
        ordersGridInfiniteScroll: true,
        favoriteCircleToggle: true,
        favoriteAuthorToggle: true,
        listingHover: true,
        headingTranslator: true,
        vpnLinkHandler: true,
        favoriteAuthorsInfiniteScroll: true,
        wishlistToggle: true,
        wishlistInfiniteScroll: true
    }
}
```

Do not migrate existing feature values into a new storage system until the master settings framework is stable.

---

# 27. Tampermonkey Menu

For the first combined release, implement simple management commands through `GM_registerMenuCommand` only if the required grant is accepted and tested.

Potential commands:

```text
Melonbooks Enhancements: Settings
Melonbooks Enhancements: Feature Status
Melonbooks Enhancements: Reset Master Settings
Melonbooks Enhancements: Debug Information
```

A custom full settings UI is not required for initial parity.

Do not replace feature-specific controls that already work directly on their pages.

---

# 28. Build System

Use Node.js with `esbuild`.

Recommended:

```text
tools\build.mjs
```

The build should:

1. load the master version from `src\script-info.js`
2. generate the userscript metadata block
3. bundle `src\main.js`
4. output an IIFE or equivalent non-module browser bundle
5. preserve readable output
6. avoid minification by default
7. prepend a generated-file notice
8. write exactly:
   `dist\Melonbooks - Enhancements.user.js`
9. exit non-zero on errors
10. verify the metadata version matches `ScriptInfo.version`

Recommended package scripts:

```json
{
  "scripts": {
    "build": "node tools/build.mjs",
    "check": "node tools/build.mjs --check",
    "watch": "node tools/build.mjs --watch"
  }
}
```

Do not require PyCharm to build the project. PyCharm is only the repository location/IDE.

---

# 29. Generated File Rules

The generated userscript should begin with a clear notice after the userscript metadata block:

```javascript
// GENERATED FILE. DO NOT EDIT DIRECTLY.
// Edit files under src/ and run the build.
```

Commit the `dist` file.

Users need a stable GitHub raw URL to install and update the script.

Do not make `dist` the editable source of truth.

---

# 30. GitHub Repository

Recommended repository name:

```text
melonbooks-enhancements
```

Recommended default branch:

```text
main
```

Recommended license:

```text
MIT
```

Recommended visibility:

```text
Public
```

The local folder name does not need to match the GitHub repository name.

Local:

```text
C:\Users\Netoxic\PycharmProjects\Melonbooks Enhanced
```

GitHub:

```text
melonbooks-enhancements
```

---

# 31. GitHub Update URLs

Once the actual GitHub owner/repository is confirmed, generate:

```javascript
// @updateURL    https://raw.githubusercontent.com/<OWNER>/melonbooks-enhancements/main/dist/Melonbooks%20-%20Enhancements.user.js
// @downloadURL  https://raw.githubusercontent.com/<OWNER>/melonbooks-enhancements/main/dist/Melonbooks%20-%20Enhancements.user.js
```

Do not guess the repository owner in the build.

Store repository metadata in one build configuration location.

---

# 32. GitHub Actions

Add after local builds are stable:

```text
.github\workflows\build.yml
```

Run on:

```text
push to main
pull requests targeting main
```

Workflow:

1. checkout
2. setup Node
3. `npm ci`
4. `npm run check`
5. rebuild into a temporary location or verify deterministic output
6. fail if committed `dist` does not equal a fresh build

Do not automatically bump versions.

Do not automatically commit build changes from CI.

---

# 33. Legacy Sources

Store all 15 `.user.js` files exactly as imported:

```text
legacy\standalone\
```

Keep both translator variants.

Legacy sources are permanent regression references.

Do not edit them to reflect master-script fixes.

When a module is fixed later, only update:

```text
src\
dist\
docs\
tests\
```

unless explicitly preserving a historical note.

---

# 34. Import Options and Storage JSON

The archive includes matching:

```text
*.options.json
*.storage.json
```

Observed storage exports are empty.

Recommended policy:

```text
do not commit them by default
```

Use them during import to verify:

- enabled state
- script order
- original effective run-at
- metadata matches

Create a summary in `docs\IMPORT_NOTES.md`.

If the coding agent determines one of these files contains useful non-sensitive configuration not represented elsewhere, document it before committing that file.

---

# 35. Tampermonkey Script Ordering

The supplied options metadata indicates these scripts were installed at different Tampermonkey positions.

Do not assume this order was an intended dependency chain.

The master architecture should make module order irrelevant unless a real dependency is found.

If module order becomes necessary:

1. prove the dependency
2. document it
3. enforce it explicitly in the registry
4. add a regression test

Do not rely on object enumeration or accidental import order.

---

# 36. DOM Initialization Markers

Because multiple modules can now run inside one script, prevent duplicate initialization.

Recommended marker pattern:

```text
data-mbe-<module>=initialized
```

Examples:

```text
data-mbe-wishlist-toggle="initialized"
data-mbe-listing-hover="initialized"
```

Use markers only where they help.

Do not clutter every DOM element with master-script attributes.

---

# 37. MutationObserver Rules

Several supplied scripts use MutationObserver.

Known observer-using features include at least:

```text
Move product info below cart buttons
Cart Duplicate Warning
Force Load Listing Images
Listing hover
English Heading Translator
Wishlist Toggle
```

Requirements:

- observe the narrowest stable ancestor possible
- avoid whole-document rescans for every mutation
- make callbacks idempotent
- avoid creating observer-triggered mutation loops
- disconnect observers if a feature no longer needs them
- do not create duplicate observers after repeated initialization

Combined-script performance must be tested with all observer-heavy modules enabled.

---

# 38. Network Request Rules

For every request-making script:

1. record current endpoint
2. record HTTP method
3. record query parameters
4. record POST fields
5. record credentials behavior
6. record content type
7. record redirects
8. record transaction/CSRF token handling
9. record login redirect detection
10. record success validation

Save this in `FEATURE_MATRIX.md` or a module-specific note.

Do not consolidate request code until these differences are documented.

---

# 39. Toggle Regression Matrix

For each of:

```text
favorite-circle-toggle
favorite-author-toggle
wishlist-toggle
```

test:

```text
initially inactive
initially active
successful add
successful remove
failed add
failed remove
network timeout
login/session expiration
rapid double click
page navigation after action
icon after add
icon after remove
icon after error
toast/status after add
toast/status after remove
```

The UI must never report success before the account state actually changed.

---

# 40. Wishlist Toggle Specific Regression

The supplied Wishlist Toggle is version:

```text
1.0.2
```

Historical issues to keep as explicit tests:

```text
correct inactive bookmark appearance
correct active bookmark appearance on initial page load
correct icon after adding
correct icon after removing
English bottom-page status/toast
no page freeze during add
```

Do not consider this module migrated until these cases pass.

---

# 41. Wishlist Infinite Scroll Specific Regression

The supplied Wishlist Infinite Scroll is version:

```text
1.0.1
```

Critical layout requirement:

```text
All loaded product nodes must be children of the same effective list/grid flow.
```

Do not append an entire fetched `.item-list`, `<ul>`, page wrapper, or row wrapper if that creates a separate layout context.

When page 1 has fewer products than a full final row:

```text
page 2 products must fill the remaining visual columns
```

before starting a new row.

Test with variable thumbnail/column sizes where practical.

---

# 42. Orders Regression

The supplied orders script is version:

```text
1.2.2
```

Required tests:

```text
full-width page-content area
5 products per row by default
spacing 0px by default
change products-per-row control
persist products-per-row
change spacing control
persist spacing
no unwanted card outlines
one-year order period default
no repeated order-period form submission loop
infinite scroll loads next order page
no duplicate order blocks
lazy-loaded product images appear
final page stops loading
```

Do not change existing localStorage keys during initial migration.

---

# 43. Favorite Authors Regression

The supplied script is version:

```text
1.0.1
```

Test:

```text
all remaining pages load automatically
author rows remain correctly aligned
favorite control stays beside author name
mail control stays beside author name
author name occupies only the intended portion of the row
no duplicate authors
no duplicate controls
no broken final page
```

---

# 44. Listing Hover Regression

The supplied script is version:

```text
1.3.13
```

Because it is broad in scope, test it together with:

```text
search-columns
force-listing-images
wishlist-infinite-scroll
favorite-authors-infinite-scroll
orders-grid-infinite-scroll
```

where relevant.

The main risk is that one module mutates list items and the listing-hover observer reprocesses them incorrectly.

---

# 45. Image Loader Interaction

Two image-related modules exist:

```text
force-listing-images
force-detail-thumbnails
```

They overlap on product/detail pages at a conceptual level but target different states.

Do not merge them initially.

After migration:

1. run both together
2. verify no repeated source swapping
3. verify no MutationObserver loop
4. verify no broken placeholder state
5. only then consider a shared helper

---

# 46. Outlook/VPN Module Isolation

The master userscript will run on Outlook because of the VPN link feature.

On Outlook pages:

```text
only vpn-link-handler.js should match
```

No Melonbooks DOM module should initialize there.

This must be an explicit router test.

Likewise, on a normal Melonbooks page:

```text
Outlook-specific interception code should remain dormant
```

except any deliberate Melonbooks-side retry logic already present in the standalone script.

---

# 47. Page-Specific Activation

Do not initialize every module on every Melonbooks page.

Examples:

```text
search-columns
    -> search pages only

orders-grid-infinite-scroll
    -> history.php only

favorite-authors-infinite-scroll
    -> favorite_author.php only

wishlist-infinite-scroll
    -> favorite.php only

cart-duplicate-warning
    -> clipboard only

wishlist-toggle
favorite-circle-toggle
favorite-author-toggle
product-info-layout
    -> relevant product detail pages only
```

`listing-hover`, image loading, and translator modules can remain broader where their standalone behavior requires it.

---

# 48. Testing Approach

Create:

```text
docs\TESTING.md
```

For each module:

## A. Legacy baseline

Run only the standalone script and record expected behavior.

## B. Master isolated

Disable the standalone script.

Enable only the corresponding master module.

Compare:

```text
layout
events
network requests
DOM changes
state changes
localStorage
sessionStorage
icons
toasts
console output
```

## C. Master integration

Enable all master modules relevant to that page.

Repeat the test.

A feature does not pass migration until C is successful.

---

# 49. Saved HTML Fixtures

The supplied ZIP contains scripts, not saved Melonbooks HTML pages.

Therefore, do not claim full DOM regression coverage from the ZIP alone.

If local saved pages are available, sanitize and place appropriate fixtures under:

```text
test\fixtures\
```

Potential fixtures:

```text
search-results.html
product-wishlist-active.html
product-wishlist-inactive.html
cart.html
orders.html
favorite-authors.html
wishlist.html
```

Never commit:

```text
cookies
session tokens
CSRF secrets
personal order information
addresses
email addresses
account identifiers
```

unless safely sanitized.

Live manual testing remains required for account-state operations.

---

# 50. Automated Tests

Do not attempt to fully simulate Melonbooks immediately.

Start automated tests with deterministic pieces:

```text
routing
metadata generation
version consistency
HTML parsing helpers
storage migration helpers
translation table
deduplication helpers
next-page detection where fixtures are available
```

Use browser-like DOM testing only where it provides real value.

Avoid building a large test framework before the first feature is migrated.

---

# 51. Performance Test

With all modules enabled on a representative listing page, verify:

```text
no continuous CPU usage
no observer loop
no repeated style insertion
no repeated item processing
no unnecessary network requests
no timer storm
no duplicate event handlers
```

The master script should not make Melonbooks noticeably less responsive than the existing standalone collection.

---

# 52. Error Isolation

Each module must initialize inside its own error boundary.

A failure in:

```text
heading-translator
```

must not disable:

```text
wishlist-toggle
```

A failure in:

```text
listing-hover
```

must not stop:

```text
orders-grid-infinite-scroll
```

Log errors with module IDs.

Do not swallow all errors silently.

---

# 53. First Migration Stage. Import and Baseline

Perform this before writing the master feature code.

1. Create/open:
   `C:\Users\Netoxic\PycharmProjects\Melonbooks Enhanced`
2. initialize Git if needed
3. create `_import`, `legacy\standalone`, and `docs`
4. place/read `tampermonkey_scripts.zip`
5. extract only the `.user.js` sources to `legacy\standalone`
6. calculate full SHA-256 hashes
7. verify the archive contains the expected 15 script files
8. generate `IMPORT_MANIFEST.md`
9. generate `IMPORT_NOTES.md`
10. document the duplicate translator
11. commit the exact legacy sources

Commit:

```text
chore: preserve standalone Melonbooks userscripts
```

Do not migrate features in the same commit.

---

# 54. Second Migration Stage. Scaffold

Create:

```text
src\
src\core\
src\modules\
dist\
tools\
test\
```

Add:

```text
package.json
package-lock.json
tools\build.mjs
src\script-info.js
src\main.js
src\core\lifecycle.js
src\core\routing.js
```

Build a minimal master userscript that:

```text
installs
runs at document-start
does not modify the page
logs only in debug mode
does not throw errors
```

Suggested initial version:

```text
0.1.0
```

Commit:

```text
chore: scaffold master userscript
```

---

# 55. Third Migration Stage. Low-Risk Modules

Recommended order:

```text
1. force-detail-thumbnails
2. cart-duplicate-warning
3. heading-translator
4. product-info-layout
5. search-columns
```

After each module:

```text
migrate
build
test isolated
test combined
update FEATURE_MATRIX
increment master version
commit
```

Do not batch all five into one commit.

---

# 56. Fourth Migration Stage. Listing Infrastructure

Migrate:

```text
force-listing-images
listing-hover
```

Test them together with:

```text
search-columns
```

Pay special attention to observer interaction and dynamically inserted list items.

---

# 57. Fifth Migration Stage. Orders

Migrate:

```text
orders-grid-infinite-scroll
```

Keep it as one module initially.

Do not refactor its large internal implementation until behavior parity is demonstrated.

Preserve storage keys.

---

# 58. Sixth Migration Stage. Account-State Toggles

Recommended order:

```text
favorite-circle-toggle
favorite-author-toggle
wishlist-toggle
```

Each must be independently tested against logged-in Melonbooks.

Do not attempt to create a universal "favorite API" before these pass.

---

# 59. Seventh Migration Stage. Infinite Scroll

Recommended order:

```text
favorite-authors-infinite-scroll
wishlist-infinite-scroll
```

The wishlist module receives extra layout regression testing because of the prior partial-row issue.

---

# 60. Eighth Migration Stage. Outlook/VPN

Migrate:

```text
vpn-link-handler
```

last among the existing features.

Reason:

```text
it broadens the master userscript beyond Melonbooks
it requires GM_openInTab
it affects click and auxclick navigation
it has focus/new-tab behavior
```

Test Outlook separately.

---

# 61. Ninth Migration Stage. Consolidation

Only after all feature modules work:

1. identify duplicated toast implementations
2. identify duplicated request timeout code
3. identify duplicated login detection
4. identify duplicated DOM parsing
5. identify duplicated style injection
6. extract shared helpers one at a time
7. run affected regression tests after each extraction

Do not combine refactoring with unrelated new features.

---

# 62. Release `1.0.0`

The master reaches `1.0.0` only when every imported feature has one of these documented states:

```text
Migrated and parity passed
Deferred with explicit reason
Duplicate and reconciled
Obsolete with explicit evidence
```

Expected imported feature count:

```text
14 distinct features
15 source files
```

The duplicate translator should normally result in one feature module.

---

# 63. Acceptance Criteria

Version `1.0.0` is ready only when:

1. all 15 source userscripts are preserved
2. full hashes are documented
3. the translator duplicate is reconciled
4. all active features are accounted for
5. one generated userscript installs successfully
6. standalone scripts are no longer required for migrated features
7. module activation is route-specific
8. document-start/end/idle behavior is preserved internally
9. existing storage settings survive
10. account-state toggles work
11. wishlist infinite scroll fills rows continuously
12. favorite-author infinite scroll works
13. orders grid and settings work
14. listing hover works with dynamic content
15. image loaders do not fight each other
16. Outlook VPN behavior works
17. no page freezes are observed
18. no significant console errors remain
19. no duplicate network requests occur
20. no MutationObserver loops occur
21. `dist` matches a clean rebuild
22. GitHub raw install/update URLs work

---

# 64. README Requirements

`README.md` must include:

```text
project purpose
installation
single-script model
feature list
feature enable/disable behavior
settings
supported browsers/userscript managers
development requirements
local build commands
repository structure
how to add a module
how to update a module
versioning
troubleshooting
license
```

Do not expose unnecessary personal local paths in public-facing installation instructions.

The Windows repository path can be documented only in agent/development notes if useful.

---

# 65. Architecture Documentation

Create:

```text
docs\ARCHITECTURE.md
```

Explain:

```text
master bootstrap
module registry
route matching
lifecycle scheduling
error boundaries
shared utilities
settings
storage compatibility
build process
metadata generation
dist generation
```

Include the reason for using a single `document-start` master metadata timing plus per-module lifecycle scheduling.

---

# 66. Migration Status

Create:

```text
docs\MIGRATION_STATUS.md
```

Initial checklist:

```markdown
# Migration Status

## Import
- [ ] Verify all 15 userscript files
- [ ] Record hashes
- [ ] Preserve legacy files
- [ ] Reconcile heading translator duplicate

## Foundation
- [ ] Build system
- [ ] Script metadata generation
- [ ] Lifecycle scheduler
- [ ] Router
- [ ] Error isolation
- [ ] Master settings

## Modules
- [ ] Search Columns
- [ ] Product Info Layout
- [ ] Cart Duplicate Warning
- [ ] Force Listing Images
- [ ] Force Detail Thumbnails
- [ ] Orders Grid & Infinite Scroll
- [ ] Favorite Circle Toggle
- [ ] Favorite Author Toggle
- [ ] Listing Hover
- [ ] Heading Translator
- [ ] VPN Link Handler
- [ ] Favorite Authors Infinite Scroll
- [ ] Wishlist Toggle
- [ ] Wishlist Infinite Scroll

## Release
- [ ] Full regression test
- [ ] GitHub update URLs
- [ ] CI build verification
- [ ] README complete
- [ ] CHANGELOG complete
- [ ] v1.0.0
```

---

# 67. Changelog

Create:

```text
CHANGELOG.md
```

Track user-visible changes only.

During `0.x` migration versions, examples:

```markdown
## 0.3.0

### Added
- Migrated Search Columns into the master userscript.

### Changed
- Preserved existing search-column localStorage settings.
```

Do not clutter the changelog with internal file moves.

---

# 68. Commit Strategy

Recommended commits:

```text
chore: preserve standalone Melonbooks userscripts
docs: add userscript import manifest
chore: scaffold master userscript
feat: migrate force detail thumbnails
feat: migrate cart duplicate warning
feat: migrate heading translator
feat: migrate product info layout
feat: migrate search columns
feat: migrate force listing images
feat: migrate listing hover
feat: migrate orders grid and infinite scroll
feat: migrate circle favorite toggle
feat: migrate author favorite toggle
feat: migrate wishlist toggle
feat: migrate favorite authors infinite scroll
feat: migrate wishlist infinite scroll
feat: migrate VPN link handler
refactor: consolidate shared Melonbooks helpers
docs: complete master userscript documentation
```

Every commit that changes the generated runtime should include the appropriate version bump and rebuilt `dist`.

---

# 69. Branch Strategy

Recommended:

```text
main
feature/<module>
fix/<issue>
```

Examples:

```text
feature/wishlist-toggle
feature/orders-grid
fix/wishlist-infinite-scroll-row-flow
```

If the coding agent is working directly on `main` in a local-only repository during initial scaffold, commits should still remain small and reviewable.

Once pushed to GitHub, prefer feature branches for risky state-changing modules.

---

# 70. Security and Public Repository Review

Before the first GitHub push, scan:

```text
legacy\
src\
docs\
test\
dist\
```

for:

```text
cookies
authentication headers
session tokens
CSRF tokens copied from HTML
email addresses
addresses
order numbers
account identifiers
private URLs
API keys
passwords
personal browser export data
```

The supplied `.storage.json` files are empty, but do not assume future imports are safe.

Do not commit the raw Tampermonkey archive by default.

---

# 71. Do Not Do These During Initial Migration

Do not:

```text
rewrite all features from scratch
delete the legacy scripts
merge unrelated modules
rename the master script
change page selectors for style reasons
change request endpoints without necessity
replace form POSTs with guessed APIs
remove storage keys
redesign every UI control
minify the output
introduce TypeScript
introduce React/Vue/Svelte
introduce a development server
add analytics or telemetry
add third-party CDN dependencies
add remote @require dependencies for our own code
add new features unrelated to migration
```

Behavior preservation comes before cleanup.

---

# 72. Coding Style

Use modern readable JavaScript.

Prefer:

```text
const/let
classes only when useful
small pure helpers
clear module IDs
async/await
descriptive names
early returns
explicit error handling
```

Avoid unnecessary cleverness.

Do not use a framework.

Keep comments that explain Melonbooks-specific behavior or non-obvious workarounds.

---

# 73. Source Version Markers

Several existing scripts already contain static version fields, while others only use metadata.

The master should standardize on one static field:

```javascript
export class ScriptInfo {
    static version = "0.1.0";
}
```

Individual migrated modules do not need independent runtime version numbers unless there is a concrete debugging reason.

Historical standalone versions remain documented in `FEATURE_MATRIX.md`.

---

# 74. Debug Mode

Add a master debug setting.

When disabled:

```text
only meaningful warnings/errors
```

When enabled:

```text
master version
current route
matched modules
initialization timing
network page-load diagnostics for infinite scroll
state transition diagnostics for toggles
```

Do not log sensitive tokens or full form bodies.

---

# 75. Definition of Done Per Module

A module is "Parity passed" only when all are true:

```text
legacy source preserved
feature matrix updated
module added
router match added
lifecycle timing preserved
build succeeds
master version incremented
isolated test passes
combined test passes
no new console error
no duplicate observer/listener
persistent settings preserved
legacy script can be disabled
documentation updated
commit created
```

Compiling is not enough.

---

# 76. First Coding Agent Work Session

The first session should focus on import and infrastructure.

Required work:

```text
1. Open C:\Users\Netoxic\PycharmProjects\Melonbooks Enhanced
2. Verify Git status/repository state
3. Locate tampermonkey_scripts.zip or the extracted source files
4. Preserve the 15 .user.js files under legacy\standalone
5. Compute SHA-256 hashes
6. Compare against the manifest prefixes in this plan
7. Document all exact metadata
8. Create IMPORT_MANIFEST.md
9. Create IMPORT_NOTES.md
10. Diff the two translator files
11. Commit legacy baseline
12. Scaffold Node/esbuild build
13. Create ScriptInfo
14. Create router
15. Create lifecycle scheduler
16. Build a no-op master userscript
17. Verify it installs in Tampermonkey
18. Commit scaffold
```

Do not mass-migrate the 14 features in the same session unless the baseline and build are already stable.

---

# 77. Second Coding Agent Work Session

Migrate one low-risk feature.

Preferred first feature:

```text
force-detail-thumbnails
```

Alternative:

```text
cart-duplicate-warning
```

Required:

```text
copy behavior with minimal changes
use master lifecycle
use master routing
build
test
document
version bump
commit
```

This validates the architecture before migrating a large feature.

---

# 78. Subsequent Work Sessions

Continue one logical module at a time.

A recommended priority sequence is:

```text
1. Force Detail Thumbnails
2. Cart Duplicate Warning
3. Heading Translator
4. Product Info Layout
5. Search Columns
6. Force Listing Images
7. Listing Hover
8. Orders Grid & Infinite Scroll
9. Circle Favorite Toggle
10. Author Favorite Toggle
11. Wishlist Toggle
12. Favorite Authors Infinite Scroll
13. Wishlist Infinite Scroll
14. VPN Link Handler
```

Adjust only when real dependencies discovered in the source make another order safer.

---

# 79. Long-Term Development Workflow

After `1.0.0`:

```text
request or bug report
    -> identify module
    -> edit module or shared helper
    -> increment master version
    -> rebuild dist
    -> test affected feature
    -> run relevant integration regressions
    -> update CHANGELOG
    -> commit
    -> push/release
    -> Tampermonkey updates the one installed master script
```

Do not recreate standalone userscripts for new Melonbooks features unless there is a deliberate architectural reason.

---

# 80. Final Agent Deliverables

The migration project should eventually contain:

```text
src\main.js
src\script-info.js
src\core\...
src\modules\search-columns.js
src\modules\product-info-layout.js
src\modules\cart-duplicate-warning.js
src\modules\force-listing-images.js
src\modules\force-detail-thumbnails.js
src\modules\orders-grid-infinite-scroll.js
src\modules\favorite-circle-toggle.js
src\modules\favorite-author-toggle.js
src\modules\listing-hover.js
src\modules\heading-translator.js
src\modules\vpn-link-handler.js
src\modules\favorite-authors-infinite-scroll.js
src\modules\wishlist-toggle.js
src\modules\wishlist-infinite-scroll.js
legacy\standalone\<15 original user.js files>
dist\Melonbooks - Enhancements.user.js
docs\ARCHITECTURE.md
docs\FEATURE_MATRIX.md
docs\IMPORT_MANIFEST.md
docs\IMPORT_NOTES.md
docs\MIGRATION_STATUS.md
docs\TESTING.md
tools\build.mjs
package.json
package-lock.json
README.md
CHANGELOG.md
LICENSE
.gitignore
.github\workflows\build.yml
```

Final migration report should state:

```text
15 source userscripts discovered
14 distinct intended features
number migrated
number deferred
duplicate translator resolution
master version
all persistent storage keys retained/migrated
manual tests completed
known issues
latest commit hash
GitHub repository URL
raw userscript install URL
```

---

# 81. Core Principle

The repository exists to solve the maintenance problem created by dozens of separately installed scripts.

The desired result is not:

```text
one enormous source file
```

It is:

```text
one installable distribution
many small maintainable modules
one repository
one build
one release version
```

Preserve existing behavior first. Refactor only after parity is demonstrated.
