const conversationModel = require("../Models/conversation.model");

module.exports.fetchMainConversation = async (req, res) => {
  conversationModel
    .find({$and:[{ members: { $in: [res.locals.user._id] } },{category:'main'}]})
    .sort({ updatedAt: -1 })
    // .limit(15)
    .populate("members", "name picture job")
    .populate({
      path: "messages",
      perDocumentLimit: 1,
      options: { sort: { createdAt: -1 } },
    })
    .then(
      (docs) => 
        res.status(200).json(docs),
      (err) => {
        console.log(
          "friend conversations not found for user" + req.locals.user._id + "---" + err
        );
        res.status(500).send("friend conversation not found");
      }
    );
};

module.exports.fetchSecondConversation = async (req, res) => {
  conversationModel
    .find({$and:[{ members: { $in: [res.locals.user._id] } },{category:'second'}]})
    .sort({ updatedAt: -1 })
    // .limit(15)
    .populate("members", "name picture job")
    .populate({
      path: "messages",
      perDocumentLimit: 1,
      options: { sort: { createdAt: -1 } },
    })
    .then(
      (docs) =>
        res.status(200).json(docs),
      (err) => {
        console.log(
          "stranger conversations not found for user" + res.locals.user._id + "---" + err
        );
        res.status(500).send("stranger conversation not found");
      }
    );
};