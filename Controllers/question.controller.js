const questionModel = require("../Models/question.model");

//CREATE
module.exports.createQuestion = async(req,res)=>{
    const {data,interviewer,bg}=req.body;
    try {
        const result = await questionModel.create({data,bg,interviewer});
        res.status(201).json(result);
    } catch (error) {
        res.status(500).send(error.message)
        console.log(error);
    }
}

//READ
module.exports.readQuestion = async(req,res)=>{
    try {
        const result = await questionModel.findById(req.params.id)
        .populate('interviewer','name picture job')
        res.status(200).json(result)
    } catch (error) {
        res.status(500).send(error.message);
    }
}

//READ ALL
module.exports.readUserQuestions = async(req,res)=>{
    try {
        const result = await questionModel.find({interviewer:req.params.id})
        .populate('interviewer','name picture')
        .sort({ createdAt: -1 });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

// S E A R C H
module.exports.searchQuestions = (req, res) => {
    questionModel.find(
        { data: { $regex: req.query.query, $options: "i" } },
    )
      .then((result) => res.status(200).json(result))
      .catch((err) => res.status(500).send("Error while querying question :" + err));
  };

//DELETE
module.exports.deleteQuestion = async(req,res)=>{
    try {
        const deletedQuestion = questionModel.findByIdAndDelete(req.params.id);
        res.status(200).send('Suppression effectuée: '+deletedQuestion._id)
        
    } catch (error) {
        res.status(500).send(error);
        console.log({deletequestionError:error})
    }
}