import express from "express"
import authorizeRoles from "../middilware/roleMiddleware.js";
import authMiddleware from "../middilware/authMiddleware.js";
import {getUsersByRole} from "../controllers/userController.js"
const router = express.Router();

router.get("/",authMiddleware,getUsersByRole);
export default router;