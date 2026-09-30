const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
    buyerUnread: { type: Number, default: 0 },
    agentUnread: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One conversation per buyer per property
conversationSchema.index({ property: 1, buyer: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);