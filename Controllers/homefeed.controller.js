const publicationModel = require("../Models/publication.model");
const interviewModel = require("../Models/interview.model");

module.exports.fetchHomeFeeds = async (req, res) => {
  let nbOfDay = 86400000;
  let result = [];
  try {
    while (result.length === 0) {
      const data = await Promise.all([
        publicationModel
          .find({
            $and: [
              {
                createdAt: {
                  $lt: req.params.date,
                  $gt: req.params.date - nbOfDay,
                },
              },
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
          .sort({ $natural: -1 })
          .populate("id_user", "name picture job"),
        interviewModel
          .find({
            $and: [
              {
                createdAt: {
                  $lt: req.params.date,
                  $gt: req.params.date - nbOfDay,
                },
              },
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
          .sort({ $natural: -1 })
          .populate("id_user", "name picture job")
          .populate({
            path: "question",
            populate: { path: "interviewer", select: "name picture job" },
          }),
      ]);
      result = data[0].concat(data[1]);
      nbOfDay += 86400000;
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send("some error occurs");
    console.log(error);
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