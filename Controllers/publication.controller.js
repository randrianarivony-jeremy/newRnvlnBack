const Comments = require("../Models/comments.model");
const contentFeedModel = require("../Models/contentFeed.model");
const notificationModel = require("../Models/notification.model");
const publicationModel = require("../Models/publication.model");

//CREATE
module.exports.createPublication = async (req, res) => {
  const { content,contentType, id_user, bg, description,subscribers_only } = req.body;
  try {
    const result = await publicationModel.create({content,id_user,description,bg,contentType,subscribers_only});
    await contentFeedModel.create({id_content:result._id,docModel:'publication'});    //if we use mix feed
    res.status(201).json(result);
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
      .populate("likers", "name picture job")
      .populate("id_user", "name picture job")
      .populate({
        path: "comments",
        populate: { path: "commenterId", select: "name picture job" },
      })
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//READ
module.exports.readUserPublication = async (req, res) => {
  try {
    const result = await publicationModel
      .find({id_user:req.params.id}).select('id_user content contentType bg')
    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

//READ ALL
module.exports.readAllPublications = async (req, res) => {
  try {
    const result = await publicationModel
      .find()
      .populate("likers", "name picture job")
      .populate("id_user", "name picture job")
      .populate({
        path: "comments",
        populate: { path: "commenterId", select: "name picture job" },
      })
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
    await publicationModel
      .find({ createdAt: { $gt: req.params.date } })
      .limit(1)
      .populate("likers", "name picture tag")
      .populate("id_user", "name picture tag")
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
    await publicationModel.findByIdAndUpdate(
        req.params.id,
        {$push: { likers: req.body.id_user },},
        { new: true, select: "id_user likeNotification" }
      )
      .then(async (publication) => {
          // notification
          if (publication.id_user == req.body.id_user) {  //liking own post
            res.status(200).send("liking post success");
          } else {
            if (publication.likeNotification === null) {  //first like
              notificationModel.create({
                  action: "like",
                  to: publication.id_user,
                  from: req.body.id_user,
                  on: publication._id,
                  docModel:'publication'
                })
                .then((newNotification) => {
                  publication.likeNotification = newNotification._id;
                  publication.save().then(
                    () => res.status(200).send("liking post success"),
                    (err) => {
                      console.log("publication updating likenotification failed for liking publication " +req.params.id +"---" +err);
                      res.status(500).send("liking failed");
                    }
                  );
                },err=>{
                  console.log("creating notification failed for liking publication " +req.params.id +"---" +err);
                      res.status(500).send("liking failed");
                });
            } else {
              notificationModel
                .findByIdAndUpdate(publication.likeNotification, {
                  $set: { from: req.body.id_user },
                })
                .then(
                  () => res.status(200).send("liking post success"),
                  (err) => {
                    console.log("notification updating failed for liking publication " +req.params.id +"---" +err);
                    res.status(500).send("liking failed");
                  }
                );
            }
          }
        },
        (err) => {
          console.log("publication updating failed for liking publication " +req.params.id +"---" +err);
          res.status(500).send("liking failed");
        }
      );
  } else {
    publicationModel.findByIdAndUpdate(
      req.params.id,
        {
          $pull: { likers: req.body.id_user },
        },
        { new: true,select:'likers likeNotification' }
      )
      .then((publication) => {
          if (publication.likers.length === 0) {
            notificationModel.findByIdAndDelete(publication.likeNotification)
              .then(
                () => {
                  publication.likeNotification = null;
                  publication.save().then(
                    () => res.status(200).send("unliking publication done"),
                    (err) => {
                      console.log("setting likenotification to null failed for unliking publication " +req.params.id +"---" +err);
                      res.status(500).send("unliking failed");
                    }
                  );
                },
                (err) => {
                  console.log("deleting notification failed for unliking publication " +req.params.id +"---" +err);
                  res.status(500).send("unliking failed");
                }
              );
          } else res.status(200).send("unliking publication done");
        },
        (err) => {
          console.log("publication updating failed for unliking publication " +req.params.id +"---" +err);
          res.status(500).send("unliking failed");
        }
      );
  }
};

//F E T C H  C O M M E N T S
module.exports.fetchComments=async(req,res)=>{
  await publicationModel.findById(req.params.id,'comments')
  .populate({
    path: "comments",
    populate: { path: "commenterId", select: "name picture job" },
  })
  .then(doc=>res.status(200).json(doc.comments))
  .catch(err=>{
    console.log('Fetching comments failed for publication '+req.params.id+' --- '+err);
    res.status(500).send(err.message)
  })
}

//C O M M E N T
module.exports.commentPublication = async (req, res) => {
  await publicationModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            text: req.body.text,
          },
        },
      },
      { new: true,select:'comments id_user commentNotification' }
    )
    .populate({
      path: "comments",
      populate: { path: "commenterId", select: "name picture job" },
    })
    .then(async (publication) => {
        // notification
        if (publication.id_user == req.body.commenterId) {  //commenting own post
          res.status(200).json(publication.comments);
        } else {
          if (publication.commentNotification === null) {  //first comment
            notificationModel.create({
                action: "comment",
                to: publication.id_user,
                from: req.body.commenterId,
                on: publication._id,
                docModel:'publication'
              })
              .then((newNotification) => {
                publication.commentNotification = newNotification._id;
                publication.save().then(
                  () => res.status(200).json(publication.comments),
                  (err) => {
                    console.log("publication updating commentnotification failed for liking publication " +req.params.id +"---" +err);
                    res.status(500).send("comment failed");
                  }
                );
              },err=>{
                console.log("creating notification failed for commenting publication " +req.params.id +"---" +err);
                    res.status(500).send("comment failed");
              });
          } else {
            notificationModel
              .findByIdAndUpdate(publication.commentNotification, {
                $set: { from: req.body.commenterId },
              })
              .then(
                () => res.status(200).json(publication.comments),
                (err) => {
                  console.log("notification updating failed for commenting publication " +req.params.id +"---" +err);
                  res.status(500).send("comment failed");
                }
              );
          }
        }
      },
      (err) => {
        console.log("pushing comment failed for commenting publication " +req.params.id +"---" +err);
        res.status(500).send("comment failed");
      }
    );

};

// D E L E T E  C O M M E N T 
module.exports.deleteCommentPublication = async (req, res) => {
publicationModel.findByIdAndUpdate(
  req.params.id,
    {
      $pull: { comments: { _id: req.params.commentId } },
    },
    { new: true,select:'comments commentNotification' }
  ).populate({
    path: "comments",
    populate: { path: "commenterId", select: "name picture job" },
  })
  .then((publication) => {
      if (publication.comments.length === 0) {
        notificationModel.findByIdAndDelete(publication.commentNotification)
          .then(
            () => {
              publication.commentNotification = null;
              publication.save().then(
                () => res.status(200).json(publication.comments),
                (err) => {
                  console.log("setting commentnotification to null failed for deleting comment publication " +req.params.id +"---" +err);
                  res.status(500).send("deleting comment failed");
                }
              );
            },
            (err) => {
              console.log("deleting notification failed for deletecomment publication " +req.params.id +"---" +err);
              res.status(500).send("deleting comment failed");
            }
          );
      } else res.status(200).json(publication.comments);
    },
    (err) => {
      console.log("publication updating failed for deleting comment publication " +req.params.id +"---" +err);
      res.status(500).send("deleting comment failed");
    }
  )
};
