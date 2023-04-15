const router = require('express').Router();
const questionControler = require('../Controllers/question.controller');

//cruds
router.post('/', questionControler.createQuestion);
router.get('/user/:id', questionControler.readUserQuestions);
router.get('/:id', questionControler.readQuestion);
router.get('/', questionControler.readAllQuestions);
router.put('/:id', questionControler.updateQuestion);
router.delete('/:id', questionControler.deleteQuestion);

module.exports = router;