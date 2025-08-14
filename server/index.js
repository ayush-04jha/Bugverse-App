import dotenv from "dotenv";
dotenv.config();
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRouters.js";
import commentRoutes from "./routes/commentRoutes.js";
import setupSocket from "./sockets/socket.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import bugRoutes from "./routes/bugRoutes.js";
const app = express();
const server = http.createServer(app);
const isProduction = process.env.NODE_ENV === "production";

const allowedOrigin = isProduction
  ? "https://bugverse-app-1.onrender.com"
  : "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});
setupSocket(io);
// mongoose connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("mongoose connected"))
  .catch((err) => console.log(err));

// middleware use
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(express.json()); // json ko parse krke req.body me available krata hai

//cloudinary configuration...
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// io ka instance provide krayga routes ko or controllers ko as req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api/bugs", bugRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
