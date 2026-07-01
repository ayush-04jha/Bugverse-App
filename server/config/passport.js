import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import User from "../models/userModel.js";

// Only configure Google OAuth if credentials are available
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const callbackURL = process.env.NODE_ENV === "production"
    ? "https://bugverse-app-1.onrender.com/api/auth/google/callback"
    : "http://localhost:5000/api/auth/google/callback";

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: callbackURL,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // If user exists but is not verified, verify them now
            if (!user.isVerified) {
              user.isVerified = true;
              user.verificationToken = undefined;
              user.verificationExpires = undefined;
              await user.save();
            }
            return done(null, user);
          }

          // If user doesn't exist, pass profile in info for role selection
          // We'll create the user after they select their role
          return done(null, false, { profile });
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
} else {
  console.warn("⚠️  Google OAuth credentials not found. Google login/signup will be disabled.");
  console.warn("   Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file to enable Google OAuth.");
}

passport.serializeUser((user, done) => {
  if (user && user._id) {
    done(null, user._id);
  } else {
    done(null, null);
  }
});

passport.deserializeUser(async (id, done) => {
  if (!id) {
    return done(null, null);
  }
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;