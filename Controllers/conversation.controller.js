const { default: mongoose } = require("mongoose");
const conversationModel = require("../Models/conversation.model");
const UserModel = require("../Models/user.model");

module.exports.fetchConversationByUserId = async (req, res) => {
  const conversation = await conversationModel.findOne(
    {
      members: { $all: [req.params.userId, req.id] },
    },
    "_id"
  );
  res.status(200).json(conversation);
};

module.exports.fetchMainConversation = async (req, res) => {
  const currentUser = await UserModel.findById(
    req.id,
    "friends subscriptions subscribers"
  );
  conversationModel
    .find({
      $and: [
        { members: { $in: [req.id] } },
        {
          $or: [
            { members: { $in: currentUser.friends } },
            { members: { $in: currentUser.subscribers } },
            { members: { $in: currentUser.subscriptions } },
          ],
        },
      ],
    })
    .sort({ updatedAt: -1 })
    // .limit(15)
    .populate("members", "name picture job")
    .populate("lastMessage")
    .then(
      (conversations) => {
        res.status(200).json(conversations);
      },
      (err) => {
        console.log(
          "friend conversations not found for user" + req.id + "---" + err
        );
        res.status(500).send("friend conversation not found");
      }
    );
};

module.exports.fetchSecondConversation = async (req, res) => {
  const currentUser = await UserModel.findById(
    req.id,
    "friends subscriptions subscribers"
  );
  conversationModel
    .find({
      $and: [
        { members: { $in: [req.id] } },
        { members: { $nin: currentUser.friends } },
        { members: { $nin: currentUser.subscribers } },
        { members: { $nin: currentUser.subscriptions } },
      ],
    })
    .sort({ updatedAt: -1 })
    // .limit(15)
    .populate("members", "name picture job")
    .populate({
      path: "messages",
      perDocumentLimit: 1,
      options: { sort: { createdAt: -1 } },
    })
    .then(
      (conversations) => {
        res.status(200).json(conversations);
      },
      (err) => {
        console.log(
          "stranger conversations not found for user" + req.id + "---" + err
        );
        res.status(500).send("stranger conversation not found");
      }
    );
};

module.exports.checkNewMessage = async (req, res) => {
  conversationModel.find({ members: { $in: [req.id] } }).then(
    (conversations) => {
      let newMainMessage = 0;
      let newSecondMessage = 0;
      conversations.map((conv) => {
        if (conv.category === "main") {
          conv.newMessage = conv.newMessage.map((elt) => {
            if (String(elt.user) == String(req.id)) newMainMessage += elt.new;
          });
        } else {
          conv.newMessage = conv.newMessage.map((elt) => {
            if (String(elt.user) == String(req.id)) newSecondMessage += elt.new;
          });
        }
      });
      res.status(200).json({ newMainMessage, newSecondMessage });
    },
    (err) => {
      console.log(
        "conversation not found for new message number checking for user" +
          req.id +
          "---" +
          err
      );
      res
        .status(500)
        .send("conversation not found for new message number checking");
    }
  );
};

module.exports.updateNewMessage = (req, res) => {
  let newMessageRestore;
  if (req.params.category === "main") newMessageRestore = { newMainMessage: 0 };
  else newMessageRestore = { newSecondMessage: 0 };
  UserModel.findByIdAndUpdate(req.id, {
    $set: newMessageRestore,
  }).exec();
  res.status(200).json({ message: "New message checked" });
};

module.exports.updateUnseenMessage = (req, res) => {
  conversationModel
    .findByIdAndUpdate(
      req.params.conversationId,
      {
        $set: { "unseenMessage.$[element].new": 0 },
      },
      {
        arrayFilters: [{ "element.user": new mongoose.Types.ObjectId(req.id) }],
      }
    )
    .exec();
  res.status(200).json({ message: "unseenMessage checked" });
};
