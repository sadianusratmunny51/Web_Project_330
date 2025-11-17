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



// GET WORKER RANK
const getWorkerRank = (req, res) => {
    const worker_id = req.user.id;

    const sql = `
        SELECT worker_id, avg_rating, ranking 
        FROM (
            SELECT 
                r.assigned_worker_id AS worker_id,
                AVG(f.rating) AS avg_rating,
                RANK() OVER (ORDER BY AVG(f.rating) DESC) AS ranking
            FROM requests r
            JOIN feedback f ON f.request_id = r.id
            WHERE r.status = 'completed'
            GROUP BY r.assigned_worker_id
        ) AS ranked_workers
        WHERE worker_id = ?
    `;

    db.query(sql, [worker_id], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database error", error: err });
        }

        if (result.length === 0) {
            return res.json({ avg_rating: 0, rank: null });
        }

        return res.json({
            avg_rating: parseFloat(result[0].avg_rating).toFixed(2),
            rank: result[0].ranking
        });
    });
};


// GET FULL LEADERBOARD
const getLeaderboard = (req, res) => {
    const sql = `
        SELECT 
            ranked.worker_id,
            u.name,
            ranked.avg_rating,
            ranked.ranking
        FROM (
            SELECT 
                r.assigned_worker_id AS worker_id,
                AVG(f.rating) AS avg_rating,
                RANK() OVER (ORDER BY AVG(f.rating) DESC) AS ranking
            FROM requests r
            JOIN feedback f ON f.request_id = r.id
            WHERE r.status = 'completed'
            GROUP BY r.assigned_worker_id
        ) AS ranked
        JOIN users u ON u.id = ranked.worker_id
        ORDER BY ranked.ranking ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error", error: err });
        }
        res.json(results);
    });
};




module.exports = { workerAction, completeTask, getWorkerRank, getLeaderboard };