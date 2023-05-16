const router = require("express").Router();
const notificationController = require("../Controllers/notification.controller");
router.get("/", notificationController.fetchUserNotification);
router.get("/new", notificationController.checkNewNotificationNumber);

module.exports = router;
