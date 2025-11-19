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

const getFreeWorkers = (req, res) => {
    const { location } = req.query;

    if (!location) {
        return res.status(400).json({ message: "Location is required" });
    }

   const sql = `
        SELECT 
            ws.worker_id AS id, 
            u.name
        FROM worker_status ws
        JOIN users u ON ws.worker_id = u.id
        WHERE ws.location = ? 
        AND ws.status = 'free'
    `;
    console.log("Location param:", req.query.location);


    db.query(sql, [location], (err, results) => {
        if (err) {
            console.error("Fetch free workers error:", err);
            return res.status(500).json({ message: "Database error" });
        }

         console.log("Location param:", location, "| Type:", typeof location);

         console.log("Query results:", results);  
        res.json(results);
    });
};

module.exports = {
    getAllUsers,
    getAllWorkers,
    getAllAdmins,
    getFreeWorkers
};
