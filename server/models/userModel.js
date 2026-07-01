import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["developer", "tester", "admin"],
    default: "tester",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  
  verificationToken: String,
  verificationExpires: {
  type: Date,
},
  googleId: { type: String },
});
userSchema.index({ verificationExpires: 1 }, { expireAfterSeconds: 0 });
const User = mongoose.model("User", userSchema);
export default User;
