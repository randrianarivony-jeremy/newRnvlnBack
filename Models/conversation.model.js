const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
    ],
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message",
      },
    ],
    unseenMessage: [    //unseen message
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user"
        },
        new: { type: Number, default: 0 },
      },
    ],
    newMessage: [   //new incoming message either seen or not
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
