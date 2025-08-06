import { Bug } from "../models/bug.js";
import mongoose from "mongoose";


export const createBug = async (req, res) => {
  try {
  // console.log("User Role:", req.user?.role);
// console.log("Allowed Roles:", allowedRoles);

console.log("Incoming Bug Data:", req.body);
console.log("Logged in User:", req.user);

if (!req.body.assignedTo) {
  delete req.body.assignedTo;  // prevent empty string error
}

    const bug = new Bug({...req.body,
      createdBy:req.user._id
    });
    await bug.save();

    req.io.emit("bug:created", bug);

    res.status(201).json(bug);
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
          { assignedTo: null }
        ]
      };
    }

    const bugs = await Bug.find(query)
      .populate("createdBy")
      .populate("assignedTo")
      .populate({
        path: "comments.user",
        model: "User"
      });

    res.status(200).json(bugs);
  } catch (err) {
    console.error("❌ Error fetching bugs:", err.message);
    res.status(500).json({ message: "Error fetching bugs" });
  }
};



// export const resolveBug = ()=>{

// }

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
      closed: 0
}

summary.forEach(
   item=>{
      result[item._id] = item.count;
      result.totalAssigned += item.count;
   }
)
    res.status(200).json(result);
  } catch (err) {

    res.status(500).json({ message: "Error fetching bug summary", error });
  }
};

export const addComment  = async(req,res)=>{
  try {
    const {bugId} = req.params;
    const {text} = req.body;
    const bug = await Bug.findById(bugId);
    if (!bug) return res.status(404).json({ message: "Bug not found" });

    const comment = {
      text,
      user:req.user._id
    }

    bug.comments.push(comment);
    await bug.save();

    const populatedBug = await bug.populate("comments.user", "name role");

    req.io.emit("newComment",{bugId,comment: populatedBug.comments.at(-1)})

     res.status(200).json({ message: "Comment added", comment: populatedBug.comments.at(-1) });
  } catch (err) {
    console.error("Comment Error", err);
    res.status(500).json({ message: "Something went wrong" });
  }
}