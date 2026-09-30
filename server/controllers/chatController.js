const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Property = require("../models/Property");

const isMember = (convo, userId) =>
  convo.buyer.toString() === userId.toString() ||
  convo.agent.toString() === userId.toString();

const resetUnread = async (convo, userId) => {
  if (convo.buyer.toString() === userId.toString()) convo.buyerUnread = 0;
  else convo.agentUnread = 0;
  await convo.save();
};

// POST /api/chat/conversations  body: { propertyId }  (find or create)
exports.startConversation = async (req, res) => {
  try {
    const property = await Property.findById(req.body.propertyId);
    if (!property) return res.status(404).json({ message: "Property not found" });

    if (property.agent.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "This is your own property" });
    }

    let convo = await Conversation.findOne({
      property: property._id,
      buyer: req.user._id,
    });
    if (!convo) {
      convo = await Conversation.create({
        property: property._id,
        buyer: req.user._id,
        agent: property.agent,
      });
    }
    res.json(convo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/chat/conversations
exports.getConversations = async (req, res) => {
  try {
    const me = req.user._id.toString();
    const list = await Conversation.find({
      $or: [{ buyer: req.user._id }, { agent: req.user._id }],
    })
      .populate("property", "title images")
      .populate("buyer", "name")
      .populate("agent", "name")
      .sort({ lastMessageAt: -1 });

    res.json(
      list.map((c) => {
        const obj = c.toObject();
        obj.unread = c.buyer._id.toString() === me ? c.buyerUnread : c.agentUnread;
        return obj;
      })
    );
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/chat/conversations/:id/messages
exports.getMessages = async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ message: "Conversation not found" });
    if (!isMember(convo, req.user._id)) return res.status(403).json({ message: "Not allowed" });

    const messages = await Message.find({ conversation: convo._id }).sort({ createdAt: 1 });
    await resetUnread(convo, req.user._id);
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: "Invalid conversation id" });
  }
};

// POST /api/chat/conversations/:id/messages  body: { text }
exports.sendMessage = async (req, res) => {
  try {
    const text = (req.body.text || "").trim();
    if (!text) return res.status(400).json({ message: "Message cannot be empty" });

    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ message: "Conversation not found" });
    if (!isMember(convo, req.user._id)) return res.status(403).json({ message: "Not allowed" });

    const message = await Message.create({
      conversation: convo._id,
      sender: req.user._id,
      text,
    });

    convo.lastMessage = text.slice(0, 100);
    convo.lastMessageAt = new Date();
    if (convo.buyer.toString() === req.user._id.toString()) convo.agentUnread += 1;
    else convo.buyerUnread += 1;
    await convo.save();

    // Push to both people in real time
    const io = req.app.get("io");
    io.to(`user:${convo.buyer}`)
      .to(`user:${convo.agent}`)
      .emit("message:new", {
        conversationId: convo._id.toString(),
        message: message.toObject(),
      });

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/chat/conversations/:id/read
exports.markRead = async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ message: "Conversation not found" });
    if (!isMember(convo, req.user._id)) return res.status(403).json({ message: "Not allowed" });

    await resetUnread(convo, req.user._id);
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/chat/unread
exports.getUnreadCount = async (req, res) => {
  try {
    const me = req.user._id;
    const convos = await Conversation.find({ $or: [{ buyer: me }, { agent: me }] });
    const count = convos.reduce(
      (sum, c) => sum + (c.buyer.toString() === me.toString() ? c.buyerUnread : c.agentUnread),
      0
    );
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};