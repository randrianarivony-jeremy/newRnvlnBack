const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    subscribedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    createdAt: {
      type: Date,
      expires: 2628288,
    },
  },
  { timestamps: true }
);

const subscriptionModel = mongoose.model("subscription", subscriptionSchema);
module.exports = subscriptionModel;
