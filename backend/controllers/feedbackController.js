// controllers/feedbackController.js
const db = require("../config/db");
const { createNotification } = require("../utils/notifications");
const { createWorkerNotification } = require("../utils/workerNotifications");

// Reward points based on rating
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

    // Step 1: Get assigned worker and request type
    const workerQuery = `SELECT assigned_worker_id, request_type FROM requests WHERE id = ?`;

    db.query(workerQuery, [request_id], (err, workerResult) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        if (workerResult.length === 0) {
            return res.status(404).json({ message: "Request not found or no worker assigned" });
        }

        const worker_id = workerResult[0].assigned_worker_id;
        const request_type = workerResult[0].request_type;

        // Step 2: Insert feedback
        const insertFeedbackSQL = `
            INSERT INTO feedback (request_id, user_id, rating, feedback_text)
            VALUES (?, ?, ?, ?)
        `;

        db.query(insertFeedbackSQL, [request_id, user_id, rating, feedback_text], (err, result) => {
            if (err) return res.status(500).json({ message: "Database error inserting feedback", error: err });

            const feedback_id = result.insertId;

            // Step 3: Create notifications
            createNotification("feedback", feedback_id);
            if (worker_id) {
                createWorkerNotification(worker_id, "feedback", feedback_id);
            }


            // Step 4: Calculate reward points and update worker
            const reward = getRewardPoints(rating);
            const rewardColumn = request_type === "waste"
                ? "waste_reward_points"
                : "recycled_reward_points";

            const updateRewardSQL = `
                UPDATE users
                SET ${rewardColumn} = ${rewardColumn} + ?
                WHERE id = ?
            `;

            db.query(updateRewardSQL, [reward, worker_id], (err) => {
                if (err) return res.status(500).json({ message: "Reward update error", error: err });


                const logsql = `
                    INSERT INTO activity_log (user_id, activity_type, description)
                    VALUES (?, "login", "user loged in")
                    `;

                db.query(logsql, [user_id], (err, result) => {
                    if (err) reject(err);
        

                    res.status(201).json({
                    message: "Feedback submitted and worker reward updated",
                    reward_added: reward
                });
                });
            });
        });
    });
};

module.exports = { createFeedback };
