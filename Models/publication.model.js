const mongoose = require("mongoose");
const CommentSchema = require("./comments.model");

const publicationSchema = new mongoose.Schema(
  {
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required:true
    },
    content: {type:String,required:true},
    contentType: {type:String,required:true},
    bg: {type:String,default:''},
    description: {type:String,default:''},
    likers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    comments: [CommentSchema
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("publication", publicationSchema);
