const publicationModel = require("../Models/publication.model");
const interviewModel = require("../Models/interview.model");
const questionModel = require("../Models/question.model");

module.exports.fetchHomeFeeds = (req, res) => {
  Promise.all([
    publicationModel
      .find({
        $and: [
          { createdAt: { $lt: req.params.publication_date } },
          {
            $or: [
              { public: true },
              { id_user: res.locals.user?.friends },
              { id_user: res.locals.user?._id },
              { id_user: res.locals.user?.subscriptions },
            ],
          },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(1)
      .populate("id_user", "name picture job"),
    interviewModel
      .find({
        $and: [
          { createdAt: { $lt: req.params.interview_date } },
          {
            $or: [
              { public: true },
              { id_user: res.locals.user?.friends },
              { id_user: res.locals.user?._id },
              { id_user: res.locals.user?.subscriptions },
            ],
          },
        ],
      })
      .limit(1)
      .populate("id_user", "name picture job"),
    questionModel
      .find({ createdAt: { $lt: req.params.question_date } })
      // .limit(1)
      .select("-interviewNotification")
      .populate("interviewer", "name picture job"),
  ])
    .then((docs) => {
      const interviews = docs[1].map((data) => {
        data.question = docs[2].find(
          (question) => String(question._id) == String(data.question)
        );
        data.question = {
          _id: data.question._id,
          data: data.question.data,
          interviewer: data.question.interviewer,
        };
        return data;
      });
      res.json(
        docs[0]
          .concat(interviews, docs[2])
          .sort((a, b) => b.createdAt - a.createdAt)
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