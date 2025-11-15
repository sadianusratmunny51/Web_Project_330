const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const {
    getAllUsers,
    getAllWorkers,
    getAllAdmins
} = require("../controllers/adminController");

const router = express.Router();

// Admin View all citizens
router.get("/users", protect, authorizeRoles("admin"), getAllUsers);

// Admin View all workers
router.get("/workers", protect, authorizeRoles("admin"), getAllWorkers);

// Admin View all admins
router.get("/admins", protect, authorizeRoles("admin"), getAllAdmins);

module.exports = router;
