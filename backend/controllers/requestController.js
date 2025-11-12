const db = require("../config/db");


//Create new req
const createRequest = (req, res) => {
  const { request_type, description, location, priority } = req.body;
  const user_id = req.user.id; // from JWT token

  if (!request_type || !location) {
    return res.status(400).json({ message: "Request type and location required" });
  }

  const sql = `
    INSERT INTO requests (user_id, request_type, description, location, priority)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [user_id, request_type, description, location, priority || "normal"], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.status(201).json({ message: "Request submitted successfully" });
  });
};


//get req
const getRequests = (req, res) => {
  const { role, id: user_id } = req.user;
  const { status } = req.query; // query filter e.g. /api/requests?status=pending

  let sql = "";
  let params = [];

  if (role === "admin") {
    sql = `
      SELECT r.*, u.name AS user_name, u.email AS user_email
      FROM requests r
      JOIN users u ON r.user_id = u.id
      ${status ? "WHERE r.status = ?" : ""}
      ORDER BY r.created_at DESC
    `;
    if (status) params.push(status);

  } else if (role === "worker") {
    sql = `
      SELECT r.*, u.name AS user_name, u.email AS user_email
      FROM requests r
      JOIN users u ON r.user_id = u.id
      WHERE r.assigned_worker_id = ?
      ${status ? "AND r.status = ?" : ""}
      ORDER BY r.created_at DESC
    `;
    params.push(user_id);
    if (status) params.push(status);

  } else {
    sql = `
      SELECT * FROM requests
      WHERE user_id = ?
      ${status ? "AND status = ?" : ""}
      ORDER BY created_at DESC
    `;
    params.push(user_id);
    if (status) params.push(status);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    res.json(results);
  });
};




// Update req status (Admin)
const updateRequestStatus = (req, res) => {
  const { id } = req.params;
  const { status, assigned_worker_id } = req.body;

  const validStatuses = ["pending", "assigned", "in_progress", "completed", "rejected"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const sql = `
    UPDATE requests SET status = ?, assigned_worker_id = ?
    WHERE id = ?
  `;

  db.query(sql, [status, assigned_worker_id || null, id], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: `Request status updated to ${status}` });
  });
};

// Cancel a pending request (Citizen)
const cancelRequest = (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id; // from JWT

  // Only allow cancelling pending requests owned by this user
  const checkSql = `
    SELECT * FROM requests WHERE id = ? AND user_id = ? AND status = 'pending'
  `;

  db.query(checkSql, [id, user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (results.length === 0) {
      return res
        .status(403)
        .json({ message: "You can only cancel your own pending requests" });
    }

    const updateSql = `
      UPDATE requests SET status = 'cancelled' WHERE id = ?
    `;

    db.query(updateSql, [id], (err2) => {
      if (err2) return res.status(500).json({ message: "Database error", error: err2 });
      res.json({ message: "Request cancelled successfully" });
    });
  });
};


//WORKER ACCEPT / REJECT TASK 
const workerAction = (req, res) => {
  const { id } = req.params; // request id
  const { action } = req.body; // "accept" or "reject"
  const worker_id = req.user.id;

  if (!["accept", "reject"].includes(action)) {
    return res.status(400).json({ message: "Invalid action" });
  }

  let sql, params;

  if (action === "accept") {
    sql = "UPDATE requests SET status = 'in_progress' WHERE id = ? AND assigned_worker_id = ?";
    params = [id, worker_id];
  } else if (action === "reject") {
    sql = "UPDATE requests SET status = 'pending', assigned_worker_id = NULL WHERE id = ? AND assigned_worker_id = ?";
    params = [id, worker_id];
  }

  db.query(sql, params, (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Task not found or not assigned to you" });
    }
    res.json({ message: `Task ${action === "accept" ? "accepted" : "rejected"} successfully` });
  });
};


module.exports = { createRequest, getRequests, updateRequestStatus, cancelRequest, workerAction };
