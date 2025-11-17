const express = require("express");
const router = express.Router();

// Controllers
const { 
  registerUser, 
  loginUser, 
  updateProfilePic, 
  deleteMyAccount,
  forgotPassword,
  changePassword
} = require("../controllers/authController");

// Middlewares
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const uploadProfile = require("../middleware/profileUpload");


router.post("/register", registerUser);
router.post("/login", loginUser);

router.post("/forgot-password", forgotPassword);
router.put("/change-password", protect, changePassword);



// user profile pic update
router.put("/profile/pic", protect, uploadProfile.single("image"), updateProfilePic);


// Delete own account
router.delete("/delete-account", protect, authorizeRoles("citizen", "worker", "admin"), deleteMyAccount);

// Worker completes a task

//router.put("/worker/complete/:id", protect, authorizeRoles("worker"), completeTask);



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