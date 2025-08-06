  import dotenv from "dotenv";
  dotenv.config();
  import express from "express";
  import http from "http";
  import { Server } from "socket.io";
  import cors from "cors"
  import mongoose from "mongoose";
  import bugRoutes from './routes/bugRoutes.js';
  import authRoutes from "./routes/authRoutes.js";
  import userRoutes from "./routes/userRouters.js"
  import commentRoutes from "./routes/commentRoutes.js"
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server,{
    cors: {
        origin:'http://localhost:5173',
        methods:['GET', 'POST', 'PATCH']
      }
  })

  // mongoose connection
  mongoose.connect(process.env.MONGO_URI)
  .then(()=>console.log("mongoose connected"))
  .catch(err=>console.log(err))

  // middleware use
  app.use(cors(
    {
      origin: "http://localhost:5173",
  credentials: true
    }
  ));
  app.use(express.json()); // json ko parse krke req.body me available krata hai
   // io ka instance provide krayga routes ko or controllers ko as req.io
  app.use((req,res,next)=>{
      req.io = io;
      next();
  })

  app.use("/api/bugs",bugRoutes)
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/comments",commentRoutes);
  io.on("connection", (socket) => {
    console.log("socket connected", socket.id);
    socket.on("disconnected", () => {
      console.log("client disconnected:", socket.id);
    });
  });


 

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));