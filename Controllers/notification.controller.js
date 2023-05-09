const notificationModel = require("../Models/notification.model");

module.exports.fetchUserNotification = async(req,res)=>{
    try {
        const interviewsNotification = await notificationModel.find({$and: [{to:req.params.id},{action:'interview'}]})
        .populate({
          path: "on", select:'question',
          populate: { path: "question", select:'interviews'},
        })
        .populate('from','name job picture')

        const likeNotification = await notificationModel.find({$and: [{to:req.params.id},{action:'like'}]})
        .populate('on', 'likers')
        .populate('from','name job picture')
        const commentNotification = await notificationModel.find({$and: [{to:req.params.id},{action:'comment'}]})
        .populate('on', 'comments')
        .populate('from','name job picture')
        const relationNotification = await notificationModel.find({$and: [{to:req.params.id},{$or: [{action:'follow'},{action:'subscribe'}]}]})
        .populate('from','name job picture')

        const result = interviewsNotification.concat(likeNotification,commentNotification,relationNotification)
        .sort((a,b)=>b.updatedAt - a.updatedAt);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error.message);
        console.log(error)
    }
}