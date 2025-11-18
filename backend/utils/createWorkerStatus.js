const db = require("../config/db");

// type = "assigned" or "feedback"
const createWorkerStatus = (worker_id, location) => {
  const sql = `INSERT INTO worker_status (worker_id, location) VALUES (?, ?)`;
  db.query(sql, [worker_id, location], (err) => {
    if(err) console.error("Worker status error:", err);
  });
};

module.exports = { createWorkerStatus };