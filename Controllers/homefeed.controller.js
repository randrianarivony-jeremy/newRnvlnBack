const publicationModel = require("../Models/publication.model");
const questionModel = require("../Models/question.model");

module.exports.fetchHomeFeeds = async (req, res) => {
    let publicPublications,privatePublications,questions;
    
    const fetchPublicPublications=async()=>{
      publicPublications = await publicationModel
      .find({public:true})
      .populate("id_user", "name picture job")
    }

    const fetchQuestions=async()=>{
      questions = await questionModel
      .find()
      .select('-interviewNotification')
      .populate("interviewer", "name picture job")
    }
  
    const fetchPrivatePublications=async()=>{
      privatePublications = await publicationModel
      .find({$and:[{public:false},{$or:[{id_user:res.locals.user?.friends},{id_user:res.locals.user?._id},{id_user:res.locals.user?.subscriptions}]}]})
      .populate("id_user", "name picture job")
    }
  
    Promise.all([fetchPublicPublications(),fetchPrivatePublications(),fetchQuestions()])
    .then(()=>{
        let feeds = publicPublications.concat(privatePublications);
        feeds = feeds.map(data=>{
            if (data.type==='interview'){
                data.question = questions.find((question)=>String(question._id)==String(data.question));
                data.question = {_id:data.question._id,data:data.question.data,interviewer:data.question.interviewer}
                return data;
            } else return data;
        })
      res.json(feeds.concat(questions).sort((a,b)=>b.createdAt-a.createdAt))})
      .catch(err=>{
        res.status(500).send('some error occurs');
        console.log(err)
      })
  };