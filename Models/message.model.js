const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId, ref: 'conversation',
      required:true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId, ref: 'user',
      required:true
    },
    content: {
      type: String,
      required:true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("message", MessageSchema);
