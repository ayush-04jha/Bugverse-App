import express from "express"
import {createBug,getBugs,getResolvedBug,updateBug} from "../controllers/bugController.js"
import authMiddleware from "../middilware/authMiddleware.js";
import authorizeRoles from "../middilware/roleMiddleware.js";
import {getBugSummaryForDev } from "../controllers/bugController.js";
import { getUsersByRole } from "../controllers/userController.js";
import { upload } from "../middilware/uploadMiddleware.js";
const router = express.Router();
router.get(
  "/admin/users",
  authMiddleware,
  authorizeRoles("admin"),
  getUsersByRole
);
router.put("/:id",authMiddleware,updateBug);
router.post("/",authMiddleware,authorizeRoles("tester","admin"),upload.single("video"),createBug);
router.get("/", authMiddleware, getBugs);
router.get(
  "/dev/bug-summary",
  authMiddleware,
  authorizeRoles("developer"),
  getBugSummaryForDev
);
router.get("/resolved-bugs",getResolvedBug)
// router.put('/:id/resolve',authMiddleware,authorizeRoles("dev","admin"),resolveBug);

export default router
