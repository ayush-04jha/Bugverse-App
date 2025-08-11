import User from "../models/userModel.js";
export const getUsersByRole = async(req,res)=>{
  try{
    const currentUserRole = req.user.role;
      let query = {};
  

    if(currentUserRole==="tester"){
      // Tester can see both testers and developers
      query = {role:{$in:["developer","tester"]}}
    } 
    else if (currentUserRole === "developer"){
      // Developer can only see testers
     query = { role: "tester" };
    } 
    // Admin sees everyone (query remains {})
      const users = await User.find(query).select("name email role");
   
      
      res.json(users);


  }catch(err){
    console.error("Error fetching users by role", err);
    res.status(500).json({ message: "Server error" });
  }
}