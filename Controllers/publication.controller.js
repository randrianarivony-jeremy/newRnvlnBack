const publicationModel = require("../Models/publication.model");
const questionModel = require("../Models/question.model");
const notificationModel = require("../Models/notification.model");

//CREATE
module.exports.createPublication = async (req, res) => {
  const {type,content,contentType,id_user,question,bg,description,public,} = req.body;
  try {
    const interview = await publicationModel.create({content,type,id_user,question,description,bg,contentType,public});

    if (type === "interview") {
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
          await notificationModel.create({
              action: "interview",
              from: id_user,
              to: questionDoc.interviewer,
              on: interview._id,
              docModel: "interview",
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
    }

    res.status(201).json(interview);
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

//READ USER PUBLICATIONS
module.exports.readUserPublications = async (req, res) => {
  try {
    const result = await publicationModel
    .find({$and:[{id_user: req.params.id},{type:'article'}]  })
    .select("id_user content contentType bg");
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//READ USER INTERVIEWS
module.exports.readUserInterviews = async (req, res) => {
  try {
    const result = await publicationModel
      .find({$and:[{id_user: req.params.id},{type:'interview'}]  })
      .select("id_user content contentType bg");
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//READ ALL
module.exports.fetchPublications = async (req, res) => {
  let publicPublications,privatePublications;
  const fetchPublicPublications=async()=>{
    publicPublications = await publicationModel
    .find({public:true})
    .populate("id_user", "name picture job")
    .populate({
      path: "question",strictPopulate:false,
      populate: { path: "interviewer", select: "name picture job" },
    });
  }

  const fetchPrivatePublications=async()=>{
    privatePublications = await publicationModel
    .find({$and:[{public:false},{$or:[{id_user:res.locals.user?.friends},{id_user:res.locals.user?._id},{id_user:res.locals.user?.subscriptions}]}]})
    .populate("id_user", "name picture job")
    .populate({
      path: "question",strictPopulate:false,
      populate: { path: "interviewer", select: "name picture job" },
    });
  }

  Promise.all([fetchPublicPublications(),fetchPrivatePublications()])
  .then(()=>{
    const publications = publicPublications.concat(privatePublications).sort((a,b)=>b.createdAt-a.createdAt)
    res.json(publications)})
    .catch(err=>{
      res.status(500).send('some error occurs');
      console.log(err)
    })
};

// L O A D  N E W
module.exports.loadNews = async (req, res) => {
  try {
    await publicationModel
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
    await publicationModel
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
module.exports.updatePublication = async (req, res) => {};

//DELETE
module.exports.deletePublication = async (req, res) => {};

// L I K E
module.exports.likeOrNotPublication = async (req, res) => {
  if (req.body.like) {
    await publicationModel
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
            res.status(200).send("liking post success");
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
                      () => res.status(200).send("liking post success"),
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
                      "creating notification failed for liking interview " +
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
                  () => res.status(200).send("liking post success"),
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
    publicationModel
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
                    () => res.status(200).send("unliking interview done"),
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
          } else res.status(200).send("unliking interview done");
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
  await publicationModel
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
module.exports.commentPublication = async (req, res) => {
  await publicationModel
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
  publicationModel
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

//P R O J E C T
module.exports.projectPost = async (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);
  // req.body:like et id_user
  try {
    var projecters;
    if (req.body.project) {
      projecters = await publicationModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: { project: req.body.id_user },
        },
        { new: true }
      );
    } else {
      projecters = await publicationModel.findByIdAndUpdate(
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
      save = await publicationModel.findByIdAndUpdate(
        req.params.id,
        {
          $push: { savings: req.body.id_user },
        },
        { new: true }
      );
    } else {
      save = await publicationModel.findByIdAndUpdate(req.params.id, {
        $pull: { savings: req.body.id_user },
      });
    }

    res.status(200).json(save);
  } catch (err) {
    console.log(err);
    return res.status(400);
  }
};
