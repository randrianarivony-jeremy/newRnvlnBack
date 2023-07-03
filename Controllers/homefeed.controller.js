const publicationModel = require("../Models/publication.model");
const interviewModel = require("../Models/interview.model");
const questionModel = require("../Models/question.model");
const UserModel = require("../Models/user.model");
const subscriptionModel = require("../Models/subscription.model");

module.exports.fetchHomeFeeds = async (req, res) => {
  const currentUser = await UserModel.findById(req.id, "friends");
  let subscriptions = await subscriptionModel
    .find({ userId: req.id }, "subscribedTo")
    .lean();
  subscriptions = subscriptions.map((elt) => elt.subscribedTo);
  const date = Date.now();
  let nbOfDay = 86400000;
  let result = [];
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
                { id_user: currentUser.friends },
                { id_user: currentUser._id },
                { id_user: subscriptions },
              ],
            },
          ],
        })
        .lean()
        // .sort({ $natural: -1 })
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
                { id_user: currentUser.friends },
                { id_user: currentUser._id },
                { id_user: subscriptions },
              ],
            },
          ],
        })
        .lean()
        // .sort({ $natural: -1 })
        .populate("id_user", "name picture job")
        .populate({
          path: "question",
          populate: { path: "interviewer", select: "name picture job" },
        }),
      questionModel
        .find(
          {
            createdAt: {
              $lt: date,
              $gt: date - nbOfDay,
            },
          },
          "-interviewNotification"
        )
        .lean()
        // .sort({ $natural: -1 })
        .populate("interviewer", "name picture job"),
    ]);
    result = data[0].concat(data[1], data[2]);
    nbOfDay += 86400000;
  }
  res.status(200).json(result);
};

module.exports.fetchMoreHomeFeeds = async (req, res) => {
  const currentUser = await UserModel.findById(req.id, "friends");
  let subscriptions = await subscriptionModel
    .find({ userId: req.id }, "subscribedTo")
    .lean();
  subscriptions = subscriptions.map((elt) => elt.subscribedTo);
  const date = req.params.date;
  let nbOfDay = 86400000;
  let result = [];
  if (req.params.date === process.env.OLDEST_CONTENT)
    return res.status(204).json(result);
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
                { id_user: currentUser.friends },
                { id_user: currentUser._id },
                { id_user: subscriptions },
              ],
            },
          ],
        })
        .lean()
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
                { id_user: currentUser.friends },
                { id_user: currentUser._id },
                { id_user: subscriptions },
              ],
            },
          ],
        })
        .lean()
        .sort({ $natural: -1 })
        .populate("id_user", "name picture job")
        .populate({
          path: "question",
          populate: { path: "interviewer", select: "name picture job" },
        }),
      questionModel
        .find(
          {
            createdAt: {
              $lt: date,
              $gt: date - nbOfDay,
            },
          },
          "-interviewNotification"
        )
        .lean()
        // .sort({ $natural: -1 })
        .populate("interviewer", "name picture job"),
    ]);
    result = data[0].concat(data[1], data[2]);
    nbOfDay += 86400000;
  }
  res.status(200).json(result);
};