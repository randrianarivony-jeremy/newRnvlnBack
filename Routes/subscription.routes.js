const router = require("express").Router();
const {
  fetchUserSubscribers,
  fetchUserSubscriptions,
  subscribe,
  unsubscribe,
} = require("../Controllers/subscription.controller");

router.get("/subscribers", fetchUserSubscribers);
router.get("/subscriptions", fetchUserSubscriptions);
router.post("/subscribe", subscribe);
router.delete("/unsubscribe", unsubscribe);

module.exports = router;
