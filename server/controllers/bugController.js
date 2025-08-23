import { Bug } from "../models/bug.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { getUserSocketId } from "../sockets/socket.js";
import { v2 as cloudinary } from "cloudinary";
export const createBug = async (req, res) => {
  try {
    if (req.body.assignedTo === "") {
      delete req.body.assignedTo;
    }

    if (req.body.assignedTo && typeof req.body.assignedTo === "string") {
      const assignedDeveloper = await User.findOne({
        name: req.body.assignedTo,
      });
      if (!assignedDeveloper) {
        return res.status(400).json({ message: "Assigned user not found" });
      }
      req.body.assignedTo = assignedDeveloper._id;
    }

    // 2️⃣ Agar video file aayi hai to Cloudinary upload karo
    let videoUrl = null;
    if (req.file) {
      videoUrl = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "video", folder: "bugverse_videos" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(req.file.buffer);
      });
    }

    const bug = new Bug({
      ...req.body,
      createdBy: req.user._id,
      videoUrl,
    });
    await bug.save();

    const populatedBug = await Bug.findById(bug._id)
      .populate("createdBy", "_id name role")
      .populate("assignedTo", "_id name role");

    // If no developer assigned → only send to tester
    if (!populatedBug.assignedTo) {
      const testerSocketId = getUserSocketId(
        populatedBug.createdBy._id.toString()
      );
      if (testerSocketId) {
        // req.io.to(testerSocketId).emit("bug:created", populatedBug);
        req.io.emit("bug:created", populatedBug);
      }
    }
    // If developer assigned → send to both dev & tester
    else {
      const devSocketId = getUserSocketId(
        populatedBug.assignedTo._id.toString()
      );
      if (devSocketId) {
        req.io.to(devSocketId).emit("bug:created", populatedBug);
      }
      const testerSocketId = getUserSocketId(
        populatedBug.createdBy._id.toString()
      );
      if (testerSocketId) {
        req.io.to(testerSocketId).emit("bug:created", populatedBug);
      }
    }

    res.status(201).json(populatedBug);
  } catch (err) {
    console.error("Error creating bug:", err);
    res.status(500).json({ message: err.message });
  }
};

export const getBugs = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "tester") {
      // Tester sees only their reported bugs
      query = { createdBy: req.user._id };
    } else if (req.user.role === "developer") {
      // Developer sees bugs assigned to them OR unassigned bugs
      query = {
        $or: [
          { assignedTo: req.user._id },
          { assignedTo: { $exists: false } },
          { assignedTo: null },
        ],
      };
    }

    const bugs = await Bug.find(query)
      .populate("createdBy", "_id name role")
      .populate("assignedTo", "_id name role")
      .populate({
        path: "comments.user",
        select: "_id name",
        model: "User",
      });

    res.status(200).json(bugs);
  } catch (err) {
    console.error("❌ Error fetching bugs:", err.message);
    res.status(500).json({ message: "Error fetching bugs" });
  }
};

export const bugSummary = async (req, res) => {
  try {
    //Overall summary
    const total = await Bug.countDocuments();
    const open = await Bug.countDocuments({ status: "open" });
    const closed = await Bug.countDocuments({ status: "closed" });
    const critical = await Bug.countDocuments({ severity: "critical" });

    // 2️⃣ Personal summary (agar userId available hai)
    const userId = req.user?._id; // agar auth middleware use ho raha hai
    let me = { assigned: 0, open: 0, closed: 0, critical: 0 };
    if (userId) {
      me.assigned = await Bug.countDocuments({ assignedTo: userId });
      me.open = await Bug.countDocuments({
        assignedTo: userId,
        status: "open",
      });
      me.closed = await Bug.countDocuments({
        assignedTo: userId,
        status: "closed",
      });
      me.critical = await Bug.countDocuments({
        assignedTo: userId,
        severity: "critical",
      });
    }

    //Team summary
    // Top resolvers
    const topResolversAgg = await Bug.aggregate([
      { $match: { status: "resolved", resolvedBy: { $ne: null } } }, // resolved bugs
      {
        $lookup: {
          from: "users",
          localField: "resolvedBy",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $group: {
          _id: "$user.name",
          closed: { $sum: 1 },
        },
      },
      { $sort: { closed: -1 } },
      { $limit: 5 },
    ]);


    const topResolvers = topResolversAgg.map((r) => ({
      developer: r._id,
      closed: r.closed,
    }));
    const pendingByDevAgg = await Bug.aggregate([
      { $match: { status: "open" } },
      { $group: { _id: "$assignedToName", open: { $sum: 1 } } },
      { $sort: { open: -1 } },
    ]);
    const pendingByDev = pendingByDevAgg.map((r) => ({
      developer: r._id,
      open: r.open,
    }));

    // 4️⃣ Last week comparison (solved vs remaining, increased vs decreased)
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const solvedLastWeek = await Bug.countDocuments({
      status: "resolved",
      updatedAt: { $gte: lastWeek },
    });
    const totalRemaining = total - solvedLastWeek;

    // Increased vs decreased: assume "increased" = new bugs last week, "decreased" = closed last week
    const increasedLastWeek = await Bug.countDocuments({
      createdAt: { $gte: lastWeek },
    });
    const decreasedLastWeek = solvedLastWeek;

    // 5️⃣ Recent bugs
    const recentBugs = await Bug.find().sort({ createdAt: -1 }).limit(10);

    res.json({
      overall: { total, open, closed, critical },
      me,
      team: { topResolvers, pendingByDev },
      lastWeek: {
        solved: solvedLastWeek,
        remaining: totalRemaining,
        increased: increasedLastWeek,
        decreased: decreasedLastWeek,
      },
      recent: recentBugs,
    });
  } catch (error) {
    console.error("Error in bugSummary:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const addComment = async (req, res) => {
  try {
    const { bugId } = req.params;
    const { text } = req.body;
    const bug = await Bug.findById(bugId);
    if (!bug) return res.status(404).json({ message: "Bug not found" });

    const comment = {
      text,
      user: req.user._id,
    };

    bug.comments.push(comment);
    await bug.save();

    const populatedBug = await bug.populate("comments.user", "name role");

    req.io.emit("newComment", { bugId, comment: populatedBug.comments.at(-1) });

    res.status(200).json({
      message: "Comment added",
      comment: populatedBug.comments.at(-1),
    });
  } catch (err) {
    console.error("Comment Error", err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updateBug = async (req, res) => {
  try {
    const { id } = req.params;
    const bugToUpdate = await Bug.findById(id);

    const bugResolvedBy = id;
    if (req.body.status) {
      bugToUpdate.status = req.body.status.replace("-", " ");
    }
    if (req.body.description) {
      bugToUpdate.description = req.body.description;
    }
    if (req.body.severity) {
      bugToUpdate.severity = req.body.severity;
    }
    if (req.body.title) {
      bugToUpdate.title = req.body.title;
    }
    if (req.body.comments) {
      bugToUpdate.comments = req.body.comments;
    }
    if (req.body.tags) {
      bugToUpdate.tags = req.body.tags;
    }

    if (req.body.status === "resolved") {
      bugToUpdate.resolvedBy = req.user._id;
    }

    await bugToUpdate.save();

    res.status(201).json({ message: "status updated successfully!" });
  } catch (err) {
    console.error("Error updating bug:", err);
    res.status(501).json({ message: "Error updating bug's status" });
  }
};

export const getResolvedBug = async (req, res) => {
  try {
    const bugs = await Bug.find({ status: "resolved" });

    await Bug.populate(bugs, { path: "resolvedBy", select: "name" });

    res.json(bugs);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching resolved bugs", error: err.message });
  }
};
