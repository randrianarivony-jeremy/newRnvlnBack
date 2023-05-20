const publicationModel = require("../Models/publication.model");
const interviewModel = require("../Models/interview.model");
const questionModel = require("../Models/question.model");

module.exports.fetchHomeFeeds = async (req, res) => {
  let publications, interviews, questions;

  const fetchPublications = async () => {
    publications = await publicationModel
      .find({
        $or: [
          { public: true },
          { id_user: res.locals.user?.friends },
          { id_user: res.locals.user?._id },
          { id_user: res.locals.user?.subscriptions },
        ],
      })
      .sort({createdAt:-1})
      // .limit(3)
      .populate("id_user", "name picture job");
  };

  const fetchQuestions = async () => {
    questions = await questionModel
      .find()
      .select("-interviewNotification")
      .populate("interviewer", "name picture job");
  };

  const fetchInterviews = async () => {
    interviews = await interviewModel
      .find({
        $or: [
          { public: true },
          { id_user: res.locals.user?.friends },
          { id_user: res.locals.user?._id },
          { id_user: res.locals.user?.subscriptions },
        ],
      })
      .populate("id_user", "name picture job");
  };

  Promise.all([
    fetchPublications(),
    fetchInterviews(),
    fetchQuestions(),
  ])
    .then(() => {
      interviews = interviews.map((data) => {
        data.question = questions.find(
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
        publications.concat(interviews,questions).sort((a, b) => b.createdAt - a.createdAt)
      );
    })
    .catch((err) => {
      res.status(500).send("some error occurs");
      console.log(err);
    });
};
