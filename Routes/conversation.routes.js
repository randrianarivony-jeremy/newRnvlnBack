const router = require('express').Router();
const conversationController = require('../Controllers/conversation.controller')

router.get('/main', conversationController.fetchMainConversation);
router.get('/second', conversationController.fetchSecondConversation);
router.get('/new', conversationController.checkNewMessage);
router.get("/:userId", conversationController.fetchConversationByUserId);
router.put("/new/:category", conversationController.updateNewMessage);
router.put(
  "/check/:conversationId",
  conversationController.updateUnseenMessage
);

module.exports = router;