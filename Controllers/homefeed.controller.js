const publicationModel = require("../Models/publication.model");
const interviewModel = require("../Models/interview.model");
const questionModel = require("../Models/question.model");

module.exports.fetchHomeFeeds = (req, res) => {
  Promise.all([
    publicationModel
      .find({
        $or: [
          { public: true },
          { id_user: res.locals.user?.friends },
          { id_user: res.locals.user?._id },
          { id_user: res.locals.user?.subscriptions },
        ],
      })
      .sort({ $natural: -1 })
      .limit(2)
      .populate("id_user", "name picture job"),
    interviewModel
      .find({
        $or: [
          { public: true },
          { id_user: res.locals.user?.friends },
          { id_user: res.locals.user?._id },
          { id_user: res.locals.user?.subscriptions },
        ],
      })
      .sort({ $natural: -1 })
      .limit(2)
      .populate("id_user", "name picture job")
      .populate({
        path: "question",
        populate: { path: "interviewer", select: "name picture job" },
      }),
  ])
    .then((docs) => {
      res.json(
        docs[0].concat(docs[1]).sort((a, b) => b.createdAt - a.createdAt)
      );
    })
    .catch((err) => {
      res.status(500).send("some error occurs");
      console.log(err);
    });
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