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
        const result = await questionModel.findById(req.params.id);
        res.status(200).json(result)
    } catch (error) {
        res.status(500).send(error.message);
    }
}

//READ ALL
module.exports.readAllQuestions = async(req,res)=>{
    try {
        const result = await questionModel.find()
        .populate('interviewer','name picture')
        .sort({ createdAt: -1 });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

//READ ALL
module.exports.readUserQuestions = async(req,res)=>{
    try {
        const result = await questionModel.findOne({interviewer:req.params.id})
        .populate('interviewer','name picture')
        .sort({ createdAt: -1 });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).send(error.message);
    }
}

//UPDATE
module.exports.updateQuestion = async(req,res)=>{
    
}

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