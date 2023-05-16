const notificationModel = require("../Models/notification.model");

module.exports.fetchUserNotification = async(req,res)=>{
    try {
        const interviewsNotification = await notificationModel.find({$and: [{to:res.locals.user._id},{action:'interview'}]})
        .populate({
          path: "on", select:'question',
          populate: { path: "question", select:'interviews'},
        })
        .populate('from','name job picture')

        const likeNotification = await notificationModel.find({$and: [{to:res.locals.user._id},{action:'like'}]})
        .populate('on', 'likers')
        .populate('from','name job picture')
        const commentNotification = await notificationModel.find({$and: [{to:res.locals.user._id},{action:'comment'}]})
        .populate('on', 'comments')
        .populate('from','name job picture')
        const relationNotification = await notificationModel.find({$and: [{to:res.locals.user._id},{$or: [{action:'follow'},{action:'subscribe'}]}]})
        .populate('from','name job picture')

        const result = interviewsNotification.concat(likeNotification,commentNotification,relationNotification)
        .sort((a,b)=>b.updatedAt - a.updatedAt);
        result.map(notif=>{
            notif.seen = true;
            notif.save();
        })
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error.message);
        console.log(error)
    }
}

module.exports.checkNewNotificationNumber = async(req,res)=>{
    let newNotification=0;
    try {
        const notifications = await notificationModel.find({to:res.locals.user.id});
        notifications.map(notif=>{
            if (notif.seen===false) newNotification+=1
        })
        res.status(200).json(newNotification);
    } catch (error) {
        res.status(500).send(error.message);
        console.log(error)
    }
}