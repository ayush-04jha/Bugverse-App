import express from "express"
import { uploadToColudinary } from "../controllers/screenRecController.js";


const router = express.Router();

router.post("/uploaded-bug-video",uploadToColudinary);

export default router