const db = require("../config/db");

// type = "assigned" or "feedback"
const createWorkerNotification = (worker_id, type, reference_id) => {
  const sql = `INSERT INTO worker_notifications (worker_id, type, reference_id) VALUES (?, ?, ?)`;
  db.query(sql, [worker_id, type, reference_id], (err) => {
    if(err) console.error("Worker Notification error:", err);
  });
};

module.exports = { createWorkerNotification };