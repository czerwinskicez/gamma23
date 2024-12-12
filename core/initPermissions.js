const db = require('./database');

// Initialize permissions table and seed initial permissions
const initializePermissions = async () => {
    try {
        await createPermissionsTable();
        const count = await getPermissionsCount();

        if (count === 0) {
            const initialPermissions = [
                'createUser',
                'view_adminDashboard',
                'view_reports',
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

// const getPermissionsCount = () => {
//     return new Promise((resolve, reject) => {
//         db.get(`SELECT COUNT(*) AS count FROM permissions`, (err, row) => {
//             if (err) return reject(err);
//             resolve(row.count);
//         });
//     });
// };

const addPermission = (action) => {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO permissions (action) VALUES (?)`, [action], (err) => {
            if (err) return reject(new Error(`Error adding permission '${action}': ${err.message}`));
            resolve();
        });
    });
};

const getAllPermissions = () => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM permissions`, [], (err, rows) => {
            if (err) return reject(new Error(`Error fetching all permissions: ${err.message}`));
            resolve(rows);
        });
    });
};

// New function to delete permission by ID
const deletePermission = (id) => {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM permissions WHERE id = ?`, [id], function(err) {
            if (err) return reject(new Error(`Error deleting permission with ID ${id}: ${err.message}`));
            if (this.changes === 0) {
                return reject(new Error(`No permission found with ID ${id}.`));
            }
            resolve();
        });
    });
};

module.exports = {
    initializePermissions,
    addPermission,
    getPermissions,
    getAllPermissions,
    deletePermission,
};
