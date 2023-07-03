const notificationModel = require("../Models/notification.model");
const subscriptionModel = require("../Models/subscription.model");
const UserModel = require("../Models/user.model");
const bcrypt = require("bcrypt");

// @desc fetchUserSubscriptions
// @route GET /subscri/subscriptions?details=Boolean
// @access Authenticated
module.exports.fetchUserSubscriptions = async (req, res) => {
  let subscriptions;
  if (req.query.details === "true") {
    subscriptions = await subscriptionModel
      .find({ userId: req.params.id }, "subscribedTo")
      .populate("subscribedTo", "name job picture")
      .lean();
  } else {
    subscriptions = await subscriptionModel
      .find({ userId: req.params.id }, "subscribedTo")
      .lean();
  }
  subscriptions = subscriptions.map((elt) => elt.subscribedTo);
  res.status(200).json(subscriptions);
};

// @desc fetchUserSubscribers
// @route GET /subscri/subscribers?details=Boolean
// @access Authenticated
module.exports.fetchUserSubscribers = async (req, res) => {
  let subscribers;
  if (req.query.details === "true") {
    subscribers = await subscriptionModel
      .find({ subscribedTo: req.params.id }, "userId")
      .populate("userId", "name job picture")
      .lean();
  } else {
    subscribers = await subscriptionModel
      .find({ subscribedTo: req.params.id }, "userId")
      .lean();
  }
  subscribers = subscribers.map((elt) => elt.userId);
  res.status(200).json(subscribers);
};

// @desc subscribe
// @route POST /subscri/subscribe
// @access Authenticated
module.exports.subscribe = async (req, res) => {
  let subscriber = await UserModel.findById(req.id, "password wallet");
  const auth = await bcrypt.compare(req.body.password, subscriber.password);
  if (auth) {
    const subscribed = await UserModel.findById(
      req.body.id_user,
      "fees subscriptionNotification wallet"
    );
    if (subscriber.wallet < subscribed.fees)
      res.status(400).json({ message: "insufficient" });
    else {
      await subscriptionModel.create({
        userId: req.id,
        subscribedTo: req.body.id_user,
      });
      subscriber.wallet -= subscribed.fees;
      await subscriber.save().then(
        async () => {
          subscribed.wallet += subscribed.fees;

          //notification tricks
          if (subscribed.subscriptionNotification === null) {
            //first subscriber
            const newNotification = await notificationModel.create({
              action: "subscribe",
              to: subscribed._id,
              from: req.id,
            });
            subscribed.subscriptionNotification = newNotification._id;
          } else {
            await notificationModel.findByIdAndUpdate(
              subscribed.subscriptionNotification,
              {
                $set: { from: req.id },
              }
            );
          }
          subscribed.save().then(
            () => res.status(200).send({ message: "subscription success" }),
            (err) => {
              console.log(
                "subscribed user updating subscriptionnotification failed for subscriber user " +
                  req.id +
                  "---" +
                  err
              );
              res.status(500).send("subscribing failed");
            }
          );
        },
        (err) => {
          console.log("Subscribe : subscriber wallet logic failed" + err);
          res.status(500).send("error in wallet logic for subscriber");
        }
      );
    }
  } else {
    res.status(400).json({ message: "Mot de passe incorrect" });
  }
};

// @desc unsubscribe
// @route PUT /subscri/unsubscribe/:subscribedTo
// @access Authenticated
module.exports.unsubscribe = async (req, res) => {
  const unsubscriber = await UserModel.findById(req.id, "password").lean();
  const auth = await bcrypt.compare(req.body.password, unsubscriber.password);
  if (auth) {
    await subscriptionModel.findOneAndDelete({
      $and: [{ userId: req.id }, { subscribedTo: req.body.id_user }],
    });
    const subscribers = await subscriptionModel
      .find({ subscribedTo: req.body.id_user }, "_id")
      .lean();
    if (subscribers.length === 0) {
      const subscribedTo = await UserModel.findByIdAndUpdate(
        req.body.id_user,
        {
          $set: { subscriptionNotification: null },
        },
        { select: "subscriptionNotification" }
      );
      await notificationModel.findByIdAndDelete(
        subscribedTo.subscriptionNotification
      );
    }
    res.status(200).json({ message: "Unsubscription done" });
  } else {
    res.status(400).json({ message: "Mot de passe incorrect" });
  }
};
