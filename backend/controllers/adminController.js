const db = require("../config/db");

// GET all users
//http://localhost:5000/api/admin/users
const getAllUsers = (req, res) => {
    const sql = `SELECT id, name, email, role, profile_image,phone FROM users WHERE role='citizen'`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        res.json({
            total_users: results.length,
            users: results
        });
    });
};

// GET all workers
//http://localhost:5000/api/admin/workers
const getAllWorkers = (req, res) => {
    const sql = `SELECT id, name, email, role, profile_image FROM users WHERE role='worker'`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        res.json({
            total_workers: results.length,
            workers: results
        });
    });
};

// GET all admins
//http://localhost:5000/api/admin/admins
const getAllAdmins = (req, res) => {
    const sql = `SELECT id, name, email, role, profile_image FROM users WHERE role='admin'`;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        res.json({
            total_admins: results.length,
            admins: results
        });
    });
};

module.exports = {
    getAllUsers,
    getAllWorkers,
    getAllAdmins,
};
