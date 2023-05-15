const conversationModel = require("../Models/conversation.model");

module.exports.fetchConversation = async (req, res) => {
  conversationModel
    .find({ members: { $in: [res.locals.user._id] } })
    .sort({ updatedAt: -1 })
    .limit(15)
    .populate("members", "name picture job")
    .populate({
      path: "messages",
      perDocumentLimit: 1,
      options: { sort: { createdAt: -1 } },
    })
    .then(
      (docs) => {
        const friendsConv = docs.filter(conv=>{
          const userB = conv.members.filter(i=>String(i._id)!=String(res.locals.user._id))[0]._id;
          return (res.locals.user.friends.includes(userB) || res.locals.user.subscribers.includes(userB));
        })
        res.status(200).json(friendsConv)},
      (err) => {
        console.log(
          "friend conversations not found for user" + req.locals.user._id + "---" + err
        );
        res.status(500).send("friend conversation not found");
      }
    );
};

module.exports.fetchStrangersConversation = async (req, res) => {
  conversationModel
    .find({ members: { $in: [res.locals.user._id] } })
    .sort({ updatedAt: -1 })
    .limit(15)
    .populate("members", "name picture job")
    .populate({
      path: "messages",
      perDocumentLimit: 1,
      options: { sort: { createdAt: -1 } },
    })
    .then(
      (docs) => {
        const strangersConv = docs.filter(conv=>{
          const userB = conv.members.filter(i=>String(i._id)!=String(res.locals.user._id))[0]._id;
          return (!res.locals.user.friends.includes(userB) && !res.locals.user.subscribers.includes(userB));
        })
        res.status(200).json(strangersConv)},
      (err) => {
        console.log(
          "stranger conversations not found for user" + res.locals.user._id + "---" + err
        );
        res.status(500).send("stranger conversation not found");
      }
    );
};