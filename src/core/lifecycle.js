/**
 * Lifecycle scheduling primitives for the master userscript.
 * The master userscript executes at `@run-at document-start`.
 * Individual modules schedule their execution according to their required timing.
 */

export function onDocumentStart(callback) {
  try {
    callback();
  } catch (error) {
    console.error('[Melonbooks Enhancements][lifecycle] Error in onDocumentStart callback:', error);
  }
}

/**
 * Run as soon as <body> exists. This is earlier than DOMContentLoaded and lets
 * modules install styles/observers while Melonbooks is still constructing the page.
 */
export function onBodyReady(callback) {
  const run = () => {
    queueMicrotask(() => {
      try {
        callback();
      } catch (error) {
        console.error('[Melonbooks Enhancements][lifecycle] Error in onBodyReady callback:', error);
      }
    });
  };

  if (document.body) {
    run();
    return;
  }

  const observer = new MutationObserver(() => {
    if (!document.body) return;
    observer.disconnect();
    run();
  });

  observer.observe(document, {
    childList: true,
    subtree: true
  });
}

export function onDomReady(callback) {
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    queueMicrotask(() => {
      try {
        callback();
      } catch (error) {
        console.error('[Melonbooks Enhancements][lifecycle] Error in onDomReady callback:', error);
      }
    });
  } else {
    const handler = () => {
      document.removeEventListener('DOMContentLoaded', handler);
      try {
        callback();
      } catch (error) {
        console.error('[Melonbooks Enhancements][lifecycle] Error in onDomReady callback:', error);
      }
    };
    document.addEventListener('DOMContentLoaded', handler);
  }
}

export function onDocumentEnd(callback) {
  onDomReady(callback);
}

export function onDocumentIdle(callback) {
  const runIdle = () => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(() => {
        try {
          callback();
        } catch (error) {
          console.error('[Melonbooks Enhancements][lifecycle] Error in onDocumentIdle callback:', error);
        }
      }, { timeout: 250 });
    } else {
      setTimeout(() => {
        try {
          callback();
        } catch (error) {
          console.error('[Melonbooks Enhancements][lifecycle] Error in onDocumentIdle callback:', error);
        }
      }, 0);
    }
  };

  // Idle work no longer waits for window.load. It starts immediately after
  // DOMContentLoaded, so slow images/fonts/analytics cannot delay enhancements.
  onDomReady(runIdle);
}

export function runAt(timing, callback) {
  switch (timing) {
    case 'document-start':
      onDocumentStart(callback);
      break;
    case 'document-end':
      onDocumentEnd(callback);
      break;
    case 'document-idle':
    case 'idle':
    case 'default':
      onDocumentIdle(callback);
      break;
    case 'dom-ready':
      onBodyReady(callback);
      break;
    default:
      onBodyReady(callback);
      break;
  }
}
