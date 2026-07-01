import express from "express"
import authorizeRoles from "../middilware/roleMiddleware.js";
import authMiddleware from "../middilware/authMiddleware.js";
import {getUsersByRole, getCurrentUser} from "../controllers/userController.js"
const router = express.Router();

router.get("/",authMiddleware,getUsersByRole);
router.get("/me", authMiddleware, getCurrentUser);
export default router;