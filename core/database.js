// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { promisify } = require('util');

const dbPath = path.join(__dirname, '../database/core.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// Promisify the necessary db methods
db.runAsync = promisify(db.run).bind(db);
db.getAsync = promisify(db.get).bind(db);
db.allAsync = promisify(db.all).bind(db);
db.closeAsync = promisify(db.close).bind(db);

module.exports = db;
