import mongoose from "mongoose";

const bugSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    severity: { type: String, enum: ["low", "medium", "high", "critical"] },
    module: String,
    videoUrl: String,
    tags: [String],
    status: {
      type: String,
      enum: ["open", "in progress", "testing", "resolved"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    comments: [
      {
        text: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    environment: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    technical_context: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    extension_data: {
      url: String,
      screenshot: String,
      user_agent: String,
    },
  },
  { timestamps: true }
);

export const Bug = mongoose.model("Bug", bugSchema);
