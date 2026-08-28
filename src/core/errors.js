/**
 * Central error handling and logging for Melonbooks Enhanced.
 */

const PREFIX = '[Melonbooks Enhancements]';

export class Logger {
  static debugMode = false;

  static setDebug(enabled) {
    Logger.debugMode = Boolean(enabled);
  }

  static log(...args) {
    console.log(PREFIX, ...args);
  }

  static info(...args) {
    console.info(PREFIX, ...args);
  }

  static warn(...args) {
    console.warn(PREFIX, ...args);
  }

  static error(...args) {
    console.error(PREFIX, ...args);
  }

  static debug(...args) {
    if (Logger.debugMode) {
      console.debug(PREFIX, ...args);
    }
  }

  static moduleError(moduleId, message, error) {
    console.error(`${PREFIX}[${moduleId}] ${message}`, error);
  }

  static moduleWarn(moduleId, ...args) {
    console.warn(`${PREFIX}[${moduleId}]`, ...args);
  }

  static moduleDebug(moduleId, ...args) {
    if (Logger.debugMode) {
      console.debug(`${PREFIX}[${moduleId}]`, ...args);
    }
  }
}

export function withErrorBoundary(moduleId, fn) {
  return function wrapped(...args) {
    try {
      const result = fn.apply(this, args);
      if (result && typeof result.catch === 'function') {
        return result.catch((err) => {
          Logger.moduleError(moduleId, 'Unhandled promise rejection in module execution:', err);
        });
      }
      return result;
    } catch (err) {
      Logger.moduleError(moduleId, 'Unhandled exception in module execution:', err);
    }
  };
}
