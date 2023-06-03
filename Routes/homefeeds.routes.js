const router = require('express').Router();
const {
  fetchHomeFeeds,
  fetchMoreHomeFeeds,
} = require("../Controllers/homefeed.controller");

router.get("/", fetchHomeFeeds);
router.patch("/:date", fetchMoreHomeFeeds);

module.exports = router;