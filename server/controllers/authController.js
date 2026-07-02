import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendVerificationEmail } from "../utils/sendEmail.js";

export const googleAuthSuccess = async (req, res) => {
  try {
    // Check if this is a new user (profile in authInfo) or existing user
    if (req.authInfo && req.authInfo.profile) {
      // New user - store profile in session and redirect to role selection page
      req.session.googleProfile = req.authInfo.profile;
      
      const frontendUrl = process.env.NODE_ENV === "production"
        ? "https://bugverse-app-1.onrender.com"
        : "http://localhost:5174";
      
      res.redirect(`${frontendUrl}/role-selection`);
    } else {
      // Existing user - generate JWT token and redirect
      if (!req.user) {
        return res.status(401).json({ msg: "Authentication failed" });
      }
      
      const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const frontendUrl = process.env.NODE_ENV === "production"
        ? "https://bugverse-app-1.onrender.com"
        : "http://localhost:5174";
      
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(500).json({ msg: "Authentication failed" });
  }
};

export const googleAuthFailed = (req, res) => {
  const frontendUrl = process.env.NODE_ENV === "production"
    ? "https://bugverse-app-1.onrender.com"
    : "http://localhost:5174";

  res.redirect(`${frontendUrl}/login?error=google_auth_failed`);
};
export const signUp = async (req, res) => {
  console.log(req.body);

  const { name, email, password, role } = req.body;
  try {
    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      verificationToken,
      verificationExpires: new Date(Date.now() + 5 * 60 * 1000), // 5 min
      isVerified: false,
    });
    try{
await sendVerificationEmail(email, verificationToken);
    } catch(emailErr){
   console.error("Email failed:", emailErr);
    await User.deleteOne({ _id: user._id });
    return res.status(500).json({ msg: "Failed to send verification email" });
    }    
    res.status(201).json({
      msg: "Signup successful. Please verify your email within 5 minutes.",
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }

};

export const logIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "invalid cradentials" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ msg: "Wrong Password!" });
    if (!user.isVerified) {
      return res.status(400).json({ msg: "Please verify your email first" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    res.status(200).json({ user, token });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
    });

    if (!user) {
      return res.status(400).json({ msg: "Invalid or expired token" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

    await user.save();

    res.json({ msg: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};

export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ msg: "User not found" });

    if (user.isVerified)
      return res.status(400).json({ msg: "Email already verified" });

    // Optional: cooldown check (anti-spam)
    if (
      user.verificationExpires &&
      user.verificationExpires > new Date(Date.now() + 4 * 60 * 1000)
    ) {
      return res.status(400).json({
        msg: "Please wait before requesting another verification email",
      });
    }

    const newToken = crypto.randomBytes(32).toString("hex");

    user.verificationToken = newToken;
    user.verificationExpires = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    await sendVerificationEmail(email, newToken);

    res.json({ msg: "Verification email resent successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

export const completeGoogleSignup = async (req, res) => {
  try {
    const { role } = req.body;
    
    // Get Google profile from session
    const googleProfile = req.session.googleProfile;
    
    if (!googleProfile) {
      return res.status(400).json({ msg: "Google profile not found in session" });
    }

    // Check if user already exists (double check)
    const existingUser = await User.findOne({ email: googleProfile.emails[0].value });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create new user with selected role
    const bcrypt = await import("bcryptjs");
    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    const user = await User.create({
      name: googleProfile.displayName,
      email: googleProfile.emails[0].value,
      password: hashedPassword,
      role: role || "tester",
      isVerified: true,
      googleId: googleProfile.id,
    });

    // Clear Google profile from session
    delete req.session.googleProfile;

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ user, token });
  } catch (error) {
    console.error("Complete Google signup error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};