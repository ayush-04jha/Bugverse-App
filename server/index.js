import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory where this file is located
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server directory BEFORE any other imports
// Try to load from the server directory (where this file is located)
const envPath = path.resolve(__dirname, '.env');
const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('Error loading .env file:', result.error);
}

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes, { configureGoogleAuthRoutes } from "./routes/authRoutes.js";
import userRoutes from "./routes/userRouters.js";
import commentRoutes from "./routes/commentRoutes.js";
import setupSocket from "./sockets/socket.js";
import { v2 as cloudinary } from "cloudinary";
import bugRoutes from "./routes/bugRoutes.js";
import passport, { configureGoogleOAuth } from "./config/passport.js";
import session from "express-session";
import MongoStore from "connect-mongo";
import { connectDatabase, getConnectionStatus } from "./config/database.js";

// Configure Google OAuth after environment variables are loaded
configureGoogleOAuth();
configureGoogleAuthRoutes();
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

// middleware use
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// Initialize database connection with error handling
connectDatabase().catch((error) => {
  console.error("Failed to initialize database connection:", error);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
});

// Session middleware for Passport with MongoDB store
if (process.env.MONGO_URI) {
  app.use(
    session({
      secret: process.env.SESSION_SECRET || (() => {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('SESSION_SECRET environment variable must be set in production');
        }
        console.warn('⚠️  WARNING: Using default session secret. Set SESSION_SECRET environment variable for production.');
        return 'dev-secret-key-change-in-production';
      })(),
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
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
      },
    })
  );
} else {
  console.warn('⚠️  WARNING: MongoDB URI not found. Session storage disabled. Google OAuth will not work properly.');
  app.use(
    session({
      secret: process.env.SESSION_SECRET || (() => {
        if (process.env.NODE_ENV === 'production') {
          throw new Error('SESSION_SECRET environment variable must be set in production');
        }
        console.warn('⚠️  WARNING: Using default session secret. Set SESSION_SECRET environment variable for production.');
        return 'dev-secret-key-change-in-production';
      })(),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        httpOnly: true,
      },
    })
  );
}

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
  const dbStatus = getConnectionStatus();
  const healthStatus = {
    status: dbStatus.isConnected ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    database: dbStatus,
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development"
  };
  
  const statusCode = dbStatus.isConnected ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});
app.use("/api/bugs", bugRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/summary",bugRoutes);


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));