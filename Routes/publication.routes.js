const router = require('express').Router();
const publicationControler = require('../Controllers/publication.controller')

//CREATE
router.post('/', publicationControler.createPublication);

//READ
router.get('/user/:id', publicationControler.readUserPublication);
router.get('/load-more/:date', publicationControler.loadMore);
router.get('/load-news/:date', publicationControler.loadNews);
router.get('/', publicationControler.readAllPublications);

//UPDATE
router.put('/:id', publicationControler.updatePublication);

// DELETE
router.delete('/:id', publicationControler.deletePublication);
router.delete('/:id/:commentId', publicationControler.deleteCommentPublication);

// REACTION 
router.patch('/like/:id', publicationControler.likeOrNotPublication);
router.patch('/comment/:id', publicationControler.commentPublication);

module.exports = router;