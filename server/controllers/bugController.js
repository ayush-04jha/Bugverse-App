import { Bug } from "../models/bug.js";

export const createBug = async (req, res) => {
  try {
    const bug = new Bug(req.body);
    await bug.save();

    req.io.emit("new Bug", bug);

    res.status(201).json(bug);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBugs = async (req, res) => {
  const bugs = await Bug.find().populate("createdBy assignedTo comments.user");
  res.json(bugs);
};

// export const resolveBug = ()=>{

// }

export const getBugSummaryForDev = async (req, res) => {
  try {
    const devId = req.user.id;

    const summary = await Bug.aggrigate([
      {
        $match: { assignedTo: "devId" },
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
