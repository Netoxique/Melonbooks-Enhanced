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
      }, { timeout: 1500 });
    } else {
      setTimeout(() => {
        try {
          callback();
        } catch (error) {
          console.error('[Melonbooks Enhancements][lifecycle] Error in onDocumentIdle callback:', error);
        }
      }, 50);
    }
  };

  if (document.readyState === 'complete') {
    runIdle();
  } else {
    window.addEventListener('load', () => {
      runIdle();
    }, { once: true });
  }
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
    default:
      onDomReady(callback);
      break;
  }
}
