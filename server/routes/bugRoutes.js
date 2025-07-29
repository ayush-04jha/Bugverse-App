import express from "express"
import {createBug,getBugs} from "../controllers/bugController.js"
import authMiddleware from "../middilware/authMiddleware.js";
import authorizeRoles from "../middilware/roleMiddleware.js";
import {getBugSummaryForDev } from "../controllers/bugController.js";
import { getAllUsers } from "../controllers/userController.js";
const router = express.Router();
router.get(
  "/admin/users",
  authMiddleware,
  authorizeRoles("admin"),
  getAllUsers
);
router.post('/',authorizeRoles("tester","admin"),authMiddleware,createBug);
router.get("/", authMiddleware, getBugs);
router.get(
  "/dev/bug-summary",
  authMiddleware,
  authorizeRoles("dev"),
  getBugSummaryForDev
);
// router.put('/:id/resolve',authMiddleware,authorizeRoles("dev","admin"),resolveBug);

export default router
