const UserModel = require("../Models/user.model");
const ObjectId = require("mongoose").Types.ObjectId;
const bcrypt = require("bcrypt");
const notificationModel = require("../Models/notification.model");

// R E A D  A L L
module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select("-password");
  res.status(200).json(users);
};

// R E A D  O N E
module.exports.userInfo = (req, res) => {
  UserModel.findById(req.params.id)
    .select(
      "-password -wallet -savings -notificationSeen -messageNotSeen -createdAt -updatedAt -email"
    )
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
    .then(
      (doc) => res.status(200).send(doc),
      (err) => {
        console.log(err);
        res.status(500).send("user not found:" + req.params.id);
      }
    );
};

// R E L A T I O N
module.exports.inviteToBeFriends = async (req, res) => {
  try {
    if (req.body.to===req.body.from) throw new Error('Cannot self request to be friends');
    else {
      await UserModel.findById(req.body.from,'friends friendInvitation')
      .then(async(fromUser)=>{
        if (fromUser.friends.includes(req.body.to)) throw new Error('Already friends');
        else {
          fromUser.friendInvitation.push(req.body.to);
          fromUser.save();
          await UserModel.findByIdAndUpdate(req.body.to,{
            $push: {friendRequest: req.body.from}
          },{new:true,select:'friendRequest friendRequestNotification'})
          .then(async(toUser)=>{
            if (toUser.friendRequestNotification===null){ //first incoming friend request
              await notificationModel.create({
                action: "friendRequest",
              to: req.body.to,
              from: req.body.from,
            }).then(newNotification=>{
              toUser.friendRequestNotification = newNotification._id;
              toUser.save();
            })
          } else {
            await notificationModel.findByIdAndUpdate(toUser.friendRequestNotification,{
              $set : {from : req.body.from}
            })
          }
          res.status(200).send('friend invitation sent successfully')
        })
        }
      })
    }
  } catch (error) {
    console.log(error+"---"+req.body.from);
    res.send(error)
  }
};

module.exports.acceptToBeFriends = async (req, res) => {
  try {
    if (req.body.to===req.body.from) throw new Error('Cannot self accept to be friends');
    else {
      await UserModel.findById(req.body.from,'friends friendRequest')
      .then(async(fromUser)=>{
        if (fromUser.friends.includes(req.body.to)) throw new Error('Already friends');
        if (!fromUser.friendRequest.includes(req.body.to)) throw new Error(req.body.to+' did not send friend request to '+req.body.from);
        else {
          fromUser.friends.push(req.body.to);
          fromUser.friendRequest=fromUser.friendRequest.filter(user=>user!=req.body.to);
          fromUser.save();
          await UserModel.findByIdAndUpdate(req.body.to,{
            $push: {friends: req.body.from},$pull:{friendInvitation:req.body.from}
          },{new:true,select:'friendInvitation friends friendAcceptNotification'})
          .then(async(toUser)=>{
            if (toUser.friendAcceptNotification===null){ //first invitation friend accepted
              await notificationModel.create({
                action: "friendAccepted",
              to: req.body.to,
              from: req.body.from,
            }).then(newNotification=>{
              toUser.friendAcceptNotification = newNotification._id;
              toUser.save();
            })
          } else {
            await notificationModel.findByIdAndUpdate(toUser.friendAcceptNotification,{
              $set : {from : req.body.from}
            })
          }
          res.status(200).send('friend request accepted successfully')
        })
        }
      })
    }
  } catch (error) {
    console.log(error+"---"+req.body.from);
    res.send(error)
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
  let subscriber = await UserModel.findById(req.params.id,'password subscriptions wallet');
  const auth = await bcrypt.compare(req.body.password, subscriber.password); //comparrer le name avec le base bcrypt
  if (auth) {
    await UserModel.findById(req.body.id_user,'fees subscriptionNotification wallet subscribers').then(
      async (subscribed) => {
        if (subscriber.wallet < subscribed.fees)
          res.status(400).send("insufficient");
        else {
          subscriber.wallet -= subscribed.fees;
          subscriber.subscriptions.push(subscribed._id);
          await subscriber.save().then(
             () => {
              subscribed.wallet += subscribed.fees;
              subscribed.subscribers.push(subscriber._id);

              //notification tricks
                if (subscribed.subscriptionNotification === null) {  //first subscriber
                  notificationModel.create({
                      action: "subscribe",
                      to: subscribed._id,
                      from: req.params.id,
                    })
                    .then((newNotification) => {
                      subscribed.subscriptionNotification = newNotification._id;
                      subscribed.save().then(
                        () => res.status(200).send("subscription success"),
                        (err) => {
                          console.log("subscribed user updating subscriptionnotification failed for subscriber user " +req.params.id +"---" +err);
                          res.status(500).send("subscribing failed");
                        }
                      );
                    },err=>{
                      console.log("creating notification failed for subscriber user " +req.params.id +"---" +err);
                          res.status(500).send("subscribing failed");
                    });
                } else {
                  notificationModel
                    .findByIdAndUpdate(subscribed.subscriptionNotification, {
                      $set: { from: req.params.id },
                    })
                    .then(
                      () => res.status(200).send("subscribing success"),
                      (err) => {
                        console.log("notification updating failed for subscriber user " +req.params.id +"---" +err);
                        res.status(500).send("subscription failed");
                      }
                    );
                }
            },
            (err) => {
              console.log("Subscribe : subscriber wallet logic failed" + err);
              res.status(500).send("error in wallet logic for subscriber");
            }
          );
        }
      },
      (err) => {
        console.log(
          "Subscribe : subscribed user not found: id" + req.body.id_user + "---" + err
        );
        res.status(500).send("subscription user not found");
      }
    );
  } else {
    res.status(400).send("Mot de passe incorrect");
  }
};

module.exports.unsubscribe = async (req, res) => {
  await UserModel.findById(req.params.id,'password').then(async (unsubscriber) => {
    const auth = await bcrypt.compare(req.body.password, unsubscriber.password);
    if (auth) {
      await UserModel.findByIdAndUpdate(req.params.id, {
        $pull: { subscriptions: req.body.id_user },
      }).then(
        async () =>
          await UserModel.findByIdAndUpdate(req.body.id_user, {
            $pull: { subscribers: req.params.id },
          },{new:true,select:'subscriptionNotification subscribers'}).then(
            (subscribed) => {
            if (subscribed.subscribers.length === 0) {
              notificationModel.findByIdAndDelete(subscribed.subscriptionNotification)
                .then(
                  () => {
                    subscribed.subscriptionNotification = null;
                    subscribed.save().then(
                      () => res.status(200).send("unsubscribe done"),
                      (err) => {
                        console.log("setting subscriptionnotification to null failed for unsubscriber user " +req.params.id +"---" +err);
                        res.status(500).send("unsubscription action failed");
                      }
                    );
                  },
                  (err) => {
                    console.log("deleting notification failed for unsubscriber user " +req.params.id +"---" +err);
                    res.status(500).send("unsubscription action failed");
                  }
                );
            } else res.status(200).send("unsubscription action done");
          },
            (err) => {
              console.log("Unsubscribe : pull subscriber failed" + err);
              res.status(500).send("pull subscriber failed");
            }
          ),
        (err) => {
          console.log(
            "Subscribe : subscription user not found: id" +
              req.body.id_user +
              "---" +
              err
          );
          res.status(500).send("subscription user not found");
        }
      );
    } else {
      res.status(400).send("Mot de passe incorrect");
    }
  });
};

module.exports.fetchFriends = (req, res) => {
  UserModel.findById(req.params.id)
    .select(
      "friends"
    )
    .populate("friends", "picture name job")
    .then(
      (doc) => res.status(200).send(doc.followers),
      (err) => {
        console.log(err);
        res.status(500).send("user not found:" + req.params.id);
      }
    );
};

module.exports.fetchSubscribers = (req, res) => {
  UserModel.findById(req.params.id)
    .select(
      "subscribers"
    )
    .populate("subscribers", "picture name job")
    .then(
      (doc) => res.status(200).send(doc.subscribers),
      (err) => {
        console.log(err);
        res.status(500).send("user not found:" + req.params.id);
      }
    );
};

module.exports.fetchSubscriptions = (req, res) => {
  UserModel.findById(req.params.id)
    .select(
      "subscriptions"
    )
    .populate("subscriptions", "picture name job")
    .then(
      (doc) => res.status(200).send(doc.subscriptions),
      (err) => {
        console.log(err);
        res.status(500).send("user not found:" + req.params.id);
      }
    );
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
