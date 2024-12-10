// app.js
const express = require('express');
const path = require('path');

require("./core/consolePrefixes");
const initializeConsoleMessagesTable = require('./core/initDatabase');
const overrideConsoleMethods = require('./core/consoleLogging');
const db = require('./core/database');

const app = express();
const port = 4000;

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  return res.redirect("/login");
});

app.get('/login', (req, res) => {
  return res.render("layout", {
    filename: `index`
  });
});

(async () => {
  let isLoggingEnabled = false;

  try {
    isLoggingEnabled = await initializeConsoleMessagesTable();
  } catch (err) {
    console.warn("Unexpected error during error logging initialization:", err.message);
  }

  overrideConsoleMethods(isLoggingEnabled);

  app.listen(port, () => console.log(`App running at http://localhost:${port}`));
})();

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
