

const db = require("../config/db");


const { createNotification } = require("../utils/notifications");

//http://localhost:5000/api/worker/5/action

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

    // Create notification for task action
    createNotification(action === "accept" ? "in_progress" : "rejected", id);

    res.json({ message: `Task ${action === "accept" ? "accepted" : "rejected"} successfully` });
  });


};

//http://localhost:5000/api/worker/5/complete

// WORKER COMPLETES A TASK
const completeTask = (req, res) => {
  const { id } = req.params; // request id
  const worker_id = req.user.id;

  // Only allow completing tasks that are assigned to THIS worker AND currently in_progress
  const checkSql = `
    SELECT * FROM requests 
    WHERE id = ? AND assigned_worker_id = ? AND status = 'in_progress'
  `;

  db.query(checkSql, [id, worker_id], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    if (results.length === 0) {
      return res.status(403).json({
        message: "You can only complete your own in-progress tasks"
      });
    }

    const updateSql = `
      UPDATE requests SET status = 'completed'
      WHERE id = ?
    `;

    db.query(updateSql, [id], (err2) => {
      if (err2) return res.status(500).json({ message: "Database error", error: err2 });

      
      // Create notification for task completion
      createNotification("completed", id);


      // reward for complete a task
      const typeSql = `
        SELECT request_type 
        FROM requests 
        WHERE id = ?
      `;

      db.query(typeSql, [id], (err3, result3) => {
        if (err3) {
          console.log("Failed to fetch request type:", err3);
          return;
        }

        const requestType = result3[0].request_type;

        let rewardColumn = "";
        let rewardPoints = 0;

        if (requestType === "waste") {
          rewardColumn = "waste_reward_points";
          rewardPoints = 50;
        }
        else if (requestType === "recycling") {
          rewardColumn = "recycled_reward_points";
          rewardPoints = 50;
        }

        if (rewardColumn) {
          const rewardSql = `
            UPDATE users
            SET ${rewardColumn} = ${rewardColumn} + ?
            WHERE id = ?
          `;

          db.query(rewardSql, [rewardPoints, worker_id], (err4) => {
            if (err4) console.log("Worker reward update failed:", err4);
            else console.log("Worker reward added!");
          });
        }
      });


      res.json({ message: "Task marked as completed" });
    });
  });
};

module.exports = { workerAction, completeTask };