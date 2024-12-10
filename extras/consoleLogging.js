// consoleLogging.js
const db = require('../database/database');

// Preserve original console methods
const originalConsole = {
  log: console.log,
  info: console.info,
  warn: console.warn,
  error: console.error,
};

/**
 * Converts arguments to a single string.
 * @param {Array} args - The console arguments.
 * @returns {string} - The concatenated string.
 */
function argsToString(args) {
  return args.map(arg => {
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg);
      } catch (e) {
        return String(arg);
      }
    }
    return String(arg);
  }).join(' ');
}

/**
 * Overrides console methods to log messages to the database.
 * @param {boolean} isLoggingEnabled - Flag indicating if logging is enabled.
 */
function overrideConsoleMethods(isLoggingEnabled) {
  if (!isLoggingEnabled) {
    // If logging is disabled, do not override console methods
    return;
  }

  console.log = async (...args) => {
    const message = argsToString(args);
    try {
      await db.runAsync(`INSERT INTO errors (type, message) VALUES (?, ?)`, ['log', message]);
    } catch (err) {
      originalConsole.error("Failed to log to database:", err.message);
    }
    originalConsole.log(...args);
  };

  console.info = async (...args) => {
    const message = argsToString(args);
    try {
      await db.runAsync(`INSERT INTO errors (type, message) VALUES (?, ?)`, ['info', message]);
    } catch (err) {
      originalConsole.error("Failed to log to database:", err.message);
    }
    originalConsole.info(...args);
  };

  console.warn = async (...args) => {
    const message = argsToString(args);
    try {
      await db.runAsync(`INSERT INTO errors (type, message) VALUES (?, ?)`, ['warn', message]);
    } catch (err) {
      originalConsole.error("Failed to log to database:", err.message);
    }
    originalConsole.warn(...args);
  };

  console.error = async (...args) => {
    const message = argsToString(args);
    try {
      await db.runAsync(`INSERT INTO errors (type, message) VALUES (?, ?)`, ['error', message]);
    } catch (err) {
      originalConsole.error("Failed to log to database:", err.message);
    }
    originalConsole.error(...args);
  };
}

module.exports = overrideConsoleMethods;
