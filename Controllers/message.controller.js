const conversationModel = require("../Models/conversation.model");
const messageModel = require("../Models/message.model");
const UserModel = require("../Models/user.model");

//add
module.exports.createMessage = async (req, res) => {
  let { sender, recipient, content,contentType, conversationId } = req.body;

  if (conversationId===null){
    //first message
    conversationModel.create({members:[sender,recipient]})
    .then(newConveration=>{
      conversationId = newConveration._id;
      messageModel.create({ conversationId, sender, content,contentType }).then(
        async (savedMessage) => {
          await conversationModel
            .updateOne({ _id: conversationId },{
                $push: { messages: savedMessage._id },
                $set: { newMessage: [{user:sender},{user:recipient,new:1}] }
            })
            .then(async () => {
                await UserModel.updateOne({ _id: recipient },
                  {$inc: { messageNotSeen: 1 },})
                  .then(() => res.status(201).json(savedMessage),
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
          console.log("message savings failed " + conversationId + "---" + err);
          res.status(500).send("message savings failed");
        }
      );
    })
  }
  else {
    await messageModel.create({ conversationId, sender, content,contentType }).then(
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
              .then(() => res.status(201).json(savedMessage),
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
      console.log("message savings failed " + conversationId + "---" + err);
      res.status(500).send("message savings failed");
    }
  );}
};

//get

module.exports.fetchMessages = async (req, res) => {
  try {
    const messages = await conversationModel.findById(
      req.params.conversationId)
      .populate("members", "name picture job")
      .populate("messages")
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json(messages);
  } catch (err) {
    if (err.message===`Cast to ObjectId failed for value "${req.params.conversationId}" (type string) at path "_id" for model "conversation"`)
    res.status(200).send('new conversation')
    else {
      console.log("message fetching failed" + req.params.conversationId + "---" + err.message);
      res.status(500).send("message fetching failed");
    }
  }
};

module.exports.deleteMessage=async(req,res)=>{
  await messageModel.findByIdAndDelete(req.params.id)
  .then(async(doc)=>{
    await conversationModel.findByIdAndUpdate(req.params.conversationId,{
      $pull: {messages: req.params.id}
    }).then(()=>res.status(200).send(doc._id),err=>{
      console.log("conversation message pulling failed" + req.params.id + "---" + err);
      res.status(500).send("message deleting failed upon conversation model");
    })
  },err=>{
    console.log("message deleting failed" + req.params.id + "---" + err);
      res.status(500).send("message deleting failed");
  })
}