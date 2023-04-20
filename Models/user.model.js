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
    facebook_id: String,
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
    subscribers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "user",
      },
    ],
    subscriptions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "user",
      },
    ],
    followings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "user",
      },
    ],
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "user",
      },
    ],
    wallet:{
      type:Number,
      default:0
    },
    saving: {
      type: [String],
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

//before introduction into db
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//creer une fonction personnel de table
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email }); //crypter na aloha ny password et comparer apres
  if (user) {
    const auth = await bcrypt.compare(password, user.password); //comparrer le name avec le base bcrypt
    if (auth) {
      return user;
    }
    throw Error("incorrect password");
  }
  throw Error("incorrect email");
};

const UserModel = mongoose.model("user", userSchema); //user represente le nom de la collection à creer en respectant le model userShema
module.exports = UserModel;
