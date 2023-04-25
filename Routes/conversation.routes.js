const router = require('express').Router();
const conversationController = require('../Controllers/conversation.controller')

router.get('/:userId', conversationController.fetchConversation);

module.exports = router;