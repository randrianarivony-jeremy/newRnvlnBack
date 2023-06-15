const interviewModel = require("../Models/interview.model");
const questionModel = require("../Models/question.model");
const notificationModel = require("../Models/notification.model");

//CREATE
module.exports.createInterview = async (req, res) => {
  const { data, id_user, question, public } = req.body;
  try {
    const interview = await interviewModel.create({
      data,
      id_user,
      question,
      public,
    });

    const questionDoc = await questionModel.findByIdAndUpdate(
      question,
      {
        $push: { interviews: interview._id },
      },
      { new: true, select: "-interviews" }
    );

    //notification
    if (questionDoc.interviewer != id_user) {
      if (questionDoc.interviewNotification === null) {
        //first interview
        await notificationModel
          .create({
            action: "interview",
            from: id_user,
            to: questionDoc.interviewer,
            on: interview._id,
          })
          .then((newNotification) => {
            questionDoc.interviewNotification = newNotification._id;
            questionDoc.save();
          });
      } else {
        await notificationModel.findByIdAndUpdate(
          questionDoc.interviewNotification,
          {
            $set: { from: id_user, on: interview._id },
          }
        );
      }
    }

    res.status(201).json(interview);
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
      .populate("id_user", "name picture job")
      .populate({
        path: "question",
        populate: { path: "interviewer", select: "name picture job" },
      });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//READ ALL
module.exports.readQuestionInterviews = async(req,res)=>{
  try {
      const result = await interviewModel.find({question:req.params.questionId})
      .populate("id_user", "name picture job")
      .populate({
        path: "question",
        populate: { path: "interviewer", select: "name picture job" },
      })
      .sort({ $natural: -1 });
      res.status(200).json(result);
  } catch (error) {
      res.status(500).send(error.message);
  }
}

//READ USER INTERVIEWS
module.exports.readUserInterviews = async (req, res) => {
  try {
    const result = await interviewModel
      .find({ id_user: req.params.id })
      .select("id_user data type createdAt");
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//READ ALL
module.exports.fetchInterviews = (req, res) => {
  interviewModel
    .find({
      $or: [
        { public: true },
        { id_user: res.locals.user?.friends },
        { id_user: res.locals.user?._id },
        { id_user: res.locals.user?.subscriptions },
      ],
    })
    .populate("id_user", "name picture job")
    .populate({
      path: "question",
      populate: { path: "interviewer", select: "name picture job" },
    })
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      res.status(500).send("some error occurs");
      console.log(err);
    });
};

//UPDATE
module.exports.updateInterview = async (req, res) => {};

//DELETE
module.exports.deleteInterview = async (req, res) => {};

// L I K E
module.exports.likeOrNotInterview = async (req, res) => {
  if (req.body.like) {
    await interviewModel
      .findByIdAndUpdate(
        req.params.id,
        { $push: { likers: req.body.id_user } },
        { new: true, select: "id_user likeNotification" }
      )
      .then(
        async (interview) => {
          // notification
          if (interview.id_user == req.body.id_user) {
            //liking own post
            res.status(200).send({ Success: "liking post success" });
          } else {
            if (interview.likeNotification === null) {
              //first like
              notificationModel
                .create({
                  action: "like",
                  to: interview.id_user,
                  from: req.body.id_user,
                  on: interview._id,
                  docModel: "interview",
                })
                .then(
                  (newNotification) => {
                    interview.likeNotification = newNotification._id;
                    interview.save().then(
                      () => res.status(200).send({Success:"liking post success"}),
                      (err) => {
                        console.log(
                          "interview updating likenotification failed for liking interview " +
                            req.params.id +
                            "---" +
                            err
                        );
                        res.status(500).send("liking failed");
                      }
                    );
                  },
                  (err) => {
                    console.log(
                      "creating a notification failed for liking interview " +
                        req.params.id +
                        "---" +
                        err
                    );
                    res.status(500).send("liking failed");
                  }
                );
            } else {
              notificationModel
                .findByIdAndUpdate(interview.likeNotification, {
                  $set: { from: req.body.id_user },
                })
                .then(
                  () => {
                    res.status(200).send({Success:"liking post success"});
                  },
                  (err) => {
                    console.log(
                      "notification updating failed for liking interview " +
                        req.params.id +
                        "---" +
                        err
                    );
                    res.status(500).send("liking failed");
                  }
                );
            }
          }
        },
        (err) => {
          console.log(
            "interview updating failed for liking interview " +
              req.params.id +
              "---" +
              err
          );
          res.status(500).send("liking failed");
        }
      );
  } else {
    interviewModel
      .findByIdAndUpdate(
        req.params.id,
        {
          $pull: { likers: req.body.id_user },
        },
        { new: true, select: "likers likeNotification" }
      )
      .then(
        (interview) => {
          if (interview.likers.length === 0) {
            notificationModel
              .findByIdAndDelete(interview.likeNotification)
              .then(
                () => {
                  interview.likeNotification = null;
                  interview.save().then(
                    () =>
                      res
                        .status(200)
                        .send({ Success: "unliking interview done" }),
                    (err) => {
                      console.log(
                        "setting likenotification to null failed for unliking interview " +
                          req.params.id +
                          "---" +
                          err
                      );
                      res.status(500).send("unliking failed");
                    }
                  );
                },
                (err) => {
                  console.log(
                    "deleting notification failed for unliking interview " +
                      req.params.id +
                      "---" +
                      err
                  );
                  res.status(500).send("unliking failed");
                }
              );
          } else res.status(200).send({ Success: "unliking interview done" });
        },
        (err) => {
          console.log(
            "interview updating failed for unliking interview " +
              req.params.id +
              "---" +
              err
          );
          res.status(500).send("unliking failed");
        }
      );
  }
};

//F E T C H  C O M M E N T S
module.exports.fetchComments = async (req, res) => {
  // console.log(res.locals.user)
  await interviewModel
    .findById(req.params.id, "comments")
    .populate({
      path: "comments",
      populate: { path: "commenterId", select: "name picture job" },
    })
    .then((doc) => res.status(200).json(doc.comments))
    .catch((err) => {
      console.log(
        "Fetching comments failed for interview " +
          req.params.id +
          " --- " +
          err
      );
      res.status(500).send(err.message);
    });
};

//C O M M E N T
module.exports.commentInterview = async (req, res) => {
  await interviewModel
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
      { new: true, select: "comments id_user commentNotification" }
    )
    .populate({
      path: "comments",
      populate: { path: "commenterId", select: "name picture tag" },
    })
    .then(
      async (interview) => {
        // notification
        if (interview.id_user == req.body.commenterId) {
          //commenting own post
          res.status(200).json(interview.comments);
        } else {
          if (interview.commentNotification === null) {
            //first comment
            notificationModel
              .create({
                action: "comment",
                to: interview.id_user,
                from: req.body.commenterId,
                on: interview._id,
                docModel: "interview",
              })
              .then(
                (newNotification) => {
                  interview.commentNotification = newNotification._id;
                  interview.save().then(
                    () => res.status(200).json(interview.comments),
                    (err) => {
                      console.log(
                        "interview updating commentnotification failed for liking interview " +
                          req.params.id +
                          "---" +
                          err
                      );
                      res.status(500).send("comment failed");
                    }
                  );
                },
                (err) => {
                  console.log(
                    "creating notification failed for commenting interview " +
                      req.params.id +
                      "---" +
                      err
                  );
                  res.status(500).send("comment failed");
                }
              );
          } else {
            notificationModel
              .findByIdAndUpdate(interview.commentNotification, {
                $set: { from: req.body.commenterId },
              })
              .then(
                () => res.status(200).json(interview.comments),
                (err) => {
                  console.log(
                    "notification updating failed for commenting interview " +
                      req.params.id +
                      "---" +
                      err
                  );
                  res.status(500).send("comment failed");
                }
              );
          }
        }
      },
      (err) => {
        console.log(
          "pushing comment failed for commenting interview " +
            req.params.id +
            "---" +
            err
        );
        res.status(500).send("comment failed");
      }
    );
};

// D E L E T E  C O M M E N T
module.exports.deleteCommentpost = async (req, res) => {
  interviewModel
    .findByIdAndUpdate(
      req.params.id,
      {
        $pull: { comments: { _id: req.params.commentId } },
      },
      { new: true, select: "comments commentNotification" }
    )
    .populate({
      path: "comments",
      populate: { path: "commenterId", select: "name picture tag" },
    })
    .then(
      (interview) => {
        if (interview.comments.length === 0) {
          notificationModel
            .findByIdAndDelete(interview.commentNotification)
            .then(
              () => {
                interview.commentNotification = null;
                interview.save().then(
                  () => res.status(200).json(interview.comments),
                  (err) => {
                    console.log(
                      "setting commentnotification to null failed for deleting comment interview " +
                        req.params.id +
                        "---" +
                        err
                    );
                    res.status(500).send("deleting comment failed");
                  }
                );
              },
              (err) => {
                console.log(
                  "deleting notification failed for deletecomment interview " +
                    req.params.id +
                    "---" +
                    err
                );
                res.status(500).send("deleting comment failed");
              }
            );
        } else res.status(200).json(interview.comments);
      },
      (err) => {
        console.log(
          "interview updating failed for deleting comment interview " +
            req.params.id +
            "---" +
            err
        );
        res.status(500).send("deleting comment failed");
      }
    );
};

// S E A R C H
module.exports.searchInterviews = (req, res) => {
  interviewModel
    .find({
      $and: [
        {
          $or: [
            { "data.content": { $regex: req.query.query, $options: "i" } },
            { "data.description": { $regex: req.query.query, $options: "i" } },
          ],
        },
        {
          $or: [
            { public: true },
            { id_user: res.locals.user.friends },
            { id_user: res.locals.user._id },
            { id_user: res.locals.user.subscriptions },
          ],
        },
      ],
    })
    .then((result) => res.status(200).json(result))
    .catch((err) =>
      res.status(500).send("Error while querying interview :" + err)
    );
};