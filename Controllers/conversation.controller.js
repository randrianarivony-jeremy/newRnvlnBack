const conversationModel = require("../Models/conversation.model");

module.exports.fetchMainConversation = async (req, res) => {
  conversationModel
    .find({
      $and: [{ members: { $in: [res.locals.user._id] } }, { category: "main" }],
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
        conversations.map((conv) => {
          conv.newMessage = conv.newMessage.map((elt) => {
            if (String(elt.user) == String(res.locals.user._id))
              return { ...elt, new: 0 };
            else return elt;
          });
          conv.save();
        });
        res.status(200).json(conversations);
      },
      (err) => {
        console.log(
          "friend conversations not found for user" +
            req.locals.user._id +
            "---" +
            err
        );
        res.status(500).send("friend conversation not found");
      }
    );
};

module.exports.fetchSecondConversation = async (req, res) => {
  conversationModel
    .find({
      $and: [
        { members: { $in: [res.locals.user._id] } },
        { category: "second" },
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
        conversations.map((conv) => {
          conv.newMessage = conv.newMessage.map((elt) => {
            if (String(elt.user) == String(res.locals.user._id))
              return { ...elt, new: 0 };
            else return elt;
          });
          conv.save();
        });
        res.status(200).json(conversations);
      },
      (err) => {
        console.log(
          "stranger conversations not found for user" +
            res.locals.user._id +
            "---" +
            err
        );
        res.status(500).send("stranger conversation not found");
      }
    );
};

module.exports.checkNewMessage = async (req, res) => {
  conversationModel.find({ members: { $in: [res.locals.user._id] } }).then(
    (conversations) => {
      let newMainMessage = 0;
      let newSecondMessage = 0;
      conversations.map((conv) => {
        if (conv.category === "main") {
          conv.newMessage = conv.newMessage.map((elt) => {
            if (String(elt.user) == String(res.locals.user._id))
              newMainMessage += elt.new;
          });
        } else {
          conv.newMessage = conv.newMessage.map((elt) => {
            if (String(elt.user) == String(res.locals.user._id))
              newSecondMessage += elt.new;
          });
        }
      });
      res.status(200).json({ newMainMessage, newSecondMessage });
    },
    (err) => {
      console.log(
        "conversation not found for new message number checking for user" +
          res.locals.user._id +
          "---" +
          err
      );
      res.status(500).send("conversation not found for new message number checking");
    }
  );
};
