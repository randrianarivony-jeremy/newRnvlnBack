const mongoose = require("mongoose");
const questionSchema = new mongoose.Schema(
  {
    interviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    data: {
      type: String,
      required: true,
    },
    bg: { type: String, required: true },
    interviewees: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("question", questionSchema);
