const router = require('express').Router();
const conversationController = require('../Controllers/conversation.controller')

router.get('/main', conversationController.fetchMainConversation);
router.get('/second', conversationController.fetchSecondConversation);

module.exports = router;