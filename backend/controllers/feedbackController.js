// controllers/feedbackController.js
const db = require("../config/db");

const { createNotification } = require("../utils/notifications");
const { createWorkerNotification } = require("../utils/workerNotifications");


// Reward based on rating
function getRewardPoints(rating) {
  switch (rating) {
    case 5: return 10;
    case 4: return 7;
    case 3: return 5;
    case 2: return 2;
    default: return 0;
  }
}

// Citizen submits feedback
const createFeedback = (req, res) => {
  const { request_id, rating, feedback_text } = req.body;
  const user_id = req.user.id;

  if (!request_id || !rating || !feedback_text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Insert feedback
  const sql = `
    INSERT INTO feedback (request_id, user_id, rating, feedback_text)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [request_id, user_id, rating, feedback_text], (err, result) => {
    if (err) return res.status(500).json({ message: "Database error", error: err });

    // Create notification for new feedback
    createNotification("feedback", result.insertId);

    createWorkerNotification("feedback", result.insertId);


    // Find worker from request
    const findWorkerSQL = `SELECT worker_id FROM requests WHERE id = ?`;

    db.query(findWorkerSQL, [request_id], (err, workerResult) => {
      if (err) return res.status(500).json({ message: "Database error", error: err });

      if (workerResult.length === 0) {
        return res.status(404).json({ message: "No worker found for this request" });
      }

      const worker_id = workerResult[0].worker_id;

      // Calculate reward points
      const reward = getRewardPoints(rating);

      // Update worker reward points
      const updateSQL = `
        UPDATE users 
        SET waste_reward_points = waste_reward_points + ?
        WHERE id = ?
      `;

      db.query(updateSQL, [reward, worker_id], (err) => {
        if (err) return res.status(500).json({ message: "Reward update error", error: err });

        res.status(201).json({
          message: "Feedback submitted and worker reward updated",
          reward_added: reward
        });
      });
    });
  });
};

module.exports = { createFeedback };
