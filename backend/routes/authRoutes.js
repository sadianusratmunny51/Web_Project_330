const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const uploadProfile = require("../middleware/profileUpload");
const { updateProfilePic } = require("../controllers/authController");
const { deleteMyAccount } = require("../controllers/authController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// user profile pic update
router.put("/profile/pic", protect, uploadProfile.single("image"), updateProfilePic);


// Delete own account
router.delete("/delete-account", protect, authorizeRoles("citizen", "worker", "admin"), deleteMyAccount);


// Test route to confirm router works
router.get("/test", (req, res) => {
  res.json({ message: "Auth route is working properly!" });
});

// Protected routes
router.get("/profile", protect, (req, res) => {
  res.json({ message: "Welcome to your profile", user: req.user });
});

router.get("/admin/dashboard", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Welcome Admin Dashboard" });
});


router.get("/worker/tasks", protect, authorizeRoles("worker"), (req, res) => {
  res.json({ message: "Welcome Worker Task List" });
});

module.exports = router;