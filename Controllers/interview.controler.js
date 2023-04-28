const Comments = require("../Models/comments.model");
const interviewModel = require("../Models/interview.model");
const questionModel = require("../Models/question.model");
const contentFeedModel = require("../Models/contentFeed.model");

//CREATE
module.exports.createInterview = async (req, res) => {
  const { content, contentType, id_user, question, bg, description } = req.body;
  try {
    const result = await interviewModel.create({
      content,
      id_user,
      question,
      description,
      bg,
      contentType,
    });
    await questionModel.findByIdAndUpdate(
      question,
      {
        $push: { interviewees: id_user },
      },
      { new: true }
    );
    await contentFeedModel.create({
      id_content: result._id,
      docModel: "interview",
    }); //if we use mix feed
    res.status(201).json(result);
  } catch (error) {
    res.status(500).send(error.message);
    console.log(error);
  }
};

//READ
module.exports.readInterview = async (req, res) => {
  try {
    const result = await interviewModel
      .findById(req.params.id)
      .populate("likers", "name picture job")
      .populate("id_user", "name picture job")
      // .populate("question",'data bg')
      .populate({
        path: "comments",
        populate: { path: "commenterId", select: "name picture job" },
      })
      .populate({
        path: "question",
        populate: { path: "interviewer", select: "name picture job" },
      });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//READ
module.exports.readUserInterview = async (req, res) => {
  try {
    const result = await interviewModel
      .find({ id_user: req.params.id }).select('id_user content contentType bg')
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//READ ALL
module.exports.readAllInterviews = async (req, res) => {
  try {
    const result = await interviewModel
      .find()
      .populate("likers", "name picture job")
      .populate("id_user", "name picture job")
      .populate("question")
      .populate({
        path: "comments",
        populate: [{ path: "commenterId", select: "name picture job" }],
      })
      .populate({
        path: "question",
        populate: { path: "commenterId", select: "name picture job" },
      });
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

//UPDATE
module.exports.updateInterview = async (req, res) => {};

//DELETE
module.exports.deleteInterview = async (req, res) => {};

// L I K E
module.exports.likeOrNotPost = async (req, res) => {
  try {
    if (req.body.like) {
      result = await interviewModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: { likers: req.body.id_user },
        },
        { new: true, select: "likers" }
      );
    } else {
      result = await interviewModel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { likers: req.body.id_user },
        },
        { new: true, select: "likers" }
      );
    }
    res.status(200).send("liking post success");
  } catch (err) {
    console.log(err);
    return res.status(400);
  }
};

// C O M M E N T  P O S T
module.exports.commentpost = async (req, res) => {
  try {
    const comment = await interviewModel
      .findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            comments: {
              commenterId: req.body.commenterId,
              text: req.body.text,
            },
          },
        },
        { new: true, select: "comments" }
      )
      .populate({
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
  await interviewModel
    .findOneAndUpdate(
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

//P R O J E C T
module.exports.projectPost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);
  // req.body:like et id_user
  try {
    var projecters;
    if (req.body.project) {
      projecters = await interviewModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: { project: req.body.id_user },
        },
        { new: true }
      );
    } else {
      projecters = await interviewModel.findByIdAndUpdate(
        req.params.id,
        {
          $pull: { project: req.body.id_user },
        },
        { new: true }
      );
    }

    res.status(200).json({ projecters: projecters.project });
  } catch (err) {
    console.log(err);
    return res.status(400);
  }
};

//S A V I N G
module.exports.savePost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);
  // req.body:like et id_user
  try {
    var save;
    if (req.body.save) {
      save = await interviewModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: { savings: req.body.id_user },
        },
        { new: true }
      );
    } else {
      save = await interviewModel.findByIdAndUpdate(req.params.id, {
        $pull: { savings: req.body.id_user },
      });
    }

    res.status(200).json(save);
  } catch (err) {
    console.log(err);
    return res.status(400);
  }
};
