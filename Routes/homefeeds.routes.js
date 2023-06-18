const router = require('express').Router();
const {
  fetchHomeFeeds,
  fetchMoreHomeFeeds,
} = require("../Controllers/homefeed.controller");

router.get("/:date", fetchMoreHomeFeeds);
router.get("/", fetchHomeFeeds);

module.exports = router;