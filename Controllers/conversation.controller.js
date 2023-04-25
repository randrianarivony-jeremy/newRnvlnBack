const conversationModel = require("../Models/conversation.model");

module.exports.fetchConversation = async (req, res) => {
  conversationModel
    .find({ members: { $in: [req.params.userId] } })
    .sort({ updatedAt: -1 })
    .limit(15)
    .populate("members", "name picture job")
    .populate({
      path: "messages",
      perDocumentLimit: 1,
      options: { sort: { createdAt: -1 } },
    })
    .then(
      (docs) => res.status(200).json(docs),
      (err) => {
        console.log(
          "conversations not found for user" + req.params.userId + "---" + err
        );
        res.status(500).send("conversation not found");
      }
    );
};
