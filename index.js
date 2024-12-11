require('dotenv').config(); // Load environment variables
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');

const beautifyConsole = require("./core/consolePrefixes");
const initializeConsoleMessagesTable = require('./core/initDatabase');
const overrideConsoleMethods = require('./core/consoleLogging');
const userModule = require('./core/initUsers');
const permissionModule = require("./core/initPermissions");

const app = express();
const port = process.env.PORT || 4000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap")));
app.use("/bootstrap-icons", express.static(path.join(__dirname, "node_modules/bootstrap-icons")));

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Redirect root to login
app.get("/", (req, res) => {
    return res.redirect("/login");
});

// Render the login page
app.get('/login', (req, res) => {
    return res.render("layout", {
        filename: `start`
    });
});

// Middleware factory to verify if user has permission for a given action
function verifyPermission(getAction) {
  return async (req, res, next) => {
    const action = getAction(req);
    console.log("Action:", action); // Debug

    try {
      if (req.user.isAdmin) {
        console.log("Admin has logged in: ", req.user); // Debug
        return next();
      }

      const userPermissions = await userModule.getUserPermissions(req.user.id);
      console.log("User Permissions:", userPermissions); // Debug

      if (userPermissions.includes(action)) {
        return next();
      }

      return res.status(403).json({ message: "Forbidden: You don't have permission for this action." });
    } catch (err) {
      console.error("Permission verification error:", err);
      return res.status(500).json({ message: "Internal server error." });
    }
  };
}

// Middleware to verify token using 'x-bearer' header
async function verifyTokenMiddleware(req, res, next) {
  const bearerHeader = req.headers['x-bearer'];

  if (!bearerHeader) return res.status(401).json({ message: 'No token provided' });
  const token = bearerHeader;

  try {
    const tokenData = await userModule.verifyToken(token);

    if (!tokenData) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    const user = await userModule.getUserById(tokenData.user_id);

    if (!user) {
      return res.status(403).json({ message: 'Invalid token: user does not exist' });
    }

    req.user = {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      title: user.title,
      isAdmin: user.is_admin,
    };
    req.token = token;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// API endpoint for login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await userModule.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Create a token
    const token = await userModule.createToken(user.id);

    return res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// API endpoint for logout
app.post('/api/logout', verifyTokenMiddleware, async (req, res) => {
  const token = req.token;

  try {
    await userModule.deleteToken(token);
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// API endpoint for authorized actions (e.g., createUser)
app.post(
  '/api/authorized/:action',
  verifyTokenMiddleware,
  verifyPermission((req) => req.params.action), // Extract action from URL params
  async (req, res) => {
    const { action } = req.params;
    console.log(`Action: ${action}`); // Debug
    console.log(`Request Body:`, req.body); // Debug

    if (action === "createUser") {
      const { username, password, emailAddress, displayName, title, permissions } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
      }

      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await userModule.addUser({ username, password: hashedPassword, emailAddress, displayName, title });

        // Assign permissions to the user
        if (permissions && Array.isArray(permissions)) {
          for (const perm of permissions) {
            await userModule.addUserPermission(userId, perm);
          }
        }

        // Optionally, assign all permissions if the user is an admin
        // You can include an 'isAdmin' flag in the request body if needed

        return res.json({ message: "User created successfully." });
      } catch (err) {
        console.error("Error creating user:", err);
        return res.status(500).json({ message: "Internal server error." });
      }
    }

    return res.status(400).json({ message: `Action '${action}' is not supported.` });
  }
);

// API endpoint to fetch protected dashboard data
app.get(
  '/api/dashboard-data/:panelContext',
  verifyTokenMiddleware,
  verifyPermission((req) => `view_${req.params.panelContext}`), // Derive permission from panelContext
  async (req, res) => {
    const { panelContext } = req.params;
    console.log(`Fetching panel context: ${panelContext}`); // Debug

    try {
      res.render(`panel/${panelContext}`, req.user);
    } catch (err) {
      console.error(`Error rendering panel ${panelContext}:`, err);
      res.status(500).render(`panel/error.ejs`, {
        username: req.user.username,
        errorMessage: err.message || 'An unexpected error occurred.',
      });
    }
  }
);

// Render the dashboard page
app.get('/dashboard', (req, res) => {
  return res.render('layout', { 
    filename: 'context', 
  });
});

// Start the server after initializing the database, users, and permissions
(async () => {
  try {
    await userModule.initializeUsers();
    console.log("Users and tokens tables initialized.");
  } catch (err) {
    console.error("Initialization error:", err);
    process.exit(1);
  }

  try {
    await permissionModule.initializePermissions();
    console.log("Permissions table initialized.");
  } catch (err) {
    console.error("Error initializing permissions:", err);
    process.exit(1);
  }

  try {
    let isLoggingEnabled = false;
    isLoggingEnabled = await initializeConsoleMessagesTable();
    overrideConsoleMethods(isLoggingEnabled);
  } catch (err) {
    console.warn("Unexpected error during error logging initialization:", err.message);
  }

  app.listen(port, () => console.log(`App running at http://localhost:${port}`));
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log("\nGracefully shutting down from SIGINT (Ctrl+C)");
  try {
    await userModule.closeDatabase();
    console.log("Database connection closed.");
  } catch (err) {
    console.error("Error closing database connection:", err.message);
  } finally {
    process.exit(0);
  }
});
