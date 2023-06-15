const router = require('express').Router();
const questionControler = require('../Controllers/question.controller');

//cruds
router.post('/', questionControler.createQuestion);
router.get('/user/:id', questionControler.readUserQuestions);
router.get("/search", questionControler.searchQuestions);
router.get("/:id", questionControler.readQuestion);
router.get("/", questionControler.readAllQuestions);
router.delete('/:id', questionControler.deleteQuestion);

module.exports = router;