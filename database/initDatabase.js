// initDatabase.js
const db = require('./database');

/**
 * Initializes the errors table.
 * @returns {Promise<boolean>} - Resolves to true if successful, false otherwise.
 */
async function initializeErrorsTable() {
  try {
    await db.runAsync(`
      CREATE TABLE IF NOT EXISTS errors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.info("Errors table exists. Enabling error logging...");
    return true; // Logging enabled
  } catch (err) {
    console.warn("Error creating errors table:", err.message);
    console.warn("Error logging disabled.");
    return false; // Logging disabled
  }
}

module.exports = initializeErrorsTable;
