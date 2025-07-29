import express from "express"
import authorizeRoles from "../middilware/roleMiddleware.js";
import authMiddleware from "../middilware/authMiddleware.js";
import {getAllUsers} from "../controllers/userController.js"
const router = express.Router();

router.get("/admin/users",authMiddleware,authorizeRoles("admin"),getAllUsers);
export default router;