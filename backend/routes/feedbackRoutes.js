// routes/feedbackRoutes.js
const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { createFeedback } = require("../controllers/feedbackController");

const router = express.Router();

router.post("/", protect, authorizeRoles("citizen"), createFeedback);
// Citizen gives feedback for a completed request
//router.post("/", protect, authorizeRoles("citizen"), submitFeedback);

module.exports = router;

