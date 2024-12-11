// core/initPermissions.js
const db = require('./database');

// Initialize permissions table and seed initial permissions
const initializePermissions = async () => {
    try {
        await createPermissionsTable();
        const count = await getPermissionsCount();

        if (count === 0) {
            // Add all necessary permissions here
            const initialPermissions = [
                'createUser',
                'view_adminDashboard',
                'view_reports',
                // Add more permissions as needed
            ];
            await seedPermissions(initialPermissions);
            console.log("Permissions table initialized with default actions:", initialPermissions);
        } else {
            console.log("Permissions table already initialized.");
        }
    } catch (err) {
        console.error("Error initializing permissions:", err.message);
        throw err;
    }
};

// Create the permissions table if it doesn't exist
const createPermissionsTable = () => {
    return new Promise((resolve, reject) => {
        db.run(`
            CREATE TABLE IF NOT EXISTS permissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                action TEXT UNIQUE NOT NULL
            )
        `, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

// Seed the permissions table with default values
const seedPermissions = (actions) => {
    return new Promise((resolve, reject) => {
        const placeholders = actions.map(() => '(?)').join(',');
        db.run(
            `INSERT INTO permissions (action) VALUES ${placeholders}`,
            actions,
            (err) => {
                if (err) return reject(err);
                resolve();
            }
        );
    });
};

// Get the count of rows in the permissions table
const getPermissionsCount = () => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) AS count FROM permissions`, (err, row) => {
            if (err) return reject(err);
            resolve(row.count);
        });
    });
};

// Add a new permission
const addPermission = (action) => {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO permissions (action) VALUES (?)`, [action], (err) => {
            if (err) return reject(new Error(`Error adding permission '${action}': ${err.message}`));
            resolve();
        });
    });
};

// Get all permissions
const getPermissions = () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM permissions`, [], (err, rows) => {
            if (err) return reject(new Error(`Error fetching permissions: ${err.message}`));
            resolve(rows);
        });
    });
};

module.exports = {
    initializePermissions,
    addPermission,
    getPermissions,
};
