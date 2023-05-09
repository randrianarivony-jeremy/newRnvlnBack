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
      default:''
    },
    job: {
      type: String,
      max: 30,
      default:''
    },
    address: {
      type: String,
      max: 30,
      default:''
    },
    subscription: {
      type: Boolean,
      default: false,
    },
    fees: {
      type: Number,
      default: undefined,
    },
    subscriptionNotification: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "notification",
        default:null
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
    followNotification: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "notification",
        default:null
      },
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    savings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "contentfeed",
      },
    ],
    wallet:{
      type:Number,
      default:0
    },
    notificationSeen: {
      type: Number,
      default: 0,
    },
    messageNotSeen: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("user", userSchema); //user represente le nom de la collection à creer en respectant le model userShema
module.exports = UserModel;
