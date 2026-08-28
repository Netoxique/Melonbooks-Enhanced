# Import Notes & Reconciliation

## Overview
The source material was imported from `_import/tampermonkey_scripts.zip` into `legacy/standalone/`.
The archive contained 15 `.user.js` files, 15 `.options.json` files, and 15 `.storage.json` files.

## Storage and Options Analysis
- All 15 Tampermonkey options JSON files mark their respective scripts as `enabled: true`.
- All 15 Tampermonkey storage JSON files contain `{}` (empty object), confirming no private Tampermonkey GM storage was used that required migration.
- Two scripts use browser native `localStorage` / `sessionStorage`:
  - `Melonbooks - Expand Search Columns`:
    - `localStorage["mb_column_adjuster_column_count"]` (default: 12)
    - `localStorage["mb_column_adjuster_side_padding"]` (default: 16)
  - `Melonbooks - My Orders Product Grid & Infinite Scroll`:
    - `localStorage["melonbooksOrdersColumnCount"]` (default: 5)
    - `localStorage["melonbooksOrdersProductSpacingPx"]` (default: 0)
    - `sessionStorage["melonbooksOrdersDefaultPeriodApplied:<year>"]` (tracks default 1-year order range application per session)

## English Heading Translator Reconciliation
Two source files existed under identical script names and versions:
1. `Melonbooks - English Heading Translator.user.js` (v1.0.4, SHA-256 prefix: `76d43eadd4f9d701`)
2. `Melonbooks - English Heading Translator (1).user.js` (v1.0.4, SHA-256 prefix: `cdcf2744c22d425e`)

### Diff Summary
```diff
--- "legacy/standalone/Melonbooks - English Heading Translator.user.js"
+++ "legacy/standalone/Melonbooks - English Heading Translator (1).user.js"
@@ -24,7 +24,7 @@
       ["作品情報", "Product Information"],
       ["作品詳細", "Product Details"],
       ["特典情報", "Bonus Information"],
-      ["サークル(先生)からのコメント/作品詳細", "Circle (Creator) Comments / Product Details"],
+      ["サークル(先生)からのコメント/作品詳細", "Circle/Creator Comments and Product Details"],
       ["スタッフのオススメポイント", "Staff Recommendation"],
       ["このレーベルの他の作品", "Other Works from This Label"],
       ["このサークルのほかの作品", "Other Works from This Circle"],
@@ -80,7 +80,6 @@
       ["『ダウンロード作品』ランキング", "Download Works Ranking"],
       ["あなたへのオススメ", "Recommendations for You"],
       ["お知らせ", "Notices"],
-      ["【ランキング】", "Ranking"],
```

### Reconciliation Decision
- Base module: `Melonbooks - English Heading Translator (1).user.js` is the later export (modified timestamp: 1781659274320 vs 1781624222758).
- Dictionary merge:
  - `"サークル(先生)からのコメント/作品詳細"`: Retained `"Circle/Creator Comments and Product Details"`.
  - `"【ランキング】"`: Retained `["【ランキング】", "Ranking"]` from variant 1 to ensure full coverage of bracketed ranking headers across Melonbooks pages.
- Both legacy files remain preserved verbatim in `legacy/standalone/`.
