const express = require("express");
const router = express.Router();

const { getUserRewards, getTotalRewards, updateProfile, getLogInfo } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

router.get("/rewards", protect, getUserRewards);
router.get("/rewards/total", protect, getTotalRewards);
router.put("/update", protect, updateProfile);


router.get("/logInfo", protect, getLogInfo);


module.exports = router;
