const router = require('express').Router();
const conversationController = require('../Controllers/conversation.controller')

router.get('/strangers', conversationController.fetchStrangersConversation);
router.get('/', conversationController.fetchConversation);

module.exports = router;