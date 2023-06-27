const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

//req.body:status:currency:sex:birth:experience:email:password
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
    philosophy: {
      type: String,
      maxLength: 200,
    },
    project: {
      type: String,
      max: 200,
      default: "",
    },
    job: {
      type: String,
      max: 30,
      default: "",
    },
    address: {
      type: String,
      max: 30,
      default: "",
    },
    fees: {
      type: Number,
      default: undefined,
    },
    subscriptionNotification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "notification",
      default: null,
    },
    subscribers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    subscriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],

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
      default: 0,
    },
    newNotification: {
      type: Number,
      default: 0,
    },
    newMessage: {
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
