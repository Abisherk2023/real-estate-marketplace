const express = require("express");
const {
  startConversation, getConversations, getMessages,
  sendMessage, markRead, getUnreadCount,
} = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.use(protect);

router.get("/unread", getUnreadCount);
router.get("/conversations", getConversations);
router.post("/conversations", startConversation);
router.get("/conversations/:id/messages", getMessages);
router.post("/conversations/:id/messages", sendMessage);
router.put("/conversations/:id/read", markRead);

module.exports = router;