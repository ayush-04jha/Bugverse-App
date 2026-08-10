import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const userSocketMap = new Map();

export default function setupSocket(io) {
  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id name role");
      
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }
      
      socket.user = user;
      next();
    } catch (err) {
      console.error("Socket authentication error:", err);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user._id; // Use verified user ID from authentication
    userSocketMap.set(userId.toString(), socket.id);
    
    console.log(`User connected: ${socket.user.name} (${userId})`);

    socket.on("disconnect", () => {
      userSocketMap.forEach((sid, uid) => {
        if (sid === socket.id) {
          userSocketMap.delete(uid);
          console.log(`User disconnected: ${socket.user.name} (${uid})`);
        }
      });
    });
  });
}

export const getUserSocketId = (userId) => {
  return userSocketMap.get(userId.toString());
};
