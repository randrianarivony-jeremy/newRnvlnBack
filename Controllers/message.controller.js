const conversationModel = require("../Models/conversation.model");
const messageModel = require("../Models/message.model");
const UserModel = require("../Models/user.model");

//create conversation and message
module.exports.createMessage = async (req, res) => {
  const currentUser = await UserModel.findById(req.id);
  let { sender, recipient, content, contentType, conversationId } = req.body;
  let category = "second"; //matter of real time notification ui
  if (
    currentUser.friends.includes(recipient) ||
    currentUser.subscribers.includes(recipient) ||
    currentUser.subscriptions.includes(recipient)
  )
    category = "main";

  if (conversationId === null) {
    //first message
    conversationModel
      .create({ members: [sender, recipient], category })
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
                        { user: sender },
                        { user: recipient, new: 1 },
                      ],
                      newMessage: [
                        { user: sender },
                        { user: recipient, new: 1 },
                      ],
                    },
                  }
                )
                .then(
                  async () => {
                    await UserModel.updateOne(
                      { _id: recipient },
                      { $inc: { messageNotSeen: 1 } }
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
          await conversationModel.findOne({ _id: conversationId }).then(
            (conversation) => {
              conversation.messages = [
                ...conversation.messages,
                savedMessage._id,
              ];
              conversation.unseenMessage = conversation.unseenMessage.map(
                (user) => {
                  if (user.user == recipient)
                    return { ...user, new: user.new + 1 };
                  else return user;
                }
              );
              conversation.newMessage = conversation.newMessage.map((user) => {
                if (user.user == recipient)
                  return { ...user, new: user.new + 1 };
                else return user;
              });
              conversation.save().then(
                async () => {
                  await UserModel.updateOne(
                    { _id: recipient },
                    { $inc: { messageNotSeen: 1 } }
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
                "conversation not found " + conversationId + "---" + err
              );
              res.status(500).send("conversation not found");
            }
          );
        },
        (err) => {
          console.log("message savings failed " + conversationId + "---" + err);
          res.status(500).send("message savings failed");
        }
      );
  }
};

//get

module.exports.fetchMessages = async (req, res) => {
  try {
    const conversation = await conversationModel
      .findOne({ members: { $all: [req.params.userId, req.id] } })
      .populate("messages");
    if (conversation !== null) {
      conversation.unseenMessage = conversation.unseenMessage.map((elt) => {
        if (String(elt.user) == String(req.id)) return { ...elt, new: 0 };
        else return elt;
      });
      conversation.save();
      res.status(200).json(conversation.messages);
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
  const conversation = await conversationModel.findByIdAndUpdate(
    req.params.conversationId,
    {
      $pull: { messages: req.params.id },
    },
    { new: true }
  );
  if (conversation.messages.length === 0)
    await conversationModel.findByIdAndDelete(req.params.conversationId);
  res.status(200).json({ message: "message deletion done" });
};