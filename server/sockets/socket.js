const userSocketMap = new Map();

export default function setupSocket(io) {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      userSocketMap.set(userId.toString(), socket.id);
    }

    socket.on("disconnect", () => {
      userSocketMap.forEach((sid, uid) => {
        if (sid === socket.id) {
          userSocketMap.delete(uid);
        }
      });
    });
  });
}

export const getUserSocketId = (userId) => {
  return userSocketMap.get(userId.toString());
};
