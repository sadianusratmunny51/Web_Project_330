const db = require("../config/db");

function createUserNotification(user_id, worker_id, type, request_id, message) {
    const sql = `
        INSERT INTO user_notifications (user_id, worker_id, type, request_id, message)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [user_id, worker_id, type, request_id, message], (err) => {
        if (err) console.log("Notification error:", err);
    });
}

module.exports = { createUserNotification };
