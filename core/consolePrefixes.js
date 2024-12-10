// Define ANSI color codes
const colors = {
    reset: "\x1b[0m",
    red: "\x1b[31m",
    magenta: "\x1b[35m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
};

// Save original console methods
const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
};

// Helper function to format messages with color
function formatMessage(color, prefix, args) {
    const coloredPrefix = `${color}${prefix}${colors.reset}`;
    return [coloredPrefix, ...args];
}

// Override console.log with blue [#] prefix
console.log = (...args) => {
    originalConsole.log(...formatMessage(colors.blue, '[#]', args));
};

// Override console.info with magenta [i] prefix
console.info = (...args) => {
    originalConsole.info(...formatMessage(colors.magenta, '[i]', args));
};

// Override console.warn with yellow [w] prefix
console.warn = (...args) => {
    originalConsole.warn(...formatMessage(colors.yellow, '[w]', args));
};

// Override console.error with red [!] prefix
console.error = (...args) => {
    originalConsole.error(...formatMessage(colors.red, '[!]', args));
};

// Optionally, export the enhanced console if needed elsewhere
module.exports = console;