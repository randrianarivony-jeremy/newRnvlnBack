const { default: mongoose } = require("mongoose");
const conversationModel = require("../Models/conversation.model");
const messageModel = require("../Models/message.model");
const subscriptionModel = require("../Models/subscription.model");
const UserModel = require("../Models/user.model");

//create conversation and message
module.exports.createMessage = async (req, res) => {
  const currentUser = await UserModel.findById(req.id, "friends");
  let subscriptions = await subscriptionModel
    .find({ userId: req.id }, "subscribedTo")
    .lean();
  subscriptions = subscriptions.map((elt) => elt.subscribedTo);
  let subscribers = await subscriptionModel
    .find({ subscribedTo: req.id }, "userId")
    .lean();
  subscribers = subscribers.map((elt) => elt.userId);

  let { sender, recipient, content, contentType, conversationId } = req.body;
  let category = "second"; //matter of real time notification ui
  if (
    currentUser.friends.includes(recipient) ||
    subscribers.includes(recipient) ||
    subscriptions.includes(recipient)
  )
    category = "main";

  if (conversationId === null) {
    //first message
    conversationModel
      .create({ members: [sender, recipient] })
      .then((newConversation) => {
        conversationId = newConversation._id;
        messageModel
          .create({ conversationId, sender, content, contentType })
          .then(
            async (savedMessage) => {
              await conversationModel
                .updateOne(
                  { _id: conversationId },
                  {
                    $push: { messages: savedMessage._id },
                    $set: {
                      unseenMessage: [
                        { user: sender, new: [] },
                        { user: recipient, new: savedMessage._id },
                      ],
                      lastMessage: savedMessage._id,
                    },
                  }
                )
                .then(
                  async () => {
                    let newMessageIncrement;
                    if (category === "main")
                      newMessageIncrement = { newMainMessage: 1 };
                    else newMessageIncrement = { newSecondMessage: 1 };
                    await UserModel.updateOne(
                      { _id: recipient },
                      { $inc: newMessageIncrement }
                    ).then(
                      () =>
                        res
                          .status(201)
                          .json({ newMessage: savedMessage, category }),
                      (err) => {
                        console.log(
                          "incrementation messagenotseen failed for user" +
                            recipient +
                            "---" +
                            err
                        );
                        res
                          .status(500)
                          .send("incrementation messagenotseen failed");
                      }
                    );
                  },
                  (err) => {
                    console.log(
                      "pushing message into conversation failed for conversation" +
                        conversationId +
                        "---" +
                        err
                    );
                    res
                      .status(500)
                      .send("pushing message into conversation failed");
                  }
                );
            },
            (err) => {
              console.log(
                "message savings failed " + conversationId + "---" + err
              );
              res.status(500).send("message savings failed");
            }
          );
      });
  } else {
    await messageModel
      .create({ conversationId, sender, content, contentType })
      .then(
        async (savedMessage) => {
          await conversationModel
            .findByIdAndUpdate(
              conversationId,
              {
                $set: { lastMessage: savedMessage._id },
                $push: { "unseenMessage.$[element].new": savedMessage._id },
              },
              {
                arrayFilters: [
                  { "element.user": new mongoose.Types.ObjectId(recipient) },
                ],
              }
            )
            .then(
              async () => {
                let newMessageIncrement;
                if (category === "main")
                  newMessageIncrement = { newMainMessage: 1 };
                else newMessageIncrement = { newSecondMessage: 1 };
                await UserModel.updateOne(
                  { _id: recipient },
                  { $inc: newMessageIncrement }
                ).then(
                  () =>
                    res
                      .status(201)
                      .json({ newMessage: savedMessage, category }),
                  (err) => {
                    console.log(
                      "incrementation messagenotseen failed for user" +
                        recipient +
                        "---" +
                        err
                    );
                    res
                      .status(500)
                      .send("incrementation messagenotseen failed");
                  }
                );
              },
              (err) => {
                console.log(
                  "pushing message into conversation failed for conversation" +
                    conversationId +
                    "---" +
                    err
                );
                res
                  .status(500)
                  .send("pushing message into conversation failed");
              }
            );
        },
        (err) => {
          console.log("conversation not found " + conversationId + "---" + err);
          res.status(500).send("conversation not found");
        }
      );
    (err) => {
      console.log("message savings failed " + conversationId + "---" + err);
      res.status(500).send("message savings failed");
    };
  }
};

module.exports.fetchMessages = async (req, res) => {
  try {
    const conversation = await conversationModel
      .findOne({ members: { $all: [req.params.userId, req.id] } })
      .select("_id")
      .lean();
    if (conversation !== null) {
      const messages = await messageModel
        .find({ conversationId: conversation._id })
        .lean();
      res.status(200).json(messages);
    } else {
      res.status(200).json(conversation);
    }
  } catch (err) {
    console.log(
      "message fetching failed" + req.params.userId + "---" + err.message
    );
    res.status(500).send("message fetching failed");
  }
};

module.exports.deleteMessage = async (req, res) => {
  await messageModel.findByIdAndDelete(req.params.id);
  const remains = await messageModel
    .find({ conversationId: req.params.conversationId }, "_id")
    .sort({ createdAt: -1 })
    .lean();
  if (remains.length === 0)
    await conversationModel.findByIdAndDelete(req.params.conversationId);
  else
    await conversationModel.findByIdAndUpdate(
      req.params.conversationId,
      {
        $pull: { "unseenMessage.$[element].new": req.params.id },
        $set: { lastMessage: remains[0]._id },
      },
      {
        arrayFilters: [
          { "element.user": { $ne: new mongoose.Types.ObjectId(req.id) } },
        ],
      }
    );
  res.status(200).json({ message: "message deletion done" });
};
