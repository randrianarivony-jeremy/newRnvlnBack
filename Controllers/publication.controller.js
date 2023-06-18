const publicationModel = require("../Models/publication.model");
const questionModel = require("../Models/question.model");
const notificationModel = require("../Models/notification.model");
const UserModel = require("../Models/user.model");

//CREATE
module.exports.createPublication = async (req, res) => {
  const { data, id_user, public } = req.body;
  try {
    const publication = await publicationModel.create({
      data,
      id_user,
      public,
    });
    res.status(201).json(publication);
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
      .populate("id_user", "name picture job");
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//READ USER PUBLICATIONS
module.exports.readUserPublications = async (req, res) => {
  try {
    const result = await publicationModel
      .find({ id_user: req.params.id })
      .select("id_user data type createdAt");
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//READ ALL
module.exports.fetchPublications = async (req, res) => {
  const currentUser = await UserModel.findById(req.id);
  await publicationModel
    .find({
      $or: [
        { public: true },
        { id_user: currentUser.friends },
        { id_user: req.id },
        { id_user: currentUser.subscriptions },
      ],
    })
    .populate("id_user", "name picture job")
    .then((docs) => {
      res.json(docs);
    })
    .catch((err) => {
      res.status(500).send("some error occurs while fetching publications");
      console.log(err);
    });
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
        async (publication) => {
          // notification
          if (publication.id_user == req.body.id_user) {
            //liking own post
            res.status(200).send({ Success: "liking post success" });
          } else {
            if (publication.likeNotification === null) {
              //first like
              notificationModel
                .create({
                  action: "like",
                  to: publication.id_user,
                  from: req.body.id_user,
                  on: publication._id,
                  docModel: "publication",
                })
                .then(
                  (newNotification) => {
                    publication.likeNotification = newNotification._id;
                    publication.save().then(
                      () =>
                        res
                          .status(200)
                          .send({ Success: "liking post success" }),
                      (err) => {
                        console.log(
                          "publication updating likenotification failed for liking publication " +
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
                      "creating notification failed for liking publication " +
                        req.params.id +
                        "---" +
                        err
                    );
                    res.status(500).send("liking failed");
                  }
                );
            } else {
              notificationModel
                .findByIdAndUpdate(publication.likeNotification, {
                  $set: { from: req.body.id_user },
                })
                .then(
                  () => {
                    res.status(200).send({ Success: "liking post success" });
                  },
                  (err) => {
                    console.log(
                      "notification updating failed for liking publication " +
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
            "publication updating failed for liking publication " +
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
        (publication) => {
          if (publication.likers.length === 0) {
            notificationModel
              .findByIdAndDelete(publication.likeNotification)
              .then(
                () => {
                  publication.likeNotification = null;
                  publication.save().then(
                    () =>
                      res
                        .status(200)
                        .send({ Success: "unliking publication done" }),
                    (err) => {
                      console.log(
                        "setting likenotification to null failed for unliking publication " +
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
                    "deleting notification failed for unliking publication " +
                      req.params.id +
                      "---" +
                      err
                  );
                  res.status(500).send("unliking failed");
                }
              );
          } else res.status(200).send({ Success: "unliking publication done" });
        },
        (err) => {
          console.log(
            "publication updating failed for unliking publication " +
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
  // console.log(currentUser)
  await publicationModel
    .findById(req.params.id, "comments")
    .populate({
      path: "comments",
      populate: { path: "commenterId", select: "name picture job" },
    })
    .then((doc) => res.status(200).json(doc.comments))
    .catch((err) => {
      console.log(
        "Fetching comments failed for publication " +
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
      async (publication) => {
        // notification
        if (publication.id_user == req.body.commenterId) {
          //commenting own post
          res.status(200).json(publication.comments);
        } else {
          if (publication.commentNotification === null) {
            //first comment
            notificationModel
              .create({
                action: "comment",
                to: publication.id_user,
                from: req.body.commenterId,
                on: publication._id,
                docModel: "publication",
              })
              .then(
                (newNotification) => {
                  publication.commentNotification = newNotification._id;
                  publication.save().then(
                    () => res.status(200).json(publication.comments),
                    (err) => {
                      console.log(
                        "publication updating commentnotification failed for liking publication " +
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
                    "creating notification failed for commenting publication " +
                      req.params.id +
                      "---" +
                      err
                  );
                  res.status(500).send("comment failed");
                }
              );
          } else {
            notificationModel
              .findByIdAndUpdate(publication.commentNotification, {
                $set: { from: req.body.commenterId },
              })
              .then(
                () => res.status(200).json(publication.comments),
                (err) => {
                  console.log(
                    "notification updating failed for commenting publication " +
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
          "pushing comment failed for commenting publication " +
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
      (publication) => {
        if (publication.comments.length === 0) {
          notificationModel
            .findByIdAndDelete(publication.commentNotification)
            .then(
              () => {
                publication.commentNotification = null;
                publication.save().then(
                  () => res.status(200).json(publication.comments),
                  (err) => {
                    console.log(
                      "setting commentnotification to null failed for deleting comment publication " +
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
                  "deleting notification failed for deletecomment publication " +
                    req.params.id +
                    "---" +
                    err
                );
                res.status(500).send("deleting comment failed");
              }
            );
        } else res.status(200).json(publication.comments);
      },
      (err) => {
        console.log(
          "publication updating failed for deleting comment publication " +
            req.params.id +
            "---" +
            err
        );
        res.status(500).send("deleting comment failed");
      }
    );
};

// S E A R C H
module.exports.searchPublications = async (req, res) => {
  const currentUser = await UserModel.findById(req.id);
  publicationModel
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
            { id_user: currentUser.friends },
            { id_user: req.id },
            { id_user: currentUser.subscriptions },
          ],
        },
      ],
    })
    .then((result) => res.status(200).json(result))
    .catch((err) =>
      res.status(500).send("Error while querying publication :" + err)
    );
};