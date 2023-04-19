const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    commenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    text: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = CommentSchema;
