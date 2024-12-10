// initDatabase.js
const db = require('./database');

async function initializeConsoleMessagesTable() {
  try {
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS console_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.info("Console Messages table exists. Logging (should be) enabled.");
    return true; // Logging enabled
  } catch (err) {
    console.warn("Error creating console messages table:", err.message);
    console.warn("Logging disabled.");
    return false; // Logging disabled
  }
}

module.exports = initializeConsoleMessagesTable;
