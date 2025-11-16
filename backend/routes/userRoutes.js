const express = require("express");
const router = express.Router();

const { getUserRewards, getTotalRewards } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/rewards", protect, getUserRewards);
router.get("/rewards/total", protect, getTotalRewards);


module.exports = router;
