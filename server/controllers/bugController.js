import { Bug } from "../models/bug.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";
import { getUserSocketId } from "../sockets/socket.js";

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

    const bug = new Bug({
      ...req.body,
      createdBy: req.user._id,
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

export const getBugSummaryForDev = async (req, res) => {
  try {
    const devId = req.user.id;

    const summary = await Bug.aggregate([
      {
        $match: { assignedTo: new mongoose.Types.ObjectId(devId) },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      totalAssigned: 0,
      open: 0,
      inprogress: 0,
      testing: 0,
      closed: 0,
    };

    summary.forEach((item) => {
      result[item._id] = item.count;
      result.totalAssigned += item.count;
    });
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Error fetching bug summary", error });
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
    
    
if(req.body.status){
 bugToUpdate.status = req.body.status.replace("-", " ");
}
if(req.body.description){
bugToUpdate.description = req.body.description;
}
if(req.body.severity){
 bugToUpdate.severity = req.body.severity;
}
if(req.body.title){
bugToUpdate.title = req.body.title;
}
if(req.body.comments){
bugToUpdate.comments = req.body.comments;
}
if(req.body.tags){
 bugToUpdate.tags = req.body.tags;}
    
    
   
    
    
   

    await bugToUpdate.save();

    res.status(201).json({ message: "status updated successfully!" });
  } catch (err) {
    console.error("Error updating bug:", err);
    res.status(501).json({ message: "Error updating bug's status" });
  }
};
