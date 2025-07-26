import {Bug} from "../models/bug.js"

export const createBug = async (req,res)=>{
 try{
    const bug = new Bug(req.body);
    await bug.save();

   req.io.emit("new Bug",bug);

   res.status(201).json(bug);

 } catch(err){
res.status(500).json({  message: err.message });
 }
};


export const getBugs = async (req,res)=>{
   const bugs = await Bug.find().populate("createdBy assignedTo comments.user")
   res.json(bugs);

};