const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");


const { getAdminNotifications, markNotificationRead } = require("../controllers/notificationsController");
const { getWorkerNotifications, markWorkerNotificationRead } = require("../controllers/workerNotificationsController");
const { getUserNotifications, markAsRead } = require("../controllers/userNotificationsController");

// GET notifications for admin

router.get("/", protect, authorizeRoles("admin"), getAdminNotifications);
router.put("/:id/read", protect, authorizeRoles("admin"), markNotificationRead);


// GET notifications for worker
router.get("/worker",protect,authorizeRoles("worker"),getWorkerNotifications);
// Mark worker notification as read
router.put("/worker/:id/read",protect,authorizeRoles("worker"),markWorkerNotificationRead);


//for citizen
router.get("/user", protect, getUserNotifications);
router.put("/user/:id/read", protect, markAsRead);


module.exports = router;
