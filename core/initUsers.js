// core/initUsers.js
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const db = require('./database'); // Ensure database.js exports the db object

// Initialize the database with users and tokens tables
const initializeUsers = () => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // Create users table if it doesn't exist
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    display_name TEXT,
                    title TEXT,
                    is_admin BOOLEAN DEFAULT false
                )
            `, async (err) => {
                if (err) return reject(err);
                // Check if any users exist
                db.get(`SELECT COUNT(*) as count FROM users`, async (err, row) => {
                    if (err) return reject(err);
                    if (row.count === 0) {
                        // No users, create default root user
                        const hashedPassword = await bcrypt.hash(process.env.INITIAL_ROOT_PASSWORD, 10);
                        db.run(`INSERT INTO users (username, password, is_admin) VALUES (?, ?, true)`, ['root', hashedPassword], (err) => {
                            if (err) return reject(err);
                            console.log("Root user created with username 'root' and password 'root'.");
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            });

            // Create tokens table if it doesn't exist
            db.run(`
                CREATE TABLE IF NOT EXISTS tokens (
                    token TEXT PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    expires_at INTEGER NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            `, (err) => {
                if (err) return reject(err);
                // Tokens table created or already exists
            });
        });
    });
};

// Function to retrieve a user by username
const getUserByUsername = (username) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

// Function to retrieve a user by ID
const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

// Function to create a new token
const createToken = (userId) => {
    return new Promise((resolve, reject) => {
        const token = uuidv4();
        const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour in milliseconds
        db.run(`INSERT INTO tokens (token, user_id, expires_at) VALUES (?, ?, ?)`, [token, userId, expiresAt], (err) => {
            if (err) return reject(err);
            resolve(token);
        });
    });
};

// Function to verify a token
const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        const currentTime = Date.now();
        db.get(`SELECT * FROM tokens WHERE token = ? AND expires_at > ?`, [token, currentTime], (err, row) => {
            if (err) return reject(err);
            resolve(row); // Returns the token row if valid, otherwise null
        });
    });
};

// Function to delete a token (for logout)
const deleteToken = (token) => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM tokens WHERE token = ?`, [token], (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

// Function to close the database connection gracefully
const closeDatabase = () => {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

module.exports = {
    initializeUsers,
    getUserByUsername,
    getUserById,
    createToken,
    verifyToken,
    deleteToken,
    closeDatabase
};
