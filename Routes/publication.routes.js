const router = require('express').Router();
const publicationControler = require('../Controllers/publication.controller')

//CREATE
router.post('/', publicationControler.createPublication);

//READ
router.get('/interview/user/:id', publicationControler.readUserInterviews);
router.get('/article/user/:id', publicationControler.readUserPublications);
// router.get('/user/:id', publicationControler.readUserPublication);
router.get('/comments/:id', publicationControler.fetchComments);
router.get('/:id', publicationControler.readPublication);
router.get('/load-more/:date', publicationControler.loadMore);
router.get('/load-news/:date', publicationControler.loadNews);
router.get('/', publicationControler.fetchPublications);

//REACTION
router.patch('/like/:id', publicationControler.likeOrNotPublication);
router.patch('/comment/:id', publicationControler.commentPublication);

//UPDATE
router.put('/:id', publicationControler.updatePublication);

// DELETE
router.delete('/:id', publicationControler.deletePublication);
router.delete('/:id/:commentId', publicationControler.deleteCommentpost);

module.exports = router;