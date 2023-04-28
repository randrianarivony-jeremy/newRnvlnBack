const Comments = require("../Models/comments.model");
const contentFeedModel = require("../Models/contentFeed.model");
const interviewModel = require("../Models/interview.model");
const publicationModel = require("../Models/publication.model");

//READ ALL
module.exports.fetchContentFeed = async (req, res) => {
  try {
    const docs = await contentFeedModel
    .find()
    let result = [];
    if (docs.length===0) res.status(200).send([]);
    else {
      docs.map(async(elt)=>{
        if (elt.docModel==='publication') {
          try {
            const doc = await publicationModel
              .findById(elt.id_content)
              // .populate("likers", "name picture job")
              .populate("id_user", "name picture job")
              .populate({
                path: "comments",
                populate: { path: "commenterId", select: "name picture job" },
              })
              result.push({content:doc,type:'publication'});
              
              if (result.length === docs.length) res.status(200).json(result)
          } catch (error) {
            res.status(500).send(error.message);
          }
        } else {
          try {
            const doc =await interviewModel
              .findById(elt.id_content)
              // .populate("likers", "name picture job")
              .populate("id_user", "name picture job")
              .populate({
                path: "comments",
                populate: { path: "commenterId", select: "name picture job" },
              })
              .populate({
                path: "question",
                populate: { path: "interviewer", select: "name picture job" },
              });
            result.push({content:doc,type:'interview'});
            // console.log(result.length,docs.length);
            if (result.length === docs.length) res.status(200).json(result)
          } catch (error) {
            res.status(500).send(error.message);
          }
        }
      })
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// L O A D  N E W
module.exports.loadNews = async (req, res) => {
  try {
    await interviewModel
      .find({ createdAt: { $gt: req.params.date } })
      .limit(1)
      .populate("likers", "name picture tag")
      .populate("id_user", "name picture tag")
      .populate("project", "name picture tag")
      .populate("savings", "name picture tag")
      .populate("meToo", "name picture tag")
      .populate({
        path: "comments",
        populate: { path: "commenterId", select: "name picture tag" },
      })
      .then((doc) => res.send(doc));
  } catch (error) {
    res.send(error.message);
  }
};

//READ OLD POST
module.exports.loadMore = async (req, res) => {
  try {
    await interviewModel
      .find({ createdAt: { $lt: req.params.date } })
      .limit(1)
      .sort({ createdAt: -1 })
      .populate("likers", "name picture tag")
      .populate("id_user", "name picture tag")
      .populate("project", "name picture tag")
      .populate("savings", "name picture tag")
      .populate("meToo", "name picture tag")
      .populate({
        path: "comments",
        populate: { path: "commenterId", select: "name picture tag" },
      })
      .then((doc) => res.send(doc));
  } catch (error) {
    res.send(error.message);
  }
};

module.exports.fetchUserPosts=async(req,res)=>{
  await contentFeedModel.find()
}