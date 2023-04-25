const conversationModel = require("../Models/conversation.model");
const messageModel = require("../Models/message.model");
const UserModel = require("../Models/user.model");

//add
module.exports.createMessage = async (req, res) => {
  let { sender, recipient, content, conversationId } = req.body;

  if (conversationId===null){
    //first message
    conversationModel.create({members:[sender,recipient]})
    .then(newConveration=>{
      conversationId = newConveration._id;
      messageModel.create({ conversationId, sender, content }).then(
        async (savedMessage) => {
          await conversationModel
            .updateOne({ _id: conversationId },{
                $push: { messages: savedMessage._id },
                $set: { newMessage: [{user:sender},{user:recipient,new:1}] }
            })
            .then(async () => {
                await UserModel.updateOne({ _id: recipient },
                  {$inc: { messageNotSeen: 1 },})
                  .then(() => res.status(201).send("message successfully saved"),
                  (err) => {
                    console.log("incrementation messagenotseen failed for user" +recipient +"---" +err);
                    res.status(500).send("incrementation messagenotseen failed");
                  }
                );
              },
              (err) => {
                console.log("pushing message into conversation failed for conversation" +conversationId +"---" +err);
                res.status(500).send("pushing message into conversation failed");
              }
            );
        },
        (err) => {
          console.log("message saving failed " + conversationId + "---" + err);
          res.status(500).send("message saving failed");
        }
      );
    })
  }
  else {
    await messageModel.create({ conversationId, sender, content }).then(
    async (savedMessage) => {
      await conversationModel.findOne({_id:conversationId})
        .then(conversation=>{
          conversation.messages = [...conversation.messages,savedMessage._id];
          conversation.newMessage = conversation.newMessage.map(user=>{
            if (user.user==recipient) return {...user,new:user.new+1}; else return user;
          });
          conversation.save()
          .then(async () => {
            await UserModel.updateOne({ _id: recipient },
              {$inc: { messageNotSeen: 1 },})
              .then(() => res.status(201).send("message successfully saved"),
              (err) => {
                console.log("incrementation messagenotseen failed for user" +recipient +"---" +err);
                res.status(500).send("incrementation messagenotseen failed");
              }
            );
          },
          (err) => {
            console.log("pushing message into conversation failed for conversation" +conversationId +"---" +err);
            res.status(500).send("pushing message into conversation failed");
          }
          );
        },err=>{
          console.log("conversation not found " + conversationId + "---" + err);
      res.status(500).send("conversation not found");
        })
    },
    (err) => {
      console.log("message saving failed " + conversationId + "---" + err);
      res.status(500).send("message saving failed");
    }
  );}
};

//get

module.exports.fetchMessages = async (req, res) => {
  try {
    const messages = await messageModel.findById(
      req.params.conversationId)
      .populate("members", "name picture job")
      .populate("messages")
      .sort({ createdAt: -1 })
      .limit(20);
    res.status(200).json(messages);
  } catch (err) {
    console.log("message fetching failed" + req.params.conversationId + "---" + err);
      res.status(500).send("message fetching failed");
  }
};