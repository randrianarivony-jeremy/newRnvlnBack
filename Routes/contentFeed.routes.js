const router = require('express').Router();
const contentFeedControler = require('../Controllers/contentFeed.controller')

router.get('/load-more/:date', contentFeedControler.loadMore);
router.get('/load-news/:date', contentFeedControler.loadNews);
router.get('/', contentFeedControler.fetchContentFeed);

module.exports = router;