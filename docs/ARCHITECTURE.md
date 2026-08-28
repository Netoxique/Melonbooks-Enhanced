# Architecture Guide

This document details the architectural principles, runtime lifecycle, error isolation strategies, and styling model for **Melonbooks Enhanced**.

---

## 1. High-Level Design Principles

1. **Modular Feature Separation**: Each distinct feature is implemented as an isolated module under `src/modules/` implementing a standard interface (`id`, `name`, `lifecycle`, `matches(context)`, `init(context)`).
2. **Centralized Execution & Lifecycle Scheduling**: All modules are coordinated by `src/main.js` and `src/core/lifecycle.js`, ensuring execution at the correct document stage (`document-start`, `dom-ready`, `document-end`, `document-idle`).
3. **Strict Error Isolation**: Every module execution is guarded by `withErrorBoundary`, preventing an unexpected error or DOM change in one module from affecting other modules.
4. **Behavioral & Data Parity**: Legacy storage keys, URL patterns, DOM selectors, CSS variables, and timing delays are preserved without regressions.

---

## 2. Module Interface

Each module conforms to the following contract:

```javascript
export const ExampleModule = {
  id: 'example-module',              // Unique slug
  name: 'Example Module',            // Human-readable title
  lifecycle: 'document-start',       // 'document-start' | 'dom-ready' | 'document-end' | 'document-idle'

  matches(context) {
    // Return true if this module should run on the current URL/environment
    return context.route === 'melonbooks-product';
  },

  init(context) {
    // Main module setup logic
  }
};
```

---

## 3. Execution Context & Routing

When the userscript initializes at `@run-at document-start`, `classifyRoute` and `createExecutionContext` inspect `window.location` to produce an execution context object:

```javascript
{
  location: window.location,
  route: 'melonbooks-product',       // 'melonbooks-top' | 'melonbooks-search' | 'melonbooks-product' | ... | 'outlook'
  isMelonbooks: true,
  isOutlook: false
}
```

Modules evaluate `matches(context)` during bootstrap. If matched, the module is scheduled into the lifecycle runner for its designated phase.

---

## 4. Lifecycle Phases

| Phase | Timing / Trigger | Intended Use |
|---|---|---|
| `document-start` | Immediate script load (`document.readyState === 'loading'`) | CSS injection, mutation observer setup, request interception, URL hash handling |
| `dom-ready` | `DOMContentLoaded` or immediate if already loaded | Initial DOM inspection, element injection, layout modifications |
| `document-end` | Document parsed | High-priority page interactions |
| `document-idle` | `window.requestIdleCallback` / fallback timer | Infinite scroll initialization, non-blocking background scanners |

---

## 5. Style Injection & Scoping

Styles are dynamically managed via `src/core/styles.js`:
- Privilege check: Uses `GM_addStyle` if available in the userscript environment.
- Fallback: Injects or updates an HTML `<style id="mb-style-${id}">` tag into `document.head` or `document.documentElement`.
- Scoping: Classes and IDs are namespaced with `mb-` or `mb_` to prevent collisions with host site stylesheets and third-party scripts.

---

## 6. Storage Model

Persistent configurations use standard `localStorage` and `sessionStorage` with preserved legacy keys:
- `mb_column_adjuster_column_count`
- `mb_column_adjuster_side_padding`
- `melonbooksOrdersColumnCount`
- `melonbooksOrdersProductSpacingPx`
- `melonbooksOrdersDefaultPeriodApplied:<path>`

All storage reads and writes are wrapped in `try/catch` blocks to guard against private browsing restrictions and quota exceptions.
