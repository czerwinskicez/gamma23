// index.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');

const initializeConsoleMessagesTable = require('./core/initDatabase');
const overrideConsoleMethods = require('./core/consoleLogging');
const userModule = require('./core/initUsers');

const app = express();
const port = process.env.PORT || 4000;

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/bootstrap", express.static(path.join(__dirname, "node_modules/bootstrap")));

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
        filename: `index`
    });
});

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

// Middleware to verify token using 'x-bearer' header
async function verifyTokenMiddleware(req, res, next) {
    const bearerHeader = req.headers['x-bearer'];
    if (!bearerHeader) return res.status(401).json({ message: 'No token provided' });

    const token = bearerHeader;
    if (!token) return res.status(401).json({ message: 'Invalid token format' });

    try {
        const tokenData = await userModule.verifyToken(token);
        if (!tokenData) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }

        // Retrieve user information by ID
        const user = await userModule.getUserById(tokenData.user_id);

        if (!user) {
            return res.status(403).json({ message: 'Invalid token: user does not exist' });
        }

        req.user = { id: user.id, username: user.username };
        req.token = token; // Attach token to request for logout
        next();
    } catch (err) {
        console.error("Token verification error:", err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// API endpoint to fetch protected dashboard data
// app.get('/api/dashboard-data', verifyTokenMiddleware, (req, res) => {
//     res.json({ message: `Welcome, ${req.user.username}!` });
// });
app.get('/api/dashboard-data', verifyTokenMiddleware, (req, res) => {
  res.render('dashboardRender', { username: req.user.username });
});

// Render the dashboard page
app.get('/dashboard', (req, res) => {
    return res.render('layout', { 
        filename: 'dashboard', 
        // You can pass additional variables if needed
    });
});

// Start the server after initializing the database and users
(async () => {
    try {
        await userModule.initializeUsers();
        console.log("Users and tokens tables initialized.");
    } catch (err) {
        console.error("Initialization error:", err);
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
