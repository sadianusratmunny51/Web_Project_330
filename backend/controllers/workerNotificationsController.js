
const db = require("../config/db");

// WORKER notifications
const getWorkerNotifications = (req, res) => {
    const worker_id = req.user.id;

    const sql = `
        SELECT *
        FROM worker_notifications
        WHERE worker_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [worker_id], (err, result) => {
        if (err) return res.status(500).json({ message: "DB error" });
        res.json(result);
    });
};

const markWorkerNotificationRead = (req, res) => {
    const { id } = req.params;
    const worker_id = req.user.id;
    // Mark ANY worker notification type as read
    const sql = "UPDATE worker_notifications SET status='read' WHERE id=? AND worker_id=?";
    
    db.query(sql, [id, worker_id], (err, result) => {
        if (err) return res.status(500).json({ message: "DB error" });
        res.json({ message: "Notification marked as read" });
    });
    
};

module.exports = {
    getWorkerNotifications,
    markWorkerNotificationRead
};