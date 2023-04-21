const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: [{
      type: mongoose.Schema.Types.ObjectId, ref: 'user'
    }],
    messages: [{
      type: mongoose.Schema.Types.ObjectId, ref: 'message'
    }],
    newUserA: {type:Number,default:0},
    newUserB: {type:Number,default:0},
  },
  { timestamps: true }
);

module.exports = mongoose.model("conversation", ConversationSchema);
