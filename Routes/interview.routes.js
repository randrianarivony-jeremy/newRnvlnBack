const router = require('express').Router();
const interviewControler = require('../Controllers/interview.controller')

//CREATE
router.post('/', interviewControler.createInterview);

//READ
router.get('/interview/user/:id', interviewControler.readUserInterviews);
router.get('/comments/:id', interviewControler.fetchComments);
router.get('/:id', interviewControler.readInterview);
router.get('/load-more/:date', interviewControler.loadMore);
router.get('/load-news/:date', interviewControler.loadNews);
router.get('/', interviewControler.fetchInterviews);

//REACTION
router.patch('/like/:id', interviewControler.likeOrNotInterview);
router.patch('/comment/:id', interviewControler.commentInterview);

//UPDATE
router.put('/:id', interviewControler.updateInterview);

// DELETE
router.delete('/:id', interviewControler.deleteInterview);
router.delete('/:id/:commentId', interviewControler.deleteCommentpost);

module.exports = router;