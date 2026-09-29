const express = require("express");
const {
  createInquiry, getReceivedInquiries, markAsRead,
} = require("../controllers/inquiryController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/", protect, createInquiry);
router.get("/received", protect, authorize("agent", "admin"), getReceivedInquiries);
router.put("/:id/read", protect, authorize("agent", "admin"), markAsRead);

module.exports = router;