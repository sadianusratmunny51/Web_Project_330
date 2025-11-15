const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");



const { getAdminNotifications, markNotificationRead } = require("../controllers/notificationsController");

router.get("/", protect, authorizeRoles("admin"), getAdminNotifications);
router.put("/:id/read", protect, authorizeRoles("admin"), markNotificationRead);

module.exports = router;
