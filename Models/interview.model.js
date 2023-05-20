const mongoose = require("mongoose");
const CommentSchema = require("./comments.model");

const interviewSchema = new mongoose.Schema(
  {
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
        type:String,
        default:'interview'
    },
    data: [
      {
        content: { type: String, required: true, trim: true },
        contentType: { type: String, required: true},
        bg: { type: String, default: "" },
        description: { type: String, default: "", trim: true },
      },
    ],
    public: { type: Boolean, default: false },
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "question",
      required: true,
    },
    likers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    likeNotification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "notification",
      default: null,
    },
    comments: [CommentSchema],
    commentNotification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "notification",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("interview", interviewSchema);
