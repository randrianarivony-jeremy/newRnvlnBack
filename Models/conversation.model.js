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
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
    },
    unseenMessage: [
      //unseen message
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
        new: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "message",
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("conversation", ConversationSchema);
