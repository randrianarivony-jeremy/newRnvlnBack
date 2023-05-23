const router = require('express').Router();
const { fetchHomeFeeds } = require('../Controllers/homefeed.controller');

router.get("/:publication_date/:interview_date/:question_date", fetchHomeFeeds);

module.exports = router;