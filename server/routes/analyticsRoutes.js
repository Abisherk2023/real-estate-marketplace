const express = require("express");
const { getAgentAnalytics, getAdminAnalytics } = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/agent", protect, authorize("agent", "admin"), getAgentAnalytics);
router.get("/admin", protect, authorize("admin"), getAdminAnalytics);

module.exports = router;