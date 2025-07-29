import User from "../models/userModel.js";
export const getAllUsers = async(req,res)=>{
    try{
      const users = await User.find().select("-password");
      res.status(200).json(users);
    } catch(e){
       res.status(500).json({ message: "Failed to fetch users", error });
    }
    
}