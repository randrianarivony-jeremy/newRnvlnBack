const router = require('express').Router();
const { fetchHomeFeeds } = require('../Controllers/homefeed.controller');

router.get('/', fetchHomeFeeds);

module.exports = router;