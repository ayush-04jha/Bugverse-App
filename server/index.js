import express from "express";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors"
import mongoose from "mongoose";
import bugRoutes from './routes/bugRoutes.js';
import authRoutes from "./routes/authRoutes.js";
dotenv.config();

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
app.use(cors());
app.use(express.json()); // json ko parse krke req.body me available krata hai
app.use("/api/bugs",bugRoutes)
app.use("/api/auth", authRoutes);

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
  socket.on("disconnected", () => {
    console.log("socket disconnected:", socket.id);
  });
});


// io ka instance provide krayga routes ko or controllers ko as req.io
app.use((req,res,next)=>{
    req.io = io;
    next();
})

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));