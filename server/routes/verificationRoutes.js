const express = require("express");
const { requestVerification } = require("../controllers/verificationController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();
router.post("/request", protect, authorize("agent"), requestVerification);

module.exports = router;