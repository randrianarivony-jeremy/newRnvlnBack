const UserModel = require("../Models/user.model");
const ObjectId = require("mongoose").Types.ObjectId;
const bcrypt = require("bcrypt");

// R E A D  A L L
module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select("-password");
  res.status(200).json(users);
};

// R E A D  O N E
module.exports.userInfo = (req, res) => {
  UserModel.findById(req.params.id)
    .select(
      "-password -wallet -saving -notificationSeen -messageNotSeen -createdAt -updatedAt -email"
    )
    .populate("followings", "picture name job")
    .populate("followers", "picture name job")
    .populate("subscribers", "picture name job")
    .populate("subscriptions", "picture name job")
    .then(
      (doc) => res.status(200).send(doc),
      (err) => {
        console.log(err);
        res.status(500).send("user not found:" + req.params.id);
      }
    );
};

// R E A D  C U R R E N T  U S E R
module.exports.currentUser = (req, res) => {
  UserModel.findById(req.params.id)
    .select("-password -createdAt -updatedAt")
    .populate("followings", "picture name job")
    .populate("followers", "picture name job")
    .populate("subscribers", "picture name job")
    .populate("subscriptions", "picture name job")
    .then(
      (doc) => res.status(200).send(doc),
      (err) => {
        console.log(err);
        res.status(500).send("user not found:" + req.params.id);
      }
    );
};

// R E L A T I O N
module.exports.follow = async (req, res) => {
  if (req.body.follow) {
    //follow
    await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: { followings: req.body.id_user },
      },
      { new: true }
    ).then(
      async () => {
        await UserModel.findByIdAndUpdate(
          req.body.id_user,
          {
            $push: { followers: req.params.id },
          },
          { new: true }
        ).then(
          () => res.status(200).send("follow success"),
          (err) => {
            console.log("push followers failed");
            res.status(500).send("push followers failed: " + err);
          }
        );
      },
      (err) => {
        console.log("set following failed");
        res.status(500).send("push followings failed: " + err);
      }
    );
  } else {
    //unfollow
    await UserModel.findByIdAndUpdate(req.params.id, {
      $pull: { followings: req.body.id_user },
    }).then(
      async () => {
        await UserModel.findByIdAndUpdate(req.body.id_user, {
          $pull: { followers: req.params.id },
        }).then(
          () => res.status(200).send("unfollow success"),
          (err) => {
            console.log("pull followers failed");
            res.status(500).send("pull followers failed: " + err);
          }
        );
      },
      (err) => {
        console.log("pull following failed");
        res.status(500).send("pull followings failed: " + err);
      }
    );
  }
};

module.exports.enableSubscription = async (req, res) => {
  await UserModel.findById(req.params.id).then(async (user) => {
    const auth = await bcrypt.compare(req.body.password, user.password);
    if (auth) {
      if (req.body.enabled) {
        user.subscription = true;
        user.fees=req.body.fees;
        user.save().then(
          (doc) => res.status(200).json({ subscription: doc.subscription,fees:doc.fees }),
          (err) => {
            console.log("enable subscription failed for " + user + "---" + err);
            res.status(500).send("enable subscription failed");
          }
        );
      } else {
        user.subscription = false;
        user.save().then(
          (doc) => res.status(200).json({ subscription: doc.subscription }),
          (err) => {
            console.log("cancel subscription failed for " + user + "---" + err);
            res.status(500).send("cancel subscription failed");
          }
        );
      }
    } else res.status(400).send("Mot de passe incorrect");
  });
};

module.exports.subscribe = async (req, res) => {
  let follower = await UserModel.findById(req.params.id);
  const auth = await bcrypt.compare(req.body.password, follower.password); //comparrer le name avec le base bcrypt
  if (auth) {
    await UserModel.findById(req.body.id_user).then(
      async (following) => {
        if (follower.wallet < following.fees)
          res.status(400).send("insufficient");
        else {
          follower.wallet -= following.fees;
          follower.subscriptions.push(following._id);
          await follower.save().then(
            async () => {
              following.wallet += following.fees;
              following.subscribers.push(follower._id);
              await following.save().then(
                () => res.status(200).send("subscription success"),
                (err) => {
                  console.log(
                    "Subscribe : following wallet logic failed" + err
                  );
                  res
                    .status(500)
                    .send("error in wallet logic for following (you)");
                }
              );
            },
            (err) => {
              console.log("Subscribe : follower wallet logic failed" + err);
              res.status(500).send("error in wallet logic for follower");
            }
          );
        }
      },
      (err) => {
        console.log(
          "Subscribe : following not found: id" + req.body.id_user + "---" + err
        );
        res.status(500).send("following not found");
      }
    );
  } else {
    res.status(400).send("Mot de passe incorrect");
  }
};

module.exports.unsubscribe = async (req, res) => {
  await UserModel.findById(req.params.id).then(async (follower) => {
    const auth = await bcrypt.compare(req.body.password, follower.password);
    if (auth) {
      await UserModel.findByIdAndUpdate(req.params.id, {
        $pull: { subscriptions: req.body.id_user },
      }).then(
        async () =>
          await UserModel.findByIdAndUpdate(req.body.id_user, {
            $pull: { subscribers: req.params.id },
          }).then(
            () => res.status(200).send("unsubscribe done"),
            (err) => {
              console.log("Unsubscribe : pull subscriber failed" + err);
              res.status(500).send("pull subscriber failed");
            }
          ),
        (err) => {
          console.log(
            "Subscribe : following not found: id" +
              req.body.id_user +
              "---" +
              err
          );
          res.status(500).send("following not found");
        }
      );
    } else {
      res.status(400).send("Mot de passe incorrect");
    }
  });
};

// U P D A T E
module.exports.updateUsername = async (req, res) => {
  await UserModel.findById(req.params.id).then(async (user) => {
    const auth = await bcrypt.compare(req.body.password, user.password);
    if (auth) {
      user.name = req.body.name;
      user.save().then(
        (doc) => res.status(200).json({ name: doc.name }),
        (err) => {
          console.log("update username failed for " + user + "---" + err);
          res.status(500).send("update username failed");
        }
      );
    } else res.status(400).send("Mot de passe incorrect");
  });
};

module.exports.updateEmail = async (req, res) => {
  await UserModel.findById(req.params.id).then(async (user) => {
    const auth = await bcrypt.compare(req.body.password, user.password);
    if (auth) {
      user.email = req.body.email;
      user.save().then(
        (doc) => res.status(200).json({ email: doc.email }),
        (err) => {
          console.log("update email failed for " + user + "---" + err);
          res.status(500).send("update email failed");
        }
      );
    } else res.status(400).send("Mot de passe incorrect");
  });
};

module.exports.updateFees = async (req, res) => {
  await UserModel.findById(req.params.id).then(async (user) => {
    const auth = await bcrypt.compare(req.body.password, user.password);
    if (auth) {
      user.fees = req.body.fees;
      user.save().then(
        (doc) => res.status(200).json({ fees: doc.fees }),
        (err) => {
          console.log("update fees failed for " + user + "---" + err);
          res.status(500).send("update fees failed");
        }
      );
    } else res.status(400).send("Mot de passe incorrect");
  });
};

module.exports.updatePassword = async (req, res) => {
  await UserModel.findById(req.params.id).then(async (user) => {
    const auth = await bcrypt.compare(req.body.password, user.password);
    if (auth) {
      const salt = await bcrypt.genSalt(10);
      const newPassword = await bcrypt.hash(req.body.newPassword, salt);
      user.password = newPassword;
      user.save().then(
        () => res.status(200).send("Password modified successfully"),
        (err) => {
          console.log("update password failed for " + user + "---" + err);
          res.status(500).send("update password failed");
        }
      );
    } else res.status(400).send("Mot de passe incorrect");
  });
};

// D E L E T E
module.exports.deleteUser = (req, res) => {
  if (!ObjectId.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  UserModel.findByIdAndRemove(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("Delete error : " + err);
  });
};

// U P D A T E
module.exports.changeProfilePicture = async (req, res) => {
  try {
    const updatedRes = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        picture: req.body.picture,
      },
      { new: true }
    ).select("picture");
    res.status(200).json(updatedRes);
  } catch (error) {
    console.log("Update error : " + error);
  }
};

module.exports.changeAddress = async (req, res) => {
  try {
    const updatedRes = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        address: req.body.address,
      },
      { new: true }
    ).select("address");
    res.status(200).json(updatedRes);
  } catch (error) {
    console.log("Update error : " + error);
  }
};

module.exports.changeJob = async (req, res) => {
  try {
    const updatedRes = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        job: req.body.job,
      },
      { new: true }
    ).select("job");
    res.status(200).json(updatedRes);
  } catch (error) {
    console.log("Update error : " + error);
  }
};

module.exports.changeProject = async (req, res) => {
  try {
    const updatedRes = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        project: req.body.project,
      },
      { new: true }
    ).select("project");
    res.status(200).json(updatedRes);
  } catch (error) {
    console.log("Update error : " + error);
  }
};

module.exports.changePhilosophy = async (req, res) => {
  try {
    const updatedRes = await UserModel.findByIdAndUpdate(
      req.params.id,
      {
        philosophy: req.body.philosophy,
      },
      { new: true }
    ).select("philosophy");
    res.status(200).json(updatedRes);
  } catch (error) {
    console.log("Update error : " + error);
  }
};
