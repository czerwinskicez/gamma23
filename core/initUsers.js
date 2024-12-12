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
                        const hashedPassword = await bcrypt.hash(process.env.INITIAL_ROOT_PASSWORD || "root", 10);
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
                    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `, (err) => {
                if (err) console.error("Error creating tokens table:", err);
            });

            // Create user_permissions table if it doesn't exist
            db.run(`
                CREATE TABLE IF NOT EXISTS user_permissions (
                    user_id INTEGER NOT NULL,
                    permission_id INTEGER NOT NULL,
                    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY(permission_id) REFERENCES permissions(id),
                    PRIMARY KEY (user_id, permission_id)
                )
            `, (err) => {
                if (err) console.error("Error creating user_permissions table:", err);
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

// Add a permission to a user
const addUserPermission = (userId, action) => {
    return new Promise(async (resolve, reject) => {
        try {
            const row = await new Promise((res, rej) => {
                db.get(`SELECT id FROM permissions WHERE action = ?`, [action], (err, row) => {
                    if (err) return rej(err);
                    res(row);
                });
            });

            if (!row) return reject(new Error(`Permission '${action}' does not exist`));

            const permissionId = row.id;

            db.run(`INSERT INTO user_permissions (user_id, permission_id) VALUES (?, ?)`, [userId, permissionId], (err) => {
                if (err) return reject(err);
                resolve();
            });
        } catch (err) {
            reject(err);
        }
    });
};

// Get all permissions for a user
const getUserPermissions = (userId) => {
    return new Promise((resolve, reject) => {
        db.all(`
            SELECT p.action FROM permissions p
            INNER JOIN user_permissions up ON up.permission_id = p.id
            WHERE up.user_id = ?
        `, [userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows.map(row => row.action)); // Return an array of actions
        });
    });
};

// Add a new user and return the user ID, then assign 'dashboard' permission
const addUser = ({ username, password, emailAddress, displayName, title }) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO users (username, password, email_address, display_name, title) VALUES (?, ?, ?, ?, ?)`,
            [username, password, emailAddress, displayName, title],
            async function (err) { // Make the callback async to use await
                if (err) {
                    console.error("DB Error creating user:", err.message);
                    return reject(new Error(`Error creating user: ${err.message}`));
                }
                const userId = this.lastID;
                try {
                    // Assign 'dashboard' permission to the new user
                    await addUserPermission(userId, 'dashboard');
                    await addUserPermission(userId, 'view_dashboard');
                    console.log(`'dashboard' permission assigned to user ID ${userId}.`);
                    resolve(userId); // Return the ID of the newly created user
                } catch (permissionErr) {
                    console.error(`Error assigning 'dashboard' permission to user ID ${userId}:`, permissionErr.message);
                    return reject(new Error(`User created, but failed to assign 'dashboard' permission: ${permissionErr.message}`));
                }
            }
        );
    });
};

// Delete user based on userId
const deleteUser = (userId) => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM users WHERE id=?;`, [Number(userId)], async function (err) {
            if(err){
                console.error("Error deleting user: ", err.message);
                return reject(new Error(`Error deleting user: ${err.message}`));
            }
            resolve(false);
        });
    });
};

// User update based on given data
const updateUser = (userId, updates) => {
    return new Promise((resolve, reject) => {
      // Build the dynamic SQL query based on provided fields
      const fields = Object.keys(updates);
  
      if (fields.length === 0) {
        return reject(new Error("No updates provided."));
      }
  
      const setClause = fields.map((field) => `${field} = ?`).join(", ");
      const values = fields.map((field) => updates[field]);
  
      // Append userId to the values array for the WHERE clause
      values.push(userId);
  
      db.run(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        values,
        function (err) {
          if (err) {
            console.error("DB Error updating user:", err.message);
            return reject(new Error(`Error updating user: ${err.message}`));
          }
  
          // Check if a row was actually updated
          if (this.changes === 0) {
            return resolve(false); // No user found with the given ID
          }
  
          resolve(true); // User updated successfully
        }
      );
    });
  };
  

const getAllUsers = () => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT id, username, email_address, display_name, title, is_admin FROM users`,
            [],
            (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            }
        );
    });
};


module.exports = {
    initializeUsers,
    getUserByUsername,
    getUserById,
    createToken,
    verifyToken,
    deleteToken,
    updateUser,
    addUser,
    deleteUser,
    getAllUsers,
    addUserPermission,
    getUserPermissions,
    closeDatabase
};
