import "dotenv/config";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRouters.js";
import commentRoutes from "./routes/commentRoutes.js";
import setupSocket from "./sockets/socket.js";
import { v2 as cloudinary } from "cloudinary";
import bugRoutes from "./routes/bugRoutes.js";
import passport from "./config/passport.js";
import session from "express-session";
import MongoStore from "connect-mongo";
const app = express();
const server = http.createServer(app);
const isProduction = process.env.NODE_ENV === "production";


const allowedOrigin = isProduction
  ? "https://bugverse-app-1.onrender.com"
  : "http://localhost:5174";

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  },
});
setupSocket(io);

// middleware use
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// mongoose connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("mongoose connected"))
  .catch((err) => console.log(err));

// Session middleware for Passport with MongoDB store
app.use(
  session({
    secret: process.env.JWT_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 60 * 60 * 24 * 7, // 7 days
      touchAfter: 24 * 3600, // Update session only once every 24 hours
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json()); // json ko parse krke req.body me available krta hai

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
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});
app.use("/api/bugs", bugRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/summary",bugRoutes);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));