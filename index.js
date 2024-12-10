// app.js
const express = require('express');
const path = require('path');

require("./extras/consolePrefixes");
const initializeErrorsTable = require('./database/initDatabase');
const overrideConsoleMethods = require('./extras/consoleLogging');
const db = require('./database/database');

const app = express();
const port = 4000;

// Middleware Setup
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
  return res.redirect("/login");
});

// Login page and handler
app.get('/login', (req, res) => {
  console.info("test info message on login");
  return res.render("layout", {
    filename: `index`
  });
});

// Initialize error logging and start the server
(async () => {
  let isLoggingEnabled = false;

  try {
    isLoggingEnabled = await initializeErrorsTable();
  } catch (err) {
    console.warn("Unexpected error during error logging initialization:", err.message);
    // isLoggingEnabled remains false
  }

  // Override console methods if logging is enabled
  overrideConsoleMethods(isLoggingEnabled);

  // Start the server
  app.listen(port, () => console.log(`App running at http://localhost:${port}`));
})();

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
  try {
    await db.closeAsync();
    console.log("Database connection closed.");
  } catch (err) {
    console.error("Error closing database connection:", err.message);
  } finally {
    process.exit(0);
  }
});
