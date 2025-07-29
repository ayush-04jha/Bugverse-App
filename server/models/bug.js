import mongoose from "mongoose";

const bugSchema = new mongoose.Schema({
  title: String,
  description: String,
  serverity: String,
  module:String,
  status:{
    type : String,
    enum: ["open", "inprogress", "testing", "closed"],
    default: "Open"
  },
  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comment:[
    {
        text: String,
        user:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
        createdAt:{type:Date,default:Date.now}
    }
  ]
},{timestamps:true});

export const Bug = mongoose.model('Bug',bugSchema)
