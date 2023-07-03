const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
    },
    philosophy: String,
    project: {
      type: String,
      default: "",
    },
    job: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    fees: {
      type: Number,
      default: 10,
    },
    subscriptionNotification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "notification",
      default: null,
    },

    //demande d'ami
    friendRequestNotification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "notification",
      default: null,
    },
    friendAcceptNotification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "notification",
      default: null,
    },
    friends: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
      // validate: [function(val){
      //   return val.length<2;
      // },"2 friends max"],
    },
    friendRequest: [
      //incoming friend request <-
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    friendInvitation: [
      //asking to be friend ->
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    wallet: {
      type: Number,
      default: 200,
    },
    newNotification: {
      type: Number,
      default: 0,
    },
    newMainMessage: {
      type: Number,
      default: 0,
    },
    newSecondMessage: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;
