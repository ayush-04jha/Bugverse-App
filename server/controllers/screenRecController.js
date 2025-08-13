import { Bug } from "../models/bug.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import cloudinary from "cloudinary";
export const uploadToColudinary = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "video", folder: "bugverse_videos" },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return res.status(500).json({ error: "Upload failed" });
        }
        return res.json({ videoUrl: result.secure_url, raw: result });
      }
    );

     uploadStream.end(req.file.buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
