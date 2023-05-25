const router = require('express').Router();
const { fetchHomeFeeds } = require('../Controllers/homefeed.controller');

router.get("/:date", fetchHomeFeeds);

module.exports = router;