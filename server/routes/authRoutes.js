import express from "express"
import { logIn,resendVerification,signUp } from "../controllers/authController.js"
import { verifyEmail } from "../controllers/authController.js";
const router = express.Router();
router.post("/signup",signUp);
router.post("/login", logIn);
router.get("/verify/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
export default router;