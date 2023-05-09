const router = require("express").Router();
const notificationController = require("../Controllers/notification.controller");
router.get("/:id", notificationController.fetchUserNotification);

module.exports = router;
