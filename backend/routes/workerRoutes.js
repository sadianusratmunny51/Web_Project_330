const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  workerAction,
  completeTask,
  getWorkerRank,
  getLeaderboard,
  updateWorkerStatus,
  getWorkerStatus
} = require("../controllers/workerController");

const router = express.Router();

// Worker accept/reject assigned task
router.put("/:id/action", protect, authorizeRoles("worker"), workerAction);

// Worker completes a task
router.put("/:id/complete", protect, authorizeRoles("worker"), completeTask);

// Rank + Leaderboard
router.get("/rank", protect, getWorkerRank);
router.get("/leaderboard", protect, getLeaderboard);

// // Static route FIRST
// router.get("/free", protect, authorizeRoles("admin"), getFreeWorkers);

// Update worker status
router.put("/status", protect, authorizeRoles("worker"), updateWorkerStatus);

// Dynamic route LAST (VERY IMPORTANT)
router.get("/:id/status", protect, authorizeRoles("worker"), getWorkerStatus);



module.exports = router;
