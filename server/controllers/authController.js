import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET

export const signUp = async (req,res)=>{
   const {name,email,password} = req.body;
   try{
    const userExist = await User.findOne({email});
    if (userExist) res.status(400).json({msg:"User already exists"});

    const hashedPassword = await bcrypt.hash(password,10);
    const user = await User.create({name,email,password:hashedPassword});
    const token = jwt.sign({id:user._id},JWT_SECRET,{expiresIn:"7d"});

    res.status(201).json({ user, token });
   }
   catch(err){
     res.status(500).json({ msg: "Server error" });
   }
}

export const logIn = async (req,res)=>{
 const {email,password} = req.body;
 try{
   const user =await User.findOne({email})
   if(!user) res.status(400).json({msg:"invalid cradentials"});

   const isMatch = await bcrypt.compare(password,user.password);

   if(!isMatch) res.status(400).json({msg:"Wrong Password!"});

   const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
   res.status(200).json({ user, token });
 }catch(err){
   res.status(500).json({ msg: "Server error" });
 }
}

