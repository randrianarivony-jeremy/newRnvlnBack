const Comments = require("../Models/comments.model");
const contentFeedModel = require("../Models/contentFeed.model");
const publicationModel = require("../Models/publication.model");

//CREATE
module.exports.createPublication = async (req, res) => {
  const { content,contentType, id_user, bg, description } = req.body;
  try {
    const result = await publicationModel.create({content,id_user,description,bg,contentType});
    await contentFeedModel.create({id_content:result._id,docModel:'publication'});    //if we use mix feed
    res.status(201).json(result);
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error);
  }
};

//READ
module.exports.readPublication = async (req, res) => {
  try {
    const result = await publicationModel
      .findById(req.params.id)
      .populate("likers", "name picture job")
      .populate("id_user", "name picture job")
      .populate({
        path: "comments",
        populate: { path: "commenterId", select: "name picture job" },
      })
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//READ
module.exports.readUserPublication = async (req, res) => {
  try {
    const result = await publicationModel
      .find({id_user:req.params.id}).select('id_user content contentType bg')
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//READ ALL
module.exports.readAllPublications = async (req, res) => {
  try {
    const result = await publicationModel
      .find()
      .populate("likers", "name picture job")
      .populate("id_user", "name picture job")
      .populate({
        path: "comments",
        populate: { path: "commenterId", select: "name picture job" },
      })
      // .limit(2)
      // .sort({ createdAt: -1 });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// L O A D  N E W
module.exports.loadNews = async (req, res) => {
  try {
    await publicationModel
      .find({ createdAt: { $gt: req.params.date } })
      .limit(1)
      .populate("likers", "name picture tag")
      .populate("id_user", "name picture tag")
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
    await publicationModel
      .find({ createdAt: { $lt: req.params.date } })
      .limit(1)
      .sort({ createdAt: -1 })
      .populate("likers", "name picture tag")
      .populate("id_user", "name picture tag")
      .populate({
        path: "comments",
        populate: { path: "commenterId", select: "name picture tag" },
      })
      .then((doc) => res.send(doc));
  } catch (error) {
    res.send(error.message);
  }
};

//UPDATE
module.exports.updatePublication = async (req, res) => {};

//DELETE
module.exports.deletePublication = async (req, res) => {};

// L I K E
module.exports.likeOrNotPost = async (req, res) => {
  try {
    var result;
    if (req.body.like) {
      result = await publicationModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: { likers: req.body.id_user },
        },
        { new: true,select:'likers' }
      );
    } else {
      result = await publicationModel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { likers: req.body.id_user },
        },
        { new: true,select:'likers' }
      );
    }
    res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(400);
  }
};

// C O M M E N T  P O S T
module.exports.commentpost = async (req, res) => {
  try {
    const comment = await publicationModel.findByIdAndUpdate(req.params.id, {
      $push: { comments: {commenterId:req.body.commenterId,text:req.body.text} },
    },{new:true,select:'comments'}).populate({
      path: "comments",
      populate: { path: "commenterId", select: "name picture tag" },
    });
    res.status(200).json(comment);
  } catch (error) {
    console.log(error);
    res.status(201).send(error);
  }
};

module.exports.deleteCommentpost = async (req, res) => {
  await publicationModel.findOneAndUpdate(
    { _id: req.params.id },
    {
      $pull: { comments: { _id: req.params.commentId } },
    },{ new: true, select: "comments" }
  ).populate({
    path: "comments",
    populate: { path: "commenterId", select: "name picture tag" },
  })
  .then((doc) => res.status(200).json(doc))
  .catch((err) => {
    res.status(500).send(err);
    console.log(err);
  });
};
