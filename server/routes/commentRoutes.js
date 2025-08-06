import express from "express"
import { addComment } from "../controllers/bugController.js"
import authMiddleware from "../middilware/authMiddleware.js";

const router = express.Router();

router.post("/bugs/:bugId/comment", authMiddleware,addComment);

export default router