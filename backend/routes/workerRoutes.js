const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
  workerAction,
  completeTask
} = require("../controllers/workerController");

const router = express.Router();

// Worker accept/reject assigned task
router.put("/:id/action", protect, authorizeRoles("worker"), workerAction);

// Worker completes a task
router.put("/:id/complete", protect, authorizeRoles("worker"), completeTask);

module.exports = router;
