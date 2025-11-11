const express = require("express");
const { createRequest, getRequests, updateRequestStatus } = require("../controllers/requestController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

// User submits req
router.post("/", protect, authorizeRoles("citizen"), createRequest);


//views requests
router.get("/", protect, getRequests);


// updates status (admin)
router.put("/:id", protect, authorizeRoles("admin"), updateRequestStatus);

module.exports = router;
