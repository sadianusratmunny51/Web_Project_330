// controllers/feedbackController.js
const db = require("../config/db");

const { createNotification } = require("../utils/notifications");

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

    res.status(201).json({ message: "Feedback submitted successfully" });
  });
};

module.exports = { createFeedback };
