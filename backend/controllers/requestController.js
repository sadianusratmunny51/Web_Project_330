const db = require("../config/db");

const { createNotification } = require("../utils/notifications");

const { createWorkerNotification } = require("../utils/workerNotifications");
const { createUserNotification } = require("../utils/createUserNotification");

//Create new req
const createRequest = (req, res) => {
  const { request_type, description, location, priority } = req.body;
  const user_id = req.user.id; // from JWT token

  const waste_image = req.file ? req.file.path : null;

  if (!request_type || !location) {
    return res.status(400).json({ message: "Request type and location required" });
  }

  const sql = `
    INSERT INTO requests (user_id, request_type, description, location, priority, waste_image)
    VALUES (?, ?, ?, ?, ?, ?)
  `;


  db.query(
    sql,
    [user_id, request_type, description, location, priority || "normal", waste_image],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });

      let rewardSql = "";

      if (request_type === "waste") {
        rewardSql = `
          UPDATE users
          SET waste_reward_points = waste_reward_points + 2
          WHERE id = ?
        `;
      }
      else if (request_type === "recycling") {
        rewardSql = `
          UPDATE users
          SET recycled_reward_points = recycled_reward_points + 5
          WHERE id = ?
        `;
      }

      if (rewardSql) {
        db.query(rewardSql, [user_id], (err2) => {
          if (err2) console.log("Reward update failed", err2);
        });
      }

      createNotification("request", result.insertId);


      const logsql = `
                    INSERT INTO activity_log (user_id, activity_type, description)
                    VALUES (?, "createRequest", "user create request")
                    `;

      db.query(logsql, [user_id], (err, result) => {
        if (err) reject(err);


        res.status(201).json({
          message: "Request submitted successfully",
          image: waste_image
        });
      });

    }
  );
};


//get req
const getRequests = (req, res) => {
  const { role, id: user_id } = req.user;
  const { status, userId, workerId } = req.query;

  let sql = "";
  let params = [];

  if (role === "admin") {
    sql = `
      SELECT r.*, u.name AS user_name, u.email AS user_email
      FROM requests r
      JOIN users u ON r.user_id = u.id
      WHERE 1=1
    `;

    if (workerId) {
      sql += " AND r.assigned_worker_id = ?";
      params.push(workerId);
    }

    if (userId) {
      sql += " AND r.user_id = ?";
      params.push(userId);
    }

    if (status) {
      sql += " AND r.status = ?";
      params.push(status);
    }

    sql += " ORDER BY r.created_at DESC";
  }

  else if (role === "worker") {
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
  }

  else {
    sql = `
      SELECT *
      FROM requests
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

  // GET REQUEST OWNER FIRST
  const findUserSql = "SELECT user_id FROM requests WHERE id = ?";

  db.query(findUserSql, [id], (err2, userResult) => {
    if (err2 || userResult.length === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    const ownerId = userResult[0].user_id;

    const sql = `
      UPDATE requests SET status = ?, assigned_worker_id = ?
      WHERE id = ?
    `;

    db.query(sql, [status, assigned_worker_id || null, id], (err, result) => {
      if (err) return res.status(500).json({ message: "Database error" });

      // IF ASSIGNED
      if (status === "assigned" && assigned_worker_id) {
        createWorkerNotification(assigned_worker_id, "assigned", id);

        createUserNotification(
          ownerId,
          assigned_worker_id,
          "assigned",
          id,
          `Your request #${id} has been assigned to a worker.`
        );
      }

      // IF REJECTED
      if (status === "rejected") {
        createUserNotification(
          ownerId,
          null,
          "rejected",
          id,
          `Your request #${id} has been rejected by the admin.`
        );
      }

      res.json({ message: `Request status updated to ${status}` });
    });
  });
};



// Cancel a pending request (Citizen)
const cancelRequest = (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  const checkSql = `
    SELECT * FROM requests 
    WHERE id = ? AND user_id = ? AND status = 'pending'
  `;

  db.query(checkSql, [id, user_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (results.length === 0) {
      return res.status(403).json({ message: "You can only cancel your own pending requests" });
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



module.exports = { createRequest, getRequests, updateRequestStatus, cancelRequest };