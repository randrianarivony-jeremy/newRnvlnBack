const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
        unique:true
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message",
      },
    ],
    newMessage: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user"
        },
        new: { type: Number, default: 0 },
      },
    ],
    category:{
      type:String,
      required:true,
      enum:['main','second'],
      default:'second'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("conversation", ConversationSchema);
