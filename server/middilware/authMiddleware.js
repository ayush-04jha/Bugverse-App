import jwt from "jsonwebtoken"
import User from "../models/userModel.js";
const authMiddleware =async (req,res,next)=>{
    const token = req.headers.authorization?.split(" ")[1];
console.log("TOKEN RECEIVED:", token);
console.log("SECRET USED TO VERIFY:", process.env.JWT_SECRET);

    if(!token){
        return res.status(401).json({message:"No token, access denied"});
    }
        try{
           console.log("decoded=",process.env.JWT_SECRET);
          const decoded = jwt.verify(token,process.env.JWT_SECRET);
          console.log("decodedPayload:",decoded);
          
          req.user = await User.findById(decoded.id);
          next();
        } catch(e){
          console.error("token problem",e)
           res.status(401).json({message:"Invalid Token"});
        }
    

};
export default authMiddleware;
