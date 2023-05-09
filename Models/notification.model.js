const mongoose = require("mongoose");

const NotifSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["like", "comment", "follow", "subscribe", "interview"],
      required: true,
    },
    from: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    on: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "docModel"
    },
    docModel:{
      type:'String',
      enum:['publication','interview']
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("notification", NotifSchema);
