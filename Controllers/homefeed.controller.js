const publicationModel = require("../Models/publication.model");
const interviewModel = require("../Models/interview.model");

module.exports.fetchHomeFeeds = async (req, res) => {
  const date = Date.now();
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
                  $lt: date,
                  $gt: date - nbOfDay,
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
                  $lt: date,
                  $gt: date - nbOfDay,
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

module.exports.fetchMoreHomeFeeds = async (req, res) => {
  const date = req.params.date;
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
                  $lt: date,
                  $gt: date - nbOfDay,
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
                  $lt: date,
                  $gt: date - nbOfDay,
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