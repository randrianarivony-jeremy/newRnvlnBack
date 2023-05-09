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
    interviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "interview" }],
    interviewNotification:{
      type:mongoose.Schema.Types.ObjectId, ref: "notification",
      default:null
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("question", questionSchema);
