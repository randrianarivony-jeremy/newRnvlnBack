const mongoose = require("mongoose");
const CommentSchema = require("./comments.model");

const publicationSchema = new mongoose.Schema(
  {
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required:true
    },
    type: {type:String,required:true,enum:['interview','article'],default:'article'},
    content: {type:String,required:true,trim:true},
    contentType: {type:String,required:true},
    bg: {type:String,default:''},
    public: {type:Boolean,default:false},
    description: {type:String,default:'',trim:true},
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "question",
      required: function() {
        return this.type =='interview';
      },
    },
    likers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
    likeNotification: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "notification",
        default:null
      }
    ,
    comments: [CommentSchema],
    commentNotification: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "notification",
        default:null
      }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("publication", publicationSchema);
