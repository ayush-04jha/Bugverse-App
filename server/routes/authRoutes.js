import express from "express"
import { logIn,resendVerification,signUp, googleAuthSuccess, googleAuthFailed, completeGoogleSignup } from "../controllers/authController.js"
import { verifyEmail } from "../controllers/authController.js";
import passport from "../config/passport.js";
const router = express.Router();

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  router.get(
    "/google/callback",
    (req, res, next) => {
      passport.authenticate("google", { 
        failureRedirect: "/api/auth/google/failed",
        passReqToCallback: true,
        failureMessage: true 
      }, (err, user, info) => {
        if (err) {
          console.error("Passport error:", err);
          return res.redirect("/api/auth/google/failed");
        }
        
        // Store user and info in request for the next middleware
        req.user = user;
        req.authInfo = info;
        
        next();
      })(req, res, next);
    },
    googleAuthSuccess
  );

  router.get("/google/failed", googleAuthFailed);
} else {
  // Return error if Google OAuth is not configured
  router.get("/google", (req, res) => {
    res.status(503).json({ 
      message: "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file." 
    });
  });
}

// Regular auth routes
router.post("/signup",signUp);
router.post("/login", logIn);
router.get("/verify/:token", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post("/google/complete-signup", completeGoogleSignup);
export default router;