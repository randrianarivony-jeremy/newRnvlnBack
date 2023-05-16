const router = require('express').Router();
const conversationController = require('../Controllers/conversation.controller')

router.get('/main', conversationController.fetchMainConversation);
router.get('/second', conversationController.fetchSecondConversation);
router.get('/new', conversationController.checkNewMessage);

module.exports = router;