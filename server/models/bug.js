import mongoose from "mongoose";

const bugSchema = new mongoose.Schema({
  title: String,
  description: String,
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
  module:String,
  tags:[String],
  status:{
    type : String,
    enum: ["open", "inprogress", "testing", "closed"],
    default: "open"
  },
  createdBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  comments:[
    {
        text: String,
        user:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
        createdAt:{type:Date,default:Date.now}
    }
  ]
},{timestamps:true});

export const Bug = mongoose.model('Bug',bugSchema)
