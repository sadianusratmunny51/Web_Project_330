// utils/notifications.js
const db = require("../config/db");

const createNotification = (type, reference_id) => {
    const sql = `INSERT INTO notifications (type, reference_id) VALUES (?, ?)`;
    db.query(sql, [type, reference_id], (err) => {
        if (err) console.error("Notification error:", err);
    });
};

module.exports = { createNotification };
