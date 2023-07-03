const router = require("express").Router();
const {
  fetchUserSubscribers,
  fetchUserSubscriptions,
  subscribe,
  unsubscribe,
} = require("../Controllers/subscription.controller");

router.get("/subscribers/:id", fetchUserSubscribers);
router.get("/subscriptions/:id", fetchUserSubscriptions);
router.post("/subscribe", subscribe);
router.put("/unsubscribe", unsubscribe);

module.exports = router;
