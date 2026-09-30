const jwt = require("jsonwebtoken");
const Conversation = require("./models/Conversation");

module.exports = (io) => {
  // Authenticate every socket with the same JWT
  io.use((socket, next) => {
    try {
      const decoded = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    // Each user has a private room, used for pushing messages
    socket.join(`user:${socket.userId}`);

    socket.on("typing", async ({ conversationId }) => {
      try {
        const convo = await Conversation.findById(conversationId);
        if (!convo) return;

        const isBuyer = convo.buyer.toString() === socket.userId;
        const isAgent = convo.agent.toString() === socket.userId;
        if (!isBuyer && !isAgent) return;

        const other = isBuyer ? convo.agent : convo.buyer;
        io.to(`user:${other}`).emit("typing", { conversationId });
      } catch (err) {
        // ignore typing errors
      }
    });
  });
};