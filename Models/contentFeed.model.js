const mongoose = require("mongoose");
const interviewSchema = new mongoose.Schema(
  {
    id_content: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "docModel",
      required:true
    },docModel: {
        type: String,
        required: true,
        enum: ["interview", "publication"],
      },
  },{timestamps:true}
);

module.exports = mongoose.model("contentfeed", interviewSchema);
