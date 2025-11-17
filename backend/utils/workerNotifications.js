// utils/workerNotifications.js
const db = require("../config/db");

const createWorkerNotification = (type, reference_id) => {
    const sql = `INSERT INTO worker_notifications (type, reference_id) VALUES (?, ?)`;
    db.query(sql, [type, reference_id], (err) => {
        if (err) {
            console.error("Worker Notification Error:", err);
        }
    });
};

module.exports = { createWorkerNotification };
